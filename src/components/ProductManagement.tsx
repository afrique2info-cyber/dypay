import { useState, useEffect } from 'react';
import { Package, Plus, CreditCard as Edit2, Trash2, Eye, EyeOff, Loader2, Search, X, Info, Upload, Download } from 'lucide-react';
import { getCurrentMerchant } from '../lib/auth';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from '../lib/products';
import { getMerchantShops } from '../lib/shops';
import { COUNTRIES_WITH_CURRENCY, getCurrencyForCountry } from '../lib/monetbil';
import { calculateTotalWithFees, SERVICE_FEE_PERCENTAGE } from '../lib/service-fees';
import { supabase } from '../lib/supabase';

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_at_price: '',
    category: '',
    stock_quantity: '0',
    sku: '',
    image_url: '',
    shop_id: '',
    is_active: true,
    prices: {} as Record<string, string>,
    product_type: 'physical',
    digital_file: null as File | null,
    download_limit: '',
    access_duration_days: '',
  });

  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const merchant = await getCurrentMerchant();
      if (merchant) {
        const [productsData, shopsData] = await Promise.all([
          getProducts({ merchant_id: merchant.id }),
          getMerchantShops(),
        ]);
        setProducts(productsData);
        setShops(shopsData);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, merchantId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${merchantId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('digital-products')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const merchant = await getCurrentMerchant();
      if (!merchant) return;

      setUploadingFile(true);

      const selectedShop = formData.shop_id
        ? shops.find(s => s.id === formData.shop_id)
        : null;
      const currency = selectedShop?.currency || 'XAF';

      const pricesObj: Record<string, number> = {};
      if (selectedShop && selectedShop.supported_countries?.length > 0) {
        selectedShop.supported_countries.forEach((countryCode: string) => {
          const countryCurrency = getCurrencyForCountry(countryCode);
          const priceValue = formData.prices[countryCurrency];
          if (priceValue && priceValue !== '') {
            pricesObj[countryCurrency] = parseFloat(priceValue);
          }
        });
      }

      if (Object.keys(pricesObj).length === 0 && formData.price) {
        pricesObj[currency] = parseFloat(formData.price);
      }

      let digitalFileUrl = null;
      let digitalFileSize = null;
      let digitalFileType = null;

      if (formData.product_type === 'digital' && formData.digital_file) {
        digitalFileUrl = await handleFileUpload(formData.digital_file, merchant.id);
        digitalFileSize = formData.digital_file.size;
        digitalFileType = formData.digital_file.type;
      }

      const productData: any = {
        merchant_id: merchant.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || Object.values(pricesObj)[0] || 0,
        compare_at_price: formData.compare_at_price
          ? parseFloat(formData.compare_at_price)
          : null,
        category: formData.category || null,
        stock_quantity: formData.product_type === 'digital' ? 999999 : parseInt(formData.stock_quantity),
        sku: formData.sku || null,
        image_url: formData.image_url || null,
        shop_id: formData.shop_id || null,
        is_active: formData.is_active,
        currency,
        prices: pricesObj,
        product_type: formData.product_type,
        digital_file_url: digitalFileUrl,
        digital_file_size: digitalFileSize,
        digital_file_type: digitalFileType,
        download_limit: formData.download_limit ? parseInt(formData.download_limit) : null,
        access_duration_days: formData.access_duration_days ? parseInt(formData.access_duration_days) : null,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      await loadData();
      resetForm();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert('Erreur lors de la sauvegarde du produit: ' + error.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const pricesMap: Record<string, string> = {};
    if (product.prices && typeof product.prices === 'object') {
      Object.entries(product.prices).forEach(([curr, price]) => {
        pricesMap[curr] = price.toString();
      });
    }
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      compare_at_price: product.compare_at_price?.toString() || '',
      category: product.category || '',
      stock_quantity: product.stock_quantity.toString(),
      sku: product.sku || '',
      image_url: product.image_url || '',
      shop_id: product.shop_id || '',
      is_active: product.is_active,
      prices: pricesMap,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      await deleteProduct(id);
      await loadData();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression du produit');
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      await updateProduct(product.id, { is_active: !product.is_active });
      await loadData();
    } catch (error: any) {
      console.error('Error updating product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      compare_at_price: '',
      category: '',
      stock_quantity: '0',
      sku: '',
      image_url: '',
      shop_id: '',
      is_active: true,
      prices: {},
      product_type: 'physical',
      digital_file: null,
      download_limit: '',
      access_duration_days: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Information sur les frais de service
            </h3>
            <p className="text-sm text-blue-800">
              <strong>{SERVICE_FEE_PERCENTAGE}%</strong> de frais de service sont automatiquement ajoutés au prix de vos produits.
              Ces frais sont payés par le client et couvrent les coûts de transaction et de sécurité.
              Vous recevez <strong>100%</strong> du prix que vous définissez.
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Exemple: Si vous fixez le prix à 1,000 XAF, le client paiera 1,025 XAF (1,000 + 2.5%)
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Produits</h2>
          <p className="text-gray-600 mt-1">Gérez vos produits et votre catalogue</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Annuler' : 'Ajouter un Produit'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Vêtements, Électronique..."
                />
              </div>

              {formData.shop_id && (() => {
                const selectedShop = shops.find(s => s.id === formData.shop_id);
                const supportedCountries = selectedShop?.supported_countries || [selectedShop?.country || 'CM'];

                if (supportedCountries.length === 1) {
                  const currency = getCurrencyForCountry(supportedCountries[0]);
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix ({currency}) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.prices[currency] || formData.price}
                          onChange={(e) => setFormData({
                            ...formData,
                            price: e.target.value,
                            prices: { ...formData.prices, [currency]: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix comparatif ({currency})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.compare_at_price}
                          onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Pour afficher une réduction"
                        />
                      </div>
                    </>
                  );
                }

                return (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix par devise *
                    </label>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                      {supportedCountries.map((countryCode: string) => {
                        const currency = getCurrencyForCountry(countryCode);
                        const country = COUNTRIES_WITH_CURRENCY.find(c => c.code === countryCode);
                        return (
                          <div key={countryCode}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {country?.name} ({currency})
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              step="0.01"
                              value={formData.prices[currency] || ''}
                              onChange={(e) => {
                                const newPrices = { ...formData.prices, [currency]: e.target.value };
                                setFormData({
                                  ...formData,
                                  prices: newPrices,
                                  price: e.target.value || formData.price
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder={`Prix en ${currency}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Définissez un prix pour chaque pays où votre boutique accepte les paiements
                    </p>
                  </div>
                );
              })()}

              {!formData.shop_id && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix (XAF) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix comparatif (XAF)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.compare_at_price}
                      onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Pour afficher une réduction"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Code produit"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Boutique
                </label>
                <select
                  value={formData.shop_id}
                  onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sans boutique</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.shop_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de produit *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="product_type"
                      value="physical"
                      checked={formData.product_type === 'physical'}
                      onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Produit physique</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="product_type"
                      value="digital"
                      checked={formData.product_type === 'digital'}
                      onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Produit digital (ebook, formation, etc.)</span>
                  </label>
                </div>
              </div>

              {formData.product_type === 'digital' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fichier digital * (PDF, ZIP, MP4, etc. - Max 500MB)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formData.digital_file ? formData.digital_file.name : 'Sélectionner un fichier'}
                          </span>
                        </div>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 524288000) {
                                alert('Le fichier est trop volumineux (max 500MB)');
                                return;
                              }
                              setFormData({ ...formData, digital_file: file });
                            }
                          }}
                          className="hidden"
                          accept=".pdf,.zip,.mp4,.mov,.mp3,.epub,.docx,.pptx"
                        />
                      </label>
                    </div>
                    {formData.digital_file && (
                      <p className="mt-2 text-sm text-gray-500">
                        Taille: {(formData.digital_file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Limite de téléchargements
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.download_limit}
                      onChange={(e) => setFormData({ ...formData, download_limit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Illimité"
                    />
                    <p className="mt-1 text-xs text-gray-500">Laissez vide pour illimité</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée d'accès (jours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.access_duration_days}
                      onChange={(e) => setFormData({ ...formData, access_duration_days: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Permanent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Laissez vide pour accès permanent</p>
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'image
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Produit actif</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={uploadingFile}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  editingProduct ? 'Mettre à jour' : 'Créer le produit'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={uploadingFile}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit</h3>
            <p className="text-gray-600 mb-6">Commencez par ajouter votre premier produit</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            {(product as any).product_type === 'digital' ? (
                              <Download className="w-6 h-6 text-blue-500" />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{product.name}</span>
                            {(product as any).product_type === 'digital' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Download className="w-3 h-3" />
                                Digital
                              </span>
                            )}
                          </div>
                          {product.sku && (
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {product.category || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-500">
                          Prix marchand
                        </div>
                        <div className="font-medium text-gray-900">
                          {product.price.toLocaleString()} {product.currency}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Client paie: {calculateTotalWithFees(product.price).toLocaleString()} {product.currency}
                        </div>
                        {product.compare_at_price && (
                          <div className="text-sm text-gray-400 line-through">
                            {product.compare_at_price.toLocaleString()} {product.currency}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm ${
                          product.stock_quantity > 10
                            ? 'text-green-600'
                            : product.stock_quantity > 0
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {product.stock_quantity} unités
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleProductStatus(product)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.is_active ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Actif
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Inactif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
