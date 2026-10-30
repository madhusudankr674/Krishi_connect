export type UserRole = 'seller' | 'buyer' | 'both' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  roles: UserRole[];
  activeRole: 'seller' | 'buyer' | 'admin';
  state: string;
  district: string;
  villageOrTown: string;
  preferredLanguage: 'en' | 'hi' | 'kn' | 'te' | 'ta';
  latitude: number;
  longitude: number;
  verified: boolean;
  businessName?: string;
  avatarUrl?: string;
  farmSizeAcres?: number;
  commoditiesHandled?: string[];
  createdAt: string;
}

export type CropCategory = 
  | 'Vegetables' 
  | 'Fruits' 
  | 'Grains & Cereals' 
  | 'Pulses' 
  | 'Spices' 
  | 'Oilseeds' 
  | 'Commercial Crops';

export type QualityGrade = 
  | 'Grade A (Export / Premium)' 
  | 'Grade B (Standard Mandi)' 
  | 'Grade C (Processing)';

export type ListingStatus = 'AVAILABLE' | 'PARTIALLY_RESERVED' | 'SOLD_OUT' | 'PAUSED';

export interface ProductListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerLocation: {
    state: string;
    district: string;
    village: string;
    lat: number;
    lng: number;
  };
  name: string;
  category: CropCategory;
  description: string;
  imageUrl: string;
  images?: string[];
  variety: string;
  qualityGrade: QualityGrade;
  askingPrice: number;
  priceUnit: 'per kg' | 'per quintal' | 'per tonne' | 'per crate';
  availableQuantity: number;
  reservedQuantity: number;
  originalQuantity: number;
  quantityUnit: 'kg' | 'quintals' | 'tonnes' | 'crates';
  minOrderQuantity: number;
  harvestDate: string;
  availableFrom: string;
  deliveryOptions: 'Pickup only' | 'Seller delivery available' | 'Shared transport' | 'Negotiable';
  organic: boolean;
  status: ListingStatus;
  bidsCount: number;
  highestBidPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  productId: string;
  productName: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerLocation: string;
  buyerPhone: string;
  offeredPrice: number;
  priceUnit: string;
  requestedQuantity: number;
  quantityUnit: string;
  totalAmount: number;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
}

export type OrderStatus = 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY_FOR_PICKUP' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
  buyerId: string;
  buyerName: string;
  buyerLocation: string;
  agreedUnitPrice: number;
  priceUnit: string;
  quantity: number;
  quantityUnit: string;
  totalAmount: number;
  deliveryMethod: string;
  deliveryAddress: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'BID_RECEIVED' | 'BID_ACCEPTED' | 'BID_REJECTED' | 'ORDER_UPDATE' | 'NEW_MESSAGE';
  relatedEntityType: 'product' | 'bid' | 'order' | 'message';
  relatedEntityId: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  productId?: string;
  productName?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  createdAt: string;
}

export interface MarketPriceRecord {
  id: string;
  cropName: string;
  market: string;
  district: string;
  state: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}
