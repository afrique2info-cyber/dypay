import {
  LayoutDashboard,
  History,
  Book,
  Settings,
  Key,
  Download,
  LogOut,
  Store,
  Package,
  Palette,
  Menu,
  X,
  BarChart3,
  CreditCard,
  DollarSign,
  FileDown,
  Link as LinkIcon,
  Webhook,
  ShoppingBag,
  TrendingUp,
  Bell
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  businessName: string;
  onSignOut: () => void;
}

export function Sidebar({ activeTab, onTabChange, businessName, onSignOut }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Tableau de bord' },
    { id: 'shops', icon: Store, label: 'Boutiques' },
    { id: 'products', icon: Package, label: 'Produits' },
    { id: 'stock', icon: Package, label: 'Gestion du stock' },
    { id: 'orders', icon: ShoppingBag, label: 'Commandes' },
    { id: 'sales-history', icon: TrendingUp, label: 'Historique ventes' },
    { id: 'transactions', icon: History, label: 'Transactions' },
    { id: 'payment-links', icon: LinkIcon, label: 'Liens de paiement' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'page-builder', icon: Palette, label: 'Personnalisation' },
    { id: 'virtual-cards', icon: CreditCard, label: 'Cartes virtuelles' },
    { id: 'withdrawals', icon: DollarSign, label: 'Retraits' },
    { id: 'analytics', icon: BarChart3, label: 'Analytiques' },
    { id: 'exports', icon: FileDown, label: 'Exportations' },
  ];

  const bottomItems = [
    { id: 'api-keys', icon: Key, label: 'Clés API' },
    { id: 'webhooks', icon: Webhook, label: 'Webhooks' },
    { id: 'docs', icon: Book, label: 'Documentation' },
    { id: 'sdk', icon: Download, label: 'SDKs' },
    { id: 'settings', icon: Settings, label: 'Paramètres' }
  ];

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-indigo-600 text-white shadow-2xl z-50 transform transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-indigo-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <Store className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Dypay</h1>
              <p className="text-xs text-indigo-200 truncate max-w-[140px]">{businessName}</p>
            </div>
          </div>
        </div>

        <nav className="py-4 px-3 flex-1 overflow-y-auto h-[calc(100vh-240px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-lg font-semibold'
                    : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}

          <div className="mt-6 pt-4 border-t border-indigo-500">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-lg font-semibold'
                      : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-indigo-500">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-500 hover:text-white transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
}
