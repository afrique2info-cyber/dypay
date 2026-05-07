import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingCart, Minus, Plus, Star, Package, Check, Loader2,
  Truck, Shield, CreditCard, Heart, Share2, Tag, Info, AlertCircle
} from 'lucide-react';
import { getProductById, type Product } from '../lib/products';
import { useCart } from '../contexts/CartContext';
import { calculateTotalWithFees, calculateServiceFee, SERVICE_FEE_PERCENTAGE } from '../lib/service-fees';

export default function ProductDetail() {
  const { productId, shopSlug } = useParams<{ productId: string; shopSlug?: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(productId!);
      setProduct(data);
    } catch (error: any) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      alert('Erreur lors de l\'ajout au panier');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      navigate(shopSlug ? `/shop/${shopSlug}/cart` : '/cart');
    } catch (error: any) {
      console.error('Error:', error);
      alert('Erreur');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h2>
          <Link to={shopSlug ? `/shop/${shopSlug}` : '/'} className="text-blue-600 hover:underline">
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const images = product.image_url
    ? [product.image_url, ...(Array.isArray(product.images) ? product.images : [])]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to={shopSlug ? `/shop/${shopSlug}` : '/'}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la boutique
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg relative">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                  <Package className="w-32 h-32 text-gray-300" />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                  -{discount}%
                </div>
              )}
              {product.stock_quantity === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-white px-6 py-3 rounded-lg font-bold text-gray-900 text-xl">
                    Rupture de stock
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-blue-600 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {product.category && (
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  <Tag className="w-4 h-4" />
                  {product.category}
                </span>
              </div>
            )}

            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">(0 avis)</span>
                <button className="ml-auto text-gray-600 hover:text-blue-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="text-gray-600 hover:text-red-600 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {product.price.toLocaleString()} {product.currency}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-xl text-gray-400 line-through">
                      {product.compare_at_price.toLocaleString()} {product.currency}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Frais de service ({SERVICE_FEE_PERCENTAGE}%): +{calculateServiceFee(product.price).toLocaleString()} {product.currency}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-600">Prix total:</span>
                  <span className="text-4xl font-bold text-blue-600">
                    {calculateTotalWithFees(product.price).toLocaleString()} {product.currency}
                  </span>
                </div>
              </div>

              {product.sku && (
                <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 font-medium">Stock:</span>
                {product.stock_quantity > 0 ? (
                  <span className="flex items-center gap-2 text-green-600 font-semibold">
                    <Check className="w-5 h-5" />
                    {product.stock_quantity} unités disponibles
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">Rupture de stock</span>
                )}
              </div>

              {product.stock_quantity > 0 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Quantité
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-14 h-14 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-semibold text-lg"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))}
                        className="w-24 text-center px-4 py-3 border-2 border-gray-200 rounded-lg font-bold text-xl"
                        min="1"
                        max={product.stock_quantity}
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                        className="w-14 h-14 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-semibold text-lg"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={adding}
                      className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg disabled:opacity-50"
                    >
                      {adding ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : added ? (
                        <>
                          <Check className="w-6 h-6" />
                          Ajouté !
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-6 h-6" />
                          Ajouter au panier
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={adding}
                      className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50"
                    >
                      Acheter maintenant
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Livraison rapide</p>
                  <p className="text-xs text-gray-600 mt-1">2-5 jours</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Paiement sécurisé</p>
                  <p className="text-xs text-gray-600 mt-1">100% protégé</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Retour facile</p>
                  <p className="text-xs text-gray-600 mt-1">30 jours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'description'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'specs'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Caractéristiques
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Avis (0)
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Description du produit</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description || 'Aucune description disponible pour ce produit.'}
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Caractéristiques</h3>
                <div className="space-y-3">
                  {product.category && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-700">Catégorie</span>
                      <span className="text-gray-900">{product.category}</span>
                    </div>
                  )}
                  {product.sku && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-700">SKU</span>
                      <span className="text-gray-900">{product.sku}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Disponibilité</span>
                    <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.stock_quantity > 0 ? 'En stock' : 'Rupture de stock'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="font-medium text-gray-700">Devise</span>
                    <span className="text-gray-900">{product.currency}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <Info className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun avis pour le moment</h3>
                <p className="text-gray-600">Soyez le premier à donner votre avis sur ce produit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
