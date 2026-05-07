import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Package, Loader2, Download, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';

interface Sale {
  id: string;
  type: 'order' | 'payment' | 'pos';
  amount: number;
  currency: string;
  customer_name?: string;
  customer_email?: string;
  status: string;
  created_at: string;
  items?: any[];
  description?: string;
  shop_name?: string;
}

interface SalesHistoryProps {
  merchantId: string;
  merchantCurrency: string;
}

export function SalesHistory({ merchantId, merchantCurrency }: SalesHistoryProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('7days');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    topProduct: '',
  });

  useEffect(() => {
    loadSalesHistory();
  }, [merchantId, dateFilter, typeFilter]);

  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        now.setDate(now.getDate() - 1);
        now.setHours(23, 59, 59, 999);
        break;
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'year':
        startDate.setDate(now.getDate() - 365);
        break;
    }

    return { startDate: startDate.toISOString(), endDate: now.toISOString() };
  };

  const loadSalesHistory = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const allSales: Sale[] = [];

      if (typeFilter === 'all' || typeFilter === 'order') {
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            currency,
            customer_name,
            customer_email,
            status,
            created_at,
            items,
            shops (name)
          `)
          .eq('merchant_id', merchantId)
          .eq('status', 'completed')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

        if (orders) {
          allSales.push(
            ...orders.map((order: any) => ({
              id: order.id,
              type: 'order' as const,
              amount: order.total_amount,
              currency: order.currency,
              customer_name: order.customer_name,
              customer_email: order.customer_email,
              status: order.status,
              created_at: order.created_at,
              items: order.items,
              shop_name: order.shops?.name,
            }))
          );
        }
      }

      if (typeFilter === 'all' || typeFilter === 'payment') {
        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .eq('merchant_id', merchantId)
          .eq('status', 'completed')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

        if (payments) {
          allSales.push(
            ...payments.map((payment) => ({
              id: payment.id,
              type: 'payment' as const,
              amount: payment.amount,
              currency: payment.currency || merchantCurrency,
              customer_email: payment.email,
              status: payment.status,
              created_at: payment.created_at,
              description: payment.description,
            }))
          );
        }
      }

      if (typeFilter === 'all' || typeFilter === 'pos') {
        const { data: posTransactions } = await supabase
          .from('pos_transactions')
          .select('*')
          .eq('merchant_id', merchantId)
          .eq('status', 'completed')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

        if (posTransactions) {
          allSales.push(
            ...posTransactions.map((tx) => ({
              id: tx.id,
              type: 'pos' as const,
              amount: tx.amount,
              currency: tx.currency || merchantCurrency,
              status: tx.status,
              created_at: tx.created_at,
              description: 'Transaction POS',
            }))
          );
        }
      }

      allSales.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setSales(allSales);

      const totalRevenue = allSales.reduce((sum, sale) => sum + sale.amount, 0);
      const avgOrderValue = allSales.length > 0 ? totalRevenue / allSales.length : 0;

      const productCounts: Record<string, number> = {};
      allSales.forEach((sale) => {
        if (sale.items) {
          sale.items.forEach((item: any) => {
            productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
          });
        }
      });

      const topProduct =
        Object.keys(productCounts).length > 0
          ? Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0][0]
          : 'N/A';

      setStats({
        totalSales: allSales.length,
        totalRevenue,
        avgOrderValue,
        topProduct,
      });
    } catch (error) {
      console.error('Error loading sales history:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Client', 'Montant', 'Devise', 'Statut'];
    const rows = sales.map((sale) => [
      new Date(sale.created_at).toLocaleString('fr-FR'),
      sale.type === 'order' ? 'Commande' : sale.type === 'payment' ? 'Paiement' : 'POS',
      sale.customer_name || sale.customer_email || 'N/A',
      sale.amount.toString(),
      sale.currency,
      sale.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventes-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      order: 'Commande',
      payment: 'Paiement',
      pos: 'POS',
    };
    return labels[type] || type;
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      order: { bg: 'bg-blue-100', text: 'text-blue-800' },
      payment: { bg: 'bg-green-100', text: 'text-green-800' },
      pos: { bg: 'bg-purple-100', text: 'text-purple-800' },
    };
    const badge = badges[type] || badges.order;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {getTypeLabel(type)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historique des ventes</h2>
          <p className="text-gray-600 mt-1">Suivez toutes vos ventes et transactions</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalSales}</div>
          <div className="text-blue-100 text-sm">Ventes totales</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {formatCurrency(stats.totalRevenue, merchantCurrency)}
          </div>
          <div className="text-green-100 text-sm">Revenu total</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {formatCurrency(stats.avgOrderValue, merchantCurrency)}
          </div>
          <div className="text-purple-100 text-sm">Valeur moyenne</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-lg font-bold mb-1 truncate">{stats.topProduct}</div>
          <div className="text-orange-100 text-sm">Produit top</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Aujourd'hui</option>
              <option value="yesterday">Hier</option>
              <option value="7days">7 derniers jours</option>
              <option value="30days">30 derniers jours</option>
              <option value="90days">90 derniers jours</option>
              <option value="year">Cette année</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="order">Commandes</option>
              <option value="payment">Paiements</option>
              <option value="pos">POS</option>
            </select>
          </div>
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune vente</h3>
            <p className="text-gray-600">Aucune vente trouvée pour cette période</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Détails
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(sale.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(sale.type)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{sale.customer_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{sale.customer_email || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {sale.shop_name || sale.description || 'N/A'}
                      </div>
                      {sale.items && (
                        <div className="text-xs text-gray-500">
                          {sale.items.length} article(s)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(sale.amount, sale.currency)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
