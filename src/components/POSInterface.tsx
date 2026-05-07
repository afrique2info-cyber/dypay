import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Smartphone, CreditCard, Loader, History, LogOut, Menu } from 'lucide-react';
import { MOBILE_MONEY_OPERATORS } from '../lib/monetbil';
import { supabase } from '../lib/supabase';
import { signOut } from '../lib/auth';
import OperatorLogo from './OperatorLogo';
import { calculateTotalWithFees, calculateServiceFee, SERVICE_FEE_PERCENTAGE } from '../lib/service-fees';

interface POSInterfaceProps {
  merchantId: string;
}

type Step = 'operator' | 'amount' | 'phone' | 'processing' | 'success' | 'error';

interface PaymentData {
  operator?: string;
  amount?: string;
  phoneNumber?: string;
}

interface MerchantData {
  pos_currency: string;
  pos_country: string;
  pos_name: string;
  balance: number;
}

export default function POSInterface({ merchantId }: POSInterfaceProps) {
  const [step, setStep] = useState<Step>('operator');
  const [paymentData, setPaymentData] = useState<PaymentData>({});
  const [error, setError] = useState('');
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [availableOperators, setAvailableOperators] = useState(MOBILE_MONEY_OPERATORS);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadMerchantData();
    checkPaymentReturn();
  }, [merchantId]);

  const checkPaymentReturn = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const txId = urlParams.get('tx_id');

    if (paymentStatus === 'success' && txId) {
      window.history.replaceState({}, '', '/pos');

      setStep('processing');

      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data: transaction } = await supabase
        .from('pos_transactions')
        .select('*')
        .eq('id', txId)
        .maybeSingle();

      if (transaction && transaction.status === 'success') {
        setStep('success');
        await loadMerchantData();
        setTimeout(() => {
          resetPayment();
        }, 3000);
      } else {
        setStep('processing');
      }
    }
  };

  const loadMerchantData = async () => {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('pos_currency, pos_country, pos_name, balance')
        .eq('id', merchantId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMerchantData(data);
        const operators = MOBILE_MONEY_OPERATORS.filter(
          op => op.currency === data.pos_currency
        );
        setAvailableOperators(operators);
      }
    } catch (err) {
      console.error('Error loading merchant data:', err);
    }
  };

  const handleOperatorSelect = (operator: string) => {
    setPaymentData({ ...paymentData, operator });
    setStep('amount');
  };

  const handleAmountSubmit = (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Montant invalide');
      return;
    }
    setPaymentData({ ...paymentData, amount });
    setStep('phone');
    setError('');
  };

  const handlePhoneSubmit = async (phone: string) => {
    if (!phone || phone.length < 9) {
      setError('Numéro de téléphone invalide');
      return;
    }

    if (!merchantData) {
      setError('Données du marchand non disponibles');
      return;
    }

    setPaymentData({ ...paymentData, phoneNumber: phone });
    setStep('processing');
    setError('');

    try {
      const currency = merchantData.pos_currency;
      const country = merchantData.pos_country;
      const baseAmount = parseFloat(paymentData.amount!);
      const totalWithFees = calculateTotalWithFees(baseAmount);

      const { data: transaction, error: txError } = await supabase
        .from('pos_transactions')
        .insert({
          merchant_id: merchantId,
          operator: paymentData.operator,
          amount: totalWithFees,
          currency: currency,
          phone_number: phone,
          status: 'pending'
        })
        .select()
        .single();

      if (txError) throw txError;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) throw new Error('Utilisateur non authentifié');

      const returnUrl = `${window.location.origin}/pos?payment_status=success&tx_id=${transaction.id}`;
      const notifyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monetbil-webhook`;

      const paymentPayload = {
        merchant_id: merchantId,
        transaction_id: transaction.id,
        amount: totalWithFees,
        currency: currency,
        phone: phone,
        operator: paymentData.operator,
        country: country,
        email: session.user.email,
        return_url: returnUrl,
        notify_url: notifyUrl,
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dypay-process-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(paymentPayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment API Error:', errorText);
        throw new Error('Erreur lors de la connexion au service de paiement');
      }

      const result = await response.json();

      if (!result.success || !result.payment_url) {
        throw new Error(result.error || 'Erreur lors de la création du paiement');
      }

      window.location.href = result.payment_url;
    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMessage = err.message || 'Erreur lors du paiement';
      setError(`Erreur: ${errorMessage}`);
      setStep('error');
    }
  };

  const resetPayment = () => {
    setPaymentData({});
    setStep('operator');
    setError('');
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const currency = merchantData?.pos_currency || 'XAF';
  const balance = merchantData?.balance || 0;
  const posName = merchantData?.pos_name || 'Point de Vente';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-blue-700 text-white p-4 rounded-t-3xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium">{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              <Smartphone className="w-4 h-4 ml-2" />
              <span className="text-sm">📶</span>
            </div>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-blue-600 rounded-full transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xs opacity-75">{posName}</div>
                <div className="text-xl font-bold">{balance.toLocaleString()} {currency}</div>
              </div>
            </div>
            {step !== 'operator' && (
              <button
                onClick={resetPayment}
                className="p-2 hover:bg-blue-600 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {showMenu && (
            <div className="mt-4 bg-blue-600 rounded-xl p-2 space-y-1">
              <button
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-4 py-2 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-3"
              >
                <History className="w-4 h-4" />
                <span className="text-sm">Historique</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-3 text-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Déconnexion</span>
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-b-3xl shadow-2xl min-h-[500px] flex flex-col">
          {step === 'operator' && (
            <OperatorSelection onSelect={handleOperatorSelect} operators={availableOperators} />
          )}

          {step === 'amount' && (
            <AmountInput
              operator={paymentData.operator!}
              currency={currency}
              onSubmit={handleAmountSubmit}
              onBack={resetPayment}
              error={error}
            />
          )}

          {step === 'phone' && (
            <PhoneInput
              operator={paymentData.operator!}
              amount={paymentData.amount!}
              currency={currency}
              onSubmit={handlePhoneSubmit}
              onBack={() => setStep('amount')}
              error={error}
            />
          )}

          {step === 'processing' && (
            <ProcessingScreen
              operator={paymentData.operator!}
              amount={paymentData.amount!}
              currency={currency}
              phone={paymentData.phoneNumber!}
            />
          )}

          {step === 'success' && (
            <SuccessScreen amount={paymentData.amount!} currency={currency} />
          )}

          {step === 'error' && (
            <ErrorScreen error={error} onRetry={resetPayment} />
          )}
        </div>
      </div>
    </div>
  );
}

function OperatorSelection({ onSelect, operators }: { onSelect: (operator: string) => void; operators: typeof MOBILE_MONEY_OPERATORS }) {
  return (
    <div className="p-6 flex-1">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Opérateurs disponibles</h2>
      <p className="text-gray-600 mb-6 text-sm">Sélectionnez l'opérateur de votre client</p>

      <div className="grid grid-cols-2 gap-4">
        {operators.map((operator) => (
          <button
            key={operator.code}
            onClick={() => onSelect(operator.code)}
            className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <div className="flex flex-col items-center gap-3">
              <OperatorLogo
                operatorCode={operator.code}
                operatorName={operator.name}
                color={operator.color}
                size="md"
              />
              <div className="text-center">
                <div className="font-bold text-gray-900">{operator.name}</div>
                <div className="text-xs text-gray-500">{operator.country}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AmountInput({ operator, currency, onSubmit, onBack, error }: {
  operator: string;
  currency: string;
  onSubmit: (amount: string) => void;
  onBack: () => void;
  error: string;
}) {
  const [amount, setAmount] = useState('');
  const operatorInfo = MOBILE_MONEY_OPERATORS.find(op => op.code === operator);

  const handleNumberClick = (num: string) => {
    if (num === '.' && amount.includes('.')) return;
    setAmount(amount + num);
  };

  const handleBackspace = () => {
    setAmount(amount.slice(0, -1));
  };

  const handleClear = () => {
    setAmount('');
  };

  const numericAmount = parseFloat(amount) || 0;
  const serviceFee = calculateServiceFee(numericAmount);
  const totalWithFees = calculateTotalWithFees(numericAmount);

  return (
    <div className="p-6 flex-1 flex flex-col">
      <button onClick={onBack} className="self-start mb-4 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
          {operatorInfo && (
            <OperatorLogo
              operatorCode={operatorInfo.code}
              operatorName={operatorInfo.name}
              color={operatorInfo.color}
              size="sm"
            />
          )}
          <span className="font-medium text-gray-700">{operatorInfo?.name}</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Montant marchand</h2>
        <div className="text-4xl font-bold text-blue-600 h-16 flex items-center justify-center">
          {amount || '0'} <span className="text-2xl ml-2">{currency}</span>
        </div>

        {numericAmount > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frais de service ({SERVICE_FEE_PERCENTAGE}%):</span>
              <span className="font-medium text-blue-600">+{serviceFee.toLocaleString()} {currency}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1 border-t border-blue-200">
              <span className="text-gray-900">Total client:</span>
              <span className="text-blue-600">{totalWithFees.toLocaleString()} {currency}</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((key) => (
          <button
            key={key}
            onClick={() => {
              if (key === '⌫') handleBackspace();
              else handleNumberClick(key);
            }}
            className="h-16 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-xl text-gray-800 transition-colors active:scale-95"
          >
            {key}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleClear}
          className="py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium text-gray-700 transition-colors"
        >
          Effacer
        </button>
        <button
          onClick={() => onSubmit(amount)}
          disabled={!amount || parseFloat(amount) <= 0}
          className="py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

function PhoneInput({ operator, amount, currency, onSubmit, onBack, error }: {
  operator: string;
  amount: string;
  currency: string;
  onSubmit: (phone: string) => void;
  onBack: () => void;
  error: string;
}) {
  const [phone, setPhone] = useState('');
  const operatorInfo = MOBILE_MONEY_OPERATORS.find(op => op.code === operator);

  const handleNumberClick = (num: string) => {
    if (phone.length < 15) {
      setPhone(phone + num);
    }
  };

  const handleBackspace = () => {
    setPhone(phone.slice(0, -1));
  };

  const handleClear = () => {
    setPhone('');
  };

  const numericAmount = parseFloat(amount);
  const totalWithFees = calculateTotalWithFees(numericAmount);

  return (
    <div className="p-6 flex-1 flex flex-col">
      <button onClick={onBack} className="self-start mb-4 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-2">
          {operatorInfo && (
            <OperatorLogo
              operatorCode={operatorInfo.code}
              operatorName={operatorInfo.name}
              color={operatorInfo.color}
              size="sm"
            />
          )}
          <span className="font-medium text-gray-700">{operatorInfo?.name}</span>
        </div>
        <div className="text-lg font-bold text-blue-600 mb-1">
          Total à payer: {totalWithFees.toLocaleString()} {currency}
        </div>
        <div className="text-xs text-gray-500 mb-4">
          (Montant marchand: {amount} {currency} + Frais: {calculateServiceFee(numericAmount).toLocaleString()} {currency})
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Numéro de téléphone</h2>
        <div className="text-3xl font-bold text-gray-800 h-12 flex items-center justify-center">
          {phone || '+237 _ _ _   _ _ _   _ _ _'}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', '⌫'].map((key) => (
          <button
            key={key}
            onClick={() => {
              if (key === '⌫') handleBackspace();
              else handleNumberClick(key);
            }}
            className="h-16 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-xl text-gray-800 transition-colors active:scale-95"
          >
            {key}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleClear}
          className="py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium text-gray-700 transition-colors"
        >
          Effacer
        </button>
        <button
          onClick={() => onSubmit(phone)}
          disabled={!phone || phone.length < 9}
          className="py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Payer
        </button>
      </div>
    </div>
  );
}

function ProcessingScreen({ operator, amount, currency, phone }: {
  operator: string;
  amount: string;
  currency: string;
  phone: string;
}) {
  const operatorInfo = MOBILE_MONEY_OPERATORS.find(op => op.code === operator);
  const numericAmount = parseFloat(amount);
  const totalWithFees = calculateTotalWithFees(numericAmount);

  return (
    <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 mb-6">
        <Loader className="w-20 h-20 text-blue-600 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement en cours...</h2>
      <p className="text-gray-600 mb-6">Veuillez patienter</p>
      <div className="bg-gray-50 rounded-xl p-4 w-full max-w-sm">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Opérateur:</span>
          <span className="font-medium">{operatorInfo?.name}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Montant marchand:</span>
          <span className="font-medium">{amount} {currency}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Frais de service:</span>
          <span className="font-medium">{calculateServiceFee(numericAmount).toLocaleString()} {currency}</span>
        </div>
        <div className="flex justify-between mb-2 pt-2 border-t border-gray-200">
          <span className="text-gray-900 font-bold">Total:</span>
          <span className="font-bold text-blue-600">{totalWithFees.toLocaleString()} {currency}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Numéro:</span>
          <span className="font-medium">{phone}</span>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ amount, currency }: { amount: string; currency: string }) {
  const numericAmount = parseFloat(amount);
  const totalWithFees = calculateTotalWithFees(numericAmount);

  return (
    <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <Check className="w-12 h-12 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h2>
      <p className="text-gray-600 mb-4">Le paiement a été effectué avec succès</p>
      <div className="bg-green-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Montant marchand:</span>
          <span className="font-medium">{amount} {currency}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Frais de service:</span>
          <span className="font-medium">{calculateServiceFee(numericAmount).toLocaleString()} {currency}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-green-200">
          <span className="text-gray-900 font-bold">Total payé:</span>
          <span className="text-2xl font-bold text-green-600">{totalWithFees.toLocaleString()} {currency}</span>
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">❌</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement échoué</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-white transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
