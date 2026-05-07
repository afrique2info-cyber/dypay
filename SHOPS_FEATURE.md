# Guide des Boutiques DyPay

## Vue d'ensemble

Les marchands peuvent maintenant créer et gérer leurs propres boutiques en ligne directement depuis la plateforme DyPay. Chaque boutique dispose d'une URL unique et personnalisable permettant de présenter leurs produits et services.

## Fonctionnalités

### 1. Création de Boutique

Les marchands peuvent créer une boutique avec les informations suivantes:

#### Informations de Base
- **Nom de la boutique** - Nom affiché de la boutique (requis)
- **URL personnalisée** - Slug unique pour l'accès à la boutique (requis)
  - Format: `dypay.io/shop/nom-de-boutique`
  - Généré automatiquement à partir du nom
  - Vérification de disponibilité en temps réel
- **Description** - Description détaillée de la boutique

#### Informations de Contact
- Email de contact
- Numéro de téléphone
- Adresse complète
- Ville
- Pays (Cameroun, Côte d'Ivoire, Sénégal, RDC, etc.)

#### Réseaux Sociaux
- Facebook
- Instagram
- Twitter
- WhatsApp

#### Personnalisation
- Couleur principale (thème)
- Couleur secondaire
- Personnalisation visuelle complète

### 2. Gestion des Boutiques

Dans le dashboard marchand, sous l'onglet "Mes Boutiques", les marchands peuvent:

#### Visualiser leurs boutiques
- Liste complète de toutes les boutiques
- Statut (Active/Inactive)
- URL publique de la boutique
- Informations de contact
- Réseaux sociaux
- Thème personnalisé

#### Actions disponibles
- **Activer/Désactiver** - Toggle le statut de la boutique
- **Copier l'URL** - Copie rapide du lien de la boutique
- **Ouvrir** - Accès direct à la boutique publique
- **Supprimer** - Suppression définitive de la boutique

### 3. Sécurité et Permissions

#### Row Level Security (RLS)
Toutes les opérations sont sécurisées avec des politiques RLS:

- **SELECT** - Les marchands peuvent voir leurs propres boutiques
- **SELECT (Public)** - Tout le monde peut voir les boutiques actives
- **INSERT** - Les marchands peuvent créer des boutiques
- **UPDATE** - Les marchands peuvent modifier leurs boutiques
- **DELETE** - Les marchands peuvent supprimer leurs boutiques

#### Validation
- Vérification de l'unicité du slug
- Validation de la propriété avant chaque opération
- Protection contre les accès non autorisés

## Structure de la Base de Données

### Table: shops

```sql
CREATE TABLE shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  shop_slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  logo_url text,
  banner_url text,
  contact_email text,
  contact_phone text,
  address text,
  city text,
  country text DEFAULT 'CM',
  website_url text,
  social_media jsonb DEFAULT '{}',
  theme_settings jsonb DEFAULT '{"primaryColor": "#3B82F6", "secondaryColor": "#10B981"}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);
```

### Index
- `idx_shops_merchant_id` - Index sur merchant_id
- `idx_shops_slug` - Index unique sur shop_slug
- `idx_shops_active` - Index sur is_active

### Triggers
- Auto-update de `updated_at` à chaque modification

## API Functions (Frontend)

### Fichier: `src/lib/shops.ts`

#### Fonctions principales

```typescript
// Créer une boutique
await createShop({
  shop_name: "Ma Boutique",
  shop_slug: "ma-boutique",
  description: "Description...",
  contact_email: "contact@boutique.com",
  // ... autres champs
});

// Obtenir toutes les boutiques du marchand
const shops = await getMerchantShops();

// Obtenir une boutique par slug
const shop = await getShopBySlug("ma-boutique");

// Mettre à jour une boutique
await updateShop(shopId, {
  shop_name: "Nouveau nom",
  description: "Nouvelle description"
});

// Activer/désactiver une boutique
await toggleShopStatus(shopId);

// Supprimer une boutique
await deleteShop(shopId);

// Générer un slug à partir d'un nom
const slug = generateSlug("Ma Super Boutique");
// Résultat: "ma-super-boutique"

// Vérifier la disponibilité d'un slug
const available = await isSlugAvailable("ma-boutique");

// Obtenir l'URL complète de la boutique
const url = getShopUrl("ma-boutique");
// Résultat: "https://dypay.io/shop/ma-boutique"
```

## Composants UI

### 1. ShopCreation
Formulaire complet de création de boutique avec:
- Génération automatique du slug
- Vérification de disponibilité en temps réel
- Validation des données
- Sélecteurs de couleurs pour la personnalisation
- Champs pour réseaux sociaux

### 2. ShopManagement
Gestion complète des boutiques:
- Liste de toutes les boutiques
- Actions (activer, désactiver, supprimer)
- Copie rapide de l'URL
- Accès direct à la boutique publique
- État vide avec CTA pour créer la première boutique

### 3. ShopPublicPage (Design E-commerce Premium)
Page publique de boutique en ligne avec design e-commerce moderne inspiré des meilleurs sites:

**Architecture Complète:**
- Header professionnel avec barre supérieure
- Hero section avec bannière personnalisable
- Section badges de confiance
- Grilles de collections avec images
- Section produits en vedette (10 produits)
- Sections promotionnelles
- Section à propos
- Section contact
- Footer minimaliste

**Design Moderne:**
- Navigation sticky avec icônes panier/favoris/recherche
- Menu hamburger responsive
- Images avec effets zoom au hover
- Badges de promotion (-50%, NOUVEAUTÉ, etc.)
- Grille responsive adaptative
- Animations et transitions fluides
- Couleurs thématiques personnalisables
- Ombres et profondeurs modernes

## Design de la Page Publique

### Architecture du Design

#### 1. Header Immersif
- Bannière pleine largeur avec gradient personnalisé basé sur les couleurs du thème
- Support pour image de bannière avec overlay élégant
- Logo de la boutique en relief avec bordure blanche
- Titre et description avec effet de contraste optimal
- Bouton de retour à l'accueil élégant

#### 2. Mise en Page Professionnelle
- Layout en grille responsive (2/3 - 1/3 sur desktop)
- Espacement généreux pour une lecture confortable
- Cards avec ombres douces et bordures subtiles
- Coins arrondis modernes (rounded-2xl)

#### 3. Section À Propos
- Card blanche avec icône thématique
- Typographie optimisée pour la lecture
- Présentation claire de la boutique

#### 4. Carte de Contact (Sticky)
- Reste visible lors du scroll
- Informations de contact avec icônes colorées
- Effets hover sur les liens
- Bouton CTA principal en couleur du thème
- Badge "Propulsé par DyPay"

#### 5. Réseaux Sociaux
- Cards individuelles pour chaque réseau
- Icônes avec couleurs officielles des plateformes
- Effets de transition au survol
- Liens externes sécurisés

#### 6. Palette de Couleurs Dynamique
- Utilisation intelligente des couleurs du thème
- Variation d'opacité pour les backgrounds (15% alpha)
- Contraste optimisé pour la lisibilité
- Gradients personnalisés

### Expérience Mobile
- Design 100% responsive
- Navigation tactile optimisée
- Espacement adaptatif
- Performance optimale

## Utilisation

### Accès depuis le Dashboard

1. Connectez-vous en tant que marchand
2. Cliquez sur "Mes Boutiques" dans le menu latéral
3. Cliquez sur "Créer une boutique"
4. Remplissez le formulaire
5. Validez

### URL Publique

Chaque boutique est accessible via:
```
https://dypay.io/shop/{shop_slug}
```

Exemple:
```
https://dypay.io/shop/ma-super-boutique
```

### Navigation de la Page Publique

La page publique affiche automatiquement:
- **En-tête personnalisé** avec les couleurs du thème
- **Logo** (si fourni) ou icône de boutique par défaut
- **Description** de la boutique
- **Informations de contact** - Email, téléphone, adresse
- **Réseaux sociaux** - Tous les liens configurés
- **Bouton de contact** - CTA avec couleur du thème
- **Footer DyPay** - Branding discret

## Cas d'Usage

### Exemple 1: E-commerce
Un commerçant peut créer une boutique "electronique-plus" pour vendre ses produits électroniques avec des liens de paiement intégrés.

### Exemple 2: Services
Un prestataire de services peut créer une boutique "consulting-expert" pour présenter ses services et accepter les paiements.

### Exemple 3: Multi-boutiques
Un marchand peut gérer plusieurs boutiques pour différents segments:
- "vetements-femme"
- "vetements-homme"
- "accessoires-mode"

## Prochaines Étapes Possibles

### Améliorations futures
1. **Produits** - Ajouter une table `products` liée aux boutiques
2. **Catégories** - Organiser les produits par catégories
3. **Thèmes prédéfinis** - Templates de design pré-configurés
4. **Analytics** - Statistiques de visite et conversion
5. **SEO** - Méta-tags et optimisation SEO
6. **Images** - Upload de logo et bannière
7. **Domaine personnalisé** - Permettre aux marchands d'utiliser leur propre domaine

## Support

Pour toute question concernant les boutiques:
- Dashboard: Section "Mes Boutiques"
- Documentation: `/SHOPS_FEATURE.md`
- Support: support@dypay.io

---

**Date de déploiement:** 11 Février 2026
**Version:** 1.0.0
**Statut:** ✅ Production Ready
