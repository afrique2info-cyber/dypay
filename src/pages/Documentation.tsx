import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Code, Zap, Book, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Documentation() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Documentation{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              développeur
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Tout ce dont vous avez besoin pour intégrer Dypay dans votre application
          </p>
          <Link
            to="/api-documentation"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl font-semibold"
          >
            <Code className="w-5 h-5" />
            Documentation API complète
          </Link>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Démarrage rapide</h3>
              <p className="text-sm text-gray-600">En 5 minutes</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">API REST</h3>
              <p className="text-sm text-gray-600">Documentation complète</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">SDKs</h3>
              <p className="text-sm text-gray-600">4 langages supportés</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Book className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Guides</h3>
              <p className="text-sm text-gray-600">Tutoriels détaillés</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Table des matières</h3>
                <nav className="space-y-2">
                  <a href="#getting-started" className="block text-blue-600 hover:text-blue-700 py-2 font-medium">
                    Démarrage rapide
                  </a>
                  <a href="#authentication" className="block text-gray-600 hover:text-blue-600 py-2">
                    Authentification
                  </a>
                  <a href="#payments" className="block text-gray-600 hover:text-blue-600 py-2">
                    Créer un paiement
                  </a>
                  <a href="#virtual-cards" className="block text-gray-600 hover:text-blue-600 py-2">
                    Cartes virtuelles
                  </a>
                  <a href="#webhooks" className="block text-gray-600 hover:text-blue-600 py-2">
                    Webhooks
                  </a>
                  <a href="#sdks" className="block text-gray-600 hover:text-blue-600 py-2">
                    SDKs
                  </a>
                  <a href="#errors" className="block text-gray-600 hover:text-blue-600 py-2">
                    Codes d'erreur
                  </a>
                </nav>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-12">
              <div id="getting-started">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Démarrage rapide</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-6">
                    Intégrez Dypay en quelques minutes. Voici un exemple rapide pour créer votre premier paiement.
                  </p>

                  <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto mb-6">
                    <pre className="text-sm text-gray-100"><code>{`// Installation
npm install dypay

// Initialisation
import Dypay from 'dypay';

const dypay = new Dypay({
  apiKey: 'votre_clé_api',
  mode: 'test' // ou 'live'
});

// Créer un paiement
const payment = await dypay.payments.create({
  amount: 10000,
  currency: 'XAF',
  description: 'Achat produit',
  customer: {
    email: 'client@example.com',
    phone: '+237600000000'
  }
});

console.log(payment.paymentUrl);`}</code></pre>
                  </div>
                </div>
              </div>

              <div id="authentication">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Authentification</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-6">
                    Utilisez vos clés API pour authentifier vos requêtes. Vous pouvez créer et gérer vos clés depuis votre tableau de bord.
                  </p>

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
                    <p className="text-sm text-blue-900">
                      <strong>Important:</strong> Ne partagez jamais vos clés API en production. Utilisez les clés de test pour le développement.
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto mb-6">
                    <pre className="text-sm text-gray-100"><code>{`// Header d'authentification
Authorization: Bearer votre_clé_api

// Exemple avec fetch
const response = await fetch('https://api.dypay.com/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer votre_clé_api',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 10000,
    currency: 'XAF'
  })
});`}</code></pre>
                  </div>
                </div>
              </div>

              <div id="payments">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Créer un paiement</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-6">
                    L'API Payments vous permet de créer des transactions de paiement mobile money.
                  </p>

                  <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto mb-6">
                    <pre className="text-sm text-gray-100"><code>{`POST https://api.dypay.com/v1/payments

{
  "amount": 10000,
  "currency": "XAF",
  "description": "Achat de produit",
  "customer": {
    "email": "client@example.com",
    "phone": "+237600000000",
    "name": "Jean Dupont"
  },
  "metadata": {
    "order_id": "12345",
    "product": "Laptop"
  },
  "return_url": "https://monsite.com/success"
}

// Réponse
{
  "id": "pay_xxxxxxxxxxxxx",
  "status": "pending",
  "amount": 10000,
  "currency": "XAF",
  "payment_url": "https://pay.dypay.com/xxxxx",
  "created_at": "2024-01-23T10:00:00Z"
}`}</code></pre>
                  </div>
                </div>
              </div>

              <div id="virtual-cards">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Cartes virtuelles</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-6">
                    Créez des cartes Visa ou Mastercard virtuelles pour vos clients.
                  </p>

                  <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto mb-6">
                    <pre className="text-sm text-gray-100"><code>{`POST https://api.dypay.com/v1/virtual-cards

{
  "card_holder_name": "JEAN DUPONT",
  "card_type": "VISA",
  "initial_balance": 50000,
  "currency": "XAF",
  "spending_limit": 100000
}

// Réponse
{
  "id": "card_xxxxxxxxxxxxx",
  "card_number": "4532********8901",
  "card_type": "VISA",
  "expiry_month": 12,
  "expiry_year": 2027,
  "cvv": "***",
  "balance": 50000,
  "status": "active"
}`}</code></pre>
                  </div>
                </div>
              </div>

              <div id="webhooks">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Webhooks</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-6">
                    Recevez des notifications en temps réel sur les événements de paiement.
                  </p>

                  <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto mb-6">
                    <pre className="text-sm text-gray-100"><code>{`// Événements disponibles
- payment.succeeded
- payment.failed
- payment.cancelled
- card.created
- card.blocked

// Exemple de payload
{
  "event": "payment.succeeded",
  "data": {
    "id": "pay_xxxxxxxxxxxxx",
    "amount": 10000,
    "currency": "XAF",
    "status": "completed",
    "customer": {
      "email": "client@example.com"
    }
  },
  "created_at": "2024-01-23T10:00:00Z"
}`}</code></pre>
                  </div>
                </div>
              </div>

              <div id="sdks">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">SDKs</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-4">
                    Téléchargez nos SDKs officiels pour votre langage préféré.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition"
                    >
                      <Code className="w-6 h-6 text-yellow-600" />
                      <div>
                        <div className="font-semibold text-gray-900">JavaScript/Node.js</div>
                        <div className="text-sm text-gray-600">npm install dypay</div>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                    >
                      <Code className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Python</div>
                        <div className="text-sm text-gray-600">pip install dypay</div>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
                    >
                      <Code className="w-6 h-6 text-purple-600" />
                      <div>
                        <div className="font-semibold text-gray-900">PHP</div>
                        <div className="text-sm text-gray-600">composer require dypay/dypay-php</div>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                    >
                      <Code className="w-6 h-6 text-red-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Java</div>
                        <div className="text-sm text-gray-600">Maven / Gradle</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              <div id="errors">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Codes d'erreur</h2>
                <div className="prose prose-lg max-w-none">
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">400</td>
                          <td className="px-6 py-4 text-sm text-gray-600">Requête invalide</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">401</td>
                          <td className="px-6 py-4 text-sm text-gray-600">Clé API invalide</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">404</td>
                          <td className="px-6 py-4 text-sm text-gray-600">Ressource non trouvée</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">429</td>
                          <td className="px-6 py-4 text-sm text-gray-600">Limite de requêtes dépassée</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">500</td>
                          <td className="px-6 py-4 text-sm text-gray-600">Erreur serveur</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
