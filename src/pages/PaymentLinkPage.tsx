import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CreditCard, AlertCircle, Loader2, ShieldCheck, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import { initiateDypayPayment } from '../lib/monetbil';
import { calculateTotalWithFees, calculateServiceFee, SERVICE_FEE_PERCENTAGE } from '../lib/service-fees';

interface PaymentLinkData {
  id: string;
  link_id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  is_active: boolean;
  merchant_id: string;
  merchant?: {
    business_name: string;
    logo_url: string;
  };
}

export function PaymentLinkPage() {
  const { linkId } = useParams<{ linkId: string }>();
  const [paymentLink, setPaymentLink] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'form' | 'qr'>('form');
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchPaymentLink();
  }, [linkId]);

  const fetchPaymentLink = async () => {
    try {
      if (!linkId) {
        throw new Error('Lien de paiement invalide');
      }

      const { data, error: fetchError } = await supabase
        .from('payment_links')
        .select(`
          *,
          merchant:merchants(business_name, logo_url)
        `)
        .eq('link_id', linkId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        throw new Error('Lien de paiement introuvable');
      }

      if (!data.is_active) {
        throw new Error('Ce lien de paiement n\'est plus actif');
      }

      setPaymentLink(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentLink) return;

    setError('');
    setPaying(true);

    try {
      const dypayServiceKey = import.meta.env.VITE_MONETBIL_SERVICE_KEY;

      if (!dypayServiceKey) {
        throw new Error('Service de paiement Dypay non disponible');
      }

      const paymentRef = `${paymentLink.link_id}-${Date.now()}`;
      const totalWithFees = calculateTotalWithFees(paymentLink.amount);

      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          merchant_id: paymentLink.merchant_id,
          payment_ref: paymentRef,
          amount: totalWithFees,
          currency: paymentLink.currency,
          status: 'pending',
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          item_ref: paymentLink.link_id,
          metadata: {
            payment_link_id: paymentLink.id,
            payment_link_title: paymentLink.title,
            description: paymentLink.title,
            base_amount: paymentLink.amount,
            service_fee: calculateServiceFee(paymentLink.amount)
          }
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      const paymentResult = await initiateDypayPayment({
        amount: totalWithFees,
        currency: paymentLink.currency,
        item_ref: paymentRef,
        payment_ref: paymentData.id,
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        return_url: `${window.location.origin}/payment/success?ref=${paymentRef}`,
        notify_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monetbil-webhook`,
        logo: '',
        serviceKey: dypayServiceKey
      });

      if (paymentResult.payment_url) {
        window.location.href = paymentResult.payment_url;
      } else {
        throw new Error('URL de paiement introuvable');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'initiation du paiement');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !paymentLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!paymentLink) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {paymentLink.merchant?.logo_url && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
              <img
                src={paymentLink.merchant.logo_url}
                alt={paymentLink.merchant.business_name}
                className="h-16 mx-auto object-contain"
              />
            </div>
          )}

          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {paymentLink.title}
              </h1>
              {paymentLink.description && (
                <p className="text-gray-600">{paymentLink.description}</p>
              )}
              {paymentLink.merchant?.business_name && (
                <p className="text-sm text-gray-500 mt-2">
                  par {paymentLink.merchant.business_name}
                </p>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">Montant du produit/service</p>
                <p className="text-3xl font-bold text-gray-900">
                  {paymentLink.amount.toLocaleString()} <span className="text-xl">{paymentLink.currency}</span>
                </p>
              </div>
              <div className="border-t border-blue-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frais de service ({SERVICE_FEE_PERCENTAGE}%):</span>
                  <span className="font-medium">+{calculateServiceFee(paymentLink.amount).toLocaleString()} {paymentLink.currency}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total à payer:</span>
                  <span className="text-blue-600">{calculateTotalWithFees(paymentLink.amount).toLocaleString()} {paymentLink.currency}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('form')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                  paymentMethod === 'form'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Formulaire
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('qr')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                  paymentMethod === 'qr'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <QrCode className="w-5 h-5" />
                QR Code
              </button>
            </div>

            {paymentMethod === 'qr' ? (
              <div className="text-center py-8">
                <div className="bg-white inline-block p-6 rounded-2xl shadow-xl mb-6">
                  <QRCodeSVG
                    value={`${window.location.href}`}
                    size={240}
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="text-gray-600 mb-2">Scannez ce QR code pour payer</p>
                <p className="text-sm text-gray-500">
                  Utilisez votre application mobile money pour scanner et payer
                </p>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="+237XXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={paying}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Payer maintenant
                  </>
                )}
              </button>
            </form>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Paiement sécurisé via Dypay</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Propulsé par <span className="font-semibold text-blue-600">Dypay</span></p>
        </div>
      </div>
    </div>
  );
}
