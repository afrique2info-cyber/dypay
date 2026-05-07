package com.dypay.sdk;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.json.JSONObject;
import org.json.JSONArray;

/**
 * Dypay Java SDK
 *
 * SDK Java officiel pour intégrer Dypay dans vos applications
 *
 * @version 1.0.0
 * @author Dypay
 */
public class DypayClient {
    public static final String VERSION = "1.0.0";
    public static final List<String> SUPPORTED_CURRENCIES = Arrays.asList(
        "XAF", "XOF", "CDF", "UGX", "LRD", "GNF"
    );

    public static class PaymentStatus {
        public static final String PENDING = "pending";
        public static final String COMPLETED = "completed";
        public static final String FAILED = "failed";
        public static final String CANCELLED = "cancelled";
    }

    private final String apiKey;
    private final String apiSecret;
    private final boolean isLive;
    private String baseUrl = "https://your-dypay-domain.com/api";

    /**
     * Initialise le client Dypay
     *
     * @param apiKey Votre clé API Dypay
     * @param apiSecret Votre secret API Dypay
     * @param isLive Mode production (true) ou test (false)
     */
    public DypayClient(String apiKey, String apiSecret, boolean isLive) {
        if (apiKey == null || apiKey.isEmpty() || apiSecret == null || apiSecret.isEmpty()) {
            throw new IllegalArgumentException("API key and secret are required");
        }

        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.isLive = isLive;
    }

    /**
     * Crée une nouvelle demande de paiement
     *
     * @param params Paramètres du paiement
     * @return JSONObject contenant les informations du paiement
     * @throws DypayException En cas d'erreur
     */
    public JSONObject createPayment(Map<String, Object> params) throws DypayException {
        String[] requiredFields = {"amount", "currency", "item_ref"};

        for (String field : requiredFields) {
            if (!params.containsKey(field)) {
                throw new DypayException("Field '" + field + "' is required");
            }
        }

        String currency = (String) params.get("currency");
        if (!SUPPORTED_CURRENCIES.contains(currency)) {
            throw new DypayException(
                "Unsupported currency. Supported currencies: " + String.join(", ", SUPPORTED_CURRENCIES)
            );
        }

        double amount = ((Number) params.get("amount")).doubleValue();
        if (amount <= 0) {
            throw new DypayException("Amount must be greater than 0");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("amount", params.get("amount"));
        data.put("currency", params.get("currency"));
        data.put("item_ref", params.get("item_ref"));
        data.put("first_name", params.getOrDefault("first_name", ""));
        data.put("last_name", params.getOrDefault("last_name", ""));
        data.put("email", params.getOrDefault("email", ""));
        data.put("phone", params.getOrDefault("phone", ""));
        data.put("return_url", params.getOrDefault("return_url", ""));
        data.put("notify_url", params.getOrDefault("notify_url", ""));
        data.put("metadata", params.getOrDefault("metadata", new HashMap<>()));

        return request("POST", "/payments", data);
    }

    /**
     * Récupère le statut d'un paiement
     *
     * @param paymentRef Référence du paiement
     * @return JSONObject contenant les informations du paiement
     * @throws DypayException En cas d'erreur
     */
    public JSONObject getPayment(String paymentRef) throws DypayException {
        if (paymentRef == null || paymentRef.isEmpty()) {
            throw new DypayException("Payment reference is required");
        }

        return request("GET", "/payments/" + paymentRef, null);
    }

    /**
     * Liste tous les paiements du marchand
     *
     * @param filters Filtres optionnels (status, limit, offset)
     * @return JSONObject contenant la liste des paiements
     * @throws DypayException En cas d'erreur
     */
    public JSONObject listPayments(Map<String, Object> filters) throws DypayException {
        StringBuilder queryParams = new StringBuilder();

        if (filters != null && !filters.isEmpty()) {
            queryParams.append("?");
            for (Map.Entry<String, Object> entry : filters.entrySet()) {
                if (queryParams.length() > 1) {
                    queryParams.append("&");
                }
                queryParams.append(entry.getKey()).append("=").append(entry.getValue());
            }
        }

        return request("GET", "/payments" + queryParams.toString(), null);
    }

    /**
     * Vérifie la signature d'un webhook
     *
     * @param payload Corps de la requête webhook
     * @param signature Signature reçue dans les headers
     * @return true si la signature est valide
     */
    public boolean verifyWebhookSignature(String payload, String signature) {
        try {
            String expectedSignature = calculateHmacSha256(payload, apiSecret);
            return MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Traite les données d'un webhook
     *
     * @param payload Corps de la requête webhook
     * @param signature Signature reçue dans les headers
     * @return JSONObject contenant les données du webhook
     * @throws DypayException Si la signature est invalide
     */
    public JSONObject handleWebhook(String payload, String signature) throws DypayException {
        if (!verifyWebhookSignature(payload, signature)) {
            throw new DypayException("Invalid webhook signature");
        }

        try {
            return new JSONObject(payload);
        } catch (Exception e) {
            throw new DypayException("Invalid webhook payload");
        }
    }

    /**
     * Effectue une requête HTTP vers l'API Dypay
     *
     * @param method Méthode HTTP (GET, POST, etc.)
     * @param endpoint Point de terminaison de l'API
     * @param data Données à envoyer
     * @return JSONObject contenant la réponse
     * @throws DypayException En cas d'erreur
     */
    private JSONObject request(String method, String endpoint, Map<String, Object> data)
            throws DypayException {
        try {
            URL url = new URL(baseUrl + endpoint);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            conn.setRequestMethod(method);
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setRequestProperty("X-API-Secret", apiSecret);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("User-Agent", "Dypay-Java-SDK/" + VERSION);
            conn.setRequestProperty("X-API-Mode", isLive ? "live" : "test");
            conn.setConnectTimeout(30000);
            conn.setReadTimeout(30000);

            if (data != null && (method.equals("POST") || method.equals("PUT"))) {
                conn.setDoOutput(true);
                JSONObject jsonData = new JSONObject(data);
                String jsonString = jsonData.toString();

                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonString.getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }
            }

            int responseCode = conn.getResponseCode();
            String responseBody;

            if (responseCode >= 200 && responseCode < 300) {
                responseBody = readResponse(conn.getInputStream());
            } else {
                responseBody = readResponse(conn.getErrorStream());
                JSONObject errorData = new JSONObject(responseBody);
                String errorMessage = errorData.optString("error",
                    errorData.optString("message", "Unknown error"));
                throw new DypayException("API Error (" + responseCode + "): " + errorMessage);
            }

            return new JSONObject(responseBody);

        } catch (IOException e) {
            throw new DypayException("Request failed: " + e.getMessage());
        } catch (Exception e) {
            if (e instanceof DypayException) {
                throw (DypayException) e;
            }
            throw new DypayException("Request failed: " + e.getMessage());
        }
    }

    /**
     * Lit la réponse d'une requête HTTP
     */
    private String readResponse(java.io.InputStream inputStream) throws IOException {
        try (Scanner scanner = new Scanner(inputStream, StandardCharsets.UTF_8.name())) {
            return scanner.useDelimiter("\\A").hasNext() ? scanner.next() : "";
        }
    }

    /**
     * Calcule le HMAC SHA256 d'une chaîne
     */
    private String calculateHmacSha256(String data, String key)
            throws NoSuchAlgorithmException, InvalidKeyException {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKey);

        byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();

        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }

        return hexString.toString();
    }

    /**
     * Définit l'URL de base de l'API
     *
     * @param baseUrl Nouvelle URL de base
     */
    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl.replaceAll("/$", "");
    }

    /**
     * Retourne si le client est en mode production
     *
     * @return true si en mode production
     */
    public boolean isLive() {
        return isLive;
    }

    /**
     * Exception levée pour les erreurs Dypay
     */
    public static class DypayException extends Exception {
        public DypayException(String message) {
            super(message);
        }
    }
}
