import { useState, useEffect } from 'react';
import { AlertCircle, Store as StoreIcon, Plus, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageBuilderEditor from './builder/PageBuilderEditor';

interface Shop {
  id: string;
  shop_name: string;
  shop_slug: string;
  merchant_id: string;
}

export function PageBuilderManager() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadShops();

    const handleShopCreated = () => {
      loadShops();
    };

    window.addEventListener('shopCreated', handleShopCreated);

    return () => {
      window.removeEventListener('shopCreated', handleShopCreated);
    };
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setError('Utilisateur non connecté');
        return;
      }

      console.log('User authenticated:', user.id);

      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (merchantError) throw merchantError;
      if (!merchantData) {
        setError('Compte marchand introuvable');
        return;
      }

      console.log('Merchant found:', merchantData.id);

      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('id, shop_name, shop_slug, merchant_id')
        .eq('merchant_id', merchantData.id)
        .order('created_at', { ascending: false });

      if (shopsError) {
        console.error('Shops query error:', shopsError);
        throw shopsError;
      }

      console.log('Shops loaded:', shopsData?.length || 0, shopsData);

      if (shopsData && shopsData.length > 0) {
        setShops(shopsData);
        setSelectedShop(shopsData[0]);
      } else {
        setShops([]);
        setSelectedShop(null);
      }
    } catch (error: any) {
      console.error('Error loading shops:', error);
      setError(error.message || 'Erreur lors du chargement des boutiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600 font-medium">Chargement de vos boutiques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={loadShops}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Réessayer
        </button>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <StoreIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Créez votre première boutique</h3>
          <p className="text-gray-600 mb-2">
            Vous n'avez pas encore de boutique en ligne.
          </p>
          <p className="text-gray-600 mb-8">
            Créez une boutique pour commencer à vendre vos produits et personnaliser son design.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={loadShops}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Actualiser
            </button>
            <button
              onClick={() => {
                const event = new CustomEvent('changeTab', { detail: 'shops' });
                window.dispatchEvent(event);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Créer ma boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg">
                <StoreIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Boutique sélectionnée</p>
                  {shops.length === 1 ? (
                    <p className="text-sm font-bold text-gray-900">{selectedShop?.shop_name}</p>
                  ) : (
                    <select
                      value={selectedShop?.id || ''}
                      onChange={(e) => {
                        const shop = shops.find(s => s.id === e.target.value);
                        if (shop) setSelectedShop(shop);
                      }}
                      className="text-sm font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
                    >
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.shop_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              {shops.length > 1 && (
                <span className="text-sm text-gray-500">
                  {shops.length} boutiques disponibles
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {selectedShop && (
                <a
                  href={`/shop/${selectedShop.shop_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Voir la boutique
                </a>
              )}
              <button
                onClick={loadShops}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedShop && (
        <PageBuilderEditor shopId={selectedShop.id} shopSlug={selectedShop.shop_slug} />
      )}
    </div>
  );
}
