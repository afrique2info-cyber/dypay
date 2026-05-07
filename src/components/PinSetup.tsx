import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { setupPin, checkPinStatus } from '../lib/withdrawals';

interface PinSetupProps {
  merchantId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function PinSetup({ merchantId, onSuccess, onCancel }: PinSetupProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasExistingPin, setHasExistingPin] = useState(false);

  useEffect(() => {
    checkExistingPin();
  }, [merchantId]);

  const checkExistingPin = async () => {
    const pinStatus = await checkPinStatus(merchantId);
    setHasExistingPin(!!pinStatus);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must contain only numbers');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (pin === '0000' || pin === '1234' || pin === '1111' || pin === '2222') {
      setError('Please choose a more secure PIN');
      return;
    }

    setLoading(true);

    const result = await setupPin(merchantId, pin);

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setPin('');
      setConfirmPin('');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setError(result.error || 'Failed to setup PIN');
    }
  };

  const handlePinInput = (value: string, setter: (val: string) => void) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setter(numericValue);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {hasExistingPin ? 'Change Withdrawal PIN' : 'Setup Withdrawal PIN'}
              </h2>
              <p className="text-blue-100 text-sm">Secure your withdrawals with a 4-digit PIN</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Security Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Choose a unique 4-digit PIN</li>
                <li>Don't use obvious combinations (1234, 0000)</li>
                <li>Never share your PIN with anyone</li>
                <li>After 5 failed attempts, your account will be locked for 30 minutes</li>
              </ul>
            </div>
          </div>

          {/* PIN Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {hasExistingPin ? 'New PIN' : 'Create PIN'} (4 digits)
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                value={pin}
                onChange={(e) => handlePinInput(e.target.value, setPin)}
                maxLength={4}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {pin.length > 0 && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= pin.length ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirm PIN Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm PIN
            </label>
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => handlePinInput(e.target.value, setConfirmPin)}
              maxLength={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              placeholder="••••"
              disabled={loading}
            />
            {confirmPin.length === 4 && pin === confirmPin && (
              <div className="mt-2 flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">PINs match</span>
              </div>
            )}
            {confirmPin.length === 4 && pin !== confirmPin && (
              <div className="mt-2 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">PINs don't match</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">
                PIN {hasExistingPin ? 'updated' : 'created'} successfully!
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || pin.length !== 4 || pin !== confirmPin}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting up...' : hasExistingPin ? 'Update PIN' : 'Create PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
