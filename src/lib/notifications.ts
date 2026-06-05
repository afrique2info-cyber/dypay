import { supabase } from './supabase';

export interface MerchantNotification {
  id: string;
  merchant_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}

export async function getNotifications(merchantId: string): Promise<MerchantNotification[]> {
  const { data, error } = await supabase
    .from('merchant_notifications')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return data || [];
}

export async function getUnreadCount(merchantId: string): Promise<number> {
  const { count, error } = await supabase
    .from('merchant_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchantId)
    .eq('read', false);

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
  return count || 0;
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('merchant_notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
  return true;
}

export async function markAllAsRead(merchantId: string): Promise<boolean> {
  const { error } = await supabase
    .from('merchant_notifications')
    .update({ read: true })
    .eq('merchant_id', merchantId)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
  return true;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('merchant_notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
  return true;
}

export function subscribeToNotifications(
  merchantId: string,
  onNewNotification: (notification: MerchantNotification) => void
) {
  return supabase
    .channel('merchant-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'merchant_notifications',
        filter: `merchant_id=eq.${merchantId}`,
      },
      (payload) => {
        onNewNotification(payload.new as MerchantNotification);
      }
    )
    .subscribe();
}
