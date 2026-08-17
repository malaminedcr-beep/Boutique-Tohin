# French Beauty BD - Contexte du Projet

## 📋 Vue d'ensemble
Boutique en ligne de cosmétiques français pour le Bangladesh, développée avec Next.js 14 et TypeScript.

## 🛠️ Stack Technique

### Framework & Runtime
- **Next.js 14.2.5** - App Router avec TypeScript
- **React 18** - Composants fonctionnels avec hooks
- **Node.js** - Runtime JavaScript

### Styling & UI
- **Tailwind CSS** - Framework CSS utilitaire
- **PostCSS** - Traitement CSS
- **shadcn/ui** - Composants UI (inspiré)
- **Custom Cursor** - Curseur personnalisé

### Fonts & Design
- **Cormorant Garamond** - Serif pour les titres
- **Montserrat** - Sans-serif pour le corps de texte
- **Design System** - Couleurs, espacement, typographie cohérents

### Backend & Données
- **Supabase** (Postgres + Auth) - Backend hébergé, projet `jonny-cargo` (`https://ujcxhukiwgxwgyiuoryt.supabase.co`). Tables `products`, `orders`, `order_items`, `profiles`. **Source de vérité** du catalogue et des commandes. RLS activée.
- **React Context** - Gestion d'état global du panier (`lib/cart-context.tsx`)
- **Lecture produits** - `lib/supabase/products.ts` (serveur, clé anon, lecture publique). `data/products.json` = **seed initial uniquement**, plus lu en prod.
- *(Migration PocketBase → Supabase effectuée le 2026-08-17 — voir section « Backend Supabase ».)*

## 📁 Structure du Projet

```
french-beauty-bd/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Page d'accueil
│   ├── globals.css              # Styles globaux
│   ├── shop/page.tsx            # Boutique avec filtres
│   ├── brands/page.tsx          # Marques avec modales
│   ├── cart/page.tsx            # Panier
│   ├── checkout/page.tsx        # Paiement
│   ├── product/[id]/page.tsx    # Pages produits
│   ├── account/page.tsx         # Compte utilisateur
│   └── about/page.tsx           # À propos
├── components/                   # Composants React
│   ├── Header.tsx               # Navigation principale
│   ├── ProductCard.tsx          # Carte produit
│   ├── BrandModal.tsx           # Modal marques
│   ├── LoadingScreen.tsx        # Écran de chargement
│   └── CustomCursor.tsx         # Curseur personnalisé
├── lib/                         # Utilitaires & logique métier
│   ├── cart-context.tsx         # Contexte panier
│   ├── supabase/               # Clients Supabase : client, server, admin, products, orders
│   └── commerce/                # types.ts (Product) + filter.ts (filtre isomorphe)
├── data/                        # Données statiques
│   └── products.json            # Catalogue produits
├── public/                      # Assets statiques
│   └── images/                  # Images produits
├── styles/                      # Styles additionnels
└── design-system/               # Système de design
```

## 🎨 Design System

### Couleurs
```css
--color-black: #000000
--color-charcoal: #2D3748
--color-cream: #F7F5F0
--color-gold: #D4AF37
--color-background: #FFFFFF
--color-text: #1A202C
```

### Espacement
- Base: 0.25rem (4px)
- Échelle: 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64

### Bordures
- Rayons: 1rem, 1.5rem, 2rem, 2.5rem
- Largeurs: 1px, 2px

## 🔧 Fonctionnalités Implémentées

### ✅ Core Features
- [x] Page d'accueil avec sélection homme/femme
- [x] Boutique avec filtres avancés (genre, marque, prix)
- [x] Pages produits individuelles
- [x] Système de panier complet
- [x] Checkout avec formulaire livraison
- [x] Paiement bKash simulé
- [x] Confirmation de commande
- [x] Pages marques avec modales détaillées
- [x] Navigation responsive
- [x] Barre de recherche (UI prête)

### ✅ UI/UX
- [x] Design premium français
- [x] Animations et transitions fluides
- [x] Responsive design
- [x] Curseur personnalisé
- [x] Icônes SVG cohérentes
- [x] Loading states

### ✅ Architecture
- [x] TypeScript strict
- [x] Composants réutilisables
- [x] Gestion d'état centralisée
- [x] Séparation logique/UI
- [x] Code modulaire et maintenable

## 📊 État du Build
- **Status**: ✅ Compilation réussie
- **Linting**: ✅ Aucune erreur
- **TypeScript**: ✅ Types valides
- **SSR**: ✅ Pages statiques générées
- **Bundle Size**: ~87-99KB first load

## 🚀 Démarrage Rapide

### Installation
```bash
npm install
```

### Développement
```bash
npm run dev
# http://localhost:3000
```

### Build Production
```bash
npm run build
npm start
```

### Tests
```bash
npm run lint
```

## 📝 Conventions de Code

### Nommage
- **Composants**: PascalCase (`ProductCard.tsx`)
- **Fichiers**: kebab-case (`cart-context.tsx`)
- **Variables**: camelCase (`productName`)
- **Types**: PascalCase (`CartItem`)

### Structure Composants
```tsx
'use client'; // Si utilise hooks/state

interface Props {
  // Props typées
}

export default function ComponentName({ prop }: Props) {
  // Logique
  return (
    // JSX
  );
}
```

### Imports
```tsx
// React & Next
import { useState } from 'react';
import Link from 'next/link';

// Composants locaux
import Header from '../components/Header';

// Utilitaires
import { useCart } from '../lib/cart-context';

// Types
import type { Product } from '../lib/commerce/types';
```

### Styles
- Classes Tailwind en une ligne
- Utilisation des variables CSS design system
- Responsive: `md:`, `lg:`, `xl:`

## 🔗 Points d'Extension

### Backend Supabase (fait)
Le backend est **Supabase** (Postgres + Auth), projet `jonny-cargo` — migration depuis PocketBase le 2026-08-17.

**Tables & RLS**
- `products` — lecture **publique** (policy `products_public_read`), écriture **service-role only**. Colonnes : `id`(text), `ref`(id numérique vitrine, unique), `sku`, `slug`, `name`, `brand`, `category`, `description`, `volume`, `price_bdt`, `price_eur`, `image_url` (chemins statiques `/images/…`), `gallery`(jsonb), `in_stock`, `is_new`, `is_bestseller`.
- `orders` / `order_items` — lecture **propriétaire ou admin** (`user_id = auth.uid() or is_admin()`), écriture **service-role only**. `orders.id`/`order_items.id` défaut `gen_random_uuid()::text`.
- `profiles` (lié à `auth.users`, uuid) — `full_name`, `phone`, `address_line`, `city`, `role` (user/admin) ; RLS own-row. Trigger `handle_new_user` crée le profil à l'inscription ; `is_admin()` (security definer) ; garde anti-escalade de rôle.

**Clients** (`lib/supabase/`)
- `client.ts` (browser, `@supabase/ssr`, session cookies) · `server.ts` (SSR + `getVerifiedUser/Admin` via `auth.getUser()`) · `admin.ts` (service-role, server-only, bypass RLS) · `products.ts` / `orders.ts` (lectures mappées).

**Sécurité** : recalcul de prix **serveur** dans `app/api/orders/route.ts` (client n'envoie que `[{sku, quantity}]`) ; garde admin (`middleware.ts` + `app/admin/layout.tsx`) qui **vérifie le rôle dans `profiles`** après revalidation du JWT (le cookie n'est jamais fait confiance).

**Variables d'environnement** (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://ujcxhukiwgxwgyiuoryt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...     # clé publique
SUPABASE_SERVICE_ROLE_KEY=...                        # SECRET, server-only
```

**Migration / seed** : `scripts/pb-to-supabase.mjs` génère le SQL depuis un export PocketBase (outillage one-shot, conservé pour référence). Catalogue gérable ensuite depuis l'admin Supabase.

### Features additionnelles (à venir)
- Intégrer vraie API bKash · Wishlist · Avis clients (table `reviews`) · Config SMTP Supabase (confirmation email + reset)

### Features Additionnelles
- Wishlist/favoris
- Avis clients
- Programme fidélité
- Notifications push
- Multi-langue (fr/bn)

### Performance
- Images optimisées
- Code splitting
- Caching intelligent
- CDN pour assets

## 📞 Support & Maintenance

### Debugging
- Console logs en développement
- Error boundaries pour production
- Monitoring des erreurs

### Mises à jour
- Next.js: `npm update next`
- Dépendances: `npm audit fix`
- Build régulier pour validation

---

**Dernière mise à jour**: 2026-08-17 — migration backend PocketBase → Supabase (projet `jonny-cargo`)
**Version**: 3.0.0
**Status**: Backend Supabase (hébergé) — reste : service-role key sur Vercel, réinscription admin, config confirmation email</content>
<parameter name="filePath">c:\Tohin\CONTEXT.md