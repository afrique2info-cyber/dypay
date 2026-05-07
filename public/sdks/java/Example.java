package com.dypay.example;

import com.dypay.sdk.DypayClient;
import com.dypay.sdk.DypayClient.DypayException;
import org.json.JSONObject;
import org.json.JSONArray;
import java.util.HashMap;
import java.util.Map;

/**
 * Exemple complet d'utilisation du SDK Dypay Java
 *
 * Ce fichier montre comment intégrer Dypay dans votre application Java
 */
public class Example {

    // Configuration
    private static final String DYPAY_API_KEY = "votre_cle_api_ici";
    private static final String DYPAY_API_SECRET = "votre_secret_api_ici";
    private static final String DYPAY_MODE = "test"; // "test" ou "live"

    public static void main(String[] args) {
        // Initialiser le client
        DypayClient dypay = new DypayClient(
            DYPAY_API_KEY,
            DYPAY_API_SECRET,
            DYPAY_MODE.equals("live")
        );

        System.out.println("=== Exemple d'intégration Dypay Java SDK ===\n");

        String paymentRef = null;

        // Exemple 1: Créer un paiement
        System.out.println("1. Création d'un paiement");
        System.out.println("-------------------------");

        try {
            Map<String, Object> params = new HashMap<>();
            params.put("amount", 5000);
            params.put("currency", "XAF");
            params.put("item_ref", "PROD-" + System.currentTimeMillis());
            params.put("first_name", "Jean");
            params.put("last_name", "Dupont");
            params.put("email", "jean.dupont@example.com");
            params.put("phone", "+237600000000");
            params.put("return_url", "https://votresite.com/payment/success");
            params.put("notify_url", "https://votresite.com/payment/webhook");

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("order_id", "12345");
            metadata.put("customer_id", "67890");
            metadata.put("description", "Achat de produit");
            params.put("metadata", metadata);

            JSONObject payment = dypay.createPayment(params);

            System.out.println("✓ Paiement créé avec succès!");
            System.out.println("  - Référence: " + payment.getString("payment_ref"));
            System.out.println("  - Montant: " + payment.getDouble("amount") + " " +
                             payment.getString("currency"));
            System.out.println("  - Statut: " + payment.getString("status"));
            System.out.println("  - URL de paiement: " + payment.getString("payment_url"));
            System.out.println();

            paymentRef = payment.getString("payment_ref");

        } catch (DypayException e) {
            System.err.println("✗ Erreur: " + e.getMessage() + "\n");
            System.exit(1);
        }

        // Exemple 2: Vérifier le statut d'un paiement
        System.out.println("2. Vérification du statut d'un paiement");
        System.out.println("---------------------------------------");

        try {
            JSONObject payment = dypay.getPayment(paymentRef);

            System.out.println("✓ Paiement trouvé!");
            System.out.println("  - Référence: " + payment.getString("payment_ref"));
            System.out.println("  - Statut: " + payment.getString("status"));
            System.out.println("  - Montant: " + payment.getDouble("amount") + " " +
                             payment.getString("currency"));

            String status = payment.getString("status");
            if (status.equals(DypayClient.PaymentStatus.PENDING)) {
                System.out.println("  - ⏳ Paiement en attente");
            } else if (status.equals(DypayClient.PaymentStatus.COMPLETED)) {
                System.out.println("  - ✓ Paiement réussi");
            } else if (status.equals(DypayClient.PaymentStatus.FAILED)) {
                System.out.println("  - ✗ Paiement échoué");
            } else if (status.equals(DypayClient.PaymentStatus.CANCELLED)) {
                System.out.println("  - ✗ Paiement annulé");
            }
            System.out.println();

        } catch (DypayException e) {
            System.err.println("✗ Erreur: " + e.getMessage() + "\n");
        }

        // Exemple 3: Lister les paiements
        System.out.println("3. Liste des paiements récents");
        System.out.println("------------------------------");

        try {
            Map<String, Object> filters = new HashMap<>();
            filters.put("limit", 5);

            JSONObject payments = dypay.listPayments(filters);

            System.out.println("✓ " + payments.getInt("total") + " paiements trouvés");

            JSONArray data = payments.getJSONArray("data");
            for (int i = 0; i < data.length(); i++) {
                JSONObject p = data.getJSONObject(i);
                System.out.println("  - " + p.getString("payment_ref") + ": " +
                                 p.getDouble("amount") + " " + p.getString("currency") +
                                 " (" + p.getString("status") + ")");
            }
            System.out.println();

        } catch (DypayException e) {
            System.err.println("✗ Erreur: " + e.getMessage() + "\n");
        }

        // Exemple 4: Vérification de signature webhook
        System.out.println("4. Vérification de signature webhook");
        System.out.println("------------------------------------");

        try {
            // Simuler des données de webhook
            JSONObject webhookData = new JSONObject();
            webhookData.put("event", "payment.completed");
            webhookData.put("payment_ref", paymentRef);
            webhookData.put("status", "completed");
            webhookData.put("amount", 5000);
            webhookData.put("currency", "XAF");

            JSONObject webhookMetadata = new JSONObject();
            webhookMetadata.put("order_id", "12345");
            webhookData.put("metadata", webhookMetadata);

            String webhookPayload = webhookData.toString();

            // Génération de la signature (normalement fait par Dypay)
            String webhookSignature = calculateHmacSha256(webhookPayload, DYPAY_API_SECRET);

            boolean isValid = dypay.verifyWebhookSignature(webhookPayload, webhookSignature);

            if (isValid) {
                System.out.println("✓ Signature webhook valide");

                JSONObject event = dypay.handleWebhook(webhookPayload, webhookSignature);
                System.out.println("  - Événement: " + event.getString("event"));
                System.out.println("  - Paiement: " + event.getString("payment_ref"));
                System.out.println("  - Statut: " + event.getString("status"));
            } else {
                System.out.println("✗ Signature webhook invalide");
            }
            System.out.println();

        } catch (Exception e) {
            System.err.println("✗ Erreur: " + e.getMessage() + "\n");
        }

        // Exemple 5: Gestion des erreurs
        System.out.println("5. Gestion des erreurs");
        System.out.println("----------------------");

        try {
            Map<String, Object> invalidParams = new HashMap<>();
            invalidParams.put("amount", -100);  // Montant invalide
            invalidParams.put("currency", "USD");  // Devise non supportée
            invalidParams.put("item_ref", "");

            dypay.createPayment(invalidParams);

        } catch (DypayException e) {
            System.out.println("✓ Erreur capturée correctement: " + e.getMessage() + "\n");
        }

        // Informations utiles
        System.out.println("=== Informations ===");
        System.out.println("Mode: " + (DYPAY_MODE.equals("live") ? "Production" : "Test"));
        System.out.println("Version SDK: " + DypayClient.VERSION);
        System.out.println("Devises supportées: " + String.join(", ", DypayClient.SUPPORTED_CURRENCIES));
        System.out.println();

        System.out.println("Pour un exemple avec Spring Boot, voir ci-dessous:\n");
        System.out.println(
            "import org.springframework.web.bind.annotation.*;\n" +
            "import com.dypay.sdk.DypayClient;\n" +
            "\n" +
            "@RestController\n" +
            "@RequestMapping(\"/webhook\")\n" +
            "public class WebhookController {\n" +
            "    private final DypayClient dypay;\n" +
            "\n" +
            "    public WebhookController() {\n" +
            "        this.dypay = new DypayClient(\n" +
            "            System.getenv(\"DYPAY_API_KEY\"),\n" +
            "            System.getenv(\"DYPAY_API_SECRET\"),\n" +
            "            true\n" +
            "        );\n" +
            "    }\n" +
            "\n" +
            "    @PostMapping(\"/dypay\")\n" +
            "    public ResponseEntity<String> handleWebhook(\n" +
            "        @RequestBody String payload,\n" +
            "        @RequestHeader(\"X-Dypay-Signature\") String signature\n" +
            "    ) {\n" +
            "        try {\n" +
            "            JSONObject event = dypay.handleWebhook(payload, signature);\n" +
            "\n" +
            "            if (event.getString(\"status\").equals(DypayClient.PaymentStatus.COMPLETED)) {\n" +
            "                // Traiter le paiement réussi\n" +
            "            }\n" +
            "\n" +
            "            return ResponseEntity.ok(\"OK\");\n" +
            "        } catch (DypayClient.DypayException e) {\n" +
            "            return ResponseEntity.badRequest().body(e.getMessage());\n" +
            "        }\n" +
            "    }\n" +
            "}\n"
        );

        System.out.println("\n=== Fin de l'exemple ===");
    }

    // Méthode utilitaire pour calculer HMAC SHA256
    private static String calculateHmacSha256(String data, String key) throws Exception {
        javax.crypto.Mac sha256Hmac = javax.crypto.Mac.getInstance("HmacSHA256");
        javax.crypto.spec.SecretKeySpec secretKey =
            new javax.crypto.spec.SecretKeySpec(key.getBytes("UTF-8"), "HmacSHA256");
        sha256Hmac.init(secretKey);

        byte[] hash = sha256Hmac.doFinal(data.getBytes("UTF-8"));
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
}
