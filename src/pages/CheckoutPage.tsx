import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, CreditCard, MapPin, User, Mail, Phone, Globe, Info } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { createOrder } from '../lib/orders';
import { initiateDypayPayment, COUNTRIES_WITH_CURRENCY, getCurrencyForCountry } from '../lib/monetbil';
import { calculateTotalWithFees, calculateServiceFee, SERVICE_FEE_PERCENTAGE } from '../lib/service-fees';

export default function CheckoutPage() {
  const { shopSlug } = useParams<{ shopSlug?: string }>();
  const { items, total, clear, selectedCurrency, selectedCountry, getProductPrice, setCartCurrency } = useCart();
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    city: '',
    country: 'Cameroun',
    notes: '',
  });

  const handlePaymentCountryChange = (countryCode: string) => {
    const currency = getCurrencyForCountry(countryCode);
    setCartCurrency(currency, countryCode);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
          <Link
            to={shopSlug ? `/shop/${shopSlug}` : '/'}
            className="text-blue-600 hover:underline"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const merchantId = items[0]?.product?.merchant_id;
      const shopId = items[0]?.product?.shop_id;

      if (!merchantId) {
        throw new Error('Merchant ID introuvable');
      }

      const serviceFees = calculateServiceFee(total);
      const totalWithFees = calculateTotalWithFees(total);

      const orderData = {
        merchant_id: merchantId,
        shop_id: shopId || null,
        customer_email: formData.customer_email,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        shipping_address: {
          address: formData.address,
          city: formData.city,
          country: formData.country,
        },
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product?.name,
          quantity: item.quantity,
          price: getProductPrice(item.product, selectedCurrency),
        })),
        subtotal: total,
        shipping_cost: 0,
        tax: serviceFees,
        total: totalWithFees,
        currency: selectedCurrency,
        status: 'pending' as const,
        payment_status: 'pending',
        notes: formData.notes || undefined,
      };

      const order = await createOrder(orderData);

      const paymentResult = await initiateDypayPayment({
        amount: totalWithFees,
        currency: selectedCurrency,
        country: selectedCountry,
        item_ref: order.order_number,
        email: formData.customer_email,
        return_url: shopSlug
          ? `${window.location.origin}/shop/${shopSlug}/order/${order.order_number}`
          : `${window.location.origin}/order/${order.order_number}`,
        locale: 'fr',
      });

      if (paymentResult.payment_url) {
        await clear();
        window.location.href = paymentResult.payment_url;
      } else {
        throw new Error('URL de paiement introuvable');
      }
    } catch (error: any) {
      console.error('Error processing checkout:', error);
      alert('Erreur lors du traitement de la commande: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to={shopSlug ? `/shop/${shopSlug}/cart` : '/cart'}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au panier
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finaliser ma commande</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Informations personnelles
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  Adresse de livraison
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse complète *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays *
                      </label>
                      <select
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Cameroun">Cameroun</option>
                        <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                        <option value="Sénégal">Sénégal</option>
                        <option value="RDC">RDC</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Instructions de livraison, préférences..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-blue-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-blue-600" />
                  Pays et Devise de paiement
                </h2>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      Sélectionnez le pays dans lequel vous effectuerez le paiement. La devise sera automatiquement adaptée.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays de paiement *
                    </label>
                    <select
                      required
                      value={selectedCountry}
                      onChange={(e) => handlePaymentCountryChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {COUNTRIES_WITH_CURRENCY.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name} - {country.currencyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Devise sélectionnée:</span>
                      <span className="text-lg font-bold text-blue-600">{selectedCurrency}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sous-total:</span>
                      <span className="font-medium text-gray-900">
                        {total.toLocaleString()} {selectedCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Frais de service ({SERVICE_FEE_PERCENTAGE}%):</span>
                      <span className="font-medium text-blue-600">
                        +{calculateServiceFee(total).toLocaleString()} {selectedCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Montant total:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {calculateTotalWithFees(total).toLocaleString()} {selectedCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    Payer {calculateTotalWithFees(total).toLocaleString()} {selectedCurrency}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Récapitulatif</h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {item.product?.name}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">Qté: {item.quantity}</p>
                      <p className="text-gray-900 font-semibold text-sm mt-1">
                        {(getProductPrice(item.product, selectedCurrency) * item.quantity).toLocaleString()} {selectedCurrency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-semibold">{total.toLocaleString()} {selectedCurrency}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frais de service ({SERVICE_FEE_PERCENTAGE}%)</span>
                  <span className="font-semibold text-blue-600">
                    +{calculateServiceFee(total).toLocaleString()} {selectedCurrency}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className="font-semibold text-green-600">Gratuite</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900 mb-2">
                    <span>Total à payer</span>
                    <span>{calculateTotalWithFees(total).toLocaleString()} {selectedCurrency}</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Inclut {SERVICE_FEE_PERCENTAGE}% de frais de service pour la plateforme
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Paiement sécurisé via Monetbil
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
