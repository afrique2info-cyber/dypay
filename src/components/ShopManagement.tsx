import { useState, useEffect } from 'react';
import { Store, Plus, ExternalLink, Trash2, Power, Copy, CheckCircle2, MapPin, Mail, Phone, Globe, Palette, ImageIcon } from 'lucide-react';
import { getMerchantShops, toggleShopStatus, deleteShop, getShopUrl, type Shop } from '../lib/shops';
import ShopCreation from './ShopCreation';
import ThemeSelector from './ThemeSelector';
import ThemeImageManager from './ThemeImageManager';

export default function ShopManagement() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [editingThemeShopId, setEditingThemeShopId] = useState<string | null>(null);
  const [selectedShopThemeId, setSelectedShopThemeId] = useState<string | null>(null);
  const [editingImagesShopId, setEditingImagesShopId] = useState<string | null>(null);
  const [shopCustomImages, setShopCustomImages] = useState<{
    hero?: string;
    banner?: string;
    logo?: string;
  }>({});

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const data = await getMerchantShops();
      setShops(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des boutiques');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (shopId: string) => {
    try {
      await toggleShopStatus(shopId);
      await loadShops();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification du statut');
    }
  };

  const handleDelete = async (shopId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette boutique ? Cette action est irréversible.')) {
      return;
    }

    try {
      await deleteShop(shopId);
      await loadShops();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la boutique');
    }
  };

  const copyShopUrl = (slug: string) => {
    const url = getShopUrl(slug);
    navigator.clipboard.writeText(url);
    setCopiedUrl(slug);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  if (showCreateForm) {
    return (
      <ShopCreation
        onSuccess={() => {
          setShowCreateForm(false);
          loadShops();
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingThemeShopId) {
    const shop = shops.find((s) => s.id === editingThemeShopId);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Thème de {shop?.shop_name}</h2>
            <p className="text-gray-600">Personnalisez l'apparence de votre boutique</p>
          </div>
          <button
            onClick={() => setEditingThemeShopId(null)}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Retour
          </button>
        </div>
        <ThemeSelector
          shopId={editingThemeShopId}
          currentThemeId={selectedShopThemeId}
          onThemeChange={(themeId) => {
            setSelectedShopThemeId(themeId);
            loadShops();
          }}
        />
      </div>
    );
  }

  if (editingImagesShopId) {
    const shop = shops.find((s) => s.id === editingImagesShopId);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Images de {shop?.shop_name}</h2>
            <p className="text-gray-600">Personnalisez les images de votre boutique</p>
          </div>
          <button
            onClick={() => setEditingImagesShopId(null)}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Retour
          </button>
        </div>
        <ThemeImageManager
          shopId={editingImagesShopId}
          currentImages={shopCustomImages}
          onImagesUpdate={(images) => {
            setShopCustomImages(images);
            loadShops();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Boutiques</h2>
          <p className="text-gray-600 mt-1">Gérez vos boutiques en ligne</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Créer une boutique
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Store className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune boutique</h3>
          <p className="text-gray-600 mb-6">Créez votre première boutique pour commencer à vendre</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Créer ma première boutique
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Store className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{shop.shop_name}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            shop.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {shop.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {shop.description && (
                        <p className="text-gray-600 mb-3">{shop.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {shop.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {shop.city}, {shop.country}
                          </div>
                        )}
                        {shop.contact_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {shop.contact_email}
                          </div>
                        )}
                        {shop.contact_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {shop.contact_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingThemeShopId(shop.id);
                        setSelectedShopThemeId(shop.theme_id || null);
                      }}
                      className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                      title="Changer le thème"
                    >
                      <Palette className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingImagesShopId(shop.id);
                        const customConfig = shop.custom_theme_config as any;
                        setShopCustomImages(customConfig?.images || {});
                      }}
                      className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                      title="Personnaliser les images"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(shop.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        shop.is_active
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={shop.is_active ? 'Désactiver' : 'Activer'}
                    >
                      <Power className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(shop.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <code className="flex-1 text-sm text-gray-700">
                    {getShopUrl(shop.shop_slug)}
                  </code>
                  <button
                    onClick={() => copyShopUrl(shop.shop_slug)}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Copier le lien"
                  >
                    {copiedUrl === shop.shop_slug ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <a
                    href={getShopUrl(shop.shop_slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Ouvrir"
                  >
                    <ExternalLink className="w-5 h-5 text-gray-600" />
                  </a>
                </div>

                {(shop.social_media?.facebook || shop.social_media?.instagram || shop.social_media?.twitter || shop.social_media?.whatsapp) && (
                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">Réseaux sociaux:</span>
                    <div className="flex gap-2">
                      {shop.social_media.facebook && (
                        <a
                          href={shop.social_media.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Facebook
                        </a>
                      )}
                      {shop.social_media.instagram && (
                        <a
                          href={shop.social_media.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700"
                        >
                          Instagram
                        </a>
                      )}
                      {shop.social_media.twitter && (
                        <a
                          href={shop.social_media.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:text-sky-700"
                        >
                          Twitter
                        </a>
                      )}
                      {shop.social_media.whatsapp && (
                        <a
                          href={`https://wa.me/${shop.social_media.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
                <div
                  className="flex items-center gap-2"
                  style={{ color: shop.theme_settings.primaryColor }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: shop.theme_settings.primaryColor }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: shop.theme_settings.secondaryColor }}
                  />
                  <span className="text-sm text-gray-600">Thème personnalisé</span>
                </div>
                <p className="text-sm text-gray-500">
                  Créée le {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
