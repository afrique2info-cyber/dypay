import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Check, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Tarifs{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              transparents
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Pas de frais cachés. Payez uniquement pour ce que vous utilisez.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-600">Pour les petites entreprises</p>
              </div>
              <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">Gratuit</div>
                <p className="text-gray-600">Jusqu'à 100 transactions/mois</p>
              </div>
              <Link
                to="/auth"
                className="block w-full text-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-semibold mb-8"
              >
                Commencer gratuitement
              </Link>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Jusqu'à 100 transactions/mois</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Paiements mobile money</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">API REST complète</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Tableau de bord</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Support par email</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Documentation complète</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl border-2 border-blue-600 p-8 transform lg:scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Populaire
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Business</h3>
                <p className="text-blue-100">Pour les entreprises en croissance</p>
              </div>
              <div className="mb-6">
                <div className="text-5xl font-bold text-white mb-2">2.5%</div>
                <p className="text-blue-100">par transaction</p>
              </div>
              <Link
                to="/auth"
                className="block w-full text-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition font-semibold mb-8"
              >
                Commencer maintenant
              </Link>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white">Transactions illimitées</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white">Tous les moyens de paiement</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white">Cartes virtuelles illimitées</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white">Paiement par QR Code</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white">Webhooks en temps réel</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white">Support prioritaire 24/7</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white">Rapports avancés</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white">SDKs multi-langages</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600">Pour les grandes entreprises</p>
              </div>
              <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">Custom</div>
                <p className="text-gray-600">Tarifs sur mesure</p>
              </div>
              <Link
                to="/contact"
                className="block w-full text-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-semibold mb-8"
              >
                Nous contacter
              </Link>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Tout de Business +</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Volume négociable</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Intégration personnalisée</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Account manager dédié</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">SLA garanti 99.99%</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Formation sur site</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Assistance technique dédiée</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Fonctionnalités personnalisées</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frais de transaction détaillés</h2>
            <p className="text-gray-600">Transparence totale sur nos tarifs</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Service</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Starter</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Business</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-gray-900 font-medium">Paiements mobiles</td>
                    <td className="px-6 py-4 text-gray-600">3.5%</td>
                    <td className="px-6 py-4 text-gray-600">2.5%</td>
                    <td className="px-6 py-4 text-gray-600">Sur mesure</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-900 font-medium">Cartes virtuelles</td>
                    <td className="px-6 py-4 text-gray-600">Non disponible</td>
                    <td className="px-6 py-4 text-gray-600">500 XAF/carte</td>
                    <td className="px-6 py-4 text-gray-600">Sur mesure</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-900 font-medium">Paiement QR Code</td>
                    <td className="px-6 py-4 text-gray-600">Gratuit</td>
                    <td className="px-6 py-4 text-gray-600">Gratuit</td>
                    <td className="px-6 py-4 text-gray-600">Gratuit</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-900 font-medium">Liens de paiement</td>
                    <td className="px-6 py-4 text-gray-600">Gratuit</td>
                    <td className="px-6 py-4 text-gray-600">Gratuit</td>
                    <td className="px-6 py-4 text-gray-600">Gratuit</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-900 font-medium">Retraits</td>
                    <td className="px-6 py-4 text-gray-600">1%</td>
                    <td className="px-6 py-4 text-gray-600">0.5%</td>
                    <td className="px-6 py-4 text-gray-600">Sur mesure</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              * Tous les prix sont en XAF. Les frais de conversion s'appliquent pour les autres devises.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
          <div className="mt-12 space-y-6 text-left">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Y a-t-il des frais cachés ?</h3>
              <p className="text-gray-600">
                Non, absolument aucun. Tous nos tarifs sont transparents et vous ne payez que ce qui est indiqué.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Puis-je changer de plan à tout moment ?</h3>
              <p className="text-gray-600">
                Oui, vous pouvez passer d'un plan à l'autre à tout moment selon vos besoins.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Comment fonctionne la facturation ?</h3>
              <p className="text-gray-600">
                Les frais sont prélevés automatiquement sur chaque transaction. Pas d'abonnement mensuel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
