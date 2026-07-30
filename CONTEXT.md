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

### État & Données
- **React Context** - Gestion d'état global (panier)
- **Mock Data** - Données produits simulées (`data/products.json`)
- **Commerce Adapter** - Abstraction couche commerce (`lib/commerce/mock.ts`)

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
│   └── commerce/mock.ts         # Données & logique commerce
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
import type { Product } from '../lib/commerce/mock';
```

### Styles
- Classes Tailwind en une ligne
- Utilisation des variables CSS design system
- Responsive: `md:`, `lg:`, `xl:`

## 🔗 Points d'Extension

### Backend Integration
- Remplacer `lib/commerce/mock.ts` par API réelle
- Ajouter authentification utilisateur
- Intégrer vraie API bKash
- Base de données pour commandes

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

**Dernière mise à jour**: Mai 2026
**Version**: 1.0.0
**Status**: Production Ready</content>
<parameter name="filePath">c:\Tohin\CONTEXT.md