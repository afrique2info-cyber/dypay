import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Loader2, XCircle, Clock, MapPin, Mail, Phone, Download } from 'lucide-react';
import { getOrderByNumber, type Order } from '../lib/orders';

export default function OrderConfirmation() {
  const { orderNumber, shopSlug } = useParams<{ orderNumber: string; shopSlug?: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasDigitalProducts, setHasDigitalProducts] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      loadOrder();
    }
  }, [orderNumber]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderByNumber(orderNumber!);
      setOrder(data);

      const hasDigital = data.items.some((item: any) =>
        item.product_type === 'digital'
      );
      setHasDigitalProducts(hasDigital);
    } catch (error: any) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Commande introuvable</h1>
          <p className="text-gray-600 mb-8">
            Nous n'avons pas trouvé cette commande. Vérifiez le numéro de commande.
          </p>
          <Link
            to={shopSlug ? `/shop/${shopSlug}` : '/'}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      title: 'En attente de paiement',
      message: 'Votre commande est en attente de paiement',
    },
    paid: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      title: 'Paiement confirmé',
      message: 'Votre paiement a été reçu avec succès',
    },
    processing: {
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      title: 'En cours de traitement',
      message: 'Votre commande est en cours de préparation',
    },
    shipped: {
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      title: 'Expédiée',
      message: 'Votre commande a été expédiée',
    },
    delivered: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      title: 'Livrée',
      message: 'Votre commande a été livrée',
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      title: 'Annulée',
      message: 'Votre commande a été annulée',
    },
  };

  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${config.bg} rounded-2xl p-8 mb-8 text-center`}>
          <StatusIcon className={`w-20 h-20 ${config.color} mx-auto mb-4`} />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{config.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{config.message}</p>
          <div className="inline-block bg-white px-6 py-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Numéro de commande</p>
            <p className="text-2xl font-bold text-gray-900">{order.order_number}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Adresse de livraison
            </h3>
            <div className="space-y-2 text-gray-600">
              <p className="font-semibold text-gray-900">{order.customer_name}</p>
              {order.shipping_address?.address && <p>{order.shipping_address.address}</p>}
              {order.shipping_address?.city && (
                <p>
                  {order.shipping_address.city}, {order.shipping_address.country}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Informations de contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-gray-600">{order.customer_email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="text-gray-600">{order.customer_phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Articles commandés</h3>
          <div className="space-y-4">
            {order.items.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{item.product_name}</h4>
                    {item.product_type === 'digital' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Download className="w-3 h-3" />
                        Digital
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {(item.price * item.quantity).toLocaleString()} {order.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span className="font-semibold">
                {order.subtotal.toLocaleString()} {order.currency}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span className="font-semibold">
                {order.shipping_cost > 0
                  ? `${order.shipping_cost.toLocaleString()} ${order.currency}`
                  : 'Gratuite'}
              </span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Taxes</span>
                <span className="font-semibold">
                  {order.tax.toLocaleString()} {order.currency}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>
                {order.total.toLocaleString()} {order.currency}
              </span>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Notes</h3>
            <p className="text-gray-600">{order.notes}</p>
          </div>
        )}

        {hasDigitalProducts && order.status === 'completed' && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm mb-8 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Download className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Produits digitaux disponibles
                </h3>
                <p className="text-gray-700 mb-4">
                  Votre commande contient des produits digitaux. Vous pouvez maintenant télécharger vos fichiers.
                </p>
                <Link
                  to="/my-downloads"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Download className="w-5 h-5" />
                  Accéder à mes téléchargements
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-4">
          <Link
            to={shopSlug ? `/shop/${shopSlug}` : '/'}
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            Continuer mes achats
          </Link>
          <p className="text-gray-600">
            Un email de confirmation a été envoyé à{' '}
            <span className="font-semibold">{order.customer_email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
