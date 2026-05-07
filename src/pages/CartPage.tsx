import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Loader2, Globe, Info } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { COUNTRIES_WITH_CURRENCY, getCurrencyForCountry } from '../lib/monetbil';
import { calculateTotalWithFees, calculateServiceFee, SERVICE_FEE_PERCENTAGE } from '../lib/service-fees';

export default function CartPage() {
  const { shopSlug } = useParams<{ shopSlug?: string }>();
  const navigate = useNavigate();
  const { items, loading, total, updateQuantity, removeItem, selectedCurrency, selectedCountry, setCartCurrency, getProductPrice } = useCart();

  const handlePaymentCountryChange = (countryCode: string) => {
    const currency = getCurrencyForCountry(countryCode);
    setCartCurrency(currency, countryCode);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleCheckout = () => {
    if (shopSlug) {
      navigate(`/shop/${shopSlug}/checkout`);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to={shopSlug ? `/shop/${shopSlug}` : '/'}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Continuer mes achats
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Panier</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
            <p className="text-gray-600 mb-8">Ajoutez des produits pour commencer vos achats</p>
            <Link
              to={shopSlug ? `/shop/${shopSlug}` : '/'}
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-6 shadow-sm flex gap-6 hover:shadow-md transition-shadow"
                >
                  {item.product?.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-12 h-12 text-gray-300" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.product?.name}
                    </h3>
                    {item.product?.category && (
                      <p className="text-sm text-gray-500 mb-3">{item.product.category}</p>
                    )}
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-900">
                        {getProductPrice(item.product, selectedCurrency).toLocaleString()} {selectedCurrency}
                      </span>
                      {item.product?.compare_at_price && (
                        <span className="text-lg text-gray-400 line-through">
                          {item.product.compare_at_price.toLocaleString()} {selectedCurrency}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Résumé de la commande</h2>

                <div className="space-y-4 mb-6">
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
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900 mb-2">
                      <span>Total à payer</span>
                      <span className="text-2xl">{calculateTotalWithFees(total).toLocaleString()} {selectedCurrency}</span>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        Les frais de service ({SERVICE_FEE_PERCENTAGE}%) couvrent les coûts de transaction et de sécurité de la plateforme.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Pays de paiement
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => handlePaymentCountryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {COUNTRIES_WITH_CURRENCY.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.currency})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-700 mt-2">
                    Les prix seront convertis en {selectedCurrency}
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg mb-4"
                >
                  Procéder au paiement
                </button>

                <Link
                  to={shopSlug ? `/shop/${shopSlug}` : '/'}
                  className="block text-center text-blue-600 hover:underline"
                >
                  Continuer mes achats
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
