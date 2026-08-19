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
- **`Telegram bKash Bot`** (type *Telegram API*) : le **bot token** obtenu via @BotFather (voir la section « Configuration Telegram » plus bas). Utilisé par les notifs **admin** (WF1 + WF2 alertes).
- **Variable d'environnement n8n `TELEGRAM_ADMIN_CHAT_ID`** : le `chat_id` du **groupe Telegram** admin (toi + associé). Recommandé en variable d'env (et non en dur) car réutilisé par 3 nœuds dans 2 workflows → un seul endroit à changer.

Après import, ouvre chaque nœud Airtable/Supabase/Telegram et **sélectionne le credential** (le champ `id` est vide exprès).

### 1. Workflow 1 — activer + brancher le webhook Supabase
1. Importe `workflow-1`, connecte le credential Airtable, **active** le workflow.
2. Copie l'URL de production du nœud *Webhook Supabase* (ex : `https://<ton-n8n>/webhook/bkash-new-verification`).
3. Supabase → **Database → Webhooks → Create** :
   - Table : `orders` · Événements : **UPDATE**
   - Type : HTTP Request · Method : `POST` · URL : l'URL n8n ci-dessus
   - (le filtre `payment_status = paiement_a_verifier` est déjà fait **dans** le workflow, nœud *Filtre*)
4. Notif admin : le nœud **Telegram — Notif admin** est déjà en place. Connecte le credential `Telegram bKash Bot` et définis la variable d'env `TELEGRAM_ADMIN_CHAT_ID` (voir « Configuration Telegram »). Rien à remplacer côté admin.

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
4. Remplace l'URL `XXXXXXXXXX` du nœud *Notif client* par ton provider email/SMS.

> Le workflow mappe `Paye → paye` et `Refuse → refuse`, et écrit `verified_by` + `verified_at`.

### 3. Workflow 3 — matching SMS (en dernier)
1. Importe `workflow-3`, connecte les credentials Airtable **et** Supabase, **active**.
2. URL du *Webhook SMS* : `.../webhook/bkash-sms-inbound`. Configure ton app de forward SMS (Android dédié) pour POST le texte du SMS en `{"text": "<contenu du SMS>"}`.
3. **⚠️ Le regex `/TrxID[:\s]+([A-Z0-9]+)/i` (nœud *Extraire TrxID*) devra être ajusté avec de vrais SMS bKash** — le format exact n'est pas confirmé. Envoie-moi un vrai SMS reçu et j'affine le regex.
4. Notifs admin : les deux nœuds **Telegram — Alerte SMS non reconnu** (format non reconnu) et **Telegram — Alerte TrxID sans commande** (aucune ligne correspondante) sont déjà en place (credential `Telegram bKash Bot` + env `TELEGRAM_ADMIN_CHAT_ID`).
5. Notif **client** : remplace l'URL `XXXXXXXXXX` du nœud *Notif client (paye)* par ton provider email (inchangé, hors périmètre Telegram).

---

## 🧩 Placeholders restants (à remplacer)

| Placeholder | Emplacement | Quoi |
|---|---|---|
| `XXXXXXXXXX` | `workflow-2` → nœud *Notif client (email/SMS)* → `url` | Provider notif **client** (email) |
| `XXXXXXXXXX` | `workflow-3` → nœud *Notif client (paye)* → `url` | Provider notif **client** (email) |
| `id: ""` | tous les nœuds Airtable/Supabase/Telegram → `credentials` | À relier après import |
| `TELEGRAM_ADMIN_CHAT_ID` | variable d'env n8n (référencée par les 3 nœuds Telegram) | `chat_id` du groupe admin |
| Base ID Airtable | déjà connu → `app8wnK5LRxNVaXq1` | (rien à faire) |

> Les notifs **admin** ne sont plus des placeholders : elles passent par des nœuds **Telegram natifs**. Il ne reste des `XXXXXXXXXX` que sur les notifs **client (email)**, volontairement laissées intactes.

Le **PAT Airtable**, la **service_role Supabase** et le **bot token Telegram** vont dans les **credentials n8n**, pas dans les fichiers.

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
4. Dans la réponse JSON, lis `result[].message.chat.id`. Pour un **groupe**, c'est un **nombre négatif** (ex : `-1002123456789`). C'est ton `chat_id`.
5. Mets cette valeur dans la variable d'env n8n **`TELEGRAM_ADMIN_CHAT_ID`**.

> Variante individuelle : écris directement au bot en privé, puis même appel `getUpdates` → `chat.id` positif. Mais il faudrait alors un nœud par personne → le groupe est plus simple.

### c) Pourquoi env var plutôt que credential pour le chat_id ?
Le `chat_id` n'est pas un secret et est **réutilisé par 3 nœuds** (WF1 + les 2 alertes WF3). En variable d'env `TELEGRAM_ADMIN_CHAT_ID`, tu le changes à **un seul endroit**. Le **token**, lui, reste dans le credential (secret).

---

## Notes
- Chaque workflow est importé **inactif** (`"active": false`) — active-les après avoir branché les credentials.
- Les nœuds de notification sont en `continueOnFail` : une notif manquante ne bloque pas la synchro paiement.
- Anti-doublon (WF1) : le filtre ignore les updates où le statut était déjà `paiement_a_verifier`.
