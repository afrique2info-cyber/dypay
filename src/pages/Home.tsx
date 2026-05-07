import { useState, useEffect } from 'react';
import { MerchantAuth } from '../components/MerchantAuth';
import { MerchantDashboard } from '../components/MerchantDashboard';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, currentSession) => {
      setSession(currentSession);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return session ? <MerchantDashboard /> : <MerchantAuth />;
}
