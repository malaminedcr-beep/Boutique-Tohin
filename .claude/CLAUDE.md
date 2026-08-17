# CONTEXT.md — French Beauty BD
> Fichier de contexte projet. À lire en priorité avant toute intervention sur le codebase.

---

## 1. Vision du projet

**French Beauty BD** est une boutique e-commerce de cosmétiques français destinée au marché bangladais.

- **Modèle économique** : Zéro stock. Les produits sont sourcés en France et expédiés directement au Bangladesh depuis des partenaires logistiques français.
- **Positionnement** : Cosmétiques authentiques, certifiés, provenant de grandes marques françaises — inaccessibles ou contrefaits localement.
- **Marché cible** : Consommateurs bangladais urbains (Dhaka, Chittagong), principalement féminins, 20–40 ans, sensibles à la qualité et à l'authenticité.
- **Avantage concurrentiel** : Authenticité garantie, design luxe/éditorial, paiement local (COD, bKash, Nagad), interface en anglais adaptée au Bangladesh.

---

## 2. Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (Postgres + Auth) — projet `jonny-cargo`, `https://ujcxhukiwgxwgyiuoryt.supabase.co` |
| Images | Fichiers statiques `/public/images` (pas de storage DB) |
| State management | React Context (`lib/cart-context.tsx`) |
| Déploiement | Vercel |
| Paiement | COD · bKash · Nagad (via webhook partenaire BD) |
| Design system | `.claude/skills/ui-ux-pro-max/design-system/MASTER.md` |

---

## 3. Structure des dossiers

```
C:\Tohin\
├── app/
│   ├── page.tsx                  # Homepage
│   ├── shop/
│   │   └── page.tsx              # Shop avec filtres
│   ├── product/
│   │   └── [slug]/page.tsx       # Fiche produit dynamique
│   ├── cart/
│   │   └── page.tsx              # Panier
│   ├── checkout/
│   │   └── page.tsx              # Checkout COD/bKash/Nagad
│   ├── confirmation/
│   │   └── page.tsx              # Confirmation commande
│   ├── account/
│   │   └── page.tsx              # Espace client
│   ├── login/
│   │   └── page.tsx              # Authentification
│   └── register/
│       └── page.tsx              # Inscription
├── components/
│   ├── layout/
│   │   ├── AnnouncementBar.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── HeroBanner.tsx
│   │   ├── CategoryArches.tsx    # Style Choice Legacy
│   │   └── FeaturedProducts.tsx
│   ├── shop/
│   │   ├── FilterSidebar.tsx     # Availability / Price / Category / Brand
│   │   └── ProductGrid.tsx
│   ├── product/
│   │   └── ProductCard.tsx
│   └── checkout/
│       └── PaymentSelector.tsx   # COD / bKash / Nagad
├── lib/
│   ├── supabase/                # Clients Supabase : client, server, admin, products, orders
│   ├── commerce/                 # types.ts (Product) + filter.ts (filtre isomorphe)
│   ├── cart-context.tsx          # État panier (React Context)
│   └── types/                    # Types TypeScript globaux
├── public/
│   ├── images/
│   │   ├── hero/                 # Banners homepage (à générer via Higgsfield)
│   │   └── products/             # Images produits (CeraVe, Vichy, etc.)
├── .env.local                    # Variables d'environnement (ne pas commiter)
├── .claude/
│   └── skills/
│       └── ui-ux-pro-max/
│           └── design-system/
│               └── MASTER.md     # Design system complet
└── CONTEXT.md                    # Ce fichier
```

---

## 4. Design system

### Palette de couleurs
| Token | Valeur | Usage |
|---|---|---|
| `--color-bg` | `#FAF8F5` | Fond global (crème chaud) |
| `--color-accent` | `#C9513A` | CTA, boutons principaux, accents |
| `--color-text` | `#1A1A1A` | Texte principal |
| `--color-muted` | `#6B6B6B` | Texte secondaire |
| `--color-border` | `#E8E2DA` | Bordures, séparateurs |
| `--color-white` | `#FFFFFF` | Cards, modales |

### Typographie
- **Titres** : Playfair Display (serif) — luxe, éditorial
- **Corps** : Inter (sans-serif) — lisibilité, modernité

### Composants clés
- **CategoryArches** : Arches style [choicelegacy.com.bd](https://choicelegacy.com.bd) — visuels catégories
- **FilterSidebar** : Gauche, sticky, sections : Availability / Price / Category / Brand
- **AnnouncementBar** : Barre rouge `#C9513A` en haut avec message promo/livraison
- **ProductCard** : Image + marque + nom + prix BDT + bouton Add to Cart

---

## 5. Catalogue produits

**37 produits** répartis sur 6 marques :

| Marque | Positionnement | Catégories |
|---|---|---|
| CeraVe | Dermo-cosmétique US | Hydratation, nettoyants, SPF |
| Vichy | Pharmacie française | Anti-âge, minéral, corps |
| La Roche-Posay | Peau sensible | Cicaplast, Anthelios, Effaclar |
| Yves Rocher | Naturel / accessible | Soins visage, corps, cheveux |
| Bioderma | Dermo-pharmacie | Micellar water, sensibio |
| Nuxe | Luxe naturel | Huiles, Prodigieux |
| Avène | Eau thermale | Peaux réactives, bébé |

> Source de vérité : table Supabase `products` (44 lignes migrées depuis PocketBase le 2026-08-17). Catalogue gérable depuis l'admin Supabase sans redéployer. *(Marques réelles actuelles : CeraVe, Vichy, Yves Rocher, La Roche-Posay.)*

---

## 6. Flux de commande

```
[Client] 
  → Browse shop / filtres
  → Fiche produit
  → Add to Cart (React Context)
  → Checkout
      → Saisie adresse Bangladesh (Dhaka / Chittagong / autres)
      → Sélection paiement :
          ① COD (Cash on Delivery) — valeur par défaut
          ② bKash — numéro de mobile money
          ③ Nagad — numéro de mobile money
  → Confirmation commande
      → Email de confirmation
      → Webhook partenaire Bangladesh (à implémenter)
[Admin]
  → Réception commande dans Supabase (back-office /admin/orders, garde rôle admin)
  → Traitement expédition depuis France
```

---

## 7. Tables Supabase & RLS

Postgres avec Row Level Security. IDs PocketBase préservés en clés `text` lors de la migration.

| Table | Champs clés | RLS (lecture / écriture) |
|---|---|---|
| `products` | `id`(text), `ref`(id num. vitrine, unique), `sku`, `slug`, `name`, `brand`, `category`, `description`, `volume`, `price_bdt`, `price_eur`, `image_url` (statique), `gallery`(jsonb), `in_stock`, `is_new`, `is_bestseller` | **publique** (`products_public_read`) / **service-role only** |
| `orders` | `id`(text, défaut uuid), `user_id`(uuid→profiles), `status`, `payment_method`, `payment_status`, `total_bdt`, `shipping_address`(jsonb) | **propriétaire ou admin** (`user_id = auth.uid() or is_admin()`) / **service-role only** |
| `order_items` | `order_id`(text, cascade), `product_id`(text), `quantity`, `unit_price_bdt` | lisible si commande parente lisible / **service-role only** |
| `profiles` (lié `auth.users`, uuid) | `full_name`, `phone`, `address_line`, `city`, `role` (user/admin) | own-row ; trigger `handle_new_user`, `is_admin()`, garde anti-escalade de rôle |

- **Recalcul prix** : `app/api/orders/route.ts` (client ↦ `[{sku, quantity}]` seulement, total recalculé serveur via service-role).
- **Garde admin** : `middleware.ts` + `app/admin/layout.tsx` revalident le JWT (`auth.getUser()`) puis vérifient `profiles.role` — le cookie n'est jamais fait confiance.
- **Clients** : `lib/supabase/{client,server,admin,products,orders}.ts`.

---

## 8. Variables d'environnement (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ujcxhukiwgxwgyiuoryt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   # clé publique
SUPABASE_SERVICE_ROLE_KEY=                          # SECRET, server-only

# Paiements Bangladesh (à configurer)
BKASH_APP_KEY=
BKASH_APP_SECRET=
NAGAD_MERCHANT_ID=
NAGAD_MERCHANT_PRIVATE_KEY=

# Webhook partenaire BD
PARTNER_WEBHOOK_URL=
PARTNER_WEBHOOK_SECRET=
```

---

## 9. État d'avancement

### ✅ Fait
- [x] Boutique complète (home, shop + filtres, fiches produits, panier React Context, checkout COD/bKash/Nagad, confirmation)
- [x] **Backend Supabase** : tables + RLS, 44 produits migrés, vitrine branchée sur Supabase (source de vérité), hébergé
- [x] **Recalcul de prix côté serveur** (`api/orders`) — anti-fraude
- [x] **Auth Supabase** native (login/register/reset/account) + **garde admin** (rôle vérifié serveur)
- [x] Back-office `/admin/orders` (liste + bon de commande) sur Supabase
- [x] SEO (metadata par page, JSON-LD, sitemap/robots), i18n 100% anglais, pages légales
- [x] Migration PocketBase → Supabase (projet `jonny-cargo`) : code réécrit, `npm run build` OK

### ⏳ À faire
- [ ] **Service-role key** : copier depuis Supabase dans `.env.local` + Vercel (sinon création de commande KO)
- [ ] **Env Supabase sur Vercel** + retrait des `POCKETBASE_*`, puis redéploiement
- [ ] **Promotion admin** : réinscrire `malaminedcr@gmail.com` puis `update profiles set role='admin'`
- [ ] **SMTP / confirmation email Supabase** : sinon désactiver "Confirm email" dans Auth settings
- [ ] **Images hero/bannière** : fournir les fichiers (fallback propre en attendant)
- [ ] **Paiement réel** bKash/Nagad + webhook partenaire BD

### 🔴 Bloquants prod
- `SUPABASE_SERVICE_ROLE_KEY` absente de Vercel → les créations de commande échoueront tant qu'elle n'est pas configurée

---

## 10. Références

| Ressource | Lien |
|---|---|
| Design inspiration | [choicelegacy.com.bd](https://choicelegacy.com.bd) |
| Supabase docs | [supabase.com/docs](https://supabase.com/docs) |
| Next.js 14 App Router | [nextjs.org/docs](https://nextjs.org/docs) |
| bKash Payment Gateway | [developer.bka.sh](https://developer.bka.sh) |
| Nagad API | [nagad.com.bd/developer](https://nagad.com.bd) |
| Higgsfield (visuels) | [higgsfield.ai](https://higgsfield.ai) |
