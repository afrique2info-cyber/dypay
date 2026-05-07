import { useState, useEffect } from 'react';
import { Link2, Copy, Check, Eye, EyeOff, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PaymentLink {
  id: string;
  link_id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  is_active: boolean;
  payment_count: number;
  total_received: number;
  created_at: string;
}

interface PaymentLinkListProps {
  merchantId: string;
  refreshTrigger?: number;
}

export function PaymentLinkList({ merchantId, refreshTrigger }: PaymentLinkListProps) {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchLinks = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('payment_links')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLinks(data || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des liens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [merchantId, refreshTrigger]);

  const handleCopyLink = async (linkId: string) => {
    const fullLink = `${window.location.origin}/pay/${linkId}`;
    await navigator.clipboard.writeText(fullLink);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (link: PaymentLink) => {
    try {
      const { error: updateError } = await supabase
        .from('payment_links')
        .update({ is_active: !link.is_active })
        .eq('id', link.id);

      if (updateError) throw updateError;
      await fetchLinks();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lien?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('payment_links')
        .delete()
        .eq('id', linkId);

      if (deleteError) throw deleteError;
      await fetchLinks();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun lien de paiement
          </h3>
          <p className="text-gray-600">
            Créez votre premier lien de paiement pour commencer à accepter des paiements
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Mes liens de paiement ({links.length})
        </h2>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {links.map((link) => (
          <div key={link.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {link.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      link.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {link.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                {link.description && (
                  <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="font-medium text-gray-900">
                    {link.amount.toLocaleString()} {link.currency}
                  </span>
                  <span>•</span>
                  <span>{link.payment_count} paiement(s)</span>
                  <span>•</span>
                  <span>Total reçu: {link.total_received.toLocaleString()} {link.currency}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleToggleActive(link)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title={link.is_active ? 'Désactiver' : 'Activer'}
                >
                  {link.is_active ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/pay/${link.link_id}`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => handleCopyLink(link.link_id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  {copiedId === link.link_id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copier
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Créé le {formatDate(link.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
