import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  type MerchantNotification,
} from '../lib/notifications';
import { formatCurrency } from '../lib/currency';

interface NotificationBellProps {
  merchantId: string;
  merchantCurrency?: string;
  currencySymbol?: string;
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

function typeColor(type: string): string {
  switch (type) {
    case 'payment': return 'bg-emerald-50 border-emerald-200';
    case 'pos_transaction': return 'bg-blue-50 border-blue-200';
    case 'order': return 'bg-amber-50 border-amber-200';
    case 'withdrawal': return 'bg-green-50 border-green-200';
    default: return 'bg-gray-50 border-gray-200';
  }
}

export function NotificationBell({ merchantId, merchantCurrency = 'XAF', currencySymbol = 'XAF' }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<MerchantNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUnreadCount();
    const subscription = subscribeToNotifications(merchantId, (newNotif) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [newNotif, ...prev]);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [merchantId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnreadCount = async () => {
    const count = await getUnreadCount(merchantId);
    setUnreadCount(count);
  };

  const loadNotifications = async () => {
    setLoading(true);
    const notifs = await getNotifications(merchantId);
    setNotifications(notifs);
    setLoading(false);
  };

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkRead = async (id: string) => {
    const success = await markAsRead(id);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const success = await markAllAsRead(merchantId);
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteNotification(id);
    if (success) {
      const notif = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notif && !notif.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-indigo-600' : 'text-gray-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 hover:text-indigo-600"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Bell className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium">Aucune notification</p>
                <p className="text-xs mt-1">Vous serez notifie quand un paiement est confirme</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 transition-colors ${
                      !notif.read ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon(notif.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-gray-400">{timeAgo(notif.created_at)}</span>
                          <div className="flex items-center gap-1">
                            {!notif.read && (
                              <button
                                onClick={() => handleMarkRead(notif.id)}
                                className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-400 hover:text-green-600"
                                title="Marquer comme lu"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notif.id)}
                              className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-400 hover:text-red-600"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
