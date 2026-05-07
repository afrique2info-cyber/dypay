import { useState } from 'react';
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ThemeImageManagerProps {
  shopId: string;
  currentImages: {
    hero?: string;
    banner?: string;
    logo?: string;
  };
  onImagesUpdate: (images: { hero?: string; banner?: string; logo?: string }) => void;
}

export default function ThemeImageManager({ shopId, currentImages, onImagesUpdate }: ThemeImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(currentImages);

  const handleImageUpload = async (file: File, type: 'hero' | 'banner' | 'logo') => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${shopId}-${type}-${Date.now()}.${fileExt}`;
      const filePath = `shop-themes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shop-images')
        .getPublicUrl(filePath);

      const updatedImages = { ...images, [type]: publicUrl };
      setImages(updatedImages);

      await saveCustomConfig(updatedImages);
      onImagesUpdate(updatedImages);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (type: 'hero' | 'banner' | 'logo') => {
    const updatedImages = { ...images };
    delete updatedImages[type];
    setImages(updatedImages);

    await saveCustomConfig(updatedImages);
    onImagesUpdate(updatedImages);
  };

  const saveCustomConfig = async (newImages: typeof images) => {
    try {
      const { error } = await supabase
        .from('shops')
        .update({
          custom_theme_config: {
            images: newImages
          }
        })
        .eq('id', shopId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving custom config:', error);
      throw error;
    }
  };

  const ImageUploadBox = ({
    type,
    label,
    description
  }: {
    type: 'hero' | 'banner' | 'logo';
    label: string;
    description: string;
  }) => {
    const currentImage = images[type];

    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">{label}</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <ImageIcon className="w-6 h-6 text-gray-400" />
        </div>

        {currentImage ? (
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={currentImage}
                alt={label}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                <button
                  onClick={() => handleRemoveImage(type)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-3 rounded-full hover:bg-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, type);
                }}
                disabled={uploading}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm font-medium">
                <Upload className="w-4 h-4" />
                Changer l'image
              </span>
            </label>
          </div>
        ) : (
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, type);
              }}
              disabled={uploading}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center py-8 cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <span className="text-sm font-medium text-gray-700 mb-1">
                Cliquez pour télécharger
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG jusqu'à 5 MB
              </span>
            </div>
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Personnaliser les images du thème
        </h3>
        <p className="text-gray-600">
          Ajoutez vos propres images ou supprimez-les pour utiliser les images par défaut du thème
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUploadBox
          type="hero"
          label="Image Hero"
          description="Image principale de votre page d'accueil (recommandé: 1920x600px)"
        />
        <ImageUploadBox
          type="banner"
          label="Bannière"
          description="Bannière promotionnelle (recommandé: 1920x400px)"
        />
        <ImageUploadBox
          type="logo"
          label="Logo"
          description="Logo de votre boutique (recommandé: 400x400px)"
        />
      </div>

      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Téléchargement en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
}
