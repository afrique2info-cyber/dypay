import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { Home } from './pages/Home';
import { LandingPage } from './pages/LandingPage';
import { About } from './pages/About';
import { Documentation } from './pages/Documentation';
import APIDocumentation from './pages/APIDocumentation';
import { Pricing } from './pages/Pricing';
import { Contact } from './pages/Contact';
import { PaymentLinkPage } from './pages/PaymentLinkPage';
import ShopPublicPage from './pages/ShopPublicPage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import POSPage from './pages/POSPage';
import PaymentSuccess from './pages/PaymentSuccess';
import MyDownloads from './pages/MyDownloads';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/api-documentation" element={<APIDocumentation />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pay/:linkId" element={<PaymentLinkPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/shop/:slug" element={<ShopPublicPage />} />
          <Route path="/shop/:shopSlug/product/:productId" element={<ProductDetail />} />
          <Route path="/shop/:shopSlug/cart" element={<CartPage />} />
          <Route path="/shop/:shopSlug/checkout" element={<CheckoutPage />} />
          <Route path="/shop/:shopSlug/order/:orderNumber" element={<OrderConfirmation />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
          <Route path="/my-downloads" element={<MyDownloads />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
