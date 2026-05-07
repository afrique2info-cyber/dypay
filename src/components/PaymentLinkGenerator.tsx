import { useState, useEffect } from 'react';
import { Link2, Copy, Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PaymentLinkGeneratorProps {
  merchantId: string;
  onLinkCreated?: () => void;
}

export function PaymentLinkGenerator({ merchantId, onLinkCreated }: PaymentLinkGeneratorProps) {
  const [defaultCurrency, setDefaultCurrency] = useState('XAF');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    currency: 'XAF',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMerchantCurrency();
  }, [merchantId]);

  const loadMerchantCurrency = async () => {
    try {
      const { data } = await supabase
        .from('merchants')
        .select('default_currency')
        .eq('id', merchantId)
        .maybeSingle();

      if (data?.default_currency) {
        setDefaultCurrency(data.default_currency);
        setFormData(prev => ({ ...prev, currency: data.default_currency }));
      }
    } catch (err) {
      console.error('Error loading merchant currency:', err);
    }
  };

  const currencies = [
    { code: 'XAF', name: 'Franc CFA (Cameroun)' },
    { code: 'XOF', name: 'Franc CFA (Sénégal, Côte d\'Ivoire)' },
    { code: 'CDF', name: 'Franc Congolais' },
    { code: 'UGX', name: 'Shilling Ougandais' },
    { code: 'LRD', name: 'Dollar Libérien' },
    { code: 'GNF', name: 'Franc Guinéen' }
  ];

  const generateLinkId = () => {
    return `DYP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.title || !formData.amount) {
        throw new Error('Le titre et le montant sont requis');
      }

      const amount = parseFloat(formData.amount);
      if (amount <= 0) {
        throw new Error('Le montant doit être supérieur à 0');
      }

      const linkId = generateLinkId();

      const { error: insertError } = await supabase
        .from('payment_links')
        .insert({
          merchant_id: merchantId,
          link_id: linkId,
          amount,
          currency: formData.currency,
          title: formData.title,
          description: formData.description
        });

      if (insertError) throw insertError;

      const fullLink = `${window.location.origin}/pay/${linkId}`;
      setGeneratedLink(fullLink);

      setFormData({
        title: '',
        amount: '',
        currency: defaultCurrency,
        description: ''
      });

      if (onLinkCreated) {
        onLinkCreated();
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du lien');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateAnother = () => {
    setGeneratedLink(null);
    setCopied(false);
  };

  if (generatedLink) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Link2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Lien de paiement créé!
          </h3>
          <p className="text-gray-600 mb-6">
            Partagez ce lien avec vos clients pour recevoir des paiements
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Votre lien de paiement:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                {copied ? (
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

          <button
            onClick={handleCreateAnother}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Créer un autre lien
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link2 className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Créer un lien de paiement
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre du paiement *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Achat de produit, Service de consultation"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="5000"
              min="1"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Devise *
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnelle)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ajoutez des détails sur ce paiement..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <Link2 className="w-5 h-5" />
              Générer le lien de paiement
            </>
          )}
        </button>
      </form>
    </div>
  );
}
