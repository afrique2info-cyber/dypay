<?php

/**
 * Dypay PHP SDK
 *
 * SDK PHP pour l'intégration de paiements via Dypay
 *
 * @author Dypay
 * @version 1.0.0
 */

namespace Dypay;

class DypayClient
{
    private $apiKey;
    private $apiSecret;
    private $baseUrl;
    private $isLive;

    const VERSION = '1.0.0';
    const SUPPORTED_CURRENCIES = ['XAF', 'XOF', 'CDF', 'UGX', 'LRD', 'GNF'];
    const PAYMENT_STATUS_PENDING = 'pending';
    const PAYMENT_STATUS_COMPLETED = 'completed';
    const PAYMENT_STATUS_FAILED = 'failed';
    const PAYMENT_STATUS_CANCELLED = 'cancelled';

    /**
     * Initialise le client Dypay
     *
     * @param string $apiKey Votre clé API Dypay
     * @param string $apiSecret Votre secret API Dypay
     * @param bool $isLive Mode production (true) ou test (false)
     */
    public function __construct($apiKey, $apiSecret, $isLive = false)
    {
        $this->apiKey = $apiKey;
        $this->apiSecret = $apiSecret;
        $this->isLive = $isLive;
        $this->baseUrl = 'https://your-dypay-domain.com/api';
    }

    /**
     * Crée une nouvelle demande de paiement
     *
     * @param array $params Paramètres du paiement
     * @return array Réponse de l'API
     * @throws \Exception En cas d'erreur
     */
    public function createPayment(array $params)
    {
        $requiredFields = ['amount', 'currency', 'item_ref'];
        foreach ($requiredFields as $field) {
            if (!isset($params[$field])) {
                throw new \Exception("Le champ '{$field}' est requis");
            }
        }

        if (!in_array($params['currency'], self::SUPPORTED_CURRENCIES)) {
            throw new \Exception("Devise non supportée. Devises supportées: " . implode(', ', self::SUPPORTED_CURRENCIES));
        }

        if ($params['amount'] <= 0) {
            throw new \Exception("Le montant doit être supérieur à 0");
        }

        $data = [
            'amount' => $params['amount'],
            'currency' => $params['currency'],
            'item_ref' => $params['item_ref'],
            'first_name' => $params['first_name'] ?? '',
            'last_name' => $params['last_name'] ?? '',
            'email' => $params['email'] ?? '',
            'phone' => $params['phone'] ?? '',
            'return_url' => $params['return_url'] ?? '',
            'notify_url' => $params['notify_url'] ?? '',
            'metadata' => $params['metadata'] ?? []
        ];

        return $this->request('POST', '/payments', $data);
    }

    /**
     * Récupère le statut d'un paiement
     *
     * @param string $paymentRef Référence du paiement
     * @return array Informations du paiement
     * @throws \Exception En cas d'erreur
     */
    public function getPayment($paymentRef)
    {
        if (empty($paymentRef)) {
            throw new \Exception("La référence du paiement est requise");
        }

        return $this->request('GET', "/payments/{$paymentRef}");
    }

    /**
     * Liste tous les paiements du marchand
     *
     * @param array $filters Filtres optionnels (status, limit, offset)
     * @return array Liste des paiements
     * @throws \Exception En cas d'erreur
     */
    public function listPayments(array $filters = [])
    {
        $queryParams = http_build_query($filters);
        $endpoint = '/payments' . ($queryParams ? '?' . $queryParams : '');

        return $this->request('GET', $endpoint);
    }

    /**
     * Vérifie la signature d'un webhook
     *
     * @param string $payload Corps de la requête webhook
     * @param string $signature Signature reçue dans les headers
     * @return bool True si la signature est valide
     */
    public function verifyWebhookSignature($payload, $signature)
    {
        $expectedSignature = hash_hmac('sha256', $payload, $this->apiSecret);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Traite les données d'un webhook
     *
     * @param string $payload Corps de la requête webhook
     * @param string $signature Signature reçue dans les headers
     * @return array Données du webhook décodées
     * @throws \Exception Si la signature est invalide
     */
    public function handleWebhook($payload, $signature)
    {
        if (!$this->verifyWebhookSignature($payload, $signature)) {
            throw new \Exception("Signature du webhook invalide");
        }

        $data = json_decode($payload, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Payload du webhook invalide");
        }

        return $data;
    }

    /**
     * Effectue une requête HTTP vers l'API Dypay
     *
     * @param string $method Méthode HTTP (GET, POST, etc.)
     * @param string $endpoint Point de terminaison de l'API
     * @param array|null $data Données à envoyer
     * @return array Réponse de l'API
     * @throws \Exception En cas d'erreur
     */
    private function request($method, $endpoint, $data = null)
    {
        $url = $this->baseUrl . $endpoint;

        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'X-API-Secret: ' . $this->apiSecret,
            'Content-Type: application/json',
            'User-Agent: Dypay-PHP-SDK/' . self::VERSION,
            'X-API-Mode: ' . ($this->isLive ? 'live' : 'test')
        ];

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

        if ($data !== null && ($method === 'POST' || $method === 'PUT')) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            throw new \Exception("Erreur cURL: {$error}");
        }

        $responseData = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Réponse API invalide: " . json_last_error_msg());
        }

        if ($httpCode >= 400) {
            $errorMessage = $responseData['error'] ?? $responseData['message'] ?? 'Erreur inconnue';
            throw new \Exception("Erreur API ({$httpCode}): {$errorMessage}");
        }

        return $responseData;
    }

    /**
     * Définit l'URL de base de l'API (utile pour les tests)
     *
     * @param string $baseUrl Nouvelle URL de base
     */
    public function setBaseUrl($baseUrl)
    {
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    /**
     * Retourne si le client est en mode production
     *
     * @return bool
     */
    public function isLive()
    {
        return $this->isLive;
    }
}
