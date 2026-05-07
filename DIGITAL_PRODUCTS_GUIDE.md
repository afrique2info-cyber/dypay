# Guide des Produits Digitaux Dypay

## Vue d'ensemble

Le système de produits digitaux de Dypay permet aux marchands de vendre et distribuer des produits numériques tels que:
- Formations en ligne
- Ebooks et livres électroniques
- Fichiers audio et vidéo
- Archives ZIP contenant des ressources
- Documents PDF
- Présentations et documents professionnels

## Fonctionnalités Principales

### 1. Gestion des Produits Digitaux

#### Types de Fichiers Supportés
- **Documents**: PDF, DOCX, PPTX, EPUB
- **Archives**: ZIP
- **Vidéo**: MP4, MOV
- **Audio**: MP3
- **Limite de taille**: 500 MB par fichier

#### Création d'un Produit Digital

1. Accédez à **Produits** dans le menu
2. Cliquez sur **Ajouter un Produit**
3. Sélectionnez **Produit digital** comme type
4. Remplissez les informations:
   - Nom du produit
   - Description
   - Prix
   - Image de couverture (optionnel)
   - Catégorie
5. **Téléchargez le fichier digital** (max 500MB)
6. Configurez les options d'accès:
   - **Limite de téléchargements**: Nombre maximum de fois que le client peut télécharger (laissez vide pour illimité)
   - **Durée d'accès**: Nombre de jours pendant lesquels le client peut accéder au fichier (laissez vide pour accès permanent)

### 2. Stockage Sécurisé

- Les fichiers sont stockés dans un bucket Supabase sécurisé
- Accès contrôlé par des tokens temporaires
- Aucun accès direct aux fichiers
- Protection contre le partage non autorisé

### 3. Livraison Automatique

Après un paiement réussi:
1. Le système crée automatiquement un accès de téléchargement
2. Le client reçoit un lien sécurisé
3. L'accès est ajouté à l'espace "Mes téléchargements" du client
4. Les limites et dates d'expiration sont automatiquement appliquées

### 4. Gestion des Accès Client

Les clients peuvent:
- Voir tous leurs produits digitaux achetés
- Télécharger les fichiers via des liens sécurisés
- Voir le nombre de téléchargements restants
- Vérifier les dates d'expiration

### 5. Contrôles de Sécurité

#### Téléchargements Limités
- Configurez un nombre maximum de téléchargements par achat
- Protège contre le partage excessif
- Idéal pour les formations premium

#### Accès Temporaire
- Définissez une durée d'accès en jours
- Parfait pour les abonnements à durée limitée
- Accès révoqué automatiquement après expiration

#### Tokens Sécurisés
- Chaque téléchargement génère un token unique
- Les tokens expirent après utilisation
- Durée de validité de 1 heure
- Impossible de partager les liens de téléchargement

### 6. Suivi et Analytiques

Le système enregistre:
- Nombre de téléchargements par client
- Date du dernier téléchargement
- Statut d'expiration
- Limites de téléchargement atteintes

## Workflow Technique

### 1. Upload du Fichier
```
Marchand → Formulaire produit → Upload → Stockage Supabase
```

### 2. Création de l'Accès
```
Paiement réussi → Trigger automatique → Création entrée digital_downloads
```

### 3. Téléchargement Sécurisé
```
Client clique → Génération token → URL signée temporaire → Téléchargement
```

## Structure de la Base de Données

### Table `products`
- `product_type`: 'physical' ou 'digital'
- `digital_file_url`: Chemin du fichier dans le storage
- `digital_file_size`: Taille en bytes
- `digital_file_type`: Type MIME
- `download_limit`: Nombre max de téléchargements (null = illimité)
- `access_duration_days`: Durée d'accès en jours (null = permanent)

### Table `digital_downloads`
- `order_id`: Référence à la commande
- `product_id`: Référence au produit
- `customer_email`: Email du client
- `download_count`: Nombre de téléchargements effectués
- `last_downloaded_at`: Date du dernier téléchargement
- `expires_at`: Date d'expiration d'accès
- `created_at`: Date de création

### Table `download_tokens`
- `digital_download_id`: Référence au téléchargement
- `token`: Token unique sécurisé
- `expires_at`: Expiration du token (1 heure)
- `used`: Statut d'utilisation
- `used_at`: Date d'utilisation
- `ip_address`: IP du téléchargeur
- `user_agent`: Navigateur utilisé

## API Edge Function

### `generate-download-link`

**Endpoint**: `/functions/v1/generate-download-link`

**Méthode**: POST

**Headers**:
```json
{
  "Authorization": "Bearer <session_token>",
  "Content-Type": "application/json"
}
```

**Body**:
```json
{
  "download_id": "uuid-du-téléchargement"
}
```

**Response**:
```json
{
  "download_url": "https://...",
  "token": "token-sécurisé",
  "product_name": "Nom du produit",
  "downloads_remaining": 5,
  "expires_at": "2024-12-31T23:59:59Z"
}
```

## Cas d'Usage

### Formations en Ligne
- Vidéos de formation en MP4
- Accès limité à 90 jours
- 10 téléchargements maximum
- Documents PDF complémentaires

### Ebooks
- Fichiers PDF ou EPUB
- Accès permanent
- 3 téléchargements (pour différents appareils)

### Ressources Professionnelles
- Archives ZIP avec templates
- Accès permanent
- Téléchargements illimités

### Abonnements Mensuels
- Contenu renouvelé chaque mois
- Accès de 30 jours
- 1 téléchargement par produit

## Bonnes Pratiques

1. **Nommage des Fichiers**
   - Utilisez des noms clairs et descriptifs
   - Évitez les caractères spéciaux

2. **Taille des Fichiers**
   - Compressez les vidéos pour réduire la taille
   - Optimisez les PDF
   - Utilisez des archives ZIP pour grouper les fichiers

3. **Configuration d'Accès**
   - Formations premium: 90 jours, 10 téléchargements
   - Ebooks: Permanent, 3 téléchargements
   - Ressources gratuites: Permanent, illimité

4. **Images de Couverture**
   - Utilisez des images attrayantes
   - Format recommandé: 1200x800px
   - Montrez un aperçu du contenu

5. **Descriptions**
   - Listez ce qui est inclus
   - Mentionnez les prérequis
   - Indiquez la durée (pour vidéos/formations)
   - Précisez le format du fichier

## Sécurité

- ✅ Fichiers stockés dans un bucket privé
- ✅ URLs signées temporaires (1 heure)
- ✅ Authentification requise
- ✅ Vérification des limites de téléchargement
- ✅ Vérification des dates d'expiration
- ✅ Logs des téléchargements
- ✅ Protection contre le partage non autorisé

## Frais de Service

Les frais de service de 2.5% s'appliquent également aux produits digitaux:
- Le marchand définit le prix
- 2.5% sont automatiquement ajoutés au checkout
- Le marchand reçoit 100% du prix défini
- Les frais couvrent le traitement du paiement et le stockage sécurisé

## Support

Pour toute question ou problème:
- Consultez la documentation complète
- Vérifiez les logs dans le dashboard
- Contactez le support technique Dypay
