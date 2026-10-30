import { ProductListing, Bid, Order, Notification, Message, UserProfile, MarketPriceRecord } from '../types';

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to log in');
    }
    return res.json() as Promise<{ user: UserProfile; token: string }>;
  },

  async register(data: any) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json() as Promise<{ user: UserProfile; token: string; message: string }>;
  },

  // Users Directory & Direct Onboarding
  async getUsers(role?: string, search?: string) {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.append('role', role);
    if (search) params.append('search', search);
    const res = await fetch(`/api/users?${params.toString()}`);
    return res.json() as Promise<UserProfile[]>;
  },

  async addUser(data: any) {
    const res = await fetch('/api/users/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add user');
    }
    return res.json() as Promise<{ user: UserProfile; message: string }>;
  },

  // Products
  async getProducts(params?: { category?: string; search?: string; state?: string; status?: string; sellerId?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.state) query.append('state', params.state);
    if (params?.status) query.append('status', params.status);
    if (params?.sellerId) query.append('sellerId', params.sellerId);
    const res = await fetch(`/api/products?${query.toString()}`);
    return res.json() as Promise<ProductListing[]>;
  },

  async createProduct(data: Partial<ProductListing>) {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to list product');
    }
    return res.json() as Promise<ProductListing>;
  },

  async updateProduct(id: string, data: Partial<ProductListing>) {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json() as Promise<ProductListing>;
  },

  async addPhotosToProduct(productId: string, photoUrls: string[]) {
    const res = await fetch(`/api/products/${productId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrls }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add photos to product');
    }
    return res.json() as Promise<ProductListing>;
  },

  // Bids
  async getBids(params?: { productId?: string; buyerId?: string; sellerId?: string }) {
    const query = new URLSearchParams();
    if (params?.productId) query.append('productId', params.productId);
    if (params?.buyerId) query.append('buyerId', params.buyerId);
    if (params?.sellerId) query.append('sellerId', params.sellerId);
    const res = await fetch(`/api/bids?${query.toString()}`);
    return res.json() as Promise<Bid[]>;
  },

  async createBid(data: Partial<Bid>) {
    const res = await fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit bid');
    }
    return res.json() as Promise<Bid>;
  },

  async acceptBid(bidId: string) {
    const res = await fetch(`/api/bids/${bidId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to accept bid');
    }
    return res.json() as Promise<{ message: string; order: Order; updatedProduct: ProductListing; updatedBid: Bid }>;
  },

  async rejectBid(bidId: string) {
    const res = await fetch(`/api/bids/${bidId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reject bid');
    }
    return res.json() as Promise<{ message: string; bid: Bid }>;
  },

  // Orders
  async getOrders(params?: { buyerId?: string; sellerId?: string }) {
    const query = new URLSearchParams();
    if (params?.buyerId) query.append('buyerId', params.buyerId);
    if (params?.sellerId) query.append('sellerId', params.sellerId);
    const res = await fetch(`/api/orders?${query.toString()}`);
    return res.json() as Promise<Order[]>;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json() as Promise<Order>;
  },

  // Messages
  async getMessages(params?: { userId?: string; conversationId?: string }) {
    const query = new URLSearchParams();
    if (params?.userId) query.append('userId', params.userId);
    if (params?.conversationId) query.append('conversationId', params.conversationId);
    const res = await fetch(`/api/messages?${query.toString()}`);
    return res.json() as Promise<Message[]>;
  },

  async sendMessage(data: Partial<Message>) {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json() as Promise<Message>;
  },

  // Notifications
  async getNotifications(userId: string) {
    const res = await fetch(`/api/notifications?userId=${userId}`);
    return res.json() as Promise<Notification[]>;
  },

  async markNotificationRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
  },

  async markAllNotificationsRead(userId: string) {
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  },

  // Market Insights
  async getMarketInsights() {
    const res = await fetch('/api/market-insights');
    return res.json() as Promise<MarketPriceRecord[]>;
  },

  // Real-time State Poll
  async getState() {
    const res = await fetch('/api/state');
    return res.json() as Promise<{
      timestamp: string;
      usersCount: number;
      productsCount: number;
      bidsCount: number;
      ordersCount: number;
      notificationsCount: number;
      messagesCount: number;
    }>;
  },

  // Gemini Agricultural Advisor with Google Maps Grounding
  async askGeminiAdvisor(messages: { role: 'user' | 'model'; text: string }[], userLocation?: { lat: number; lng: number }) {
    const res = await fetch('/api/gemini/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, userLocation }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to query Krishi AI Advisor');
    }
    return res.json() as Promise<{
      text: string;
      mapsSources: { title: string; uri: string }[];
    }>;
  },
};
