import { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2, Eye, EyeOff, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCurrentMerchant } from '../lib/auth';

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  last_triggered_at: string | null;
  last_response_status: number | null;
  created_at: string;
}

const AVAILABLE_EVENTS = [
  { value: 'payment.completed', label: 'Paiement complété' },
  { value: 'payment.failed', label: 'Paiement échoué' },
  { value: 'order.completed', label: 'Commande complétée' },
  { value: 'order.cancelled', label: 'Commande annulée' },
  { value: 'pos.transaction.completed', label: 'Transaction POS complétée' },
  { value: 'withdrawal.completed', label: 'Retrait complété' },
];

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    url: '',
    events: [] as string[],
  });

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const merchant = await getCurrentMerchant();
      if (!merchant) return;

      const { data, error } = await supabase
        .from('merchant_webhooks')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Error loading webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const merchant = await getCurrentMerchant();
      if (!merchant) return;

      const { error } = await supabase
        .from('merchant_webhooks')
        .insert({
          merchant_id: merchant.id,
          url: formData.url,
          events: formData.events,
        });

      if (error) throw error;

      await loadWebhooks();
      setFormData({ url: '', events: [] });
      setShowForm(false);
    } catch (error: any) {
      console.error('Error creating webhook:', error);
      alert('Erreur lors de la création du webhook');
    }
  };

  const handleToggleActive = async (webhookId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('merchant_webhooks')
        .update({ is_active: !currentStatus })
        .eq('id', webhookId);

      if (error) throw error;
      await loadWebhooks();
    } catch (error) {
      console.error('Error updating webhook:', error);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce webhook ?')) return;

    try {
      const { error } = await supabase
        .from('merchant_webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;
      await loadWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  const copyToClipboard = (text: string, webhookId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSecret(webhookId);
    setTimeout(() => setCopiedSecret(null), 2000);
  };

  const toggleEventSelection = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Webhooks</h2>
          <p className="text-gray-600 mt-1">Recevez des notifications en temps réel pour vos transactions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter un Webhook
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveau Webhook</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL du webhook *
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://votre-site.com/webhook"
              />
              <p className="text-xs text-gray-500 mt-1">
                L'URL doit commencer par http:// ou https://
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Événements à surveiller *
              </label>
              <div className="space-y-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
                {AVAILABLE_EVENTS.map(event => (
                  <label key={event.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.events.includes(event.value)}
                      onChange={() => toggleEventSelection(event.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{event.label}</span>
                  </label>
                ))}
              </div>
              {formData.events.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Vous devez sélectionner au moins un événement
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={formData.events.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer le webhook
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ url: '', events: [] });
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Comment fonctionnent les webhooks ?</p>
            <p>
              Dypay enverra une requête POST à votre URL avec les détails de la transaction à chaque événement.
              Utilisez le secret pour vérifier que les requêtes proviennent bien de Dypay.
            </p>
          </div>
        </div>
      </div>

      {webhooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Webhook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun webhook configuré</h3>
          <p className="text-gray-600 mb-6">
            Configurez un webhook pour recevoir des notifications en temps réel
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded">
                      {webhook.url}
                    </code>
                    <button
                      onClick={() => handleToggleActive(webhook.id, webhook.is_active)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        webhook.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {webhook.is_active ? 'Actif' : 'Inactif'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events.map(event => (
                      <span
                        key={event}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                      >
                        {AVAILABLE_EVENTS.find(e => e.value === event)?.label || event}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {webhook.last_triggered_at && (
                      <span>
                        Dernier appel: {new Date(webhook.last_triggered_at).toLocaleString('fr-FR')}
                      </span>
                    )}
                    {webhook.last_response_status && (
                      <span
                        className={
                          webhook.last_response_status >= 200 && webhook.last_response_status < 300
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        Statut: {webhook.last_response_status}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(webhook.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Secret (pour vérifier les requêtes)
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                    {showSecret[webhook.id] ? webhook.secret : '•'.repeat(64)}
                  </code>
                  <button
                    onClick={() => setShowSecret(prev => ({ ...prev, [webhook.id]: !prev[webhook.id] }))}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showSecret[webhook.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(webhook.secret, webhook.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {copiedSecret === webhook.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
