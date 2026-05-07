import { Code, Copy, Download, Book } from 'lucide-react';
import { useState } from 'react';

export function IntegrationDocs() {
  const [copied, setCopied] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const directCode = `const response = await fetch('${supabaseUrl}/functions/v1/dypay-process-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'votre_cle_api',
    'X-Signature': 'signature_hmac_sha256' // Optionnel mais recommandé
  },
  body: JSON.stringify({
    amount: 5000,
    phone: '237699000000',
    operator: 'CM_ORANGEMONEY',
    country: 'CM',
    currency: 'XAF',
    email: 'client@example.com',
    first_name: 'Jean',
    last_name: 'Dupont',
    item_ref: 'PROD-123',
    return_url: 'https://votresite.com/payment/success',
    notify_url: 'https://votresite.com/webhook',
    metadata: {
      order_id: '12345',
      customer_id: '67890'
    }
  })
});

const data = await response.json();

if (data.success) {
  window.location.href = data.payment_url;
} else {
  console.error('Erreur:', data.error);
}`;

  const signatureCode = `// Génération de la signature HMAC-SHA256
import crypto from 'crypto';

const apiSecret = 'votre_api_secret';
const payload = JSON.stringify(paymentData);

const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(payload)
  .digest('hex');

// Ajoutez la signature dans le header X-Signature`;

  const webhookCode = `// Gestion du webhook Monetbil
app.post('/webhook/dypay', express.json(), async (req, res) => {
  const { status, payment_ref, transaction_id, amount } = req.body;

  console.log('Webhook reçu:', { status, payment_ref });

  // Vérifier et traiter le paiement
  if (status === 'success') {
    // Paiement réussi - débloquer le service/produit
    await completeOrder(transaction_id);
  } else if (status === 'failed') {
    // Paiement échoué
    await cancelOrder(transaction_id);
  }

  res.status(200).send('OK');
});`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Code className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Documentation API Dypay</h2>
            <p className="text-sm sm:text-base text-gray-600">Intégrez les paiements mobiles en Afrique</p>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Book className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">SDKs Disponibles</h3>
                <p className="text-blue-800 text-sm mb-3">
                  Téléchargez nos SDKs officiels avec des exemples complets et une documentation détaillée.
                </p>
                <p className="text-blue-800 text-sm font-medium">
                  Allez dans l'onglet "SDKs" pour télécharger le SDK de votre langage préféré.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Endpoint API</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <code className="text-xs sm:text-sm text-gray-800">
                POST {supabaseUrl}/functions/v1/dypay-process-payment
              </code>
            </div>
          </section>

          <section>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Headers requis</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="border-b border-gray-200">
                  <tr className="text-left">
                    <th className="pb-3 pr-4">Header</th>
                    <th className="pb-3 pr-4">Valeur</th>
                    <th className="pb-3">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">Content-Type</td>
                    <td className="py-2 pr-4">application/json</td>
                    <td className="py-2">Type de contenu</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">X-API-Key</td>
                    <td className="py-2 pr-4">Votre clé API</td>
                    <td className="py-2">Authentification</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">X-Signature</td>
                    <td className="py-2 pr-4">HMAC-SHA256</td>
                    <td className="py-2">Signature (optionnel)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Exemple d'intégration</h3>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Créer un paiement</span>
                <button
                  onClick={() => copyCode(directCode)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-xs sm:text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                <code>{directCode}</code>
              </pre>
            </div>
          </section>

          <section>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Sécurité: Signature HMAC</h3>
            <p className="text-sm text-gray-700 mb-4">
              Pour sécuriser vos requêtes, générez une signature HMAC-SHA256 du payload avec votre API secret.
            </p>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Génération de signature</span>
                <button
                  onClick={() => copyCode(signatureCode)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-xs sm:text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                <code>{signatureCode}</code>
              </pre>
            </div>
          </section>

          <section>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Paramètres de paiement</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="border-b border-gray-200">
                  <tr className="text-left">
                    <th className="pb-3 pr-4">Paramètre</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Requis</th>
                    <th className="pb-3">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">amount</td>
                    <td className="py-2 pr-4">number</td>
                    <td className="py-2 pr-4">Oui</td>
                    <td className="py-2">Montant en devise locale</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">phone</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Non</td>
                    <td className="py-2">Numéro de téléphone (ex: 237699000000)</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">operator</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Non</td>
                    <td className="py-2">Opérateur mobile</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">country</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Non</td>
                    <td className="py-2">Code pays ISO (CM, SN, etc.)</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">currency</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Non</td>
                    <td className="py-2">Devise (XAF, XOF, etc.)</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">email</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Non</td>
                    <td className="py-2">Email du client</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">first_name</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Non</td>
                    <td className="py-2">Prénom du client</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">last_name</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Non</td>
                    <td className="py-2">Nom du client</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">item_ref</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Non</td>
                    <td className="py-2">Référence produit/commande</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">return_url</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Non</td>
                    <td className="py-2">URL de redirection après paiement</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">notify_url</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Non</td>
                    <td className="py-2">URL webhook pour notifications</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">metadata</td>
                    <td className="py-2 pr-4">object</td>
                    <td className="py-2 pr-4">Non</td>
                    <td className="py-2">Données personnalisées (JSON)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Réponse de succès</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-xs sm:text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                <code>{`{
  "success": true,
  "payment_url": "https://payment.monetbil.com/...",
  "payment_ref": "DYP-1234567890-abcdef",
  "payment_id": "uuid-du-paiement"
}`}</code>
              </pre>
            </div>
          </section>

          <section>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Gestion des webhooks</h3>
            <p className="text-sm text-gray-700 mb-4">
              Configurez un endpoint webhook pour recevoir les notifications de statut de paiement en temps réel.
            </p>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Exemple webhook handler</span>
                <button
                  onClick={() => copyCode(webhookCode)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-xs sm:text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                <code>{webhookCode}</code>
              </pre>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Les webhooks proviennent de Monetbil. Assurez-vous que votre endpoint est accessible publiquement et répond avec un statut 200.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Codes d'erreur</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="border-b border-gray-200">
                  <tr className="text-left">
                    <th className="pb-3 pr-4">Code</th>
                    <th className="pb-3">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">401</td>
                    <td className="py-2">Clé API invalide ou signature incorrecte</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">400</td>
                    <td className="py-2">Paramètres manquants ou invalides</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono text-xs">500</td>
                    <td className="py-2">Erreur serveur ou service de paiement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Téléchargez nos SDKs</h3>
                <p className="text-green-800 text-sm">
                  Pour une intégration plus rapide, téléchargez nos SDKs officiels (JavaScript/Node.js, Python, PHP, Java) dans l'onglet "SDKs".
                  Chaque SDK inclut des exemples complets et toute la documentation nécessaire.
                </p>
              </div>
            </div>
          </section>
        </div>

        {copied && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            Code copié!
          </div>
        )}
      </div>
    </div>
  );
}
