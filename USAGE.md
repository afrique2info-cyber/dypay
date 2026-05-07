# Guide d'Utilisation Dypay

Guide complet pour utiliser toutes les fonctionnalites de Dypay, que vous soyez marchand, developpeur ou client.

---

## Table des Matieres

1. [Inscription et Connexion](#1-inscription-et-connexion)
2. [Tableau de Bord](#2-tableau-de-bord)
3. [Gestion des Boutiques](#3-gestion-des-boutiques)
4. [Gestion des Produits](#4-gestion-des-produits)
5. [Produits Digitaux](#5-produits-digitaux)
6. [Gestion du Stock](#6-gestion-du-stock)
7. [Commandes](#7-commandes)
8. [Liens de Paiement](#8-liens-de-paiement)
9. [Point de Vente (POS)](#9-point-de-vente-pos)
10. [Transactions et Historique](#10-transactions-et-historique)
11. [Retraits de Fonds](#11-retraits-de-fonds)
12. [Cartes Virtuelles](#12-cartes-virtuelles)
13. [Personnalisation de Boutique](#13-personnalisation-de-boutique)
14. [Outils Developpeur](#14-outils-developpeur)
15. [Webhooks](#15-webhooks)
16. [SDK](#16-sdk)
17. [Analytiques](#17-analytiques)
18. [Exportations](#18-exportations)
19. [Parametres du Compte](#19-parametres-du-compte)
20. [Parcours Client](#20-parcours-client)

---

## 1. Inscription et Connexion

### Creer un compte marchand

1. Allez sur la page d'accueil et cliquez sur **"Commencer"** ou allez directement sur `/auth`
2. Remplissez le formulaire d'inscription :
   - **Nom de l'entreprise** : Le nom de votre boutique ou entreprise
   - **Email** : Votre adresse email professionnelle
   - **Mot de passe** : Minimum 6 caracteres
3. Cliquez sur **"Creer un compte"**
4. Votre profil marchand est automatiquement cree avec les parametres par defaut

### Se connecter

1. Allez sur `/auth`
2. Entrez votre email et mot de passe
3. Cliquez sur **"Se connecter"**

### Types de compte

- **Individuel** : Pour les vendeurs independants
- **Business** : Pour les entreprises avec equipe

Vous pouvez changer le type de compte dans les parametres.

---

## 2. Tableau de Bord

Le tableau de bord est votre espace central. Il affiche :

- **Solde du compte** : Vos fonds disponibles
- **Nombre de transactions** : Total des paiements recus
- **Volume de ventes** : Montant total des ventes
- **Boutiques actives** : Nombre de boutiques en ligne
- **Graphique des revenus** : Evolution de vos revenus sur 30 jours
- **Transactions recentes** : Les dernieres transactions

### Navigation

Utilisez la barre laterale gauche pour acceder a toutes les sections :

| Onglet | Description |
|--------|-------------|
| Tableau de bord | Vue d'ensemble |
| Boutiques | Gerer vos boutiques en ligne |
| Produits | Gerer votre catalogue |
| Gestion du stock | Suivi d'inventaire |
| Commandes | Gerer les commandes clients |
| Historique ventes | Analytique des ventes |
| Transactions | Historique des paiements |
| Liens de paiement | Creer et gerer les liens |
| Personnalisation | Page Builder et themes |
| Cartes virtuelles | Gerer vos cartes |
| Retraits | Retirer vos fonds |
| Analytiques | Statistiques detaillees |
| Exportations | Exporter vos donnees |
| Cles API | Outils developpeur |
| Webhooks | Configurer les notifications |
| SDK | Telecharger les SDK |
| Parametres | Configuration du compte |

---

## 3. Gestion des Boutiques

### Creer une boutique

1. Allez dans l'onglet **"Boutiques"**
2. Cliquez sur **"Creer une boutique"**
3. Remplissez le formulaire :
   - **Nom de la boutique** : Nom public de votre boutique
   - Description** : Description de votre activite
   - **Pays** : Votre pays d'operation
   - **Devise** : Devise principale
   - **Pays supportes** : Pays ou vous acceptez les paiements
   - **URL personnalisee** : Slug pour votre boutique (ex: `ma-boutique`)
4. Cliquez sur **"Creer"**

Votre boutique sera accessible a l'adresse : `/shop/votre-slug`

### Gerer une boutique

- **Modifier** : Changez les informations de la boutique
- **Activer/Desactiver** : Rendez la boutique visible ou invisible
- **Supprimer** : Supprimez la boutique (irreversible)
- **Voir la boutique** : Ouvrez la boutique publique dans un nouvel onglet

### Multi-devises

Chaque boutique supporte plusieurs devises. Les prix des produits sont automatiquement convertis selon les taux de change en temps reel.

---

## 4. Gestion des Produits

### Ajouter un produit

1. Allez dans l'onglet **"Produits"**
2. Cliquez sur **"Ajouter un Produit"**
3. Remplissez le formulaire :
   - **Nom du produit** : Nom affiche aux clients
   - **Categorie** : Ex: Vetements, Electronique, Formation...
   - **Prix** : Prix dans votre devise principale
   - **Prix comparatif** : Prix barre (pour les promotions)
   - **Description** : Description detaillee
   - **Image** : URL de l'image du produit
   - **Quantite en stock** : Pour les produits physiques
   - **SKU** : Code produit interne
   - **Boutique** : Associez le produit a une boutique
   - **Type de produit** : Physique ou Digital

4. Cliquez sur **"Creer le produit"**

### Frais de service

Un frais de service de **2.5%** est automatiquement ajoute au prix affiche. Ce frais est paye par le client. Vous recevez 100% du prix que vous definissez.

**Exemple** : Prix = 1,000 XAF -> Client paie 1,025 XAF -> Vous recevez 1,000 XAF

### Modifier/Supprimer un produit

- Cliquez sur l'icone **crayon** pour modifier
- Cliquez sur l'icone **poubelle** pour supprimer
- Cliquez sur l'icone **oeil** pour activer/desactiver la visibilite

### Filtrer les produits

- **Recherche** : Cherchez par nom ou description
- **Categorie** : Filtrez par categorie

---

## 5. Produits Digitaux

Les produits digitaux permettent de vendre des fichiers telechargeables : ebooks, formations, logiciels, musique, etc.

### Creer un produit digital

1. Dans le formulaire d'ajout de produit, selectionnez **"Produit digital"**
2. De nouveaux champs apparaissent :
   - **Fichier digital** : Uploadez votre fichier (PDF, ZIP, MP4, MP3, EPUB, DOCX, PPTX)
   - **Taille max** : 500 MB
   - **Limite de telechargements** : Nombre max de telechargements par achat (vide = illimite)
   - **Duree d'acces** : Nombre de jours d'acces apres achat (vide = permanent)

3. Le stock est automatiquement defini a 999999 (illimite)
4. Cliquez sur **"Creer le produit"**

### Processus de livraison

1. Le client achete le produit digital
2. Apres paiement confirme, un acces de telechargement est cree
3. Le client recoit un lien de telechargement securise
4. Chaque telechargement est trace et decompte de la limite
5. L'acces expire apres la duree definie

### Gerer les telechargements

Dans le dashboard, onglet **"Produits"**, les produits digitaux sont marques avec un badge **"Digital"**.

Les clients peuvent acceder a leurs telechargements via la page **"Mes Telechargements"** (`/my-downloads`).

---

## 6. Gestion du Stock

### Suivi d'inventaire

1. Allez dans l'onglet **"Gestion du stock"**
2. Voyez l'etat du stock de tous vos produits
3. Modifiez les quantites en cliquant sur le bouton de modification

### Historique du stock

Chaque modification de stock est enregistree avec :
- Date et heure
- Ancienne quantite
- Nouvelle quantite
- Type de changement (vente, ajustement, retour)

### Alertes

Les produits en stock faible sont mis en evidence pour vous alerter.

---

## 7. Commandes

### Voir les commandes

1. Allez dans l'onglet **"Commandes"**
2. Voyez toutes les commandes avec :
   - Numero de commande
   - Nom du client
   - Montant total
   - Statut (en attente, payee, expediee, annulee)
   - Date

### Statuts de commande

| Statut | Description |
|--------|-------------|
| En attente | Commande creee, en attente de paiement |
| Payee | Paiement confirme |
| Expediee | Produit expedie (physique) |
| Terminee | Commande completee |
| Annulee | Commande annulee |

### Gerer une commande

- **Marquer comme expediee** : Pour les produits physiques
- **Voir les details** : Informations completes de la commande

---

## 8. Liens de Paiement

### Creer un lien de paiement

1. Allez dans l'onglet **"Liens de paiement"**
2. Cliquez sur **"Creer un lien"**
3. Remplissez :
   - **Montant** : Montant a payer
   - **Devise** : Devise du paiement
   - **Description** : Description du paiement
   - **Nom du client** : Optionnel
   - **Email du client** : Optionnel
4. Cliquez sur **"Generer"**

### Partager un lien

- Copiez le lien genere
- Partagez-le par email, SMS, reseaux sociaux
- Le lien redirige vers une page de paiement securisee
- Generez un QR Code pour le lien

### Gerer les liens

- **Activer/Desactiver** : Rendez le lien actif ou inactif
- **Supprimer** : Supprimez le lien
- **Voir les statistiques** : Nombre de visites et paiements

---

## 9. Point de Vente (POS)

### Utiliser le POS

1. Allez sur `/pos` ou utilisez l'onglet POS dans le dashboard
2. Entrez le montant du paiement
3. Selectionnez l'operateur Mobile Money du client
4. Entrez le numero de telephone du client
5. Cliquez sur **"Initier le paiement"**
6. Le client recoit une notification sur son telephone
7. Le client confirme le paiement
8. Le statut est mis a jour automatiquement

### Configuration POS

- **Pays** : Selectionnez votre pays
- **Devise** : Devise par defaut pour les transactions

---

## 10. Transactions et Historique

### Historique des transactions

1. Allez dans l'onglet **"Transactions"**
2. Voyez toutes vos transactions avec :
   - ID de transaction
   - Montant et devise
   - Statut
   - Operateur
   - Numero de telephone
   - Date

### Filtrer les transactions

- **Par date** : Plage de dates
- **Par statut** : Complete, en attente, echouee
- **Par operateur** : MTN, Orange Money, Airtel

### Historique des ventes

L'onglet **"Historique ventes"** affiche :
- Ventes par jour/semaine/mois
- Produits les plus vendus
- Revenus par boutique
- Tendances de vente

---

## 11. Retraits de Fonds

### Configurer le PIN de retrait

1. Allez dans l'onglet **"Retraits"**
2. Si c'est votre premier retrait, configurez votre PIN :
   - Entrez un PIN a 4 chiffres
   - Confirmez le PIN
3. Le PIN est requis pour chaque retrait

### Effectuer un retrait

1. Allez dans l'onglet **"Retraits"**
2. Cliquez sur **"Retirer"**
3. Entrez :
   - **Montant** : Montant a retirer
   - **Numero de telephone** : Numero pour recevoir les fonds
   - **PIN** : Votre PIN de retrait
4. Cliquez sur **"Confirmer"**
5. Les fonds sont transferes via Mobile Money

### Securite

- **Verrouillage du compte** : Apres 5 tentatives de PIN echouees, le compte est verrouille temporairement
- **Historique** : Tous les retraits sont enregistres
- **Minimum** : Montant minimum de retrait selon le pays

---

## 12. Cartes Virtuelles

### Creer une carte virtuelle

1. Allez dans l'onglet **"Cartes virtuelles"**
2. Cliquez sur **"Creer une carte"**
3. La carte est generee avec :
   - Numero de carte unique
   - Date d'expiration
   - CVV
   - Plafond defini

### Gerer les cartes

- **Activer/Desactiver** : Controlez l'etat de la carte
- **Voir les transactions** : Historique des transactions par carte
- **Recharger** : Ajoutez des fonds a la carte

---

## 13. Personnalisation de Boutique

### Page Builder

1. Allez dans l'onglet **"Personnalisation"**
2. Selectionnez une boutique
3. Utilisez le Page Builder pour composer votre page :
   - **Ajouter des blocs** : Cliquez sur le type de bloc a ajouter
   - **Reorganiser** : Glissez-deposez les blocs
   - **Configurer** : Cliquez sur un bloc pour modifier son contenu
   - **Supprimer** : Retirez un bloc

### Blocs disponibles

| Bloc | Description |
|------|-------------|
| Hero | Grande banniere avec titre, sous-titre et CTA |
| Texte | Contenu textuel riche |
| CTA | Bouton d'appel a l'action |
| Image | Image avec legende |
| Features | Grille de fonctionnalites avec icones |
| Grille Produits | Affichage des produits de la boutique |
| Espacement | Espace vide entre les blocs |

### Themes

1. Dans l'onglet **"Personnalisation"**, section Themes
2. Choisissez parmi les themes predefinis ou creez un theme personnalise
3. Configurez :
   - **Couleur principale** : Couleur de marque
   - **Couleur secondaire** : Couleur d'accent
   - **Police** : Choix de police
   - **Logo** : Uploadez votre logo
   - **Banniere** : Image de banniere
   - **Favicon** : Icone du site

---

## 14. Outils Developpeur

### Cles API

1. Allez dans l'onglet **"Cles API"**
2. Vos cles sont generees automatiquement :
   - **Cle de test** : Pour les tests en environnement sandbox
   - **Cle de production** : Pour les vraies transactions
3. Chaque cle a un **secret** associe pour la verification de signature

### Utilisation des cles API

```bash
# Exemple avec curl
curl -X POST https://votre-projet.supabase.co/functions/v1/dypay-process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_CLE_API" \
  -d '{
    "amount": 1000,
    "currency": "XAF",
    "phone": "2376XXXXXXX",
    "operator": "MTN",
    "description": "Paiement test"
  }'
```

### Verification de signature

Pour securiser vos requetes API, utilisez la verification HMAC-SHA256 :

```javascript
const crypto = require('crypto');

const payload = JSON.stringify(body);
const signature = crypto
  .createHmac('sha256', API_SECRET)
  .update(payload)
  .digest('hex');

// Ajoutez la signature dans le header
headers['X-Signature'] = signature;
```

---

## 15. Webhooks

### Configurer un webhook

1. Allez dans l'onglet **"Webhooks"**
2. Cliquez sur **"Ajouter un webhook"**
3. Remplissez :
   - **URL** : L'URL de votre serveur qui recevra les notifications
   - **Evenements** : Selectionnez les evenements a ecouter
4. Cliquez sur **"Creer"**

### Evenements disponibles

| Evenement | Description |
|-----------|-------------|
| `payment.completed` | Paiement complete avec succes |
| `payment.failed` | Paiement echoue |
| `order.completed` | Commande terminee |
| `withdrawal.completed` | Retrait effectue |
| `withdrawal.failed` | Retrait echoue |

### Format du webhook

```json
{
  "event": "payment.completed",
  "data": {
    "payment_id": "uuid",
    "amount": 1000,
    "currency": "XAF",
    "status": "completed",
    "merchant_id": "uuid",
    "created_at": "2026-01-01T00:00:00Z"
  },
  "timestamp": "2026-01-01T00:00:00Z"
}
```

---

## 16. SDK

### SDK JavaScript/Node.js

```javascript
import Dypay from 'dypay';

const client = new Dypay({
  apiKey: 'votre_cle_api',
  apiSecret: 'votre_secret',
  baseUrl: 'https://votre-projet.supabase.co'
});

// Creer un paiement
const payment = await client.createPayment({
  amount: 1000,
  currency: 'XAF',
  phone: '2376XXXXXXX',
  operator: 'MTN',
  description: 'Paiement test'
});
```

### SDK Python

```python
from dypay import DypayClient

client = DypayClient(
    api_key='votre_cle_api',
    api_secret='votre_secret',
    base_url='https://votre-projet.supabase.co'
)

# Creer un paiement
payment = client.create_payment(
    amount=1000,
    currency='XAF',
    phone='2376XXXXXXX',
    operator='MTN',
    description='Paiement test'
)
```

### SDK PHP

```php
require_once 'DypayClient.php';

$client = new DypayClient([
    'api_key' => 'votre_cle_api',
    'api_secret' => 'votre_secret',
    'base_url' => 'https://votre-projet.supabase.co'
]);

// Creer un paiement
$payment = $client->createPayment([
    'amount' => 1000,
    'currency' => 'XAF',
    'phone' => '2376XXXXXXX',
    'operator' => 'MTN',
    'description' => 'Paiement test'
]);
```

### SDK Java

```java
DypayClient client = new DypayClient("votre_cle_api", "votre_secret");

Payment payment = client.createPayment(1000, "XAF", "2376XXXXXXX", "MTN", "Paiement test");
```

---

## 17. Analytiques

### Tableau de bord analytique

1. Allez dans l'onglet **"Analytiques"**
2. Voyez les statistiques detaillees :
   - **Revenus** : Par jour, semaine, mois, annee
   - **Transactions** : Volume et tendance
   - **Produits** : Les plus vendus
   - **Boutiques** : Performance par boutique
   - **Operateurs** : Repartition par operateur Mobile Money

### Graphiques

- **Revenus dans le temps** : Courbe d'evolution
- **Repartition par operateur** : Camembert
- **Top produits** : Barres horizontales
- **Ventes par pays** : Carte

---

## 18. Exportations

### Exporter les donnees

1. Allez dans l'onglet **"Exportations"**
2. Selectionnez le type de donnees :
   - Transactions
   - Commandes
   - Produits
   - Clients
3. Selectionnez la plage de dates
4. Choisissez le format : **CSV** ou **JSON**
5. Cliquez sur **"Exporter"**

---

## 19. Parametres du Compte

### Modifier le profil

1. Allez dans l'onglet **"Parametres"**
2. Modifiez :
   - **Nom de l'entreprise**
   - **Email**
   - **Type de compte** (Individuel/Business)
   - **Pays par defaut**
   - **Devise par defaut**
   - **Numero de telephone**

### Securite

- **Changer le mot de passe**
- **Configurer le PIN de retrait**
- **Gerer les cles API**

---

## 20. Parcours Client

### Comment un client achete

1. **Visite la boutique** : Le client accede a `/shop/nom-boutique`
2. **Parcourt les produits** : Navigue dans le catalogue
3. **Ajoute au panier** : Clique sur "Ajouter au panier"
4. **Consulte le panier** : `/shop/nom-boutique/cart`
5. **Passe au checkout** : `/shop/nom-boutique/checkout`
6. **Remplit les informations** : Nom, email, telephone
7. **Choisit l'operateur** : MTN, Orange Money, etc.
8. **Confirme le paiement** : Le client recoit une notification Mobile Money
9. **Paiement confirme** : Redirection vers la page de succes
10. **Commande confirmee** : `/shop/nom-boutique/order/NUMERO`

### Pour les produits digitaux

Apres le paiement confirme :
1. Le client recoit un acces de telechargement
2. Il peut telecharger le fichier depuis **"Mes Telechargements"** (`/my-downloads`)
3. Le telechargement est trace (limite et expiration)

### Payer via un lien de paiement

1. Le client clique sur le lien de paiement
2. Il arrive sur `/pay/linkId`
3. Il voit le montant et la description
4. Il entre son numero de telephone et choisit l'operateur
5. Il confirme le paiement
6. Redirection vers la page de succes

---

## Pays et Operateurs Supportes

| Pays | Code | Devise | Operateurs |
|------|------|--------|------------|
| Cameroun | CM | XAF | MTN, Orange Money |
| Senegal | SN | XOF | Orange Money, Free Money |
| RDC | CD | CDF | Orange Money, Airtel |
| Ouganda | UG | UGX | MTN, Airtel |
| Liberia | LR | LRD | Orange Money, Lonestar |
| Congo-Brazzaville | CG | XAF | MTN, Airtel |

---

## Raccourcis et Astuces

- **Raccourci clavier** : Utilisez `Ctrl+K` pour la recherche rapide (si implemente)
- **Filtres rapides** : Cliquez sur les en-tetes de colonnes pour trier
- **Actions en masse** : Selectionnez plusieurs elements pour des actions groupees
- **Notifications** : Verifiez regulierement vos webhooks pour les mises a jour en temps reel
