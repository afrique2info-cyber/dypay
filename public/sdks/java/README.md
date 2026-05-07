# Dypay Java SDK

SDK Java officiel pour intégrer Dypay dans vos applications Java et Android.

## Version

1.0.0

## Prérequis

- Java 8 ou supérieur
- Maven ou Gradle (pour gestion des dépendances)

## Installation

### Installation via Maven (bientôt disponible)

```xml
<dependency>
    <groupId>com.dypay</groupId>
    <artifactId>dypay-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Installation via Gradle (bientôt disponible)

```gradle
implementation 'com.dypay:dypay-java-sdk:1.0.0'
```

### Installation manuelle

1. Téléchargez le SDK depuis votre tableau de bord Dypay
2. Ajoutez `DypayClient.java` à votre projet
3. Ajoutez la dépendance JSON:

**Maven:**
```xml
<dependency>
    <groupId>org.json</groupId>
    <artifactId>json</artifactId>
    <version>20231013</version>
</dependency>
```

**Gradle:**
```gradle
implementation 'org.json:json:20231013'
```

## Configuration

### Obtenir vos clés API

1. Connectez-vous à votre tableau de bord Dypay
2. Allez dans "Clés API"
3. Créez une nouvelle clé API (Test ou Production)
4. Copiez votre clé API et votre secret

### Initialisation du client

```java
import com.dypay.sdk.DypayClient;

// Mode test
DypayClient dypay = new DypayClient(
    "votre_cle_api",
    "votre_secret_api",
    false  // false = mode test, true = mode production
);

// Mode production
DypayClient dypayLive = new DypayClient(
    "votre_cle_api_live",
    "votre_secret_api_live",
    true
);
```

## Utilisation

### Créer un paiement

```java
import com.dypay.sdk.DypayClient;
import com.dypay.sdk.DypayClient.DypayException;
import org.json.JSONObject;
import java.util.HashMap;
import java.util.Map;

public class PaymentExample {
    public static void main(String[] args) {
        DypayClient dypay = new DypayClient("api_key", "api_secret", false);

        try {
            Map<String, Object> params = new HashMap<>();
            params.put("amount", 5000);
            params.put("currency", "XAF");
            params.put("item_ref", "PROD-123");
            params.put("first_name", "Jean");
            params.put("last_name", "Dupont");
            params.put("email", "jean.dupont@example.com");
            params.put("phone", "+237600000000");
            params.put("return_url", "https://votresite.com/payment/success");
            params.put("notify_url", "https://votresite.com/payment/webhook");

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("order_id", "12345");
            metadata.put("customer_id", "67890");
            params.put("metadata", metadata);

            JSONObject payment = dypay.createPayment(params);

            System.out.println("Paiement créé: " + payment.getString("payment_ref"));
            System.out.println("URL: " + payment.getString("payment_url"));

            // Redirigez l'utilisateur vers payment_url

        } catch (DypayException e) {
            System.err.println("Erreur: " + e.getMessage());
        }
    }
}
```

### Vérifier le statut d'un paiement

```java
try {
    JSONObject payment = dypay.getPayment("DYPAY-REF-123456");

    System.out.println("Statut: " + payment.getString("status"));
    System.out.println("Montant: " + payment.getDouble("amount"));

    if (payment.getString("status").equals(DypayClient.PaymentStatus.COMPLETED)) {
        System.out.println("Paiement réussi!");
    }

} catch (DypayException e) {
    System.err.println("Erreur: " + e.getMessage());
}
```

### Lister tous les paiements

```java
try {
    // Sans filtres
    JSONObject payments = dypay.listPayments(null);

    // Avec filtres
    Map<String, Object> filters = new HashMap<>();
    filters.put("status", "completed");
    filters.put("limit", 10);
    filters.put("offset", 0);

    JSONObject filteredPayments = dypay.listPayments(filters);

    System.out.println("Total: " + payments.getInt("total"));

    JSONArray data = payments.getJSONArray("data");
    for (int i = 0; i < data.length(); i++) {
        JSONObject payment = data.getJSONObject(i);
        System.out.println(payment.getString("payment_ref") + ": " +
                         payment.getString("status"));
    }

} catch (DypayException e) {
    System.err.println("Erreur: " + e.getMessage());
}
```

### Gérer les webhooks

**Spring Boot:**

```java
import org.springframework.web.bind.annotation.*;
import com.dypay.sdk.DypayClient;
import org.json.JSONObject;

@RestController
@RequestMapping("/webhook")
public class WebhookController {

    private final DypayClient dypay;

    public WebhookController() {
        this.dypay = new DypayClient(
            System.getenv("DYPAY_API_KEY"),
            System.getenv("DYPAY_API_SECRET"),
            true
        );
    }

    @PostMapping("/dypay")
    public ResponseEntity<String> handleWebhook(
        @RequestBody String payload,
        @RequestHeader("X-Dypay-Signature") String signature
    ) {
        try {
            JSONObject event = dypay.handleWebhook(payload, signature);

            String status = event.getString("status");

            if (status.equals(DypayClient.PaymentStatus.COMPLETED)) {
                System.out.println("Paiement réussi: " + event.getString("payment_ref"));
                // Débloquez le service/produit
                JSONObject metadata = event.getJSONObject("metadata");
                String orderId = metadata.getString("order_id");
                // completeOrder(orderId);
            } else if (status.equals(DypayClient.PaymentStatus.FAILED)) {
                System.out.println("Paiement échoué");
                // Annulez la commande
            }

            return ResponseEntity.ok("OK");

        } catch (DypayClient.DypayException e) {
            System.err.println("Webhook error: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
```

**Servlet Java EE:**

```java
import javax.servlet.http.*;
import javax.servlet.annotation.WebServlet;
import com.dypay.sdk.DypayClient;
import org.json.JSONObject;
import java.io.*;

@WebServlet("/webhook/dypay")
public class DypayWebhookServlet extends HttpServlet {

    private DypayClient dypay;

    @Override
    public void init() {
        dypay = new DypayClient(
            System.getenv("DYPAY_API_KEY"),
            System.getenv("DYPAY_API_SECRET"),
            true
        );
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String payload = readRequestBody(request);
        String signature = request.getHeader("X-Dypay-Signature");

        try {
            JSONObject event = dypay.handleWebhook(payload, signature);

            if (event.getString("status").equals(DypayClient.PaymentStatus.COMPLETED)) {
                // Traiter le paiement réussi
                System.out.println("Paiement réussi: " + event.getString("payment_ref"));
            }

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("OK");

        } catch (DypayClient.DypayException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(e.getMessage());
        }
    }

    private String readRequestBody(HttpServletRequest request) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }
}
```

## Utilisation avec Android

Le SDK est compatible avec Android:

```java
// Dans votre Activity ou Fragment
import com.dypay.sdk.DypayClient;
import android.os.AsyncTask;

public class PaymentActivity extends AppCompatActivity {

    private DypayClient dypay;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment);

        dypay = new DypayClient(
            getString(R.string.dypay_api_key),
            getString(R.string.dypay_api_secret),
            false
        );
    }

    private void createPayment() {
        new AsyncTask<Void, Void, JSONObject>() {
            @Override
            protected JSONObject doInBackground(Void... voids) {
                try {
                    Map<String, Object> params = new HashMap<>();
                    params.put("amount", 5000);
                    params.put("currency", "XAF");
                    params.put("item_ref", "PROD-123");

                    return dypay.createPayment(params);

                } catch (DypayClient.DypayException e) {
                    e.printStackTrace();
                    return null;
                }
            }

            @Override
            protected void onPostExecute(JSONObject payment) {
                if (payment != null) {
                    String paymentUrl = payment.getString("payment_url");
                    // Ouvrir le navigateur ou WebView
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(paymentUrl));
                    startActivity(intent);
                }
            }
        }.execute();
    }
}
```

## Devises supportées

- `XAF` - Franc CFA (Cameroun, etc.)
- `XOF` - Franc CFA (Sénégal, Côte d'Ivoire, etc.)
- `CDF` - Franc Congolais
- `UGX` - Shilling Ougandais
- `LRD` - Dollar Libérien
- `GNF` - Franc Guinéen

## Statuts de paiement

```java
DypayClient.PaymentStatus.PENDING     // "pending"
DypayClient.PaymentStatus.COMPLETED   // "completed"
DypayClient.PaymentStatus.FAILED      // "failed"
DypayClient.PaymentStatus.CANCELLED   // "cancelled"
```

## Gestion des erreurs

Toutes les méthodes peuvent lever une `DypayException`:

```java
try {
    JSONObject payment = dypay.createPayment(params);
} catch (DypayClient.DypayException e) {
    System.err.println("Erreur Dypay: " + e.getMessage());
    // Afficher un message à l'utilisateur
}
```

## Sécurité

### Vérification des webhooks

Toujours vérifier la signature des webhooks:

```java
String payload = requestBody;
String signature = request.getHeader("X-Dypay-Signature");

if (!dypay.verifyWebhookSignature(payload, signature)) {
    throw new DypayClient.DypayException("Invalid signature");
}
```

### Protection des clés API

- Ne jamais exposer vos clés dans le code
- Utilisez des variables d'environnement ou fichiers de configuration
- Utilisez des clés de test pour le développement

**Application.properties (Spring Boot):**
```properties
dypay.api.key=${DYPAY_API_KEY}
dypay.api.secret=${DYPAY_API_SECRET}
dypay.mode=${DYPAY_MODE:test}
```

## Thread Safety

Le `DypayClient` est thread-safe et peut être réutilisé dans une application multi-thread.

## Exemple complet

Voir le fichier `Example.java` pour un exemple complet d'intégration.

## Support

Pour toute question ou problème:

- Documentation: https://docs.dypay.com
- Email: support@dypay.com
- Tableau de bord: https://dashboard.dypay.com

## Changelog

### Version 1.0.0 (2026-01-21)

- Version initiale du SDK
- Support Java 8+
- Compatible Android
- Thread-safe
- Gestion des paiements et webhooks
- Support de 6 devises africaines

## Licence

MIT License - Voir le fichier LICENSE pour plus de détails
