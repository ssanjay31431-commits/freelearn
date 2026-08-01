import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { AIFloatingChatbot } from './components/common/AIFloatingChatbot';

import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CustomQuotePage } from './pages/CustomQuotePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ClientDashboardPage } from './pages/ClientDashboardPage';

const PageWrapper = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="animate-page-smooth">
      {children}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
              <Navbar />
              
              <main className="flex-1">
                <PageWrapper>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/services/:slug" element={<ServiceDetailPage />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/track" element={<OrderTrackingPage />} />
                    <Route path="/quote" element={<CustomQuotePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/dashboard" element={<ClientDashboardPage />} />
                  </Routes>
                </PageWrapper>
              </main>

              <Footer />
              <FloatingWhatsApp />
              <AIFloatingChatbot />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
