import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Loader2, Plus, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCurrentMerchant } from '../lib/auth';
import { formatCurrency } from '../lib/currency';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number;
  track_stock: boolean;
  price: number;
  currency: string;
  total_sales: number;
  image_url?: string;
  shops?: {
    name: string;
  };
}

interface StockHistory {
  id: string;
  movement_type: string;
  quantity_change: number;
  quantity_after: number;
  reason: string;
  created_at: string;
  products?: {
    name: string;
  };
}

export function StockManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'restock' | 'adjustment'>('restock');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const merchant = await getCurrentMerchant();
      if (!merchant) return;

      let query = supabase
        .from('products')
        .select(`
          *,
          shops (name)
        `)
        .eq('merchant_id', merchant.id)
        .eq('track_stock', true)
        .order('stock_quantity', { ascending: true });

      if (filter === 'low') {
        query = query.lte('stock_quantity', supabase.rpc('products.low_stock_threshold'));
      } else if (filter === 'out') {
        query = query.eq('stock_quantity', 0);
      }

      const { data: productsData } = await query;
      setProducts(productsData || []);

      const { data: historyData } = await supabase
        .from('stock_history')
        .select(`
          *,
          products (name)
        `)
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setStockHistory(historyData || []);
    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedProduct || !adjustmentQuantity) return;

    try {
      const merchant = await getCurrentMerchant();
      if (!merchant) return;

      const quantityChange = parseInt(adjustmentQuantity);
      const newQuantity = Math.max(0, selectedProduct.stock_quantity + quantityChange);

      await supabase.from('products').update({ stock_quantity: newQuantity }).eq('id', selectedProduct.id);

      await supabase.from('stock_history').insert({
        product_id: selectedProduct.id,
        merchant_id: merchant.id,
        movement_type: adjustmentType,
        quantity_change: quantityChange,
        quantity_after: newQuantity,
        reason: adjustmentReason || (adjustmentType === 'restock' ? 'Réapprovisionnement' : 'Ajustement manuel'),
      });

      await loadData();
      setShowAdjustModal(false);
      setSelectedProduct(null);
      setAdjustmentQuantity('');
      setAdjustmentReason('');
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Erreur lors de l\'ajustement du stock');
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { label: 'Rupture', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: 'Stock faible', color: 'text-orange-600', bg: 'bg-orange-100' };
    }
    return { label: 'En stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'restock':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'adjustment':
        return <Edit3 className="w-4 h-4 text-blue-600" />;
      case 'return':
        return <Plus className="w-4 h-4 text-purple-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMovementLabel = (type: string) => {
    const labels: Record<string, string> = {
      sale: 'Vente',
      restock: 'Réapprovisionnement',
      adjustment: 'Ajustement',
      return: 'Retour',
    };
    return labels[type] || type;
  };

  const lowStockCount = products.filter((p) => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0).length;
  const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.stock_quantity * p.price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion du stock</h2>
          <p className="text-gray-600 mt-1">Suivez et gérez votre inventaire</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les produits</option>
          <option value="low">Stock faible</option>
          <option value="out">Rupture de stock</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <Package className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-1">{products.length}</div>
          <div className="text-blue-100 text-sm">Produits suivis</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
          <AlertTriangle className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-1">{lowStockCount}</div>
          <div className="text-orange-100 text-sm">Stock faible</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md p-6 text-white">
          <TrendingDown className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-1">{outOfStockCount}</div>
          <div className="text-red-100 text-sm">Rupture de stock</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold mb-1">{formatCurrency(totalValue, products[0]?.currency || 'XAF')}</div>
          <div className="text-green-100 text-sm">Valeur du stock</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Inventaire</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {products.map((product) => {
              const status = getStockStatus(product);
              return (
                <div key={product.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{product.name}</div>
                    <div className="text-xs text-gray-500">SKU: {product.sku || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{product.shops?.name || 'Sans boutique'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{product.stock_quantity}</div>
                    <span className={`text-xs px-2 py-1 rounded ${status.bg} ${status.color}`}>{status.label}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowAdjustModal(true);
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Ajuster
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Historique des mouvements</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stockHistory.map((history) => (
              <div key={history.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                <div className="mt-1">{getMovementIcon(history.movement_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{history.products?.name || 'Produit inconnu'}</div>
                  <div className="text-xs text-gray-600">{getMovementLabel(history.movement_type)}</div>
                  <div className="text-xs text-gray-500">{history.reason}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(history.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${history.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {history.quantity_change > 0 ? '+' : ''}
                    {history.quantity_change}
                  </div>
                  <div className="text-xs text-gray-500">→ {history.quantity_after}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ajuster le stock</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                <div className="text-gray-900">{selectedProduct.name}</div>
                <div className="text-sm text-gray-500">Stock actuel: {selectedProduct.stock_quantity}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'ajustement</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="restock">Réapprovisionnement (+)</option>
                  <option value="adjustment">Ajustement manuel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité {adjustmentType === 'restock' ? '(à ajouter)' : '(+ ou -)'}
                </label>
                <input
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  placeholder={adjustmentType === 'restock' ? '10' : '+10 ou -5'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Nouveau stock:{' '}
                  {adjustmentQuantity
                    ? Math.max(0, selectedProduct.stock_quantity + parseInt(adjustmentQuantity || '0'))
                    : selectedProduct.stock_quantity}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raison (optionnel)</label>
                <textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Raison de l'ajustement..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedProduct(null);
                    setAdjustmentQuantity('');
                    setAdjustmentReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAdjustStock}
                  disabled={!adjustmentQuantity}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
