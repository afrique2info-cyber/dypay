import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Search } from 'lucide-react';

interface Transaction {
  id: string;
  payment_ref: string;
  amount: number;
  currency: string;
  status: string;
  customer_phone: string | null;
  customer_email: string | null;
  operator: string | null;
  created_at: string;
  type: 'payment' | 'order' | 'pos';
}

interface TransactionHistoryProps {
  merchantId: string;
}

export function TransactionHistory({ merchantId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'payment' | 'order' | 'pos'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [filter, merchantId]);

  const loadTransactions = async () => {
    try {
      const [paymentsResult, ordersResult, posTransactionsResult] = await Promise.all([
        supabase
          .from('payments')
          .select('id, payment_ref, amount, currency, status, phone, email, operator, created_at')
          .eq('merchant_id', merchantId)
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('id, order_number, total_amount, currency, status, customer_phone, customer_email, created_at')
          .eq('merchant_id', merchantId)
          .order('created_at', { ascending: false }),
        supabase
          .from('pos_transactions')
          .select('id, amount, currency, status, phone_number, operator, created_at')
          .eq('merchant_id', merchantId)
          .order('created_at', { ascending: false })
      ]);

      const payments = (paymentsResult.data || []).map(item => ({
        id: item.id,
        payment_ref: item.payment_ref,
        amount: item.amount,
        currency: item.currency,
        status: item.status,
        customer_phone: item.phone,
        customer_email: item.email,
        operator: item.operator,
        created_at: item.created_at,
        type: 'payment' as const
      }));

      const orders = (ordersResult.data || []).map(item => ({
        id: item.id,
        payment_ref: item.order_number,
        amount: item.total_amount,
        currency: item.currency,
        status: item.status,
        customer_phone: item.customer_phone,
        customer_email: item.customer_email,
        operator: 'Boutique',
        created_at: item.created_at,
        type: 'order' as const
      }));

      const posTransactions = (posTransactionsResult.data || []).map(item => ({
        id: item.id,
        payment_ref: `POS-${item.id.slice(0, 8)}`,
        amount: item.amount,
        currency: item.currency,
        status: item.status,
        customer_phone: item.phone_number,
        customer_email: null,
        operator: item.operator,
        created_at: item.created_at,
        type: 'pos' as const
      }));

      let allTransactions = [...payments, ...orders, ...posTransactions]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (filter !== 'all') {
        allTransactions = allTransactions.filter(tx => tx.status === filter);
      }

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = searchTerm === '' ||
      tx.payment_ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.customer_phone?.includes(searchTerm) ||
      tx.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || tx.type === typeFilter;

    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Historique des transactions</h2>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par référence, téléphone ou email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Statut</p>
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'completed', 'failed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg transition ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'Toutes' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Type de transaction</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Toutes' },
                { value: 'order', label: 'Boutique' },
                { value: 'pos', label: 'POS' },
                { value: 'payment', label: 'Liens de paiement' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setTypeFilter(type.value as any)}
                  className={`px-4 py-2 rounded-lg transition ${
                    typeFilter === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          {searchTerm ? 'Aucune transaction trouvée' : 'Aucune transaction'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr className="text-gray-600 text-left">
                <th className="pb-3 pt-3 px-4 font-semibold">Référence</th>
                <th className="pb-3 pt-3 px-4 font-semibold">Type</th>
                <th className="pb-3 pt-3 px-4 font-semibold">Montant</th>
                <th className="pb-3 pt-3 px-4 font-semibold">Client</th>
                <th className="pb-3 pt-3 px-4 font-semibold">Opérateur</th>
                <th className="pb-3 pt-3 px-4 font-semibold">Statut</th>
                <th className="pb-3 pt-3 px-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={`${tx.type}-${tx.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs">{tx.payment_ref}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.type === 'order' ? 'bg-blue-100 text-blue-800' :
                      tx.type === 'pos' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tx.type === 'order' ? 'Boutique' :
                       tx.type === 'pos' ? 'POS' :
                       'Lien'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold whitespace-nowrap">
                    {tx.amount.toLocaleString()} {tx.currency}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {tx.customer_phone && <div>{tx.customer_phone}</div>}
                      {tx.customer_email && <div className="text-gray-500 text-xs">{tx.customer_email}</div>}
                    </div>
                  </td>
                  <td className="py-3 px-4">{tx.operator || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
