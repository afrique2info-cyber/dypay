import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import POSInterface from '../components/POSInterface';
import { Loader } from 'lucide-react';

export default function POSPage() {
  const [loading, setLoading] = useState(true);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkPOSAccess();
  }, []);

  const checkPOSAccess = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate('/merchant/auth');
        return;
      }

      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('id, account_type')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (merchantError) throw merchantError;

      if (!merchantData) {
        navigate('/merchant/auth');
        return;
      }

      if (merchantData.account_type !== 'pos') {
        navigate('/merchant/dashboard');
        return;
      }

      setMerchantId(merchantData.id);
    } catch (error) {
      console.error('Error checking POS access:', error);
      navigate('/merchant/auth');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Chargement du POS...</p>
        </div>
      </div>
    );
  }

  if (!merchantId) {
    return null;
  }

  return <POSInterface merchantId={merchantId} />;
}
