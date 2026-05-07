import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface QRCodePaymentProps {
  amount: number;
  currency: string;
  paymentRef: string;
  onPaymentComplete?: () => void;
}

export function QRCodePayment({ amount, currency, paymentRef }: QRCodePaymentProps) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'pending' | 'completed' | 'expired'>('pending');
  const [timeRemaining, setTimeRemaining] = useState(600);

  const paymentUrl = `${window.location.origin}/pay/${paymentRef}`;
  const qrData = JSON.stringify({
    amount,
    currency,
    paymentRef,
    url: paymentUrl,
    timestamp: Date.now()
  });

  useEffect(() => {
    if (timeRemaining <= 0) {
      setStatus('expired');
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <QrCode className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement par QR Code</h2>
        <p className="text-gray-600">Scannez le code pour effectuer le paiement</p>
      </div>

      {status === 'pending' && (
        <>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <QRCodeSVG
                  value={qrData}
                  size={220}
                  level="H"
                  includeMargin
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {amount.toLocaleString()} <span className="text-xl">{currency}</span>
              </p>
              <p className="text-sm text-gray-600">Montant à payer</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Loader2 className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">En attente du paiement</p>
              <p className="text-xs text-yellow-700 mt-1">
                Code expire dans: <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Lien de paiement</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={paymentUrl}
                  readOnly
                  className="flex-1 text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded border-0 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
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

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Référence: <span className="font-mono">{paymentRef}</span>
              </p>
            </div>
          </div>
        </>
      )}

      {status === 'completed' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi!</h3>
          <p className="text-gray-600">Votre transaction a été effectuée avec succès</p>
        </div>
      )}

      {status === 'expired' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">QR Code expiré</h3>
          <p className="text-gray-600 mb-6">Veuillez générer un nouveau code de paiement</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Générer un nouveau code
          </button>
        </div>
      )}
    </div>
  );
}
