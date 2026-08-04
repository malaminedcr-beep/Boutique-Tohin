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
- **PocketBase** - Backend auto-hébergé (SQLite). Collections `products`, `orders`, `order_items`, `users`. **Source de vérité** du catalogue et des commandes. Local : `http://127.0.0.1:8090`.
- **React Context** - Gestion d'état global du panier (`lib/cart-context.tsx`)
- **Lecture produits** - `lib/pocketbase/products.ts` (serveur). `data/products.json` = **seed initial uniquement** (`scripts/migrate-to-pocketbase.ts`), plus lu en prod.
- *(Migration Supabase → PocketBase effectuée — voir section « Backend PocketBase ».)*

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
│   ├── pocketbase/              # Clients PB : client, server, admin, products, orders
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

### Backend PocketBase (fait)
Le backend est **PocketBase** (migration depuis Supabase, branche `migrate/pocketbase`).

**Collections & API Rules** (équivalent des RLS)
- `products` — lecture **publique** (`list/view = ""`), écriture **superuser only** (`create/update/delete = null`). Champs : `ref`(id numérique vitrine), `sku`, `slug`, `name`, `brand`, `category`, `description`, `volume`, `price_bdt`, `price_eur`, `image_url` (chemins statiques `/images/…`), `gallery`, `in_stock`, `is_new`, `is_bestseller`.
- `orders` / `order_items` — lecture **propriétaire uniquement** (`user = @request.auth.id`), écriture **serveur only**.
- `users` (auth) — champs `full_name`, `phone`, `address_line`, `city`, `role` (user/admin) ; rules own-row.

**Clients** (`lib/pocketbase/`)
- `client.ts` (browser, cookie-sync) · `server.ts` (SSR + `getVerifiedAdmin/User` via `authRefresh`) · `admin.ts` (superuser, server-only) · `products.ts` / `orders.ts` (lectures mappées).

**Sécurité** : recalcul de prix **serveur** dans `app/api/orders/route.ts` (client n'envoie que `[{sku, quantity}]`) ; garde admin (`middleware.ts` + `app/admin/layout.tsx`) qui **vérifie le rôle contre PocketBase** (le cookie n'est jamais fait confiance).

**Lancer PocketBase en local**
```bash
# binaire dans C:\Users\USER\pocketbase\
pocketbase serve --http 127.0.0.1:8090
# superuser : admin@frenchbeauty.local
npx tsx scripts/pb-schema.ts            # crée collections + rules (idempotent)
npx tsx scripts/migrate-to-pocketbase.ts # seed 37 produits depuis products.json
```

**Variables d'environnement** (`.env.local`)
```env
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=...      # superuser (server-only)
POCKETBASE_ADMIN_PASSWORD=...   # superuser (server-only)
```

### Features additionnelles (à venir)
- Intégrer vraie API bKash · Wishlist · Avis clients (collection `reviews`) · Hébergement prod de PocketBase (VPS)

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

**Dernière mise à jour**: Août 2026 — migration backend Supabase → PocketBase
**Version**: 2.0.0
**Status**: Backend PocketBase (local) — hébergement prod PB à décider</content>
<parameter name="filePath">c:\Tohin\CONTEXT.md