import { PageBlock } from '../../lib/page-builder';

interface BlockEditorProps {
  block: PageBlock;
  onUpdate: (updates: Partial<PageBlock>) => void;
}

export default function BlockEditor({ block, onUpdate }: BlockEditorProps) {
  const updateContent = (key: string, value: any) => {
    onUpdate({
      content: {
        ...block.content,
        [key]: value,
      },
    });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdate({
      style: {
        ...block.style,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Contenu</h3>
        <div className="space-y-4">
          {renderContentFields()}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-semibold mb-3">Style</h3>
        <div className="space-y-4">
          {block.type !== 'spacer' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Couleur de fond</label>
                <input
                  type="color"
                  value={block.style?.backgroundColor || '#FFFFFF'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Couleur du texte</label>
                <input
                  type="color"
                  value={block.style?.textColor || '#000000'}
                  onChange={(e) => updateStyle('textColor', e.target.value)}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Padding</label>
                <input
                  type="text"
                  value={block.style?.padding || ''}
                  onChange={(e) => updateStyle('padding', e.target.value)}
                  placeholder="ex: 60px 20px"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  function renderContentFields() {
    switch (block.type) {
      case 'hero':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sous-titre</label>
              <input
                type="text"
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Texte du bouton</label>
              <input
                type="text"
                value={block.content.buttonText || ''}
                onChange={(e) => updateContent('buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lien du bouton</label>
              <input
                type="text"
                value={block.content.buttonLink || ''}
                onChange={(e) => updateContent('buttonLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image de fond (URL)</label>
              <input
                type="text"
                value={block.content.backgroundImage || ''}
                onChange={(e) => updateContent('backgroundImage', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        );

      case 'products-grid':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={block.content.description || ''}
                onChange={(e) => updateContent('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Colonnes</label>
              <select
                value={block.content.columns || 3}
                onChange={(e) => updateContent('columns', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value={2}>2 colonnes</option>
                <option value={3}>3 colonnes</option>
                <option value={4}>4 colonnes</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showCategory"
                checked={block.content.showCategory ?? true}
                onChange={(e) => updateContent('showCategory', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showCategory" className="text-sm font-medium">
                Afficher la catégorie
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPrice"
                checked={block.content.showPrice ?? true}
                onChange={(e) => updateContent('showPrice', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showPrice" className="text-sm font-medium">
                Afficher le prix
              </label>
            </div>
          </>
        );

      case 'features':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fonctionnalités</label>
              <div className="space-y-3">
                {(block.content.features || []).map((feature: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <input
                      type="text"
                      value={feature.title || ''}
                      onChange={(e) => {
                        const newFeatures = [...block.content.features];
                        newFeatures[index] = { ...feature, title: e.target.value };
                        updateContent('features', newFeatures);
                      }}
                      placeholder="Titre"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={feature.description || ''}
                      onChange={(e) => {
                        const newFeatures = [...block.content.features];
                        newFeatures[index] = { ...feature, description: e.target.value };
                        updateContent('features', newFeatures);
                      }}
                      placeholder="Description"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      case 'text-content':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Texte</label>
              <textarea
                value={block.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alignement</label>
              <select
                value={block.content.alignment || 'left'}
                onChange={(e) => updateContent('alignment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="left">Gauche</option>
                <option value="center">Centré</option>
                <option value="right">Droite</option>
              </select>
            </div>
          </>
        );

      case 'image':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">URL de l'image</label>
              <input
                type="text"
                value={block.content.imageUrl || ''}
                onChange={(e) => updateContent('imageUrl', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Texte alternatif</label>
              <input
                type="text"
                value={block.content.alt || ''}
                onChange={(e) => updateContent('alt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Légende</label>
              <input
                type="text"
                value={block.content.caption || ''}
                onChange={(e) => updateContent('caption', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lien (optionnel)</label>
              <input
                type="text"
                value={block.content.link || ''}
                onChange={(e) => updateContent('link', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        );

      case 'cta':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={block.content.description || ''}
                onChange={(e) => updateContent('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Texte du bouton</label>
              <input
                type="text"
                value={block.content.buttonText || ''}
                onChange={(e) => updateContent('buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lien du bouton</label>
              <input
                type="text"
                value={block.content.buttonLink || ''}
                onChange={(e) => updateContent('buttonLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        );

      case 'spacer':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Hauteur</label>
            <input
              type="text"
              value={block.content.height || '40px'}
              onChange={(e) => updateContent('height', e.target.value)}
              placeholder="ex: 40px, 2rem"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        );

      default:
        return <p className="text-gray-500">Aucun paramètre disponible</p>;
    }
  }
}
