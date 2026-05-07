import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { createDypayPayment, DYPAY_OPERATORS, COUNTRY_CODES } from '../lib/monetbil';
import { supabase } from '../lib/supabase';

export function PaymentForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    phone: '',
    country: 'CAMEROON',
    operator: 'CM_MTNMOBILEMONEY',
    currency: 'XAF',
    firstName: '',
    lastName: '',
    email: '',
    itemRef: '',
  });

  const handleCountryChange = (country: string) => {
    const operators = DYPAY_OPERATORS[country as keyof typeof DYPAY_OPERATORS];
    const firstOperator = operators[0];
    setFormData({
      ...formData,
      country,
      operator: firstOperator.code,
      currency: firstOperator.currency,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paymentRef = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data: paymentRecord, error: dbError } = await supabase
        .from('payments')
        .insert({
          payment_ref: paymentRef,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          phone: formData.phone || null,
          operator: formData.operator,
          country: COUNTRY_CODES[formData.country as keyof typeof COUNTRY_CODES],
          first_name: formData.firstName || null,
          last_name: formData.lastName || null,
          email: formData.email || null,
          item_ref: formData.itemRef || null,
          status: 'pending',
        })
        .select()
        .single();

      if (dbError) {
        throw new Error('Failed to create payment record');
      }

      const result = await createDypayPayment({
        amount: parseFloat(formData.amount),
        phone: formData.phone || undefined,
        operator: formData.operator,
        country: COUNTRY_CODES[formData.country as keyof typeof COUNTRY_CODES],
        currency: formData.currency,
        payment_ref: paymentRef,
        item_ref: formData.itemRef || undefined,
        first_name: formData.firstName || undefined,
        last_name: formData.lastName || undefined,
        email: formData.email || undefined,
        locale: 'fr',
        logo: '',
      });

      if (result.success && result.payment_url) {
        await supabase
          .from('payments')
          .update({ payment_url: result.payment_url })
          .eq('id', paymentRecord.id);

        window.open(result.payment_url, '_blank');
      } else {
        throw new Error(result.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = formData.country as keyof typeof DYPAY_OPERATORS;
  const operators = DYPAY_OPERATORS[selectedCountry];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paiement Mobile</h2>
          <p className="text-gray-600">Payez avec Mobile Money</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays *
            </label>
            <select
              value={formData.country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            >
              {Object.keys(DYPAY_OPERATORS).map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opérateur Mobile *
            </label>
            <select
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            >
              {operators.map((op) => (
                <option key={op.code} value={op.code}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant * ({formData.currency})
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="1000"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="+237XXXXXXXXX"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="exemple@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Référence article
          </label>
          <input
            type="text"
            value={formData.itemRef}
            onChange={(e) => setFormData({ ...formData, itemRef: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="PROD-123"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Traitement...
            </>
          ) : (
            'Procéder au paiement'
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Vous serez redirigé vers la page de paiement sécurisée Dypay.
          Tous les opérateurs mobiles supportés par votre pays sont acceptés.
        </p>
      </div>
    </div>
  );
}
