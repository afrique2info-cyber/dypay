import { useState } from 'react';
import { Code, Copy, CheckCircle2, Key, Webhook, CreditCard, Smartphone, Globe, Lock } from 'lucide-react';

const APIDocumentation = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    curl: `curl -X POST https://api.dypay.io/v1/payments/initiate \\
  -H "Authorization: Bearer YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 5000,
    "currency": "XAF",
    "phone": "+237670000000",
    "payment_method": "mtn_momo",
    "description": "Dépôt compte utilisateur",
    "callback_url": "https://votresite.com/webhook/dypay",
    "return_url": "https://votresite.com/payment/success",
    "merchant_reference": "ORDER_12345"
  }'`,
    javascript: `const response = await fetch('https://api.dypay.io/v1/payments/initiate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SECRET_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 5000,
    currency: 'XAF',
    phone: '+237670000000',
    payment_method: 'mtn_momo',
    description: 'Dépôt compte utilisateur',
    callback_url: 'https://votresite.com/webhook/dypay',
    return_url: 'https://votresite.com/payment/success',
    merchant_reference: 'ORDER_12345'
  })
});

const data = await response.json();
console.log(data);`,
    php: `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.dypay.io/v1/payments/initiate",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer YOUR_SECRET_KEY",
    "Content-Type: application/json"
  ],
  CURLOPT_POSTFIELDS => json_encode([
    'amount' => 5000,
    'currency' => 'XAF',
    'phone' => '+237670000000',
    'payment_method' => 'mtn_momo',
    'description' => 'Dépôt compte utilisateur',
    'callback_url' => 'https://votresite.com/webhook/dypay',
    'return_url' => 'https://votresite.com/payment/success',
    'merchant_reference' => 'ORDER_12345'
  ])
]);

$response = curl_exec($curl);
curl_close($curl);

$data = json_decode($response, true);
print_r($data);`,
    python: `import requests

url = "https://api.dypay.io/v1/payments/initiate"
headers = {
    "Authorization": "Bearer YOUR_SECRET_KEY",
    "Content-Type": "application/json"
}
payload = {
    "amount": 5000,
    "currency": "XAF",
    "phone": "+237670000000",
    "payment_method": "mtn_momo",
    "description": "Dépôt compte utilisateur",
    "callback_url": "https://votresite.com/webhook/dypay",
    "return_url": "https://votresite.com/payment/success",
    "merchant_reference": "ORDER_12345"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data)`
  };

  const webhookExample = `{
  "event": "payment.success",
  "payment_id": "pay_1234567890",
  "merchant_reference": "ORDER_12345",
  "amount": 5000,
  "currency": "XAF",
  "phone": "+237670000000",
  "payment_method": "mtn_momo",
  "status": "completed",
  "transaction_id": "MTN_TXN_987654321",
  "timestamp": "2024-01-29T10:30:00Z",
  "signature": "sha256_signature_here"
}`;

  const verifyWebhookExample = `// Vérifier la signature du webhook
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return hash === signature;
}

// Dans votre endpoint webhook
app.post('/webhook/dypay', (req, res) => {
  const signature = req.headers['x-dypay-signature'];
  const payload = req.body;

  if (!verifyWebhookSignature(payload, signature, YOUR_WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Traiter le paiement
  if (payload.event === 'payment.success') {
    // Mettre à jour le solde utilisateur
    // Marquer la commande comme payée
  }

  res.status(200).send('OK');
});`;

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="text-xs text-gray-400 uppercase">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          {copiedCode === id ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code className="text-sm">{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation API DyPay</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Guide complet pour intégrer les paiements DyPay dans votre application
          </p>
        </div>

        <div className="space-y-8">
          {/* Authentication Section */}
          <section className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Authentification</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Obtenir vos clés API</h3>
                <p className="text-blue-800 mb-3">
                  Après inscription, vous recevrez deux clés dans votre tableau de bord marchand:
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li><strong>Clé publique (Public Key)</strong> : Pour les appels côté client (non sensibles)</li>
                  <li><strong>Clé secrète (Secret Key)</strong> : Pour les appels côté serveur (sensibles)</li>
                </ul>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <Lock className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Sécurité</h3>
                    <p className="text-red-800">
                      Ne partagez JAMAIS votre clé secrète. Utilisez-la uniquement côté serveur.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">En-tête d'authentification</h3>
                <CodeBlock
                  code={`Authorization: Bearer YOUR_SECRET_KEY`}
                  language="HTTP"
                  id="auth-header"
                />
              </div>
            </div>
          </section>

          {/* API Endpoints Section */}
          <section className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Points de terminaison API</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">POST</span>
                  <code className="text-gray-800">/v1/payments/initiate</code>
                </div>
                <p className="text-gray-600 mb-4">Initier un nouveau paiement</p>

                <h4 className="font-semibold text-gray-900 mb-2">Paramètres de la requête:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-gray-700">Paramètre</th>
                        <th className="text-left p-3 text-gray-700">Type</th>
                        <th className="text-left p-3 text-gray-700">Requis</th>
                        <th className="text-left p-3 text-gray-700">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-3 font-mono text-blue-600">amount</td>
                        <td className="p-3">number</td>
                        <td className="p-3 text-green-600">Oui</td>
                        <td className="p-3">Montant en centimes (ex: 5000 = 50 XAF)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-blue-600">currency</td>
                        <td className="p-3">string</td>
                        <td className="p-3 text-green-600">Oui</td>
                        <td className="p-3">Code devise (XAF, XOF, EUR, USD)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-blue-600">phone</td>
                        <td className="p-3">string</td>
                        <td className="p-3 text-green-600">Oui</td>
                        <td className="p-3">Numéro de téléphone (+237XXXXXXXXX)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-blue-600">payment_method</td>
                        <td className="p-3">string</td>
                        <td className="p-3 text-green-600">Oui</td>
                        <td className="p-3">mtn_momo, orange_money, moov_money, card</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-blue-600">description</td>
                        <td className="p-3">string</td>
                        <td className="p-3 text-gray-500">Non</td>
                        <td className="p-3">Description du paiement</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-blue-600">callback_url</td>
                        <td className="p-3">string</td>
                        <td className="p-3 text-green-600">Oui</td>
                        <td className="p-3">URL pour recevoir les notifications</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-blue-600">return_url</td>
                        <td className="p-3">string</td>
                        <td className="p-3 text-gray-500">Non</td>
                        <td className="p-3">URL de redirection après paiement</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono text-blue-600">merchant_reference</td>
                        <td className="p-3">string</td>
                        <td className="p-3 text-green-600">Oui</td>
                        <td className="p-3">Votre référence unique (commande, facture...)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Exemples de code:</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">cURL</h5>
                    <CodeBlock code={codeExamples.curl} language="bash" id="curl" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">JavaScript / Node.js</h5>
                    <CodeBlock code={codeExamples.javascript} language="javascript" id="javascript" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">PHP</h5>
                    <CodeBlock code={codeExamples.php} language="php" id="php" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Python</h5>
                    <CodeBlock code={codeExamples.python} language="python" id="python" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Réponse de succès (200 OK):</h4>
                <CodeBlock
                  code={`{
  "success": true,
  "payment_id": "pay_1234567890",
  "status": "pending",
  "payment_url": "https://pay.dypay.io/pay/1234567890",
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "message": "Paiement initié avec succès"
}`}
                  language="json"
                  id="success-response"
                />
              </div>

              <div className="pt-6 border-t">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">GET</span>
                  <code className="text-gray-800">/v1/payments/:payment_id</code>
                </div>
                <p className="text-gray-600 mb-4">Vérifier le statut d'un paiement</p>

                <h4 className="font-semibold text-gray-900 mb-2">Réponse:</h4>
                <CodeBlock
                  code={`{
  "payment_id": "pay_1234567890",
  "merchant_reference": "ORDER_12345",
  "amount": 5000,
  "currency": "XAF",
  "status": "completed",
  "payment_method": "mtn_momo",
  "phone": "+237670000000",
  "transaction_id": "MTN_TXN_987654321",
  "created_at": "2024-01-29T10:30:00Z",
  "completed_at": "2024-01-29T10:31:45Z"
}`}
                  language="json"
                  id="status-response"
                />
              </div>
            </div>
          </section>

          {/* Webhook Section */}
          <section className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Webhook className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Webhooks / Callbacks</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Les webhooks permettent de recevoir des notifications en temps réel sur l'état des paiements.
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Important</h3>
                <p className="text-yellow-800">
                  Votre endpoint webhook doit être accessible publiquement (HTTPS recommandé) et répondre avec un code 200 dans les 10 secondes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Structure du webhook:</h4>
                <CodeBlock code={webhookExample} language="json" id="webhook" />
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Événements disponibles:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><code className="text-blue-600">payment.pending</code> - Paiement en attente</li>
                  <li><code className="text-blue-600">payment.success</code> - Paiement réussi</li>
                  <li><code className="text-blue-600">payment.failed</code> - Paiement échoué</li>
                  <li><code className="text-blue-600">payment.cancelled</code> - Paiement annulé</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Vérification de la signature:</h4>
                <CodeBlock code={verifyWebhookExample} language="javascript" id="verify-webhook" />
              </div>
            </div>
          </section>

          {/* Payment Methods Section */}
          <section className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Méthodes de paiement</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Mobile Money</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <strong>MTN Mobile Money</strong> (mtn_momo)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <strong>Orange Money</strong> (orange_money)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <strong>Moov Money</strong> (moov_money)
                  </li>
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                  Disponible dans: Cameroun, Côte d'Ivoire, Sénégal, Mali, Burkina Faso
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-8 h-8 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Cartes bancaires</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <strong>Visa</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    <strong>Mastercard</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <strong>Cartes locales</strong>
                  </li>
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                  Paiements sécurisés 3D Secure
                </p>
              </div>
            </div>
          </section>

          {/* Testing Section */}
          <section className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Environnement de test</h2>

            <div className="space-y-4">
              <p className="text-gray-600">
                Utilisez ces informations pour tester l'intégration en mode sandbox:
              </p>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">URL de base (Sandbox):</h4>
                <code className="text-blue-600">https://sandbox-api.dypay.io/v1</code>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Numéros de test Mobile Money:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><code>+237690000001</code> - Paiement réussi</li>
                  <li><code>+237690000002</code> - Paiement échoué</li>
                  <li><code>+237690000003</code> - Paiement en attente (timeout)</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Cartes de test:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><code>4242 4242 4242 4242</code> - Paiement réussi</li>
                  <li><code>4000 0000 0000 0002</code> - Paiement décliné</li>
                  <li>CVV: <code>123</code> - Date: <code>12/25</code></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-sm p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Besoin d'aide?</h2>
            <p className="text-blue-100 mb-6">
              Notre équipe est disponible pour vous accompagner dans l'intégration.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/contact"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Contacter le support
              </a>
              <a
                href="/documentation"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors"
              >
                Voir plus d'exemples
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default APIDocumentation;