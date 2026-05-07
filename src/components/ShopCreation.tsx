import React, { useState } from 'react';
import { Store, Check, X, Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, MessageCircle, Palette, DollarSign } from 'lucide-react';
import { createShop, generateSlug, isSlugAvailable, type CreateShopData } from '../lib/shops';
import { COUNTRIES_WITH_CURRENCY, getCurrencyForCountry } from '../lib/monetbil';

interface ShopCreationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ShopCreation({ onSuccess, onCancel }: ShopCreationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const [formData, setFormData] = useState<CreateShopData>({
    shop_name: '',
    shop_slug: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    country: 'CM',
    currency: 'XAF',
    supported_countries: ['CM'],
    accept_all_countries: false,
    website_url: '',
    social_media: {},
    theme_settings: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981'
    }
  });

  const handleCountryChange = (countryCode: string) => {
    const currency = getCurrencyForCountry(countryCode);
    setFormData({
      ...formData,
      country: countryCode,
      currency,
      supported_countries: [countryCode]
    });
  };

  const handleSupportedCountryToggle = (countryCode: string) => {
    const defaultCountry = formData.country || 'CM';
    const current: string[] = (formData.supported_countries || [defaultCountry]).filter((c): c is string => typeof c === 'string');
    const updated: string[] = current.includes(countryCode)
      ? current.filter(c => c !== countryCode)
      : [...current, countryCode];

    const finalArray: string[] = updated.length > 0 ? updated : [defaultCountry];
    setFormData({ ...formData, supported_countries: finalArray });
  };

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    setFormData({ ...formData, shop_name: name, shop_slug: slug });
    checkSlugAvailability(slug);
  };

  const handleSlugChange = async (slug: string) => {
    const cleanSlug = generateSlug(slug);
    setFormData({ ...formData, shop_slug: cleanSlug });
    checkSlugAvailability(cleanSlug);
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setSlugChecking(true);
    try {
      const available = await isSlugAvailable(slug);
      setSlugAvailable(available);
    } catch (err) {
      console.error('Error checking slug:', err);
    } finally {
      setSlugChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!slugAvailable) {
        throw new Error('Le nom de boutique choisi n\'est pas disponible');
      }

      await createShop(formData);
      window.dispatchEvent(new Event('shopCreated'));
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la boutique');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Store className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Créer une boutique</h2>
          <p className="text-sm text-gray-500">Configurez votre boutique en ligne</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la boutique <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.shop_name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ma Super Boutique"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la boutique <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">dypay.io/shop/</span>
              <input
                type="text"
                required
                value={formData.shop_slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ma-super-boutique"
                pattern="[a-z0-9-]+"
              />
              {slugChecking && (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
              {!slugChecking && slugAvailable === true && (
                <Check className="w-5 h-5 text-green-600" />
              )}
              {!slugChecking && slugAvailable === false && (
                <X className="w-5 h-5 text-red-600" />
              )}
            </div>
            {slugAvailable === false && (
              <p className="mt-1 text-sm text-red-600">Ce nom est déjà pris</p>
            )}
            {slugAvailable === true && (
              <p className="mt-1 text-sm text-green-600">Disponible!</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Décrivez votre boutique..."
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email de contact
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@boutique.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+237 6XX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Ville
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Douala"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Pays principal <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {COUNTRIES_WITH_CURRENCY.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Devise: {formData.currency}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Adresse complète
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Rue de la Boutique, Akwa, Douala"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Réseaux sociaux</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Facebook className="w-4 h-4 inline mr-1" />
                Facebook
              </label>
              <input
                type="url"
                value={formData.social_media?.facebook || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_media: { ...formData.social_media, facebook: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://facebook.com/maboutique"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Instagram className="w-4 h-4 inline mr-1" />
                Instagram
              </label>
              <input
                type="url"
                value={formData.social_media?.instagram || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_media: { ...formData.social_media, instagram: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://instagram.com/maboutique"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Twitter className="w-4 h-4 inline mr-1" />
                Twitter
              </label>
              <input
                type="url"
                value={formData.social_media?.twitter || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_media: { ...formData.social_media, twitter: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://twitter.com/maboutique"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                WhatsApp
              </label>
              <input
                type="tel"
                value={formData.social_media?.whatsapp || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_media: { ...formData.social_media, whatsapp: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+237 6XX XXX XXX"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <DollarSign className="w-5 h-5 inline mr-2" />
            Pays supportés pour les paiements
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Sélectionnez les pays où vous souhaitez accepter des paiements. Les clients pourront payer dans la devise de leur pays.
          </p>

          <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.accept_all_countries}
                onChange={(e) => setFormData({ ...formData, accept_all_countries: e.target.checked })}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-blue-900">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Accepter tous les pays
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  En activant cette option, votre boutique pourra recevoir des paiements de tous les pays supportés par la plateforme. Les clients choisiront leur pays au moment du paiement.
                </p>
              </div>
            </label>
          </div>

          {!formData.accept_all_countries && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {COUNTRIES_WITH_CURRENCY.map((country) => {
              const isSelected = formData.supported_countries?.includes(country.code);
              const isPrimary = formData.country === country.code;
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => !isPrimary && handleSupportedCountryToggle(country.code)}
                  disabled={isPrimary}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isPrimary ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{country.name}</div>
                      <div className="text-xs text-gray-500">{country.currency}</div>
                      {isPrimary && (
                        <div className="text-xs text-blue-600 mt-1">Principal</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Palette className="w-5 h-5 inline mr-2" />
            Personnalisation
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur principale
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.theme_settings?.primaryColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    theme_settings: { ...formData.theme_settings!, primaryColor: e.target.value }
                  })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.theme_settings?.primaryColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    theme_settings: { ...formData.theme_settings!, primaryColor: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur secondaire
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.theme_settings?.secondaryColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    theme_settings: { ...formData.theme_settings!, secondaryColor: e.target.value }
                  })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.theme_settings?.secondaryColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    theme_settings: { ...formData.theme_settings!, secondaryColor: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#10B981"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !slugAvailable || !formData.shop_name}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : 'Créer la boutique'}
          </button>
        </div>
      </form>
    </div>
  );
}
