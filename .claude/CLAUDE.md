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
| Backend / DB | PocketBase (SQLite + Auth) — auto-hébergé, local `http://127.0.0.1:8090` |
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
│   ├── pocketbase/               # Clients PB : client, server, admin, products, orders
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

> Source de vérité : collection PocketBase `products` (seed initial depuis `data/products.json` via `scripts/migrate-to-pocketbase.ts`). Catalogue gérable depuis l'admin PocketBase sans redéployer. *(Catalogue réel actuel : CeraVe, Vichy, Yves Rocher.)*

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
  → Réception commande dans PocketBase (back-office /admin/orders, garde rôle admin)
  → Traitement expédition depuis France
```

---

## 7. Collections PocketBase & API Rules

Schéma créé par `scripts/pb-schema.ts` (idempotent). Les **API Rules** reproduisent l'ancienne RLS.

| Collection | Champs clés | Rules (lecture / écriture) |
|---|---|---|
| `products` | `ref`(id num. vitrine), `sku`, `slug`, `name`, `brand`, `category`, `description`, `volume`, `price_bdt`, `price_eur`, `image_url` (statique), `gallery`, `in_stock`, `is_new`, `is_bestseller` | **publique** (`list/view = ""`) / **superuser only** |
| `orders` | `user`(relation), `status`, `payment_method`, `payment_status`, `total_bdt`, `shipping_address`(json) | **propriétaire** (`user = @request.auth.id`) / **serveur only** |
| `order_items` | `order`(relation, cascade), `product`(relation), `quantity`, `unit_price_bdt` | `order.user = @request.auth.id` / **serveur only** |
| `users` (auth) | `full_name`, `phone`, `address_line`, `city`, `role` (user/admin) | own-row |

- **Recalcul prix** : `app/api/orders/route.ts` (client ↦ `[{sku, quantity}]` seulement, total recalculé serveur via superuser).
- **Garde admin** : `middleware.ts` + `app/admin/layout.tsx` vérifient le rôle contre PocketBase (`authRefresh`) — le cookie n'est jamais fait confiance.
- **Clients** : `lib/pocketbase/{client,server,admin,products,orders}.ts`.

---

## 8. Variables d'environnement (.env.local)

```env
# PocketBase
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=        # superuser (server-only)
POCKETBASE_ADMIN_PASSWORD=     # superuser (server-only)

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
- [x] **Backend PocketBase** : collections + rules, seed 37 produits, vitrine branchée sur PB (source de vérité)
- [x] **Recalcul de prix côté serveur** (`api/orders`) — anti-fraude
- [x] **Auth PocketBase** native (login/register/reset/account) + **garde admin** (rôle vérifié serveur)
- [x] Back-office `/admin/orders` (liste + bon de commande) sur PocketBase
- [x] SEO (metadata par page, JSON-LD, sitemap/robots), i18n 100% anglais, pages légales
- [x] Git + audit (`docs/AUDIT.md`) ; migration Supabase → PocketBase mergée sur `master`

### ⏳ À faire
- [ ] **Hébergement prod PocketBase** (VPS/service joignable — sinon Vercel ne l'atteint pas)
- [ ] **Promotion admin** : passer ton compte `users.role='admin'` (superuser)
- [ ] **SMTP PocketBase** : pour vérif email + reset password
- [ ] **Images hero/bannière** : fournir les fichiers (fallback propre en attendant)
- [ ] **Paiement réel** bKash/Nagad + webhook partenaire BD
- [ ] **Vercel** : redéploiement une fois PocketBase joignable en prod

### 🔴 Bloquants prod
- PocketBase tourne en **local** (`:8090`) → un déploiement Vercel ne l'atteint pas tant qu'il n'est pas hébergé publiquement

---

## 10. Références

| Ressource | Lien |
|---|---|
| Design inspiration | [choicelegacy.com.bd](https://choicelegacy.com.bd) |
| PocketBase docs | [pocketbase.io/docs](https://pocketbase.io/docs) |
| Next.js 14 App Router | [nextjs.org/docs](https://nextjs.org/docs) |
| bKash Payment Gateway | [developer.bka.sh](https://developer.bka.sh) |
| Nagad API | [nagad.com.bd/developer](https://nagad.com.bd) |
| Higgsfield (visuels) | [higgsfield.ai](https://higgsfield.ai) |
