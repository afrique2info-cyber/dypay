import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, Check } from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  slug: string;
  description: string;
  preview_image: string | null;
  config: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    layout: {
      headerStyle: string;
      productCardStyle: string;
      spacing: string;
      borderRadius: string;
    };
    components: {
      buttonStyle: string;
      cardShadow: string;
      imageStyle: string;
    };
  };
  is_active: boolean;
}

interface ThemeSelectorProps {
  shopId: string;
  currentThemeId: string | null;
  onThemeChange: (themeId: string) => void;
}

export default function ThemeSelector({ shopId, currentThemeId, onThemeChange }: ThemeSelectorProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(currentThemeId);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_themes')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setThemes(data || []);
    } catch (error) {
      console.error('Error loading themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = async (themeId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('shops')
        .update({ theme_id: themeId })
        .eq('id', shopId);

      if (error) throw error;

      setSelectedTheme(themeId);
      onThemeChange(themeId);
      alert('Thème appliqué avec succès !');
    } catch (error) {
      console.error('Error updating theme:', error);
      alert('Erreur lors de l\'application du thème');
    } finally {
      setSaving(false);
    }
  };

  const openPreview = (theme: Theme) => {
    setPreviewTheme(theme);
  };

  const closePreview = () => {
    setPreviewTheme(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Thèmes professionnels</h2>
        <p className="text-lg text-gray-600">
          Donnez vie à votre boutique avec des designs modernes et élégants, conçus pour convertir vos visiteurs en clients
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`group relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:-translate-y-1 ${
              selectedTheme === theme.id
                ? 'border-blue-600 ring-4 ring-blue-600 ring-opacity-20'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {selectedTheme === theme.id && (
              <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full p-2.5 shadow-lg">
                <Check className="w-5 h-5" />
              </div>
            )}

            <div className="relative h-56 overflow-hidden">
              {theme.preview_image ? (
                <>
                  <img
                    src={theme.preview_image}
                    alt={theme.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{theme.name}</h3>
                  </div>
                </>
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${theme.config.colors.primary} 0%, ${theme.config.colors.secondary} 100%)`,
                  }}
                >
                  <span className="text-white text-3xl font-bold drop-shadow-lg">{theme.name}</span>
                </div>
              )}
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4 leading-relaxed min-h-[48px]">{theme.description}</p>

              <div className="mb-5">
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Palette de couleurs</div>
                <div className="flex gap-1.5">
                  {Object.entries(theme.config.colors).slice(0, 6).map(([key, color]) => (
                    <div
                      key={key}
                      className="relative group/color"
                    >
                      <div
                        className="w-8 h-8 rounded-lg border-2 border-white shadow-md transition-transform hover:scale-125 cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={key}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Style</span>
                  <span className="text-gray-700 font-semibold capitalize">{theme.config.layout.productCardStyle}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Espacement</span>
                  <span className="text-gray-700 font-semibold capitalize">{theme.config.layout.spacing}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openPreview(theme)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-sm hover:shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  Aperçu
                </button>
                <button
                  onClick={() => handleThemeSelect(theme.id)}
                  disabled={saving || selectedTheme === theme.id}
                  className={`flex-1 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
                    selectedTheme === theme.id
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white cursor-default shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
                  } disabled:opacity-50`}
                >
                  {selectedTheme === theme.id ? '✓ Actif' : 'Appliquer'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewTheme && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-6 flex items-center justify-between z-10 backdrop-blur-sm">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{previewTheme.name}</h3>
                <p className="text-gray-600">{previewTheme.description}</p>
              </div>
              <button
                onClick={closePreview}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-200 font-bold text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-8">
              <div
                className="rounded-2xl overflow-hidden shadow-xl border border-gray-200"
                style={{
                  backgroundColor: previewTheme.config.colors.background,
                  fontFamily: previewTheme.config.fonts.body,
                }}
              >
                <div
                  className="p-12 relative overflow-hidden"
                  style={{
                    background: previewTheme.config.layout.headerStyle === 'gradient'
                      ? `linear-gradient(135deg, ${previewTheme.config.colors.primary} 0%, ${previewTheme.config.colors.secondary} 100%)`
                      : previewTheme.config.colors.primary,
                    color: '#FFFFFF',
                    fontFamily: previewTheme.config.fonts.heading,
                  }}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
                  </div>
                  <div className="relative">
                    <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">Ma Boutique</h1>
                    <p className="text-xl opacity-90 drop-shadow">Découvrez nos produits exceptionnels</p>
                  </div>
                </div>

                <div className="p-10 grid grid-cols-3 gap-8">
                  {[
                    { name: 'Produit Premium', price: '29.99€', image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg' },
                    { name: 'Produit Élégant', price: '49.99€', image: 'https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg' },
                    { name: 'Produit Unique', price: '39.99€', image: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg' }
                  ].map((product, i) => (
                    <div
                      key={i}
                      className="group rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: previewTheme.config.colors.surface,
                        boxShadow:
                          previewTheme.config.components.cardShadow === 'strong'
                            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                            : previewTheme.config.components.cardShadow === 'medium'
                            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                            : previewTheme.config.components.cardShadow === 'subtle'
                            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            : previewTheme.config.components.cardShadow === 'light'
                            ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                            : 'none',
                        border:
                          previewTheme.config.components.cardShadow === 'none'
                            ? `2px solid ${previewTheme.config.colors.border}`
                            : 'none',
                      }}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                          style={{
                            borderRadius:
                              previewTheme.config.layout.borderRadius === 'rounded'
                                ? '0.75rem 0.75rem 0 0'
                                : previewTheme.config.layout.borderRadius === 'minimal'
                                ? '0.375rem 0.375rem 0 0'
                                : '0',
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-5">
                        <h3
                          className="font-bold text-lg mb-2"
                          style={{
                            color: previewTheme.config.colors.text,
                            fontFamily: previewTheme.config.fonts.heading,
                          }}
                        >
                          {product.name}
                        </h3>
                        <p
                          className="text-sm mb-3 line-clamp-2"
                          style={{ color: previewTheme.config.colors.textSecondary }}
                        >
                          Une description captivante de ce produit exceptionnel qui saura séduire vos clients
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold" style={{ color: previewTheme.config.colors.accent }}>
                            {product.price}
                          </span>
                        </div>
                        <button
                          className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                          style={{
                            background: previewTheme.config.components.buttonStyle === 'gradient'
                              ? `linear-gradient(135deg, ${previewTheme.config.colors.accent} 0%, ${previewTheme.config.colors.primary} 100%)`
                              : previewTheme.config.components.buttonStyle === 'outline'
                              ? 'transparent'
                              : previewTheme.config.colors.accent,
                            color: previewTheme.config.components.buttonStyle === 'outline'
                              ? previewTheme.config.colors.accent
                              : '#FFFFFF',
                            border: previewTheme.config.components.buttonStyle === 'outline'
                              ? `2px solid ${previewTheme.config.colors.accent}`
                              : 'none',
                          }}
                        >
                          Ajouter au panier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p className="font-semibold mb-1">Informations sur le thème</p>
                  <p>Police titre: {previewTheme.config.fonts.heading}</p>
                  <p>Police texte: {previewTheme.config.fonts.body}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={closePreview}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      handleThemeSelect(previewTheme.id);
                      closePreview();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Appliquer ce thème
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
