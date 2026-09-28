import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import ProductDetail from './pages/ProductDetail';
import ProductList from './pages/ProductList';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import CategoryPage from './pages/CategoryPage';
import AdminLayout from './components/AdminLayout';
import OrderSummary from './pages/OrderSummary';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';
import BlogDetail from './pages/BlogDetail';

// Every page change (footer links, header links, anything) opens at the top.
// Only the pathname is watched, so switching subcategory tabs (#hash) doesn't jump.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

// Component to handle routes + header/footer visibility
const App = () => {
  const location = useLocation();

  // List of admin routes where Header/Footer should be hidden
  const adminRoutes = [
    '/admin-dashboard',
    '/admin-products',
    '/admin-categories',
    '/admin-subcategories',
  ];

  // Check if current path starts with any admin route
  const isAdminRoute = adminRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="App">
      <ScrollToTop />

      {!isAdminRoute && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/product/edit/:slug" element={<ProductDetail />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/fire-safety/:categorySlug" element={<ProductList />} />
        <Route path="/ict/:categorySlug" element={<ProductList />} />

        {/* SolarRouteWrapper removed: all categories use CategoryPage */}
        <Route path="/category/:slug" element={<CategoryPage />} />

        <Route path="/search" element={<ProductList />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>

      {!isAdminRoute && <Footer />}

      {/* Floating WhatsApp Button - appears on all pages */}
      <FloatingWhatsAppButton />
    </div>
  );
};

export default App;