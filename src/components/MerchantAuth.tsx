import { useState } from 'react';
import { Mail, Lock, Store, Loader2, CreditCard, Globe } from 'lucide-react';
import { signUp, signIn } from '../lib/auth';
import { COUNTRIES_WITH_CURRENCY } from '../lib/monetbil';

export function MerchantAuth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<'merchant' | 'pos'>('merchant');
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'CM',
    currency: 'XAF',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    const result = isSignUp
      ? await signUp(formData.email, formData.password, formData.businessName, accountType, formData.currency, formData.country)
      : await signIn(formData.email, formData.password);

    if (result.error) {
      setError(result.error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Dypay</h1>
          <p className="text-gray-600 mt-1">Agrégateur de Paiement</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              isSignUp
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inscription
          </button>
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              !isSignUp
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Connexion
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de compte
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('merchant')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      accountType === 'merchant'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Store className={`w-8 h-8 mx-auto mb-2 ${accountType === 'merchant' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="font-medium text-sm">Marchand</div>
                    <div className="text-xs text-gray-500 mt-1">Boutique en ligne complète</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('pos')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      accountType === 'pos'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <CreditCard className={`w-8 h-8 mx-auto mb-2 ${accountType === 'pos' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="font-medium text-sm">Point de Vente</div>
                    <div className="text-xs text-gray-500 mt-1">Terminal POS simplifié</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {accountType === 'merchant' ? 'Nom de la boutique' : 'Nom du point de vente'}
                </label>
                <div className="relative">
                  {accountType === 'merchant' ? (
                    <Store className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  ) : (
                    <CreditCard className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  )}
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder={accountType === 'merchant' ? 'Ma Boutique' : 'Mon Point de Vente'}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays et Devise
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.country}
                    onChange={(e) => {
                      const country = COUNTRIES_WITH_CURRENCY.find(c => c.code === e.target.value);
                      setFormData({
                        ...formData,
                        country: e.target.value,
                        currency: country?.currency || 'XAF'
                      });
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                    required
                  >
                    {COUNTRIES_WITH_CURRENCY.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} - {country.currencyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="vous@exemple.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isSignUp ? 'Création...' : 'Connexion...'}
              </>
            ) : (
              isSignUp ? 'Créer un compte' : 'Se connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
