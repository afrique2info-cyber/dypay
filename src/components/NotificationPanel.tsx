import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Filter } from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  type MerchantNotification,
} from '../lib/notifications';

interface NotificationPanelProps {
  merchantId: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHr < 24) return `Il y a ${diffHr}h`;
  if (diffDay < 7) return `Il y a ${diffDay}j`;
  return date.toLocaleDateString('fr-FR');
}

function typeIcon(type: string): string {
  switch (type) {
    case 'payment': return '💳';
    case 'pos_transaction': return '🏪';
    case 'order': return '🛒';
    case 'withdrawal': return '💰';
    default: return '🔔';
  }
}

function typeLabel(type: string): string {
  switch (type) {
    case 'payment': return 'Paiement';
    case 'pos_transaction': return 'POS';
    case 'order': return 'Commande';
    case 'withdrawal': return 'Retrait';
    default: return 'Autre';
  }
}

function typeBg(type: string): string {
  switch (type) {
    case 'payment': return 'bg-emerald-100 text-emerald-700';
    case 'pos_transaction': return 'bg-blue-100 text-blue-700';
    case 'order': return 'bg-amber-100 text-amber-700';
    case 'withdrawal': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export function NotificationPanel({ merchantId }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<MerchantNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'payment' | 'order' | 'pos_transaction'>('all');

  useEffect(() => {
    loadNotifications();
    const subscription = subscribeToNotifications(merchantId, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });
    return () => { subscription.unsubscribe(); };
  }, [merchantId]);

  const loadNotifications = async () => {
    setLoading(true);
    const notifs = await getNotifications(merchantId);
    setNotifications(notifs);
    setLoading(false);
  };

  const handleMarkRead = async (id: string) => {
    const success = await markAsRead(id);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    const success = await markAllAsRead(merchantId);
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteNotification(id);
    if (success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'payment' || filter === 'order' || filter === 'pos_transaction') return n.type === filter;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'unread', label: 'Non lues' },
          { key: 'payment', label: 'Paiements' },
          { key: 'order', label: 'Commandes' },
          { key: 'pos_transaction', label: 'POS' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === f.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell className="w-12 h-12 mb-3" />
            <p className="text-base font-medium">
              {filter === 'all' ? 'Aucune notification' : `Aucune notification ${filter === 'unread' ? 'non lue' : 'de ce type'}`}
            </p>
            <p className="text-sm mt-1">Vous serez notifie quand un paiement est confirme</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((notif) => (
              <div
                key={notif.id}
                className={`px-5 py-4 transition-colors ${
                  !notif.read ? 'bg-indigo-50/40' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{typeIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notif.title}
                          </p>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${typeBg(notif.type)}`}>
                            {typeLabel(notif.type)}
                          </span>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">{notif.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          Marquer comme lu
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
