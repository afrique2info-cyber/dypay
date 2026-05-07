import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store, MapPin, Mail, Phone, Globe, Facebook, Twitter, Instagram,
  ExternalLink, ArrowLeft, Loader2, ShoppingBag,
  Menu, X, Search, User, Heart, ShoppingCart, Truck, Shield,
  CreditCard, Headphones, Star, ChevronRight
} from 'lucide-react';
import { getShopBySlug, type Shop } from '../lib/shops';
import { getShopProducts, type Product } from '../lib/products';
import { useCart } from '../contexts/CartContext';
import { Carousel } from '../components/Carousel';
import { COUNTRIES_WITH_CURRENCY, getCurrencyForCountry } from '../lib/monetbil';
import { getShopPageConfig, type ShopPageConfig } from '../lib/page-builder';
import BlockRenderer from '../components/builder/BlockRenderer';
import ThemedShopWrapper from '../components/ThemedShopWrapper';

export default function ShopPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { itemCount, selectedCountry, setCartCurrency } = useCart();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pageConfig, setPageConfig] = useState<ShopPageConfig | null>(null);
  const [useCustomDesign, setUseCustomDesign] = useState(false);

  const handleCountryChange = (countryCode: string) => {
    const currency = getCurrencyForCountry(countryCode);
    setCartCurrency(currency, countryCode);
  };

  const getAvailableCountries = () => {
    if (!shop) return [];

    if (shop.accept_all_countries) {
      return COUNTRIES_WITH_CURRENCY;
    }

    const supportedCountries = shop.supported_countries || [shop.country];
    return COUNTRIES_WITH_CURRENCY.filter(c => supportedCountries.includes(c.code));
  };

  useEffect(() => {
    if (slug) {
      loadShop();
    }
  }, [slug]);

  useEffect(() => {
    if (shop) {
      const countries = getAvailableCountries();
      if (countries.length > 0 && !selectedCountry) {
        const firstCountry = countries[0];
        setCartCurrency(firstCountry.currency, firstCountry.code);
      }
    }
  }, [shop]);

  const loadShop = async () => {
    try {
      setLoading(true);
      const data = await getShopBySlug(slug!);
      if (data) {
        setShop(data);
        const productsData = await getShopProducts(data.id);
        setProducts(productsData);

        const config = await getShopPageConfig(data.id);
        if (config && config.is_published) {
          setPageConfig(config);
          setUseCustomDesign(true);
        }
      } else {
        setError('Boutique introuvable');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la boutique');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la boutique...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Boutique introuvable</h1>
          <p className="text-gray-600 mb-8">
            {error || 'La boutique que vous recherchez n\'existe pas ou n\'est plus disponible.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = shop.theme_settings.primaryColor || '#3B82F6';
  const secondaryColor = shop.theme_settings.secondaryColor || '#10B981';

  return (
    <ThemedShopWrapper themeId={shop.theme_id}>
      <div className="min-h-screen bg-white">
      <div className="bg-blue-600 text-white py-2 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {shop.contact_email && (
              <a href={`mailto:${shop.contact_email}`} className="flex items-center gap-2 hover:text-blue-100 transition-colors">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">{shop.contact_email}</span>
              </a>
            )}
            {shop.contact_phone && (
              <a href={`tel:${shop.contact_phone}`} className="flex items-center gap-2 hover:text-blue-100 transition-colors">
                <Phone className="w-4 h-4" />
                <span>{shop.contact_phone}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Bienvenue dans notre boutique!</span>
            <div className="flex items-center gap-2">
              {shop.social_media?.facebook && (
                <a href={shop.social_media.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-100 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {shop.social_media?.twitter && (
                <a href={shop.social_media.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-blue-100 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {shop.social_media?.instagram && (
                <a href={shop.social_media.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-blue-100 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              {shop.logo_url ? (
                <img src={shop.logo_url} alt={shop.shop_name} className="h-12 w-auto object-contain" />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Store className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
              )}
              <span className="text-2xl font-bold text-gray-900">{shop.shop_name}</span>
            </div>

            <nav className="hidden lg:flex items-center gap-8">
              <a href="#accueil" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Accueil</a>
              <a href="#boutique" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Boutique</a>
              <a href="#apropos" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">À propos</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</a>
            </nav>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block">
                <User className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative hidden md:block">
                <Heart className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">0</span>
              </button>

              {getAvailableCountries().length > 1 && (
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hidden md:block"
                >
                  {getAvailableCountries().map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} - {country.currency}
                    </option>
                  ))}
                </select>
              )}

              <Link
                to={`/shop/${slug}/cart`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative hidden md:block"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col gap-4">
                <a href="#accueil" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Accueil</a>
                <a href="#boutique" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Boutique</a>
                <a href="#apropos" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">À propos</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</a>

                {getAvailableCountries().length > 1 && (
                  <div className="pt-2 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Pays de paiement
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      {getAvailableCountries().map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name} - {country.currency}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Link
                  to={`/shop/${slug}/cart`}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Panier
                  {itemCount > 0 && (
                    <span className="ml-auto w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {useCustomDesign && pageConfig ? (
        <div>
          {pageConfig.blocks
            .sort((a, b) => a.order - b.order)
            .map((block) => (
              <BlockRenderer key={block.id} block={block} shopSlug={slug} />
            ))}
        </div>
      ) : (
        <>
          <section
            id="accueil"
            className="relative bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden"
          >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <p
                  className="text-lg font-semibold mb-4"
                  style={{ color: primaryColor }}
                >
                  {shop.city ? `${shop.city}, ${shop.country}` : 'Bienvenue'}
                </p>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  {shop.shop_name}
                </h1>
                <p className="text-xl text-gray-600 mb-2">
                  {shop.description || 'Découvrez nos produits et services de qualité'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  Des offres exceptionnelles vous attendent
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href="#boutique"
                  className="px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  DÉCOUVRIR
                </a>
                <a
                  href="#apropos"
                  className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  EN SAVOIR PLUS
                </a>
              </div>
            </div>

            <div className="relative">
              <Carousel
                images={
                  shop.banner_url
                    ? [
                        shop.banner_url,
                        'https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg?auto=compress&cs=tinysrgb&w=1200',
                        'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200',
                      ]
                    : [
                        'https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg?auto=compress&cs=tinysrgb&w=1200',
                        'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200',
                        'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=1200',
                      ]
                }
                height="500px"
                autoplay={true}
                interval={4000}
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">-50%</p>
                  <p className="text-xs font-semibold text-gray-900">PROMO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Truck className="w-7 h-7" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Livraison Gratuite</h3>
                <p className="text-sm text-gray-600">Commandes +50$</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${secondaryColor}15` }}
              >
                <Shield className="w-7 h-7" style={{ color: secondaryColor }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Paiement Sécurisé</h3>
                <p className="text-sm text-gray-600">100% protégé</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <CreditCard className="w-7 h-7" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Retour Facile</h3>
                <p className="text-sm text-gray-600">30 jours</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${secondaryColor}15` }}
              >
                <Headphones className="w-7 h-7" style={{ color: secondaryColor }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Support 24/7</h3>
                <p className="text-sm text-gray-600">Assistance dédiée</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="boutique" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all">
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  NOUVEAUTÉ
                </span>
              </div>
              <img
                src="https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Collection Femme"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-2xl font-bold mb-2">Collection Femme</h3>
                <p className="text-white/90 mb-4">Jusqu'à 70% de réduction</p>
                <button
                  className="self-start px-6 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  Découvrir <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-8">
              <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -35%
                  </span>
                </div>
                <img
                  src="https://images.pexels.com/photos/1972115/pexels-photo-1972115.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Accessoires"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white text-xl font-bold mb-1">Sacs & Accessoires</h3>
                  <button
                    className="self-start text-white font-semibold flex items-center gap-1 text-sm hover:gap-2 transition-all"
                  >
                    Voir <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -40%
                  </span>
                </div>
                <img
                  src="https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Montres"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white text-xl font-bold mb-1">Montres</h3>
                  <button
                    className="self-start text-white font-semibold flex items-center gap-1 text-sm hover:gap-2 transition-all"
                  >
                    Voir <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all">
              <div className="absolute top-4 left-4 z-10">
                <span
                  className="text-white px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: secondaryColor }}
                >
                  POPULAIRE
                </span>
              </div>
              <img
                src="https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Sac à dos"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-2xl font-bold mb-2">Sacs à dos</h3>
                <p className="text-white/90 mb-4">Min. 40-80% de réduction</p>
                <button
                  className="self-start px-6 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  Voir <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Produits en Vedette</h2>
            <div className="flex justify-center gap-6 mt-6">
              <button
                className="text-gray-900 font-semibold pb-2 border-b-2"
                style={{ borderColor: primaryColor }}
              >
                Nouveautés
              </button>
              <button className="text-gray-500 hover:text-gray-900 font-semibold pb-2">
                Meilleures Ventes
              </button>
              <button className="text-gray-500 hover:text-gray-900 font-semibold pb-2">
                Les Plus Populaires
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun produit disponible</h3>
              <p className="text-gray-600">Cette boutique n'a pas encore ajouté de produits</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {products.map((product) => {
                const discount = product.compare_at_price
                  ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
                  : 0;

                return (
                  <Link
                    key={product.id}
                    to={`/shop/${slug}/product/${product.id}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                  >
                    <div className="relative overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                          <ShoppingBag className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          -{discount}%
                        </div>
                      )}
                      {product.stock_quantity === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-white px-4 py-2 rounded-lg font-semibold text-gray-900">
                            Rupture de stock
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors">
                          <Heart className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      {product.category && (
                        <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(0)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {product.price.toLocaleString()} {product.currency}
                        </span>
                        {product.compare_at_price && (
                          <span className="text-sm text-gray-400 line-through">
                            {product.compare_at_price.toLocaleString()} {product.currency}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative group overflow-hidden rounded-2xl shadow-xl">
              <img
                src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Promotion Homme"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-12">
                <p className="text-blue-400 font-semibold mb-2">VENTE DE FIN DE SAISON</p>
                <h3 className="text-white text-4xl font-bold mb-4">Collection Homme</h3>
                <p className="text-white/90 text-xl mb-6">Réduction 70%</p>
                <button
                  className="self-start px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  Acheter <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl shadow-xl">
              <img
                src="https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Promotion Femme"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-12">
                <p
                  className="font-semibold mb-2"
                  style={{ color: secondaryColor }}
                >
                  MODE TENDANCE
                </p>
                <h3 className="text-white text-4xl font-bold mb-4">Vêtements Femme</h3>
                <p className="text-white/90 text-xl mb-6">Min. 35-70% de réduction</p>
                <button
                  className="self-start px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  Acheter <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="apropos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">À Propos de {shop.shop_name}</h2>
              <p className="text-lg text-gray-600 mb-6">
                {shop.description || 'Nous sommes dédiés à vous offrir les meilleurs produits et services. Notre mission est de satisfaire nos clients avec des produits de qualité et un service exceptionnel.'}
              </p>
              <p className="text-gray-600 mb-8">
                Rejoignez des milliers de clients satisfaits qui nous font confiance pour leurs achats en ligne. Profitez de nos offres exceptionnelles et de notre service client disponible 24/7.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                  <p className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>100+</p>
                  <p className="text-gray-600">Produits</p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                  <p className="text-4xl font-bold mb-2" style={{ color: secondaryColor }}>5000+</p>
                  <p className="text-gray-600">Clients</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="À propos"
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h2>
            <p className="text-lg text-gray-600">Nous sommes là pour vous aider</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {shop.contact_email && (
              <a
                href={`mailto:${shop.contact_email}`}
                className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-xl transition-all group"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Mail className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 group-hover:text-blue-600 transition-colors break-words">
                  {shop.contact_email}
                </p>
              </a>
            )}

            {shop.contact_phone && (
              <a
                href={`tel:${shop.contact_phone}`}
                className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-xl transition-all group"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${secondaryColor}15` }}
                >
                  <Phone className="w-8 h-8" style={{ color: secondaryColor }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Téléphone</h3>
                <p className="text-gray-600 group-hover:text-blue-600 transition-colors">
                  {shop.contact_phone}
                </p>
              </a>
            )}

            {(shop.address || shop.city) && (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <MapPin className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Adresse</h3>
                <p className="text-gray-600">
                  {shop.address && <span className="block">{shop.address}</span>}
                  {shop.city && (
                    <span className="block">{shop.city}, {shop.country}</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {shop.website_url && (
            <div className="mt-12 text-center">
              <a
                href={shop.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <Globe className="w-5 h-5" />
                Visiter notre site web
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          )}
        </div>
      </section>
        </>
      )}

      <div className="bg-gray-900 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 {shop.shop_name}. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Propulsé par</span>
              <Link to="/" className="font-bold text-white hover:text-blue-400 transition-colors">
                DyPay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ThemedShopWrapper>
  );
}
