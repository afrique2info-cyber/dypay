import { useState, useEffect } from 'react';
import { Settings, Loader2, ShieldCheck, Webhook, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MerchantSettingsProps {
  merchantId: string;
}

interface MerchantInfo {
  business_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  website: string;
}

export function MerchantSettings({ merchantId }: MerchantSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [merchantInfo, setMerchantInfo] = useState<MerchantInfo | null>(null);

  useEffect(() => {
    loadSettings();
  }, [merchantId]);

  const loadSettings = async () => {
    try {
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('business_name, email, phone, country, city, website')
        .eq('id', merchantId)
        .single();

      if (merchantData) {
        setMerchantInfo(merchantData);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">Paramètres du compte</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Paiements simplifiés avec Dypay</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Dypay gère l'intégration complète des paiements pour vous. Aucune configuration externe requise.
                Commencez à accepter des paiements immédiatement via Mobile Money dans toute l'Afrique.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-green-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Infrastructure de paiement entièrement gérée</span>
              </div>
            </div>
          </div>
        </div>

        {merchantInfo && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informations du compte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nom de l'entreprise</label>
                <p className="text-gray-900 mt-1">{merchantInfo.business_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900 mt-1">{merchantInfo.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Téléphone</label>
                <p className="text-gray-900 mt-1">{merchantInfo.phone || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Pays</label>
                <p className="text-gray-900 mt-1">{merchantInfo.country || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Ville</label>
                <p className="text-gray-900 mt-1">{merchantInfo.city || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Site web</label>
                <p className="text-gray-900 mt-1">{merchantInfo.website || 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Opérateurs supportés</h4>
                <p className="text-gray-600 text-sm">
                  MTN Mobile Money, Orange Money, Airtel Money, Moov Money et plus dans 9 pays africains
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <Webhook className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Webhooks</h4>
                <p className="text-gray-600 text-sm">
                  Recevez des notifications en temps réel pour toutes vos transactions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Support</h4>
          <p className="text-yellow-800 text-sm">
            Pour toute question ou assistance, contactez notre équipe support à support@dypay.com
          </p>
        </div>
      </div>
    </div>
  );
}
