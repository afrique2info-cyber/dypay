import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { getShopProducts } from '../../../lib/products';
import { useCart } from '../../../contexts/CartContext';

interface ProductsGridBlockProps {
  content: {
    title?: string;
    description?: string;
    columns?: number;
    showCategory?: boolean;
    showPrice?: boolean;
  };
  style?: Record<string, any>;
  shopSlug?: string;
}

export default function ProductsGridBlock({ content, style, shopSlug }: ProductsGridBlockProps) {
  const { title, description, columns = 3, showCategory = true, showPrice = true } = content;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, selectedCurrency, getProductPrice } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    if (!shopSlug) {
      setLoading(false);
      return;
    }

    try {
      const data = await getShopProducts(shopSlug);
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div
      style={{
        backgroundColor: style?.backgroundColor,
        color: style?.textColor,
        padding: style?.padding || '60px 20px',
      }}
      id="products"
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{title}</h2>
        )}
        {description && (
          <p className="text-lg text-center mb-12 opacity-80">{description}</p>
        )}

        {loading ? (
          <div className="text-center py-12">Chargement des produits...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">Aucun produit disponible</div>
        ) : (
          <div className={`grid ${gridCols} gap-6`}>
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <Link to={`/shop/${shopSlug}/product/${product.id}`}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                      <ShoppingCart className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </Link>
                <div className="p-6">
                  {showCategory && product.category && (
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                  )}
                  <Link to={`/shop/${shopSlug}/product/${product.id}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600">
                      {product.name}
                    </h3>
                  </Link>
                  {product.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  )}
                  {showPrice && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          {getProductPrice(product, selectedCurrency).toLocaleString()} {selectedCurrency}
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Ajouter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
