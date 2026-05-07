import { useState, useEffect } from 'react';
import {
  GripVertical,
  Trash2,
  Copy,
  Eye,
  Save,
  Plus,
  Settings,
  ArrowUp,
  ArrowDown,
  Check,
} from 'lucide-react';
import {
  PageBlock,
  moveBlock,
  addBlock,
  removeBlock,
  duplicateBlock,
  getShopPageConfig,
  createShopPageConfig,
  updateShopPageConfig,
  publishShopPageConfig,
  DEFAULT_BLOCKS,
  BlockType,
} from '../../lib/page-builder';
import BlockEditor from './BlockEditor';
import BlockRenderer from './BlockRenderer';

interface PageBuilderEditorProps {
  shopId: string;
  shopSlug: string;
}

const BLOCK_TEMPLATES: { type: BlockType; label: string }[] = [
  { type: 'hero', label: 'Hero / Bannière' },
  { type: 'products-grid', label: 'Grille de produits' },
  { type: 'features', label: 'Fonctionnalités' },
  { type: 'text-content', label: 'Contenu texte' },
  { type: 'image', label: 'Image' },
  { type: 'cta', label: 'Appel à l\'action' },
  { type: 'spacer', label: 'Espaceur' },
];

export default function PageBuilderEditor({ shopId, shopSlug }: PageBuilderEditorProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>(DEFAULT_BLOCKS);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadConfig();
  }, [shopId]);

  const loadConfig = async () => {
    const config = await getShopPageConfig(shopId);
    if (config) {
      setBlocks(config.blocks);
      setIsPublished(config.is_published);
    } else {
      const newConfig = await createShopPageConfig(shopId);
      if (newConfig) {
        setIsPublished(newConfig.is_published);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateShopPageConfig(shopId, { blocks });
      alert('Configuration sauvegardée avec succès!');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await updateShopPageConfig(shopId, { blocks, is_published: true });
      await publishShopPageConfig(shopId);
      setIsPublished(true);
      alert('Votre boutique personnalisée a été publiée!');
    } catch (error) {
      alert('Erreur lors de la publication');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock: PageBlock = {
      id: `${type}-${Date.now()}`,
      type,
      order: blocks.length,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
    };
    setBlocks(addBlock(blocks, newBlock));
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      setBlocks(moveBlock(blocks, index, index - 1));
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < blocks.length - 1) {
      setBlocks(moveBlock(blocks, index, index + 1));
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      setBlocks(moveBlock(blocks, draggedIndex, dropIndex));
    }
    setDraggedIndex(null);
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<PageBlock>) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...updates } : b));
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="flex h-screen bg-gray-100">
      {!previewMode && (
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold mb-4">Ajouter un bloc</h2>
            <div className="space-y-2">
              {BLOCK_TEMPLATES.map((template) => (
                <button
                  key={template.type}
                  onClick={() => handleAddBlock(template.type)}
                  className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left font-medium text-blue-900 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-bold mb-3">Blocs de la page</h3>
            <div className="space-y-2">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`p-3 rounded-lg border-2 cursor-move ${
                    selectedBlockId === block.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBlockId(block.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 font-medium text-sm">
                      {BLOCK_TEMPLATES.find(t => t.type === block.type)?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(index);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(index);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      disabled={index === blocks.length - 1}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBlocks(duplicateBlock(blocks, block.id));
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBlocks(removeBlock(blocks, block.id));
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Éditeur de boutique</h1>
            {isPublished && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                <Check className="w-4 h-4" />
                Publié
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Éditer' : 'Aperçu'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Publier
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {previewMode ? (
            <div className="bg-white">
              {blocks.map((block) => (
                <BlockRenderer key={block.id} block={block} shopSlug={shopSlug} />
              ))}
            </div>
          ) : (
            <div className="max-w-6xl mx-auto p-8">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className={`mb-4 border-2 rounded-lg overflow-hidden ${
                    selectedBlockId === block.id ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedBlockId(block.id)}
                >
                  <BlockRenderer block={block} shopSlug={shopSlug} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!previewMode && selectedBlock && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Paramètres du bloc
            </h2>
            <button
              onClick={() => setSelectedBlockId(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="p-4">
            <BlockEditor
              block={selectedBlock}
              onUpdate={(updates) => handleUpdateBlock(selectedBlock.id, updates)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function getDefaultContent(type: BlockType): Record<string, any> {
  switch (type) {
    case 'hero':
      return {
        title: 'Titre principal',
        subtitle: 'Sous-titre descriptif',
        buttonText: 'Découvrir',
        buttonLink: '#',
      };
    case 'products-grid':
      return {
        title: 'Nos Produits',
        description: 'Découvrez notre sélection',
        columns: 3,
        showCategory: true,
        showPrice: true,
      };
    case 'features':
      return {
        title: 'Nos avantages',
        features: [
          { icon: 'ShieldCheck', title: 'Sécurisé', description: 'Paiements 100% sécurisés' },
          { icon: 'Truck', title: 'Livraison', description: 'Livraison gratuite' },
          { icon: 'Headphones', title: 'Support', description: 'Support 24/7' },
        ],
      };
    case 'text-content':
      return {
        title: 'Titre de section',
        text: '<p>Votre contenu texte ici...</p>',
        alignment: 'left',
      };
    case 'image':
      return {
        imageUrl: 'https://via.placeholder.com/800x400',
        alt: 'Image',
        caption: '',
      };
    case 'cta':
      return {
        title: 'Prêt à commencer?',
        description: 'Rejoignez-nous dès aujourd\'hui',
        buttonText: 'Commencer',
        buttonLink: '#',
      };
    case 'spacer':
      return {
        height: '40px',
      };
    default:
      return {};
  }
}

function getDefaultStyle(type: BlockType): Record<string, any> {
  switch (type) {
    case 'hero':
      return {
        backgroundColor: '#3B82F6',
        textColor: '#FFFFFF',
        padding: '80px 20px',
      };
    case 'cta':
      return {
        backgroundColor: '#1E40AF',
        textColor: '#FFFFFF',
        padding: '60px 20px',
      };
    case 'features':
      return {
        backgroundColor: '#F9FAFB',
        padding: '60px 20px',
      };
    default:
      return {
        padding: '40px 20px',
      };
  }
}
