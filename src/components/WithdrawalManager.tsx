import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownCircle, AlertCircle, CheckCircle, Clock, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  getMerchantBalance,
  getWithdrawalHistory,
  checkPinStatus,
  createWithdrawal,
  formatCurrency,
  type MerchantBalance,
  type Withdrawal,
} from '../lib/withdrawals';

interface WithdrawalManagerProps {
  merchantId: string;
  onPinSetupRequired: () => void;
}

type WithdrawalStep = 'amount' | 'phone' | 'pin' | 'confirm';

export default function WithdrawalManager({ merchantId, onPinSetupRequired }: WithdrawalManagerProps) {
  const [balance, setBalance] = useState<MerchantBalance | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [hasPinSetup, setHasPinSetup] = useState(false);
  const [currentStep, setCurrentStep] = useState<WithdrawalStep>('amount');

  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [merchantId]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    const [balanceData, historyData, pinStatus] = await Promise.all([
      getMerchantBalance(merchantId),
      getWithdrawalHistory(merchantId),
      checkPinStatus(merchantId),
    ]);

    setBalance(balanceData);
    setWithdrawals(historyData);
    setHasPinSetup(!!pinStatus);
    setLoading(false);
  };

  const handleNextStep = () => {
    setError('');

    if (currentStep === 'amount') {
      if (!amount || parseFloat(amount) <= 0) {
        setError('Veuillez entrer un montant valide');
        return;
      }
      if (balance && parseFloat(amount) > balance.available_balance) {
        setError(`Solde insuffisant. Disponible: ${formatCurrency(balance.available_balance, balance.currency)}`);
        return;
      }
      setCurrentStep('phone');
    } else if (currentStep === 'phone') {
      if (!phoneNumber || phoneNumber.length < 9) {
        setError('Veuillez entrer un numéro de téléphone valide');
        return;
      }
      setCurrentStep('pin');
    } else if (currentStep === 'pin') {
      if (!pin || pin.length !== 4) {
        setError('Veuillez entrer votre code PIN à 4 chiffres');
        return;
      }
      setCurrentStep('confirm');
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (currentStep === 'phone') {
      setCurrentStep('amount');
    } else if (currentStep === 'pin') {
      setCurrentStep('phone');
    } else if (currentStep === 'confirm') {
      setCurrentStep('pin');
    }
  };

  const handleWithdrawal = async () => {
    setError('');

    if (!balance) {
      setError('Informations de solde non disponibles');
      return;
    }

    setProcessing(true);

    const result = await createWithdrawal({
      merchant_id: merchantId,
      amount: parseFloat(amount),
      currency: balance.currency,
      phone_number: phoneNumber,
      pin: pin,
    });

    setProcessing(false);

    if (result.success) {
      setAmount('');
      setPhoneNumber('');
      setPin('');
      setCurrentStep('amount');
      setShowWithdrawalForm(false);
      loadData();
    } else {
      setError(result.error || 'Le retrait a échoué. Veuillez réessayer.');
    }
  };

  const resetForm = () => {
    setAmount('');
    setPhoneNumber('');
    setPin('');
    setError('');
    setCurrentStep('amount');
    setShowWithdrawalForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Available Balance</p>
              <p className="text-3xl font-bold">
                {balance ? formatCurrency(balance.available_balance, balance.currency) : '0'}
              </p>
            </div>
          </div>
          {!hasPinSetup && (
            <button
              onClick={onPinSetupRequired}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors"
            >
              Setup PIN
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <p className="text-blue-100 text-sm">Pending</p>
            <p className="text-xl font-semibold">
              {balance ? formatCurrency(balance.pending_balance, balance.currency) : '0'}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Total Withdrawn</p>
            <p className="text-xl font-semibold">
              {balance ? formatCurrency(balance.total_withdrawn, balance.currency) : '0'}
            </p>
          </div>
        </div>

        {hasPinSetup && (
          <button
            onClick={() => {
              if (showWithdrawalForm) {
                resetForm();
              } else {
                setShowWithdrawalForm(true);
              }
            }}
            className="w-full mt-6 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowDownCircle className="w-5 h-5" />
            {showWithdrawalForm ? 'Annuler le retrait' : 'Retirer des fonds'}
          </button>
        )}
      </div>

      {/* Withdrawal Form - Multi-Step */}
      {showWithdrawalForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Demande de retrait</h3>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-6">
              {['amount', 'phone', 'pin', 'confirm'].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === step
                        ? 'bg-blue-600 text-white'
                        : ['amount', 'phone', 'pin', 'confirm'].indexOf(currentStep) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {['amount', 'phone', 'pin', 'confirm'].indexOf(currentStep) > index ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">
                      {step === 'amount' && 'Montant'}
                      {step === 'phone' && 'Numéro'}
                      {step === 'pin' && 'PIN'}
                      {step === 'confirm' && 'Confirmer'}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      ['amount', 'phone', 'pin', 'confirm'].indexOf(currentStep) > index
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1: Amount */}
            {currentStep === 'amount' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à retirer ({balance?.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Entrer le montant"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">
                  Disponible: {balance ? formatCurrency(balance.available_balance, balance.currency) : '0'}
                </p>
              </div>
            )}

            {/* Step 2: Phone Number */}
            {currentStep === 'phone' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Ex: 671234567"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">
                  Le numéro qui recevra {formatCurrency(parseFloat(amount || '0'), balance?.currency || 'XAF')}
                </p>
              </div>
            )}

            {/* Step 3: PIN */}
            {currentStep === 'pin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code PIN de retrait
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center tracking-widest"
                  placeholder="••••"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">
                  Entrez votre code PIN à 4 chiffres pour sécuriser le retrait
                </p>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 'confirm' && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">Récapitulatif du retrait</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Montant:</span>
                    <span className="font-semibold">{formatCurrency(parseFloat(amount), balance?.currency || 'XAF')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Numéro:</span>
                    <span className="font-semibold">{phoneNumber}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="text-gray-900 font-semibold">Total à recevoir:</span>
                    <span className="text-blue-600 font-bold">{formatCurrency(parseFloat(amount), balance?.currency || 'XAF')}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Veuillez vérifier les informations avant de confirmer
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep !== 'amount' && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour
                </button>
              )}

              {currentStep !== 'confirm' ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleWithdrawal}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Retirer
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Withdrawal History</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {withdrawals.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No withdrawals yet</p>
            </div>
          ) : (
            withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(withdrawal.amount, withdrawal.currency)}
                      </p>
                      <p className="text-sm text-gray-500">{withdrawal.phone_number}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(withdrawal.created_at).toLocaleString()}
                      </p>
                      {withdrawal.fees > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Fees: {formatCurrency(withdrawal.fees, withdrawal.currency)} • Net: {formatCurrency(withdrawal.net_amount, withdrawal.currency)}
                        </p>
                      )}
                      {withdrawal.error_message && (
                        <p className="text-xs text-red-600 mt-1">{withdrawal.error_message}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                    {withdrawal.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
