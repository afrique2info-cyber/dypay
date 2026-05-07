import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, ArrowLeft, Mail, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  payment_method: string;
  reference?: string;
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get('payment_id');
  const reference = searchParams.get('reference');

  useEffect(() => {
    loadPaymentDetails();
  }, [paymentId, reference]);

  const loadPaymentDetails = async () => {
    try {
      if (paymentId) {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('id', paymentId)
          .maybeSingle();

        if (error) throw error;
        if (data) setPayment(data);
      } else if (reference) {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('reference', reference)
          .maybeSingle();

        if (error) throw error;
        if (data) setPayment(data);
      }
    } catch (error) {
      console.error('Error loading payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    const receiptContent = `
REÇU DE PAIEMENT
================

Transaction ID: ${payment?.id}
Référence: ${payment?.reference || 'N/A'}
Montant: ${payment?.amount} ${payment?.currency}
Status: ${payment?.status}
Date: ${new Date(payment?.created_at || '').toLocaleDateString('fr-FR')}
Méthode: ${payment?.payment_method}

Merci pour votre paiement!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recu-${payment?.reference || payment?.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const sharePayment = () => {
    if (navigator.share && payment) {
      navigator.share({
        title: 'Paiement réussi',
        text: `Paiement de ${payment.amount} ${payment.currency} effectué avec succès`,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Paiement Réussi !</h1>
            <p className="text-green-100">Votre transaction a été effectuée avec succès</p>
          </div>

          {payment ? (
            <div className="p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Montant payé</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {payment.amount.toLocaleString()} {payment.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {payment.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono text-sm text-gray-900">{payment.id.slice(0, 16)}...</span>
                  </div>

                  {payment.reference && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Référence</span>
                      <span className="font-medium text-gray-900">{payment.reference}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Méthode de paiement</span>
                    <span className="font-medium text-gray-900">{payment.payment_method}</span>
                  </div>

                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Date et heure</span>
                    <span className="font-medium text-gray-900">
                      {new Date(payment.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Un email de confirmation vous a été envoyé</h3>
                <p className="text-sm text-gray-600">
                  Vous recevrez un reçu détaillé de cette transaction par email dans quelques instants.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={downloadReceipt}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Télécharger le reçu</span>
                </button>

                <button
                  onClick={sharePayment}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Partager</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>Imprimer</span>
                </button>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour à l'accueil</span>
              </button>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Paiement confirmé</h3>
              <p className="text-gray-600 mb-6">
                Votre paiement a été effectué avec succès. Les détails de la transaction sont en cours de traitement.
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour à l'accueil</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Des questions ? Contactez notre{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              support client
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
