import { useState, useEffect } from 'react';
import { Key, Copy, Eye, EyeOff, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getMerchantApiKeys, createApiKey, getApiKeySecret, revokeApiKey } from '../lib/api-keys';
import { getCurrentMerchant } from '../lib/auth';

interface ApiKey {
  id: string;
  key_name: string;
  api_key: string;
  is_live: boolean;
  last_used_at: string | null;
  created_at: string;
}

export function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyIsLive, setNewKeyIsLive] = useState(false);
  const [createdKey, setCreatedKey] = useState<{ key: string; secret: string } | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const merchant = await getCurrentMerchant();
      if (!merchant) {
        setError('Merchant not found');
        return;
      }

      const { data, error } = await getMerchantApiKeys(merchant.id);
      if (error) throw error;

      setApiKeys(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a key name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const merchant = await getCurrentMerchant();
      if (!merchant) throw new Error('Merchant not found');

      const { data, error } = await createApiKey(merchant.id, newKeyName, newKeyIsLive);
      if (error) throw error;

      setCreatedKey({
        key: data.api_key,
        secret: data.api_secret,
      });

      setNewKeyName('');
      setNewKeyIsLive(false);
      setShowNewKeyModal(false);
      await loadApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevealSecret = async (keyId: string) => {
    if (revealedSecrets[keyId]) {
      const newRevealed = { ...revealedSecrets };
      delete newRevealed[keyId];
      setRevealedSecrets(newRevealed);
      return;
    }

    try {
      const { data, error } = await getApiKeySecret(keyId);
      if (error) throw error;
      if (!data) throw new Error('No secret found');

      setRevealedSecrets({
        ...revealedSecrets,
        [keyId]: data.api_secret,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reveal secret');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await revokeApiKey(keyId);
      if (error) throw error;

      await loadApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const maskSecret = () => {
    return '•'.repeat(32);
  };

  if (loading && apiKeys.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clés API</h2>
          <p className="text-gray-600 mt-1">
            Gérez vos clés API pour intégrer DyPay dans votre application
          </p>
        </div>
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nouvelle clé
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Erreur</h3>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {createdKey && (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Clé créée avec succès!</h3>
              <p className="text-green-800 text-sm mb-4">
                Copiez votre clé secrète maintenant. Elle ne sera plus affichée.
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-white p-4 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Clé publique</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-gray-800">
                  {createdKey.key}
                </code>
                <button
                  onClick={() => copyToClipboard(createdKey.key, 'new-key')}
                  className="p-2 hover:bg-gray-100 rounded transition"
                >
                  {copiedField === 'new-key' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Clé secrète</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-gray-800">
                  {createdKey.secret}
                </code>
                <button
                  onClick={() => copyToClipboard(createdKey.secret, 'new-secret')}
                  className="p-2 hover:bg-gray-100 rounded transition"
                >
                  {copiedField === 'new-secret' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCreatedKey(null)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            J'ai sauvegardé mes clés
          </button>
        </div>
      )}

      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune clé API</h3>
            <p className="text-gray-600 mb-4">Créez votre première clé API pour commencer</p>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Créer une clé
            </button>
          </div>
        ) : (
          apiKeys.map((key) => (
            <div key={key.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{key.key_name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        key.is_live
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {key.is_live ? 'Production' : 'Test'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Créée le {new Date(key.created_at).toLocaleDateString('fr-FR')}
                    {key.last_used_at && (
                      <> • Dernière utilisation: {new Date(key.last_used_at).toLocaleDateString('fr-FR')}</>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleRevokeKey(key.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Révoquer cette clé"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Clé publique</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-gray-800 truncate">
                      {key.api_key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(key.api_key, `key-${key.id}`)}
                      className="p-2 hover:bg-gray-100 rounded transition"
                      title="Copier"
                    >
                      {copiedField === `key-${key.id}` ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Clé secrète</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-gray-800 truncate">
                      {revealedSecrets[key.id] || maskSecret()}
                    </code>
                    <button
                      onClick={() => handleRevealSecret(key.id)}
                      className="p-2 hover:bg-gray-100 rounded transition"
                      title={revealedSecrets[key.id] ? 'Masquer' : 'Révéler'}
                    >
                      {revealedSecrets[key.id] ? (
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    {revealedSecrets[key.id] && (
                      <button
                        onClick={() => copyToClipboard(revealedSecrets[key.id], `secret-${key.id}`)}
                        className="p-2 hover:bg-gray-100 rounded transition"
                        title="Copier"
                      >
                        {copiedField === `secret-${key.id}` ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Créer une nouvelle clé API</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la clé
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ex: Production API, Test API"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newKeyIsLive}
                    onChange={(e) => setNewKeyIsLive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Clé de production (à utiliser pour les vrais paiements)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewKeyModal(false);
                  setNewKeyName('');
                  setNewKeyIsLive(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateKey}
                disabled={!newKeyName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}