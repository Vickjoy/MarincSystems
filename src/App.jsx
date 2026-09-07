import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
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
import SolarRouteWrapper from './components/SolarRouteWrapper';

// Component to handle routes + header/footer visibility
const App = () => {
  const location = useLocation();

  // List of admin routes where Header/Footer should be hidden
  const adminRoutes = [
    '/admin-dashboard',
    '/admin-products',
    '/admin-categories',
    '/admin-subcategories'
  ];

  // Check if current path starts with any admin route
  const isAdminRoute = adminRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="App">
      {!isAdminRoute && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
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
        
        {/* Use SolarRouteWrapper for all category routes */}
        <Route path="/category/:slug" element={<SolarRouteWrapper />} />
        
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