import { useState, useEffect } from 'react';
import { Loader2, ShoppingBag, Users, TrendingUp, Wallet, Eye, Clock, Globe, TrendingDown, Calendar, Info, FileDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { signOut } from '../lib/auth';
import { IntegrationDocs } from './IntegrationDocs';
import { TransactionHistory } from './TransactionHistory';
import { MerchantSettings } from './MerchantSettings';
import { SDKDownloads } from './SDKDownloads';
import { PaymentLinkGenerator } from './PaymentLinkGenerator';
import { PaymentLinkList } from './PaymentLinkList';
import { VirtualCardManager } from './VirtualCardManager';
import { ApiKeys } from './ApiKeys';
import { Sidebar } from './Sidebar';
import ShopManagement from './ShopManagement';
import { ProductManagement } from './ProductManagement';
import { PageBuilderManager } from './PageBuilderManager';
import WithdrawalManager from './WithdrawalManager';
import PinSetup from './PinSetup';
import { WebhookManager } from './WebhookManager';
import { OrdersList } from './OrdersList';
import { SalesHistory } from './SalesHistory';
import { StockManagement } from './StockManagement';
import { getSupportedCurrencies, formatCurrency, type Currency } from '../lib/currency';

interface Merchant {
  id: string;
  business_name: string;
  email: string;
  total_revenue: number;
  total_transactions: number;
  balance: number;
  default_currency: string;
  default_country: string;
  pos_currency?: string;
  pos_country?: string;
  account_type: string;
}

interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalCustomers: number;
  activeCountries: number;
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  totalVisits: number;
}

interface SalesData {
  date: string;
  amount: number;
  count: number;
}

interface ProductStat {
  name: string;
  count: number;
  revenue: number;
}

export function MerchantDashboard() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshLinks, setRefreshLinks] = useState(0);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState('XAF');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    activeCountries: 0,
    conversionRate: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    totalVisits: 0,
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);

  useEffect(() => {
    loadMerchantData();
    loadCurrencies();

    const handleChangeTab = (event: any) => {
      if (event.detail) {
        setActiveTab(event.detail);
      }
    };

    window.addEventListener('changeTab', handleChangeTab);

    return () => {
      window.removeEventListener('changeTab', handleChangeTab);
    };
  }, []);

  useEffect(() => {
    if (merchant) {
      loadDashboardStats();
    }
  }, [merchant, dateFilter]);

  const loadCurrencies = async () => {
    const currenciesList = await getSupportedCurrencies();
    setCurrencies(currenciesList);
  };

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
      case '360days':
        startDate.setDate(now.getDate() - 360);
        break;
    }

    return { startDate: startDate.toISOString(), endDate: now.toISOString() };
  };

  const loadDashboardStats = async () => {
    if (!merchant) return;

    try {
      const { startDate, endDate } = getDateRange();

      const [ordersResult, paymentsResult, posTransactionsResult] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .eq('merchant_id', merchant.id)
          .eq('status', 'completed')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabase
          .from('payments')
          .select('*')
          .eq('merchant_id', merchant.id)
          .eq('status', 'completed')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabase
          .from('pos_transactions')
          .select('*')
          .eq('merchant_id', merchant.id)
          .eq('status', 'completed')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
      ]);

      const allOrders = ordersResult.data || [];
      const allPayments = paymentsResult.data || [];
      const allPosTransactions = posTransactionsResult.data || [];

      const totalSales = allOrders.length + allPayments.length + allPosTransactions.length;
      const totalRevenue =
        allOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0) +
        allPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0) +
        allPosTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

      const uniqueCustomers = new Set([
        ...allOrders.map(order => order.customer_email).filter(Boolean),
        ...allPayments.map(payment => payment.email).filter(Boolean),
      ]);

      const uniqueCountries = new Set([
        ...allOrders.map(order => order.customer_country).filter(Boolean),
        ...allPayments.map(payment => payment.country).filter(Boolean),
      ]);

      setStats({
        totalSales,
        totalRevenue,
        totalCustomers: uniqueCustomers.size,
        activeCountries: uniqueCountries.size,
        conversionRate: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
        totalVisits: 0,
      });

      const dailySales: Record<string, { amount: number; count: number }> = {};
      [...allOrders, ...allPayments, ...allPosTransactions].forEach((transaction) => {
        const date = new Date(transaction.created_at).toLocaleDateString('fr-FR');
        if (!dailySales[date]) {
          dailySales[date] = { amount: 0, count: 0 };
        }
        const amount = transaction.total_amount || transaction.amount || 0;
        dailySales[date].amount += amount;
        dailySales[date].count += 1;
      });

      const salesDataArray: SalesData[] = Object.entries(dailySales)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setSalesData(salesDataArray);

      const productStats: Record<string, ProductStat> = {};
      allOrders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const productName = item.product_name || item.name || 'Produit inconnu';
            if (!productStats[productName]) {
              productStats[productName] = { name: productName, count: 0, revenue: 0 };
            }
            productStats[productName].count += item.quantity || 1;
            productStats[productName].revenue += item.price * (item.quantity || 1);
          });
        }
      });

      const topProductsArray = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      setTopProducts(topProductsArray);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadMerchantData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (merchantData) {
        if (merchantData.account_type === 'pos') {
          window.location.href = '/pos';
          return;
        }
        setMerchant(merchantData);

        const currencyCode = merchantData.default_currency || 'XAF';
        const merchantCurrency = currencies.find(c => c.code === currencyCode);
        if (merchantCurrency) {
          setCurrencySymbol(merchantCurrency.symbol);
        } else {
          setCurrencySymbol(currencyCode);
        }
      }
    } catch (error) {
      console.error('Error loading merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dateFilterOptions = [
    { value: 'today', label: "Aujourd'hui" },
    { value: 'yesterday', label: 'Hier' },
    { value: '7days', label: '7 derniers jours' },
    { value: '30days', label: '30 derniers jours' },
    { value: '360days', label: '360 derniers jours' },
  ];

  const handleSignOut = () => {
    signOut().then(() => window.location.reload());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!merchant) {
    return <div className="text-center text-gray-600">Merchant not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        businessName={merchant.business_name}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 lg:ml-64 ml-0">
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="ml-12 lg:ml-0 flex items-center gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option>Marketplaces</option>
                <option>Digital Products</option>
              </select>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                Visiter la boutique
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {merchant.business_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-gray-900">{merchant.business_name}</p>
                  <p className="text-xs text-gray-500">{merchant.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && (
            <div>
              <div className="mb-6 flex items-center gap-3 flex-wrap">
                {dateFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDateFilter(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      dateFilter === option.value
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  08/10/2025 - 08/10/2025
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Nombre de ventes</span>
                    </div>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalSales}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Revenu total</span>
                    </div>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(stats.totalRevenue, merchant.default_currency, currencySymbol)}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Nombre de clients</span>
                    </div>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalCustomers}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Pays actifs</span>
                    </div>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stats.activeCountries}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Solde disponible</span>
                    </div>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(merchant.balance, merchant.default_currency, currencySymbol)}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">En attente</span>
                    </div>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(0, merchant.default_currency, currencySymbol)}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Taux de réussite</span>
                    </div>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stats.totalSales > 0 ? '100%' : '0%'}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Montant moyen</span>
                    </div>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(
                      stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0,
                      merchant.default_currency,
                      currencySymbol
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Evolution des ventes</h3>
                  <div className="h-64 flex items-center justify-center">
                    {salesData.length > 0 ? (
                      <div className="w-full h-full flex flex-col">
                        <div className="flex-1 flex items-end justify-around gap-2">
                          {salesData.map((data, index) => {
                            const maxAmount = Math.max(...salesData.map(d => d.amount));
                            const height = maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0;
                            return (
                              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500"
                                  style={{ height: `${height}%` }}
                                  title={`${formatCurrency(data.amount, merchant.default_currency, currencySymbol)} - ${data.count} vente(s)`}
                                />
                                <span className="text-xs text-gray-500 text-center">
                                  {data.date.split('/')[0]}/{data.date.split('/')[1]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <p>Aucune donnée de vente disponible</p>
                        <p className="text-sm mt-2">Les données apparaîtront après vos premières ventes</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Top produits par vente</h3>
                  <div className="h-64">
                    {topProducts.length > 0 ? (
                      <div className="space-y-4">
                        {topProducts.map((product, index) => {
                          const maxRevenue = Math.max(...topProducts.map(p => p.revenue));
                          const percentage = maxRevenue > 0 ? (product.revenue / maxRevenue) * 100 : 0;
                          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-900 truncate flex-1">
                                  {product.name}
                                </span>
                                <span className="text-gray-600 ml-2">
                                  {formatCurrency(product.revenue, merchant.default_currency, currencySymbol)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: colors[index % colors.length]
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 w-16 text-right">
                                  {product.count} vente{product.count > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center text-gray-500">
                        <div>
                          <p>Aucune donnée de produit disponible</p>
                          <p className="text-sm mt-2">Les statistiques apparaîtront après des ventes de produits</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shops' && (
            <ShopManagement />
          )}

          {activeTab === 'products' && (
            <ProductManagement />
          )}

          {activeTab === 'orders' && merchant && (
            <OrdersList merchantId={merchant.id} />
          )}

          {activeTab === 'sales-history' && merchant && (
            <SalesHistory merchantId={merchant.id} merchantCurrency={merchant.default_currency} />
          )}

          {activeTab === 'stock' && (
            <StockManagement />
          )}

          {activeTab === 'page-builder' && (
            <PageBuilderManager />
          )}

          {activeTab === 'api-keys' && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
              <ApiKeys />
            </div>
          )}

          {activeTab === 'virtual-cards' && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
              <VirtualCardManager />
            </div>
          )}

          {activeTab === 'payment-links' && merchant && (
            <div className="space-y-4 sm:space-y-6">
              <PaymentLinkGenerator
                merchantId={merchant.id}
                onLinkCreated={() => setRefreshLinks(prev => prev + 1)}
              />
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 overflow-x-auto">
                <PaymentLinkList
                  merchantId={merchant.id}
                  refreshTrigger={refreshLinks}
                />
              </div>
            </div>
          )}

          {activeTab === 'transactions' && merchant && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 overflow-x-auto">
              <TransactionHistory merchantId={merchant.id} />
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
              <IntegrationDocs />
            </div>
          )}

          {activeTab === 'sdk' && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
              <SDKDownloads />
            </div>
          )}

          {activeTab === 'settings' && merchant && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
              <MerchantSettings merchantId={merchant.id} />
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
              <WebhookManager />
            </div>
          )}

          {activeTab === 'analytics' && merchant && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytiques Avancées</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-5 border border-blue-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Nombre de ventes</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-900 mb-1">{stats.totalSales}</p>
                    <p className="text-xs text-blue-600">Total des transactions</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-5 border border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Revenu total</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-900 mb-1">
                      {formatCurrency(stats.totalRevenue, merchant.default_currency, currencySymbol)}
                    </p>
                    <p className="text-xs text-green-600">Chiffre d'affaires</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-5 border border-purple-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Clients</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-purple-900 mb-1">{stats.totalCustomers}</p>
                    <p className="text-xs text-purple-600">Clients uniques</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-5 border border-orange-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">Pays actifs</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-orange-900 mb-1">{stats.activeCountries}</p>
                    <p className="text-xs text-orange-600">Marchés couverts</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance des Ventes</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Taux de conversion</span>
                        <span className="text-lg font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.conversionRate}%` }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Taux de rebond</span>
                        <span className="text-lg font-bold text-gray-900">{stats.bounceRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats.bounceRate}%` }}></div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-gray-600">Durée moyenne de session</span>
                        <span className="text-lg font-bold text-gray-900">{Math.floor(stats.avgSessionDuration / 60)}m {stats.avgSessionDuration % 60}s</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Finances</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Solde disponible</span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(merchant.balance, merchant.default_currency, currencySymbol)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Montant moyen</span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatCurrency(stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0, merchant.default_currency, currencySymbol)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Taux de réussite</span>
                        <span className="text-xl font-bold text-green-600">
                          {stats.totalSales > 0 ? '100%' : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exports' && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Exportations</h2>
              <div className="text-center py-12">
                <FileDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Exportation de données</h3>
                <p className="text-gray-600 mb-6">
                  Exportez vos transactions et rapports au format CSV ou Excel
                </p>
                <div className="flex gap-4 justify-center">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Exporter en CSV
                  </button>
                  <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Exporter en Excel
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdrawals' && merchant && (
            showPinSetup ? (
              <PinSetup
                merchantId={merchant.id}
                onSuccess={() => {
                  setShowPinSetup(false);
                }}
                onCancel={() => setShowPinSetup(false)}
              />
            ) : (
              <WithdrawalManager
                merchantId={merchant.id}
                onPinSetupRequired={() => setShowPinSetup(true)}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
