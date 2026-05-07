# Dypay PHP SDK

SDK PHP officiel pour intégrer Dypay dans vos applications PHP.

## Version

1.0.0

## Prérequis

- PHP 7.4 ou supérieur
- Extension cURL activée
- Extension JSON activée

## Installation

### Installation manuelle

1. Téléchargez le SDK depuis votre tableau de bord Dypay
2. Extrayez le contenu dans votre projet
3. Incluez le fichier principal dans votre code:

```php
<?php
require_once 'path/to/DypayClient.php';

use Dypay\DypayClient;
```

### Installation via Composer (bientôt disponible)

```bash
composer require dypay/php-sdk
```

## Configuration

### Obtenir vos clés API

1. Connectez-vous à votre tableau de bord Dypay
2. Allez dans "Clés API"
3. Créez une nouvelle clé API (Test ou Production)
4. Copiez votre clé API et votre secret

### Initialisation du client

```php
<?php
require_once 'DypayClient.php';

use Dypay\DypayClient;

// Mode test
$dypay = new DypayClient(
    'votre_cle_api',
    'votre_secret_api',
    false  // false = mode test, true = mode production
);

// Mode production
$dypay = new DypayClient(
    'votre_cle_api_live',
    'votre_secret_api_live',
    true
);
```

## Utilisation

### Créer un paiement

```php
<?php
try {
    $payment = $dypay->createPayment([
        'amount' => 5000,
        'currency' => 'XAF',
        'item_ref' => 'PROD-123',
        'first_name' => 'Jean',
        'last_name' => 'Dupont',
        'email' => 'jean.dupont@example.com',
        'phone' => '+237600000000',
        'return_url' => 'https://votresite.com/payment/success',
        'notify_url' => 'https://votresite.com/payment/webhook',
        'metadata' => [
            'order_id' => '12345',
            'customer_id' => '67890'
        ]
    ]);

    // Redirigez l'utilisateur vers l'URL de paiement
    header('Location: ' . $payment['payment_url']);
    exit;

} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage();
}
```

### Vérifier le statut d'un paiement

```php
<?php
try {
    $payment = $dypay->getPayment('DYPAY-REF-123456');

    echo 'Statut: ' . $payment['status'];
    echo 'Montant: ' . $payment['amount'] . ' ' . $payment['currency'];

    if ($payment['status'] === DypayClient::PAYMENT_STATUS_COMPLETED) {
        echo 'Paiement réussi!';
    }

} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage();
}
```

### Lister tous les paiements

```php
<?php
try {
    // Sans filtres
    $payments = $dypay->listPayments();

    // Avec filtres
    $payments = $dypay->listPayments([
        'status' => 'completed',
        'limit' => 10,
        'offset' => 0
    ]);

    foreach ($payments as $payment) {
        echo $payment['payment_ref'] . ': ' . $payment['status'] . "\n";
    }

} catch (Exception $e) {
    echo 'Erreur: ' . $e->getMessage();
}
```

### Gérer les webhooks

Créez un fichier `webhook.php` pour recevoir les notifications:

```php
<?php
require_once 'DypayClient.php';

use Dypay\DypayClient;

$dypay = new DypayClient('votre_cle_api', 'votre_secret_api', true);

// Récupérer le corps de la requête
$payload = file_get_contents('php://input');

// Récupérer la signature du header
$signature = $_SERVER['HTTP_X_DYPAY_SIGNATURE'] ?? '';

try {
    // Vérifier et traiter le webhook
    $data = $dypay->handleWebhook($payload, $signature);

    // Traiter l'événement selon le statut
    switch ($data['status']) {
        case DypayClient::PAYMENT_STATUS_COMPLETED:
            // Paiement réussi - débloquez le service/produit
            $orderId = $data['metadata']['order_id'];
            completeOrder($orderId);
            break;

        case DypayClient::PAYMENT_STATUS_FAILED:
            // Paiement échoué
            $orderId = $data['metadata']['order_id'];
            cancelOrder($orderId);
            break;

        case DypayClient::PAYMENT_STATUS_CANCELLED:
            // Paiement annulé
            break;
    }

    // Répondre 200 OK à Dypay
    http_response_code(200);
    echo 'OK';

} catch (Exception $e) {
    // Signature invalide ou erreur
    http_response_code(400);
    echo 'Erreur: ' . $e->getMessage();
}
```

## Devises supportées

Le SDK supporte les devises suivantes:

- `XAF` - Franc CFA (Cameroun, etc.)
- `XOF` - Franc CFA (Sénégal, Côte d'Ivoire, etc.)
- `CDF` - Franc Congolais
- `UGX` - Shilling Ougandais
- `LRD` - Dollar Libérien
- `GNF` - Franc Guinéen

## Statuts de paiement

- `pending` - En attente de paiement
- `completed` - Paiement réussi
- `failed` - Paiement échoué
- `cancelled` - Paiement annulé

## Gestion des erreurs

Toutes les méthodes du SDK peuvent lancer des exceptions `\Exception`:

```php
<?php
try {
    $payment = $dypay->createPayment([...]);
} catch (Exception $e) {
    // Gérer l'erreur
    error_log('Erreur Dypay: ' . $e->getMessage());

    // Afficher un message à l'utilisateur
    echo 'Une erreur est survenue lors du traitement de votre paiement.';
}
```

## Sécurité

### Vérification des webhooks

Toujours vérifier la signature des webhooks pour s'assurer qu'ils proviennent de Dypay:

```php
<?php
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_DYPAY_SIGNATURE'] ?? '';

if (!$dypay->verifyWebhookSignature($payload, $signature)) {
    http_response_code(401);
    die('Signature invalide');
}
```

### Protection des clés API

- Ne jamais exposer vos clés API dans le code côté client
- Stockez vos clés dans des variables d'environnement
- Utilisez des clés de test pour le développement
- Ne commitez jamais vos clés dans Git

Exemple avec variables d'environnement:

```php
<?php
$dypay = new DypayClient(
    getenv('DYPAY_API_KEY'),
    getenv('DYPAY_API_SECRET'),
    getenv('DYPAY_MODE') === 'live'
);
```

## Exemple complet

Voir le fichier `example.php` pour un exemple complet d'intégration.

## Support

Pour toute question ou problème:

- Documentation: https://docs.dypay.com
- Email: support@dypay.com
- Tableau de bord: https://dashboard.dypay.com

## Changelog

### Version 1.0.0 (2026-01-21)

- Version initiale du SDK
- Support des paiements Mobile Money
- Gestion des webhooks
- Support de 6 devises africaines

## Licence

MIT License - Voir le fichier LICENSE pour plus de détails
