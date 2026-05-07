import { useState, useEffect } from 'react';
import { Download, Clock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DigitalDownload {
  id: string;
  product_id: string;
  download_count: number;
  last_downloaded_at: string | null;
  expires_at: string | null;
  created_at: string;
  product: {
    id: string;
    name: string;
    description: string;
    image_url: string | null;
    digital_file_type: string;
    download_limit: number | null;
  };
  order: {
    id: string;
    order_number: string;
  };
}

export function DigitalDownloads() {
  const [downloads, setDownloads] = useState<DigitalDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.email) {
        return;
      }

      const { data, error } = await supabase
        .from('digital_downloads')
        .select(`
          *,
          product:products(
            id,
            name,
            description,
            image_url,
            digital_file_type,
            download_limit
          ),
          order:orders(
            id,
            order_number
          )
        `)
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDownloads(data || []);
    } catch (error) {
      console.error('Error loading downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadId: string, productName: string) => {
    try {
      setDownloadingId(downloadId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Vous devez être connecté pour télécharger');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-download-link`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ download_id: downloadId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate download link');
      }

      const data = await response.json();

      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = productName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await loadDownloads();
    } catch (error: any) {
      console.error('Error downloading file:', error);
      alert('Erreur lors du téléchargement: ' + error.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const canDownload = (download: DigitalDownload) => {
    if (isExpired(download.expires_at)) return false;
    if (!download.product.download_limit) return true;
    return download.download_count < download.product.download_limit;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('zip')) return 'Archive ZIP';
    if (mimeType.includes('video')) return 'Vidéo';
    if (mimeType.includes('audio')) return 'Audio';
    if (mimeType.includes('epub')) return 'eBook';
    return 'Fichier';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <Download className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun produit digital
          </h3>
          <p className="text-gray-600">
            Les produits digitaux que vous achetez apparaîtront ici
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mes Produits Digitaux</h2>
        <p className="text-gray-600 mt-1">
          Téléchargez vos formations, ebooks et autres contenus digitaux
        </p>
      </div>

      <div className="grid gap-6">
        {downloads.map((download) => {
          const expired = isExpired(download.expires_at);
          const downloadable = canDownload(download);
          const remainingDownloads = download.product.download_limit
            ? download.product.download_limit - download.download_count
            : null;

          return (
            <div
              key={download.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex gap-6">
                  {download.product.image_url ? (
                    <img
                      src={download.product.image_url}
                      alt={download.product.name}
                      className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Download className="w-12 h-12 text-white" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {download.product.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getFileTypeLabel(download.product.digital_file_type)}
                        </span>
                      </div>
                    </div>

                    {download.product.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {download.product.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Acheté le {formatDate(download.created_at)}
                      </div>
                      {download.last_downloaded_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Dernier téléchargement: {formatDate(download.last_downloaded_at)}
                        </div>
                      )}
                    </div>

                    {remainingDownloads !== null && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600">
                          Téléchargements restants: {remainingDownloads}
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(remainingDownloads / (download.product.download_limit || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {download.expires_at && (
                      <div
                        className={`flex items-center gap-2 text-sm mb-4 ${
                          expired ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {expired
                          ? `Expiré le ${formatDate(download.expires_at)}`
                          : `Accès jusqu'au ${formatDate(download.expires_at)}`}
                      </div>
                    )}

                    <button
                      onClick={() => handleDownload(download.id, download.product.name)}
                      disabled={!downloadable || downloadingId === download.id}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                        downloadable
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {downloadingId === download.id ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Téléchargement...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          {expired
                            ? 'Accès expiré'
                            : !downloadable
                            ? 'Limite atteinte'
                            : 'Télécharger'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {!expired && !downloadable && remainingDownloads === 0 && (
                <div className="bg-yellow-50 border-t border-yellow-200 px-6 py-3">
                  <p className="text-sm text-yellow-800">
                    Vous avez atteint la limite de téléchargements pour ce produit. Contactez le
                    vendeur si vous avez besoin d'accès supplémentaire.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
