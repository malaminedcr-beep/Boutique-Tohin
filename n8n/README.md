# Paiements bKash — Airtable + n8n

Validation manuelle des paiements bKash via Airtable, synchronisée avec Supabase par n8n.

---

## ✅ Créé en réel (live)

**Base Airtable "Paiements bKash"** — créée par API dans le workspace *Espace de travail*.

| Élément | ID |
|---|---|
| Base | `app8wnK5LRxNVaXq1` |
| Table `Verifications` | `tbl01vfBCqTzkqwRI` |
| Vue par défaut | `viwQijo4MlNDoldem` (Grid) |

Champs (exactement comme spécifié) : `order_id`, `order_number`, `client_nom`, `client_telephone`, `montant` (nombre), `trxid`, `soumis_le` (date+heure), `statut` (select : **A verifier / Paye / Refuse**), `verifie_par`, `verifie_le` (date+heure).

> Les statuts sont **sans accents** (`A verifier`, `Paye`, `Refuse`) pour rester cohérents avec les webhooks/regex n8n. Ne les renomme pas sans mettre à jour les workflows.

## 📦 Préparé en fichiers (à importer toi-même dans n8n)

Je n'ai **aucun accès** à ton instance n8n (VPS Hetzner 178.105.175.214) — pas de credential/API. Les 3 workflows sont donc livrés en JSON, prêts à importer via **n8n → Workflows → Import from File** :

1. `workflow-1-supabase-to-airtable.json` — nouvelle commande à vérifier → ligne Airtable
2. `workflow-2-airtable-to-supabase.json` — validation Airtable → update Supabase
3. `workflow-3-sms-matching.json` — matching auto par SMS (à finaliser en dernier)

---

## ⚠️ Correctif de schéma important

Ton brief citait des colonnes `customer_name`, `customer_phone`, `total_amount` sur `orders`. **Elles n'existent pas.** Schéma réel (Supabase `ujcxhukiwgxwgyiuoryt`) :

| Donnée | Colonne réelle utilisée |
|---|---|
| Nom client | `shipping_address->>firstName` + `lastName` (jsonb) |
| Téléphone | `shipping_address->>phone` (jsonb) |
| Montant | `total_bdt` |
| TrxID / soumission | `trxid`, `trxid_submitted_at` |
| Numéro / id | `order_number`, `id` |
| Résultat | `payment_status`, `verified_by`, `verified_at` |

Les workflows mappent déjà vers ces colonnes réelles.

---

## 🔧 Étapes manuelles à faire (dans l'ordre)

### 0. Credentials n8n à créer une fois (réutilisés par les 3 workflows)
- **`Supabase French Beauty`** (type *Supabase API*) : Host `https://ujcxhukiwgxwgyiuoryt.supabase.co`, Service Role Secret = la `SUPABASE_SERVICE_ROLE_KEY` de ton `.env.local`. → secret stocké dans n8n, **jamais en clair dans les workflows**.
- **`Airtable Paiements bKash`** (type *Airtable Personal Access Token*) : un PAT Airtable avec scopes `data.records:read`, `data.records:write` sur la base `app8wnK5LRxNVaXq1`.
- **`Telegram bKash Bot`** (type *Telegram API*) : le **bot token** obtenu via @BotFather (voir la section « Configuration Telegram » plus bas). Utilisé par les notifs **admin** (WF1 + les 2 alertes WF3).
- **`Resend API`** (type *Header Auth*) : Name = `Authorization`, Value = `Bearer re_xxxxxxxxxxxxxxxxxxxx` (ta clé Resend). Utilisé par les emails **client** (WF2 + WF3). → clé stockée dans n8n, **jamais en clair dans les workflows/GitHub**. Voir la section « Configuration Resend » plus bas.

> **chat_id en dur** : le `chat_id` du groupe admin (`-5162751576`) est écrit **directement dans les 3 nœuds Telegram** (le plan n8n actuel ne licence pas les variables d'environnement — erreur *« Plan lacks license for this feature »*). Si le groupe change un jour, il faudra **modifier manuellement chaque nœud Telegram concerné** (2 dans WF1 : *Notif admin* + *Relance marchand* ; 2 dans WF3 / 4 dans WF7).

Après import, ouvre chaque nœud Airtable/Supabase/Telegram et **sélectionne le credential** (le champ `id` est vide exprès).

### 1. Workflow 1 — activer + brancher le webhook Supabase
1. Importe `workflow-1`, connecte le credential Airtable, **active** le workflow.
2. Copie l'URL de production du nœud *Webhook Supabase* (ex : `https://<ton-n8n>/webhook/bkash-new-verification`).
3. Supabase → **Database → Webhooks → Create** :
   - Table : `orders` · Événements : **UPDATE**
   - Type : HTTP Request · Method : `POST` · URL : l'URL n8n ci-dessus
   - (le filtre `payment_status = paiement_a_verifier` est déjà fait **dans** le workflow, nœud *Filtre*)
4. Notif admin : le nœud **Telegram — Notif admin** est déjà en place (credential `Telegram bKash Bot` à sélectionner ; `chat_id -5162751576` déjà en dur). Rien à remplacer côté admin.
5. **Relance marchand (nouveau).** WF1 embarque désormais une boucle de relance : après la notif initiale, un nœud **Attendre 10 min** patiente, puis **Supabase — Revérifier statut** relit l'état réel de la commande. Tant qu'elle est encore `paiement_a_verifier`, un **Telegram — Relance marchand** part vers le groupe admin (message **en anglais** : `⏰ Reminder (n/3): order #… (… BDT, TrxID …) still awaiting verification`). La boucle se répète **toutes les 10 min, max 3 relances (10/20/30 min)** puis s'arrête (anti-spam si tu es absent). Elle **s'arrête immédiatement** dès que la commande quitte `paiement_a_verifier` (confirmée/refusée à la main via Airtable→WF2, ou auto-confirmée par WF7). Le compteur vit dans l'exécution n8n (nœud *Wait* persistant, via `$runIndex`) → **aucune colonne DB ajoutée**. Le flux **client** (email « payment received » immédiat puis email final) est inchangé : la relance ne cible **que le marchand**.
   - ⚠️ **Nouveau credential requis sur WF1** : le nœud *Supabase — Revérifier statut* utilise **`Supabase French Beauty`** (le même que WF2/WF7). Sélectionne-le après import.
   - Le nœud *Telegram — Relance marchand* utilise le credential **`Telegram bKash Bot`** (chat_id `-5162751576` en dur, comme les autres).

### 2. Workflow 2 — validation Airtable → Supabase
1. Importe `workflow-2`, connecte le credential Supabase, **active**.
2. Copie l'URL du *Webhook Airtable* (`.../webhook/bkash-airtable-validation`).
3. Airtable → base *Paiements bKash* → **Automations → When a record is updated** (champ `statut`) → action **Run a script** (ou *Send webhook*) qui **POST** vers l'URL n8n avec ce corps JSON :
   ```json
   {
     "order_id": "{{order_id}}",
     "order_number": "{{order_number}}",
     "statut": "{{statut}}",
     "verifie_par": "{{verifie_par}}",
     "client_telephone": "{{client_telephone}}"
   }
   ```
   Mappe chaque `{{...}}` sur le champ correspondant de la ligne modifiée.
4. Email client : le nœud **Resend — Email client** est déjà branché sur l'API Resend. Sélectionne le credential `Resend API`. Il envoie un email « paiement confirmé » (si `Paye`) ou « paiement non validé » (si `Refuse`) à l'adresse du client. Rien à remplacer.

> Le workflow mappe `Paye → paye` et `Refuse → refuse`, écrit `verified_by` + `verified_at`, et lit l'email client depuis la ligne Supabase retournée (`shipping_address.email`).

### 3. Workflow 3 — matching SMS (en dernier)
1. Importe `workflow-3`, connecte les credentials Airtable **et** Supabase, **active**.
2. URL du *Webhook SMS* : `.../webhook/bkash-sms-inbound`. Configure ton app de forward SMS (Android dédié) pour POST le texte du SMS en `{"text": "<contenu du SMS>"}`.
3. **Regex durci** dans le nœud *Extraire TrxID (regex)* : `TrxID[:\s]*([A-Z0-9]{6,})` (+ extraction bonus du **montant** `Tk …` et de l'**expéditeur** `from 01…`). Validé sur les formats bKash connus (voir « Test & regex SMS » plus bas). **⚠️ À reconfirmer avec un VRAI SMS bKash** — envoie-m'en un et je verrouille le regex.
4. Notifs admin : les deux nœuds **Telegram — Alerte SMS non reconnu** (format non reconnu) et **Telegram — Alerte TrxID sans commande** (aucune ligne correspondante) sont déjà en place (credential `Telegram bKash Bot` ; `chat_id -5162751576` en dur).
5. Email **client** : le nœud **Resend — Email client (paye)** est déjà branché sur Resend (credential `Resend API`). Rien à remplacer.

---

## 🧩 Placeholders restants (à remplacer)

| Placeholder | Emplacement | Quoi |
|---|---|---|
| `id: ""` | tous les nœuds Airtable/Supabase/Telegram/Resend → `credentials` | À relier après import |
| `onboarding@resend.dev` | WF2 + WF3 nœuds Resend → champ `from` du `jsonBody` | Adresse expéditeur (voir « Configuration Resend ») |
| Base ID Airtable | déjà connu → `app8wnK5LRxNVaXq1` | (rien à faire) |

> **Plus aucun `XXXXXXXXXX` dans les workflows.** Toutes les notifs sont branchées : **admin → Telegram**, **client → Resend**. Il ne reste qu'à connecter les credentials.

Le **PAT Airtable**, la **service_role Supabase**, le **bot token Telegram** et la **clé Resend** vont dans les **credentials n8n**, pas dans les fichiers.

---

## 📧 Configuration Resend (emails client)

1. **Credential n8n** : crée un credential type **Header Auth** nommé **`Resend API`** → Name `Authorization`, Value `Bearer <ta_clé_resend>`. Sélectionne-le sur les 2 nœuds *Resend — Email client* (WF2) et *Resend — Email client (paye)* (WF3).
2. **Adresse expéditeur (`from`)** : par défaut `onboarding@resend.dev` (fourni par Resend). ⚠️ En **sandbox**, Resend ne délivre les emails **qu'à l'adresse du propriétaire du compte** — parfait pour tester, mais **pas** pour de vrais clients.
   - **Pour la production** : vérifie ton domaine dans Resend (*Domains → Add domain*, config DNS SPF/DKIM), puis remplace `onboarding@resend.dev` par ex. `no-reply@tondomaine.com` dans le champ `from` des 2 nœuds Resend.
3. **Email du client** : lu automatiquement depuis la ligne Supabase retournée par le nœud *Update orders* (`shipping_address.email`) — rien à configurer.

> 🔐 Ta clé a été partagée dans le chat : considère-la exposée et **fais-la tourner** (Resend → *API Keys* → recrée-en une), puis mets la nouvelle dans le credential n8n.

---

## 📲 Configuration Telegram (notifs admin)

### a) Créer le bot via @BotFather
1. Dans Telegram, ouvre **[@BotFather](https://t.me/BotFather)** → commande `/newbot`.
2. Donne un **nom** (ex : `French Beauty bKash`) puis un **username** finissant par `bot` (ex : `fb_bkash_bot`).
3. BotFather renvoie un **token** du type `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`.
   → Ce token va dans le credential n8n **`Telegram bKash Bot`** (jamais en clair dans les workflows).

### b) Récupérer le chat_id (méthode groupe — recommandée)
Un **groupe** évite de dupliquer les notifs vers chaque personne.
1. Crée un **groupe Telegram** avec toi + ton associé, et **ajoute le bot** dedans.
2. Envoie n'importe quel message dans le groupe (ex : `/start` ou « test »).
3. Ouvre dans un navigateur (remplace `<TOKEN>`) :
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. Dans la réponse JSON, lis `result[].message.chat.id`. Pour un **groupe**, c'est un **nombre négatif**. C'est ton `chat_id`.

### c) chat_id en dur (limitation du plan n8n)
Le plan n8n actuel ne permet **pas** les variables d'environnement (*« Plan lacks license for this feature »*). Le `chat_id` du groupe (**`-5162751576`**) est donc écrit **en dur dans chaque nœud Telegram** (`workflow-1` : *Telegram — Notif admin* **et** *Telegram — Relance marchand* ; `workflow-3` : *Alerte SMS non reconnu* et *Alerte TrxID sans commande* ; `workflow-7` : 4 nœuds d'alerte/confirmation).

> **Si le groupe change**, modifie le champ *Chat ID* de **chacun** de ces 3 nœuds. Le **token** reste, lui, dans le credential `Telegram bKash Bot` (secret).

---

## 📨 Test & regex SMS (workflow-3)

Le nœud *Extraire TrxID (regex)* applique :
- **TrxID** : `/TrxID[:\s]*([A-Z0-9]{6,})/i` (mis en MAJUSCULES)
- **Montant** (bonus) : `/Tk[:\s]*([\d,]+(?:\.\d{1,2})?)/i`
- **Expéditeur** (bonus) : `/from\s+(01\d{9})/i`

Formats bKash **plausibles** utilisés pour valider le regex (⚠️ à confirmer avec un vrai SMS) :
```
You have received Tk 1,540.00 from 01712345678. Ref None. Fee Tk 0.00 Balance Tk 2,090.50. TrxID BHK7A2C9Q1 at 19/08/2026 15:42
You have received Tk 500.00 from 01812345678. TrxID: 9F2A1B3C4D. Balance Tk 1,200.00
Payment Tk 3,960.00 received from 01912345678 TrxID CDE4F5G6H7 at 19/08/2026 16:10
```
→ TrxID correctement extrait dans les 3 cas ; un SMS non-bKash (OTP, pub) donne `trxid = null` → route vers l'alerte *SMS non reconnu*.

**Tester workflow-3 sans vrai téléphone** — POST un faux SMS sur le webhook (remplace l'URL) :
```bash
curl -X POST "https://<ton-n8n>/webhook/bkash-sms-inbound" \
  -H "Content-Type: application/json" \
  -d '{"text":"You have received Tk 1,540.00 from 01712345678. TrxID BHK7A2C9Q1 at 19/08/2026 15:42"}'
```
Pour tester le **chemin succès**, mets d'abord une ligne dans Airtable avec `trxid = BHK7A2C9Q1` et `statut = A verifier` (le workflow doit la passer à `Paye` + mettre à jour Supabase). Sans ligne correspondante → alerte Telegram *TrxID sans commande* (avec montant + expéditeur).

> 🔑 **Envoie-moi UN vrai SMS bKash** (copie exacte du texte reçu) et j'ajuste le regex au format réel — c'est la seule inconnue restante avant d'activer workflow-3.

---

## 🔐 workflow-7 — auto-confirm par SMS marchand (REMPLACE WF3)

`workflow-7-sms-auto-confirm.json` sécurise la vérification bKash : on ne fait plus confiance au seul TrxID saisi par le client, on **confronte le vrai SMS reçu** sur le téléphone marchand à la commande. Il **remplace WF3** (même path webhook `bkash-sms-inbound`).

**Chaîne :** Webhook (auth header secret) → *Parse SMS* (montant + TrxID + expéditeur) → *IF exploitable* → *Supabase: chercher la commande* `WHERE trxid = <SMS.trxid> AND payment_status='paiement_a_verifier'` → *Décider* :
- **trxid trouvé ET montant SMS == total commande** → `payment_status='paye'` + `status='confirmed'` (auto) + Telegram ✅
- montant différent → Telegram ⚠️ (NON confirmé)
- aucune commande → Telegram ⚠️ (NON confirmé)

**3 garde-fous cumulés avant confirmation :** (1) un vrai SMS *reçu* sur ton numéro (preuve que l'argent est arrivé), (2) TrxID SMS == TrxID soumis par le client (colonne `orders.trxid` **UNIQUE** → pas de rejeu / partage), (3) **montant exact** == `total_bdt`.

### Étapes
1. **Désactive `workflow-3`** dans n8n (il possède le même path `bkash-sms-inbound` → conflit sinon).
2. Importe `workflow-7`, relie les credentials `Supabase French Beauty` et `Telegram bKash Bot`.
3. **Sécurise le webhook (obligatoire).** Le nœud *Webhook SMS (marchand)* est en **Header Auth** (credential `SMS Webhook Token`). Crée un credential n8n type *Header Auth* : Name `x-sms-token`, Value = un secret long aléatoire. → **sans ça, quiconque connaît l'URL peut POSTER un faux SMS et auto-confirmer sans payer** (ça recréerait la faille).
4. Garde **WF4 actif** : quand `status` passe à `confirmed`, il envoie tout seul l'email « confirmed » au client (ne pas dupliquer l'email dans WF7).
5. **Téléphone (SMS Gateway for Android — recommandé)** : forwarder les SMS de l'expéditeur **`bKash` uniquement** vers l'URL du webhook, en ajoutant le header `x-sms-token: <ton secret>`. Corps POST : `{ "text": "<contenu brut du SMS>" }` (le parse lit aussi `message`/`sms`/`payload`).

### Regex (nœud *Parse bKash SMS*)
- **Montant** : `/receiv(?:ed)?(?:\s+payment)?\s+Tk[.:\s]*([\d,]+(?:\.\d{1,2})?)/i` (ancré sur *received* → ignore `Fee`/`Balance`)
- **TrxID** : `/TrxID[:\s]*([A-Z0-9]{10})\b/i` (bKash = 10 car. MAJ ; fallback `{8,12}`)
- **Expéditeur** : `/from\s+(01\d{9})/i`

> ⚠️ **À reconfirmer avec un VRAI SMS bKash** reçu sur le téléphone marchand — envoie le texte exact et on verrouille le regex sur le format réel.

---

## Notes
- Chaque workflow est importé **inactif** (`"active": false`) — active-les après avoir branché les credentials.
- Les nœuds de notification sont en `continueOnFail` : une notif manquante ne bloque pas la synchro paiement.
- Anti-doublon (WF1) : le filtre ignore les updates où le statut était déjà `paiement_a_verifier`.

---

## ✅ Checklist de mise en production (dans l'ordre exact)

1. **Réimporter les 3 JSON à jour** dans n8n (*Workflows → Import from File*) — ça remplace les versions précédentes.
2. **Nœuds Telegram (3 au total)** : vérifier/sélectionner le credential **`Telegram bKash Bot`** (le `chat_id -5162751576` est déjà en dur).
3. **Nœuds Airtable** : créer/sélectionner le credential **`Airtable Paiements bKash`** (PAT avec scope read/write sur `app8wnK5LRxNVaXq1`).
4. **Nœuds Supabase** : créer/sélectionner le credential **`Supabase French Beauty`** (host `https://ujcxhukiwgxwgyiuoryt.supabase.co` + `service_role` du `.env.local`).
5. **Nœuds Resend (WF2 + WF3)** : créer/sélectionner le credential **`Resend API`** (Header Auth : `Authorization = Bearer <clé>`). Pour de vrais clients, vérifier un domaine Resend et remplacer le `from` (voir « Configuration Resend »).
6. **Activer `workflow-1`** → copier l'URL du *Webhook Supabase* générée.
7. **Supabase** (projet `ujcxhukiwgxwgyiuoryt`) → *Database → Webhooks → Create* : table `orders`, événement **UPDATE**, filtre `payment_status = paiement_a_verifier`, POST vers l'URL de l'étape 6.
8. **Activer `workflow-2`** → copier l'URL du *Webhook Airtable* générée.
9. **Airtable** (base *Paiements bKash*) → *Automations → New automation* → trigger **When a record is updated** (champ `statut`) → action **Send webhook** vers l'URL de l'étape 8 (corps JSON : voir §2 ci-dessus).
10. **NE PAS activer `workflow-3`** pour l'instant (dépend du regex SMS pas encore validé avec un vrai SMS bKash).

---

## 🧪 Test de bout en bout (à exécuter après les étapes 1–8)

1. **Passer une commande test** sur https://french-beauty-bd.vercel.app : ajoute un produit au panier → checkout → **bKash** (déjà par défaut) → *Place order*.
2. **Soumettre un faux TrxID** dans la popup (ex : `TESTE2E12345`) → valider. La commande passe en `paiement_a_verifier` côté Supabase.
3. **Vérifier Airtable** : dans *Paiements bKash → Verifications*, une nouvelle ligne apparaît avec `statut = A verifier`, le bon `order_number`, `montant`, `trxid`, nom/téléphone. *(déclenché par WF1 via le webhook Supabase)*
4. **Vérifier Telegram** : une notif *« 🔔 Nouveau paiement à vérifier : FBD-… — … BDT — TrxID TESTE2E12345 »* arrive dans le groupe admin.
5. **Valider à la main dans Airtable** : passe le `statut` de la ligne à **Paye**. *(déclenche l'automation Airtable → WF2)*
6. **Vérifier Supabase** : la commande passe `payment_status = paye`, avec `verified_by` + `verified_at` renseignés (visible dans *Table editor → orders*, ou back-office).
7. **Vérifier l'email client (Resend)** : un email « Paiement confirmé — commande FBD-… » part vers l'adresse de la commande (via WF2). ⚠️ En sandbox Resend (`onboarding@resend.dev`), l'email n'arrive **qu'à l'adresse propriétaire du compte Resend** — pour tester, utilise cette adresse comme email de commande. Vérifie aussi l'onglet *Emails* du dashboard Resend (statut *delivered*).
8. **Nettoyage** : supprime la commande + la ligne Airtable de test.

> Astuce debug : si une étape échoue, ouvre l'onglet **Executions** du workflow concerné dans n8n — chaque exécution montre le payload reçu et l'erreur exacte par nœud.
