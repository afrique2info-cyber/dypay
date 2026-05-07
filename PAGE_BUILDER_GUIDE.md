# Guide du Page Builder - Éditeur de Boutique

## Vue d'ensemble

Le système de Page Builder permet aux marchands de personnaliser entièrement le design de leur boutique en ligne grâce à une interface drag-and-drop intuitive. Si le marchand ne personnalise pas sa boutique, un template par défaut professionnel s'affiche automatiquement.

## Fonctionnalités principales

### 1. Éditeur Drag and Drop
- **Interface visuelle** : Glissez-déposez des blocs pour réorganiser votre page
- **Aperçu en temps réel** : Visualisez vos modifications instantanément
- **Édition des propriétés** : Personnalisez le contenu et le style de chaque bloc

### 2. Blocs disponibles

#### Hero / Bannière
- Titre principal et sous-titre
- Bouton d'appel à l'action
- Image de fond personnalisable
- Couleurs et padding configurables

#### Grille de produits
- Affichage automatique des produits de la boutique
- Configuration du nombre de colonnes (2, 3 ou 4)
- Options d'affichage (catégorie, prix)
- Titre et description personnalisables

#### Fonctionnalités
- Affichage des avantages de la boutique
- Icônes personnalisables (Sécurité, Livraison, Support, etc.)
- Jusqu'à 3 fonctionnalités par bloc
- Titres et descriptions modifiables

#### Contenu texte
- Zone de texte riche pour du contenu personnalisé
- Alignement du texte (gauche, centré, droite)
- Titre optionnel

#### Image
- Insertion d'images via URL
- Texte alternatif et légende
- Lien optionnel sur l'image

#### Appel à l'action (CTA)
- Titre accrocheur
- Description
- Bouton avec lien personnalisable
- Couleurs et styles configurables

#### Espaceur
- Ajoute de l'espace entre les sections
- Hauteur personnalisable

### 3. Système de thème
Chaque configuration de page inclut des paramètres de thème globaux :
- Couleur principale
- Couleur secondaire
- Couleur de fond
- Couleur du texte
- Police de caractères

## Comment utiliser l'éditeur

### Accès à l'éditeur
1. Connectez-vous à votre dashboard marchand
2. Cliquez sur **"Éditeur de boutique"** dans le menu latéral
3. Sélectionnez la boutique à personnaliser (si vous en avez plusieurs)

### Créer votre page

#### 1. Ajouter des blocs
- Dans le panneau gauche, cliquez sur le type de bloc souhaité
- Le bloc sera ajouté à la fin de votre page
- Vous pouvez ajouter autant de blocs que nécessaire

#### 2. Réorganiser les blocs
**Méthode 1 : Drag and Drop**
- Cliquez et maintenez sur un bloc dans le panneau gauche
- Faites glisser le bloc vers sa nouvelle position
- Relâchez pour déposer

**Méthode 2 : Boutons fléchés**
- Cliquez sur un bloc dans la liste
- Utilisez les boutons ↑ (haut) et ↓ (bas) pour déplacer

#### 3. Éditer un bloc
- Cliquez sur un bloc dans la liste ou dans l'aperçu
- Le panneau de droite affiche les paramètres du bloc
- Modifiez le contenu :
  - Textes (titres, descriptions, boutons)
  - Images (URLs)
  - Liens
  - Options d'affichage
- Personnalisez le style :
  - Couleur de fond
  - Couleur du texte
  - Espacement (padding)

#### 4. Dupliquer ou supprimer
- **Dupliquer** : Cliquez sur l'icône copie (📋) pour créer une copie exacte
- **Supprimer** : Cliquez sur l'icône corbeille (🗑️) pour retirer le bloc

### Prévisualiser et publier

#### Aperçu
- Cliquez sur le bouton **"Aperçu"** en haut à droite
- Visualisez votre page telle qu'elle apparaîtra aux visiteurs
- Cliquez sur **"Éditer"** pour revenir à l'édition

#### Sauvegarder
- Cliquez sur **"Sauvegarder"** pour enregistrer vos modifications
- Vos changements sont sauvegardés mais pas encore visibles publiquement

#### Publier
- Cliquez sur **"Publier"** pour rendre votre design personnalisé visible
- Une fois publié, votre boutique affichera votre design au lieu du template par défaut
- Vous pouvez continuer à modifier et republier à tout moment

## Template par défaut

Si vous ne personnalisez pas votre boutique, un template professionnel s'affiche automatiquement avec :
- Une section hero avec carousel d'images
- Affichage des avantages (livraison, sécurité, etc.)
- Grille de produits en vedette
- Sections promotionnelles
- Section "À propos"
- Informations de contact

## Meilleures pratiques

### Design
1. **Hiérarchie visuelle** : Commencez par un Hero pour attirer l'attention
2. **Espacement** : Utilisez des espaceurs pour une mise en page aérée
3. **Cohérence** : Gardez des couleurs et styles cohérents
4. **Call-to-action** : Placez des CTAs stratégiquement dans votre page

### Contenu
1. **Titres clairs** : Utilisez des titres descriptifs et engageants
2. **Textes concis** : Gardez vos descriptions courtes et percutantes
3. **Images de qualité** : Utilisez des images haute résolution
4. **Produits en avant** : Mettez votre grille de produits en position centrale

### Performance
1. **Optimisation d'images** : Utilisez des URLs d'images optimisées
2. **Nombre de blocs** : Évitez de surcharger avec trop de blocs
3. **Testez mobile** : Vérifiez que votre design est responsive

## Support technique

### Problèmes courants

**Le design ne s'affiche pas**
- Vérifiez que vous avez cliqué sur "Publier"
- Rafraîchissez la page de votre boutique

**Les images ne s'affichent pas**
- Vérifiez que les URLs sont correctes et accessibles
- Utilisez des URLs HTTPS

**Les modifications ne sont pas sauvegardées**
- Assurez-vous d'avoir cliqué sur "Sauvegarder"
- Vérifiez votre connexion internet

## Architecture technique

### Base de données
- Table `shop_page_configs` : stocke les configurations de page
- Champs principaux :
  - `blocks` (jsonb) : Array des blocs de la page
  - `theme_settings` (jsonb) : Paramètres du thème
  - `is_published` (boolean) : Statut de publication

### Composants React
- `PageBuilderEditor` : Éditeur principal
- `BlockRenderer` : Rendu des blocs
- `BlockEditor` : Panneau d'édition des propriétés
- Blocs individuels : `HeroBlock`, `ProductsGridBlock`, etc.

### Sécurité
- RLS (Row Level Security) activé
- Les marchands peuvent uniquement modifier leurs propres boutiques
- Les configurations publiées sont visibles publiquement
