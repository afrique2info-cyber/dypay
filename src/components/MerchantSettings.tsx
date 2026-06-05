import { useState, useEffect } from 'react';
import { Settings, Loader2, ShieldCheck, Webhook, CreditCard, Bell, MessageSquare, Phone, Save, CheckCircle } from 'lucide-react';
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
  const [notificationPhone, setNotificationPhone] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notificationSaved, setNotificationSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [merchantId]);

  const loadSettings = async () => {
    try {
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('business_name, email, phone, country, city, website, notification_phone, sms_notifications_enabled, whatsapp_notifications_enabled')
        .eq('id', merchantId)
        .single();

      if (merchantData) {
        setMerchantInfo(merchantData);
        setNotificationPhone(merchantData.notification_phone || merchantData.phone || '');
        setSmsEnabled(merchantData.sms_notifications_enabled || false);
        setWhatsappEnabled(merchantData.whatsapp_notifications_enabled || false);
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

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-5">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Notifications par SMS et WhatsApp</h3>
          </div>
          <p className="text-sm text-gray-600 mb-5">
            Recevez une notification par SMS ou WhatsApp a chaque fois qu'un paiement est confirme ou echoue.
          </p>

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 text-gray-500" />
                Numero de telephone pour les notifications
              </label>
              <input
                type="tel"
                value={notificationPhone}
                onChange={(e) => setNotificationPhone(e.target.value)}
                placeholder="+237 6XX XXX XXX"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">Entrez votre numero au format international (ex: +237612345678)</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={smsEnabled}
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full transition-colors peer-checked:bg-indigo-600"></div>
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Notifications par SMS</span>
                </div>
              </label>
              <p className="text-xs text-gray-500 ml-14">
                Recevez un SMS a chaque paiement confirme ou echoue. Service Twilio requis.
              </p>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-300 rounded-full transition-colors peer-checked:bg-green-500"></div>
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.503 3.935 1.393 5.613L0 24l6.613-1.345A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82c-1.928 0-3.79-.508-5.426-1.47l-.389-.232-3.774.769.797-3.637-.253-.403A9.784 9.784 0 012.18 12c0-5.422 4.398-9.82 9.82-9.82 5.422 0 9.82 4.398 9.82 9.82 0 5.422-4.398 9.82-9.82 9.82z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Notifications par WhatsApp</span>
                </div>
              </label>
              <p className="text-xs text-gray-500 ml-14">
                Recevez un message WhatsApp a chaque paiement confirme ou echoue. WhatsApp Business API requis.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={async () => {
                  setSavingNotifications(true);
                  setNotificationSaved(false);
                  try {
                    const { error } = await supabase
                      .from('merchants')
                      .update({
                        notification_phone: notificationPhone || null,
                        sms_notifications_enabled: smsEnabled,
                        whatsapp_notifications_enabled: whatsappEnabled,
                      })
                      .eq('id', merchantId);

                    if (error) throw error;
                    setNotificationSaved(true);
                    setTimeout(() => setNotificationSaved(false), 3000);
                  } catch (err) {
                    console.error('Error saving notification settings:', err);
                  } finally {
                    setSavingNotifications(false);
                  }
                }}
                disabled={savingNotifications}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savingNotifications ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : notificationSaved ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {savingNotifications ? 'Enregistrement...' : notificationSaved ? 'Enregistre !' : 'Enregistrer les preferences'}
              </button>
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
