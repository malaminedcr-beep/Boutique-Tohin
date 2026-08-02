# French Beauty BD — Audit & Corrections

> Récapitulatif de l'audit du projet (Next.js 14 + Supabase + Vercel).
> Réalisé en 5 lots, un commit par lot, sur la branche `master`. **Non déployé.**

## Résumé des commits

| Commit | Lot | Thème |
|---|---|---|
| `213c6bf` | LOT 1 | `fix(security)` — RLS, garde back-office, prix recalculés serveur |
| `8fa2e75` | LOT 2 | `fix` — taxonomie catégories, marques dynamiques, grille, images hero |
| `1ca8236` | LOT 3 | `fix(compliance)` — faux avis, contact via env, pages légales |
| `dfdc7ee` | LOT 4 | `feat(i18n)` — passage 100% anglais + allégations prudentes |
| `57df1a3` | LOT 5 | `feat(seo)` — metadata par page, JSON-LD, sitemap, robots |

Chaque lot a été validé par `npm run build`.

---

## LOT 1 — Sécurité (bloquant)

**Problèmes trouvés**
- `orders` / `order_items` étaient **lisibles et insérables par n'importe qui** (policies RLS `USING (true)` / `WITH CHECK (true)`) → fuite des noms, téléphones, adresses clients + commandes falsifiables.
- Back-office (`/admin`, `/gestion`) **sans aucune garde serveur** (clé anon, pas de vérification de session).
- Checkout **envoyait le prix et le total depuis le navigateur** (falsifiable).
- Auth Supabase en `localStorage` → illisible côté serveur (garde impossible).

**Corrections**
- Migration auth vers cookies (`@supabase/ssr`) ; clients séparés `lib/supabase/{client,server,admin}.ts`.
- `middleware.ts` + `app/admin/layout.tsx` + `app/gestion/layout.tsx` : session + `profiles.role='admin'`, sinon **404**.
- `app/api/orders/route.ts` : reçoit `[{sku, quantity}]`, **recalcule prix/total depuis Supabase**, insère en `service_role`. Le checkout n'insère plus rien en direct.
- Lecture admin (liste + slip) via `service_role` derrière la garde (`GET /api/admin/orders/[id]`).
- `supabase/policies.sql` (**à exécuter manuellement**) : suppression des policies permissives, lecture « sa propre commande », lecture publique `products`, colonne `profiles.role`.
- `scripts/sync-products.ts` : rapport de divergences JSON ↔ Supabase (`--apply` pour seeder).

**Hors périmètre signalé** : table `reservations` (autre app partageant le projet Supabase) ouverte en anon.

---

## LOT 2 — Bugs fonctionnels

- **Slugs catégories incohérents** (nav vs footer) → source unique `lib/categories.ts` (6 catégories réelles : Skincare, Haircare, Bodycare, Fragrance, Musk, Deodorants). Slugs fantômes supprimés (Makeup/Suncare/Serum/Face Wash), « Combo → body-care » retiré.
- **Marques fantômes** (La Roche-Posay, Bioderma) → footer généré dynamiquement via `getAllBrands()`.
- **Grille « Shop by Category » rendue 3×** → une seule grille responsive.
- **Images hero/bannière manquantes** → `next/image` via `components/ui/image-with-fallback.tsx` (ratio fixe + fallback propre).

---

## LOT 3 — Conformité

- **Faux avis** « 4.5★ (12) » identiques sur les 37 produits → composant `Stars` supprimé (pas de table `reviews`).
- **Baseline** « Importateur officiel… » → « Authentic French cosmetics, imported from France ».
- **Contact** placeholder → `lib/contact.ts` (`NEXT_PUBLIC_CONTACT_WHATSAPP` / `_EMAIL` + fallback).
- **Pages légales créées** : `/legal/terms`, `/legal/privacy`, `/legal/returns`, `/shipping`, `/faq` (squelette + `[TO BE COMPLETED]`). Liens footer corrigés.

---

## LOT 4 — Passage 100% anglais

- `<html lang="en">`, toute l'UI storefront + back-office traduite.
- Prix via `Intl.NumberFormat` (`lib/format.ts`, ৳ BDT) ; dates `fr-FR` → `en-US`.
- Chaînes structurées centralisées dans `lib/i18n/strings.ts` (descriptions produits, statuts, paiements) — seam pour un futur bengali.
- **Allégations cosmétiques prudentes** : « renforce la barrière » → *helps strengthen* ; jamais *repairs/treats* ; « Traitement acné » → *Blemish-prone skin* ; « Anti-inflammatoire » → *Soothing*.
- 6 noms produits FR anglicisés (`Soin Concentré Anti-Imperfections` → *Blemish Control Gel*…). Ingrédient « Monoï » conservé.
- **`/gestion` laissé en français** (outil interne, autre business — décision validée).

---

## LOT 5 — SEO

- `lib/seo.ts` + `metadataBase` (via `NEXT_PUBLIC_SITE_URL`), template de titre, OG/Twitter par défaut, `Organization` JSON-LD.
- `generateMetadata()` par page : produit (`{name} {volume} — {brand}` + OG image produit), shop (titre dérivé du filtre), about, brands, confirmation (`noindex`).
- **JSON-LD `Product`** sur la fiche (sku, brand, image, offers price/BDT/availability/url).
- `app/sitemap.ts` (routes statiques + 37 produits) + `app/robots.ts` (disallow `/account /cart /checkout /admin /gestion /api`).
- `product/[id]`, `shop`, `brands` restructurés en **page serveur + composant client** pour metadata/JSON-LD SSR.

---

## Actions requises (côté équipe)

### Bloquant — commandes & sécurité (LOT 1)
1. Ajouter `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local` (sinon checkout + admin KO).
2. Exécuter `supabase/policies.sql` (Dashboard → SQL Editor) — **ferme la fuite de commandes**.
3. Promouvoir le compte admin (`profiles.role='admin'`, requête en bas de `policies.sql`).

### Configuration
4. `.env.local` :
   - `NEXT_PUBLIC_CONTACT_WHATSAPP="+880 1XXXXXXXXX"`
   - `NEXT_PUBLIC_CONTACT_EMAIL="hello@frenchbeautybd.com"`
   - `NEXT_PUBLIC_SITE_URL="https://…"` (si domaine custom)
5. `npx tsx scripts/sync-products.ts --apply` — aligner les noms produits EN dans Supabase.

### Contenu
6. Remplir les `[TO BE COMPLETED]` des pages légales (délais, frais, entité légale, juridiction, rétention). Faire valider terms/privacy/returns par un juriste.
7. Fournir les images :

| Fichier | Dimensions | Usage |
|---|---|---|
| `public/images/hero/hero-portrait.jpg` | 900×1200 (3:4) | Hero homepage |
| `public/images/hero/promo-skincare.jpg` | 1200×900 (4:3) | Bannière promo |
| `public/images/og-default.jpg` | 1200×630 | Open Graph par défaut |
| `public/images/cerave.jpg` | ~1200×800 | Page /brands |
| `public/images/vichy.jpg` | ~1200×800 | Page /brands |
| `public/images/yves-rocher.jpg` | ~1200×800 | Page /brands |

---

## Hors périmètre (non traité)

- Bouton WhatsApp flottant
- Traduction bengali
- Intégration paiements bKash / Nagad réels
- Webhook partenaire BD
- Table `reservations` ouverte en anon (autre app sur le même projet Supabase) — signalée, non modifiée
- `/gestion` (outil interne) laissé en français
