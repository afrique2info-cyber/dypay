<?php

/**
 * Exemple complet d'utilisation du SDK Dypay PHP
 *
 * Ce fichier montre comment intégrer Dypay dans votre application PHP
 */

require_once 'DypayClient.php';

use Dypay\DypayClient;

// Configuration
define('DYPAY_API_KEY', 'votre_cle_api_ici');
define('DYPAY_API_SECRET', 'votre_secret_api_ici');
define('DYPAY_MODE', 'test'); // 'test' ou 'live'

// Initialiser le client
$dypay = new DypayClient(
    DYPAY_API_KEY,
    DYPAY_API_SECRET,
    DYPAY_MODE === 'live'
);

echo "=== Exemple d'intégration Dypay PHP SDK ===\n\n";

// Exemple 1: Créer un paiement
echo "1. Création d'un paiement\n";
echo "-------------------------\n";

try {
    $payment = $dypay->createPayment([
        'amount' => 5000,
        'currency' => 'XAF',
        'item_ref' => 'PROD-' . time(),
        'first_name' => 'Jean',
        'last_name' => 'Dupont',
        'email' => 'jean.dupont@example.com',
        'phone' => '+237600000000',
        'return_url' => 'https://votresite.com/payment/success',
        'notify_url' => 'https://votresite.com/payment/webhook',
        'metadata' => [
            'order_id' => '12345',
            'customer_id' => '67890',
            'description' => 'Achat de produit'
        ]
    ]);

    echo "✓ Paiement créé avec succès!\n";
    echo "  - Référence: {$payment['payment_ref']}\n";
    echo "  - Montant: {$payment['amount']} {$payment['currency']}\n";
    echo "  - Statut: {$payment['status']}\n";
    echo "  - URL de paiement: {$payment['payment_url']}\n\n";

    // Dans une vraie application, vous redirigeriez l'utilisateur vers payment_url
    // header('Location: ' . $payment['payment_url']);
    // exit;

    $paymentRef = $payment['payment_ref'];

} catch (Exception $e) {
    echo "✗ Erreur: {$e->getMessage()}\n\n";
    exit(1);
}

// Exemple 2: Vérifier le statut d'un paiement
echo "2. Vérification du statut d'un paiement\n";
echo "---------------------------------------\n";

try {
    $payment = $dypay->getPayment($paymentRef);

    echo "✓ Paiement trouvé!\n";
    echo "  - Référence: {$payment['payment_ref']}\n";
    echo "  - Statut: {$payment['status']}\n";
    echo "  - Montant: {$payment['amount']} {$payment['currency']}\n";

    switch ($payment['status']) {
        case DypayClient::PAYMENT_STATUS_PENDING:
            echo "  - ⏳ Paiement en attente\n";
            break;
        case DypayClient::PAYMENT_STATUS_COMPLETED:
            echo "  - ✓ Paiement réussi\n";
            break;
        case DypayClient::PAYMENT_STATUS_FAILED:
            echo "  - ✗ Paiement échoué\n";
            break;
        case DypayClient::PAYMENT_STATUS_CANCELLED:
            echo "  - ✗ Paiement annulé\n";
            break;
    }
    echo "\n";

} catch (Exception $e) {
    echo "✗ Erreur: {$e->getMessage()}\n\n";
}

// Exemple 3: Lister les paiements
echo "3. Liste des paiements récents\n";
echo "------------------------------\n";

try {
    $payments = $dypay->listPayments([
        'limit' => 5
    ]);

    echo "✓ {$payments['total']} paiements trouvés\n";

    if (!empty($payments['data'])) {
        foreach ($payments['data'] as $p) {
            echo "  - {$p['payment_ref']}: {$p['amount']} {$p['currency']} ({$p['status']})\n";
        }
    }
    echo "\n";

} catch (Exception $e) {
    echo "✗ Erreur: {$e->getMessage()}\n\n";
}

// Exemple 4: Vérification de signature webhook
echo "4. Vérification de signature webhook\n";
echo "------------------------------------\n";

// Simuler des données de webhook
$webhookPayload = json_encode([
    'event' => 'payment.completed',
    'payment_ref' => $paymentRef,
    'status' => 'completed',
    'amount' => 5000,
    'currency' => 'XAF',
    'metadata' => [
        'order_id' => '12345'
    ]
]);

$webhookSignature = hash_hmac('sha256', $webhookPayload, DYPAY_API_SECRET);

try {
    $isValid = $dypay->verifyWebhookSignature($webhookPayload, $webhookSignature);

    if ($isValid) {
        echo "✓ Signature webhook valide\n";

        $webhookData = $dypay->handleWebhook($webhookPayload, $webhookSignature);
        echo "  - Événement: {$webhookData['event']}\n";
        echo "  - Paiement: {$webhookData['payment_ref']}\n";
        echo "  - Statut: {$webhookData['status']}\n";
    } else {
        echo "✗ Signature webhook invalide\n";
    }
    echo "\n";

} catch (Exception $e) {
    echo "✗ Erreur: {$e->getMessage()}\n\n";
}

// Exemple 5: Gestion des erreurs
echo "5. Gestion des erreurs\n";
echo "----------------------\n";

try {
    // Tentative de création d'un paiement avec des données invalides
    $dypay->createPayment([
        'amount' => -100, // Montant invalide
        'currency' => 'USD', // Devise non supportée
        'item_ref' => ''
    ]);

} catch (Exception $e) {
    echo "✓ Erreur capturée correctement: {$e->getMessage()}\n\n";
}

// Informations utiles
echo "=== Informations ===\n";
echo "Mode: " . (DYPAY_MODE === 'live' ? 'Production' : 'Test') . "\n";
echo "Version SDK: " . DypayClient::VERSION . "\n";
echo "Devises supportées: " . implode(', ', DypayClient::SUPPORTED_CURRENCIES) . "\n\n";

echo "Pour un exemple de webhook, créez un fichier webhook.php:\n";
echo <<<'WEBHOOK'
<?php
require_once 'DypayClient.php';
use Dypay\DypayClient;

$dypay = new DypayClient($_ENV['DYPAY_API_KEY'], $_ENV['DYPAY_API_SECRET'], true);

$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_DYPAY_SIGNATURE'] ?? '';

try {
    $data = $dypay->handleWebhook($payload, $signature);

    if ($data['status'] === DypayClient::PAYMENT_STATUS_COMPLETED) {
        // Traiter le paiement réussi
        $orderId = $data['metadata']['order_id'];
        // ... votre logique métier
    }

    http_response_code(200);
    echo 'OK';

} catch (Exception $e) {
    http_response_code(400);
    echo $e->getMessage();
}

WEBHOOK;

echo "\n\n=== Fin de l'exemple ===\n";
