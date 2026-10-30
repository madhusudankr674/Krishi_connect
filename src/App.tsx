import React, { useState, useEffect, useRef } from 'react';
import { ProductListing, UserProfile, Notification } from './types';
import { api } from './services/api';
import { LanguageCode } from './translations';
import { Header } from './components/Header';
import { MarketplaceView } from './components/MarketplaceView';
import { DirectoryView } from './components/DirectoryView';
import { AgriculturalMapView } from './components/AgriculturalMapView';
import { MarketInsightsView } from './components/MarketInsightsView';
import { OrdersView } from './components/OrdersView';
import { AuthModal } from './components/AuthModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AddProduceModal } from './components/AddProduceModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ChatModal } from './components/ChatModal';
import { Footer } from './components/Footer';
import { KisanAIChatbot } from './components/KisanAIChatbot';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('krishi_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [language, setLanguage] = useState<LanguageCode>(() => {
    return (currentUser?.preferredLanguage as LanguageCode) || 'en';
  });

  const [activeTab, setActiveTab] = useState<string>('marketplace');
  const [products, setProducts] = useState<ProductListing[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductListing | null>(null);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAddProduceOpen, setIsAddProduceOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Chat Modal State
  const [chatReceiver, setChatReceiver] = useState<{ id: string; name: string; productId?: string; productName?: string } | null>(null);

  // State sync ref to avoid unnecessary re-renders
  const lastStateRef = useRef<string>('');

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    try {
      const data = await api.getNotifications(currentUser.id);
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  // Sync notifications on user change
  useEffect(() => {
    fetchNotifications();
    if (currentUser) {
      localStorage.setItem('krishi_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('krishi_current_user');
    }
  }, [currentUser]);

  // Multi-device real-time sync polling (every 2.5s)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const state = await api.getState();
        const stateSignature = `${state.productsCount}-${state.bidsCount}-${state.ordersCount}-${state.usersCount}-${state.notificationsCount}`;
        if (stateSignature !== lastStateRef.current) {
          lastStateRef.current = stateSignature;
          await fetchProducts();
          await fetchUsers();
          if (currentUser) {
            await fetchNotifications();
          }
        }
      } catch (err) {
        // network silent retry
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [currentUser?.id]);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.preferredLanguage) {
      setLanguage(user.preferredLanguage as LanguageCode);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setNotifications([]);
  };

  const handleSwitchRole = () => {
    if (!currentUser) return;
    const nextRole = currentUser.activeRole === 'seller' ? 'buyer' : 'seller';
    const updated = { ...currentUser, activeRole: nextRole as any };
    setCurrentUser(updated);
  };

  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    await api.markAllNotificationsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleOpenChat = (receiverId: string, receiverName: string, productId?: string, productName?: string) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    setChatReceiver({ id: receiverId, name: receiverName, productId, productName });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF5] text-stone-900 font-sans">
      
      {/* 1. Header (Adhering to Top Bar Contract) */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenAddProduce={() => setIsAddProduceOpen(true)}
        onOpenAddUser={() => setIsAddUserOpen(true)}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
      />

      {/* 2. Main Content Views */}
      <main className="flex-1">
        {activeTab === 'marketplace' && (
          <MarketplaceView
            products={products}
            currentUser={currentUser}
            language={language}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onOpenAddProduce={() => {
              if (!currentUser) handleOpenAuth('login');
              else setIsAddProduceOpen(true);
            }}
            onOpenAddUser={() => setIsAddUserOpen(true)}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryView
            currentUser={currentUser}
            onSwitchUser={(user) => {
              setCurrentUser(user);
              if (user.preferredLanguage) setLanguage(user.preferredLanguage as LanguageCode);
            }}
            isAddUserModalOpen={isAddUserOpen}
            setIsAddUserModalOpen={setIsAddUserOpen}
          />
        )}

        {activeTab === 'map' && (
          <AgriculturalMapView
            products={products}
            users={users}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {activeTab === 'insights' && (
          <MarketInsightsView />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Global Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLoginSuccess}
        initialMode={authMode}
      />

      <ProductDetailModal
        product={selectedProduct}
        currentUser={currentUser}
        onClose={() => setSelectedProduct(null)}
        onProductUpdated={(updated) => {
          setSelectedProduct(updated);
          fetchProducts();
        }}
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenChat={handleOpenChat}
      />

      <AddProduceModal
        isOpen={isAddProduceOpen}
        currentUser={currentUser}
        onClose={() => setIsAddProduceOpen(false)}
        onProductCreated={async (newProd) => {
          await fetchProducts();
          setSelectedProduct(newProd);
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onSelectEntity={(type, id) => {
          setIsNotificationsOpen(false);
          if (type === 'product') {
            const p = products.find((x) => x.id === id);
            if (p) setSelectedProduct(p);
          } else if (type === 'order') {
            setActiveTab('orders');
          }
        }}
      />

      {chatReceiver && (
        <ChatModal
          isOpen={Boolean(chatReceiver)}
          onClose={() => setChatReceiver(null)}
          currentUser={currentUser}
          receiverId={chatReceiver.id}
          receiverName={chatReceiver.name}
          productId={chatReceiver.productId}
          productName={chatReceiver.productName}
        />
      )}

      {/* 5. Gemini-Powered Kisan AI Advisor with Google Maps Grounding */}
      <KisanAIChatbot />
    </div>
  );
}
