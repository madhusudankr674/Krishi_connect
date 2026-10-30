import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Persistent database path
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'krishi_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const getInitialData = () => {
  return {
    users: [
      {
        id: 'usr_seller_1',
        email: 'ramesh@krishiconnect.in',
        password: 'password123',
        fullName: 'Ramesh Gowda',
        phone: '+91 98450 12345',
        roles: ['seller'],
        activeRole: 'seller',
        state: 'Karnataka',
        district: 'Mysuru',
        villageOrTown: 'Hunsur Taluk',
        preferredLanguage: 'kn',
        latitude: 12.2958,
        longitude: 76.6394,
        verified: true,
        businessName: 'Gowda Organic Farms',
        farmSizeAcres: 14,
        commoditiesHandled: ['Tomatoes', 'Bananas', 'Green Chillies'],
        createdAt: '2026-10-15T08:00:00Z',
      },
      {
        id: 'usr_seller_2',
        email: 'gurpreet@krishiconnect.in',
        password: 'password123',
        fullName: 'Gurpreet Singh',
        phone: '+91 98140 54321',
        roles: ['seller'],
        activeRole: 'seller',
        state: 'Punjab',
        district: 'Ludhiana',
        villageOrTown: 'Samrala',
        preferredLanguage: 'hi',
        latitude: 30.9010,
        longitude: 75.8573,
        verified: true,
        businessName: 'Kisan Golden Harvest',
        farmSizeAcres: 35,
        commoditiesHandled: ['Basmati Rice', 'Sharbati Wheat', 'Mustard'],
        createdAt: '2026-10-18T09:30:00Z',
      },
      {
        id: 'usr_buyer_1',
        email: 'greenbazaar@trade.in',
        password: 'password123',
        fullName: 'Vikram Mehta',
        phone: '+91 97312 88990',
        roles: ['buyer'],
        activeRole: 'buyer',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        villageOrTown: 'Yeshwanthpur APMC Yard',
        preferredLanguage: 'en',
        latitude: 13.0280,
        longitude: 77.5408,
        verified: true,
        businessName: 'GreenBazaar Fresh Supermarkets',
        commoditiesHandled: ['Tomatoes', 'Onions', 'Potatoes', 'Exotic Veg'],
        createdAt: '2026-10-19T10:15:00Z',
      },
      {
        id: 'usr_buyer_2',
        email: 'freshdirect@agrocorp.in',
        password: 'password123',
        fullName: 'Sanjay Deshmukh',
        phone: '+91 99201 44556',
        roles: ['buyer'],
        activeRole: 'buyer',
        state: 'Maharashtra',
        district: 'Mumbai',
        villageOrTown: 'Vashi Wholesale APMC',
        preferredLanguage: 'en',
        latitude: 19.0760,
        longitude: 72.8777,
        verified: true,
        businessName: 'FreshDirect Interstate Agro Trade',
        commoditiesHandled: ['Red Onions', 'Basmati Rice', 'Bananas'],
        createdAt: '2026-10-20T11:45:00Z',
      },
      {
        id: 'usr_both_1',
        email: 'anita@krishifarm.in',
        password: 'password123',
        fullName: 'Anita Sharma',
        phone: '+91 98220 77112',
        roles: ['seller', 'buyer'],
        activeRole: 'seller',
        state: 'Maharashtra',
        district: 'Pune',
        villageOrTown: 'Baramati',
        preferredLanguage: 'hi',
        latitude: 18.1519,
        longitude: 74.5770,
        verified: true,
        businessName: 'Sahyadri Agro Producer Co.',
        farmSizeAcres: 20,
        commoditiesHandled: ['Red Onions', 'Pomegranates', 'Grapes'],
        createdAt: '2026-10-22T14:20:00Z',
      },
    ],
    products: [
      {
        id: 'prod_tomatoes_1',
        sellerId: 'usr_seller_1',
        sellerName: 'Ramesh Gowda',
        sellerPhone: '+91 98450 12345',
        sellerLocation: {
          state: 'Karnataka',
          district: 'Mysuru',
          village: 'Hunsur Taluk',
          lat: 12.2958,
          lng: 76.6394,
        },
        name: 'Fresh Farm Tomatoes (Desi Hybrid)',
        category: 'Vegetables',
        description: 'Naturally ripened, firm red tomatoes freshly harvested from fertile black soil. Excellent shelf life of 8-10 days, ideal for retail grocery chains and mandi traders.',
        imageUrl: '/src/assets/images/crop_fresh_tomatoes_1793372793953.jpg',
        images: [
          '/src/assets/images/crop_fresh_tomatoes_1793372793953.jpg',
          '/src/assets/images/crop_green_chillies_1793374728585.jpg',
          '/src/assets/images/crop_red_onions_1793372793295.jpg',
        ],
        variety: 'Abhinav Semi-Determinate Hybrid',
        qualityGrade: 'Grade A (Export / Premium)',
        askingPrice: 26,
        priceUnit: 'per kg',
        availableQuantity: 1200,
        reservedQuantity: 0,
        originalQuantity: 1200,
        quantityUnit: 'kg',
        minOrderQuantity: 100,
        harvestDate: '2026-10-28',
        availableFrom: 'Ready for Immediate Dispatch',
        deliveryOptions: 'Seller delivery available',
        organic: true,
        status: 'AVAILABLE',
        bidsCount: 2,
        highestBidPrice: 25.5,
        createdAt: '2026-10-28T06:00:00Z',
        updatedAt: '2026-10-28T06:00:00Z',
      },
      {
        id: 'prod_onions_1',
        sellerId: 'usr_both_1',
        sellerName: 'Anita Sharma',
        sellerPhone: '+91 98220 77112',
        sellerLocation: {
          state: 'Maharashtra',
          district: 'Pune',
          village: 'Baramati',
          lat: 18.1519,
          lng: 74.5770,
        },
        name: 'Nashik Red Onions (Premium Storage)',
        category: 'Vegetables',
        description: 'Sun-cured medium to large sized red onions with intact dry outer skin. Low moisture content, strictly graded for transport stability and long storage life.',
        imageUrl: '/src/assets/images/crop_red_onions_1793372793295.jpg',
        images: [
          '/src/assets/images/crop_red_onions_1793372793295.jpg',
          '/src/assets/images/crop_fresh_potatoes_1793374728226.jpg',
        ],
        variety: 'Fursungi Red',
        qualityGrade: 'Grade A (Export / Premium)',
        askingPrice: 32,
        priceUnit: 'per kg',
        availableQuantity: 2500,
        reservedQuantity: 0,
        originalQuantity: 2500,
        quantityUnit: 'kg',
        minOrderQuantity: 250,
        harvestDate: '2026-10-25',
        availableFrom: 'Ready for Immediate Dispatch',
        deliveryOptions: 'Shared transport',
        organic: false,
        status: 'AVAILABLE',
        bidsCount: 1,
        highestBidPrice: 31,
        createdAt: '2026-10-27T08:30:00Z',
        updatedAt: '2026-10-27T08:30:00Z',
      },
      {
        id: 'prod_potatoes_1',
        sellerId: 'usr_1793373199457_d3ib',
        sellerName: 'Shivaji Deshmukh',
        sellerPhone: '+91 98000 11223',
        sellerLocation: {
          state: 'Maharashtra',
          district: 'Nashik',
          village: 'Niphad Mandi',
          lat: 20.088,
          lng: 74.108,
        },
        name: 'Table Grade Kufri Jyoti Potatoes',
        category: 'Vegetables',
        description: 'Unblemished, firm oval Kufri Jyoti potatoes harvested from sandy loam soil. Excellent dry matter for chips and food service. Cleaned and graded into 50kg aerated gunny bags.',
        imageUrl: '/src/assets/images/crop_fresh_potatoes_1793374728226.jpg',
        images: [
          '/src/assets/images/crop_fresh_potatoes_1793374728226.jpg',
          '/src/assets/images/crop_red_onions_1793372793295.jpg',
        ],
        variety: 'Kufri Jyoti Table Grade',
        qualityGrade: 'Grade A (Export / Premium)',
        askingPrice: 22,
        priceUnit: 'per kg',
        availableQuantity: 3500,
        reservedQuantity: 0,
        originalQuantity: 3500,
        quantityUnit: 'kg',
        minOrderQuantity: 300,
        harvestDate: '2026-10-27',
        availableFrom: 'Ready for Immediate Dispatch',
        deliveryOptions: 'Seller delivery available',
        organic: false,
        status: 'AVAILABLE',
        bidsCount: 0,
        createdAt: '2026-10-28T09:00:00Z',
        updatedAt: '2026-10-28T09:00:00Z',
      },
      {
        id: 'prod_chillies_1',
        sellerId: 'usr_seller_1',
        sellerName: 'Ramesh Gowda',
        sellerPhone: '+91 98450 12345',
        sellerLocation: {
          state: 'Karnataka',
          district: 'Mysuru',
          village: 'Hunsur Taluk',
          lat: 12.2958,
          lng: 76.6394,
        },
        name: 'Dark Green Pungent G4 Chillies',
        category: 'Vegetables',
        description: 'Crisp, spicy G4 hybrid green chillies harvested in early morning hours. Uniform 8-10 cm length, high capsaicin pungency, packed in 10kg breathable crates.',
        imageUrl: '/src/assets/images/crop_green_chillies_1793374728585.jpg',
        images: [
          '/src/assets/images/crop_green_chillies_1793374728585.jpg',
          '/src/assets/images/crop_fresh_tomatoes_1793372793953.jpg',
        ],
        variety: 'G4 Hybrid Pungent',
        qualityGrade: 'Grade A (Export / Premium)',
        askingPrice: 48,
        priceUnit: 'per kg',
        availableQuantity: 750,
        reservedQuantity: 0,
        originalQuantity: 750,
        quantityUnit: 'kg',
        minOrderQuantity: 50,
        harvestDate: '2026-10-30',
        availableFrom: 'Ready for Immediate Dispatch',
        deliveryOptions: 'Shared transport',
        organic: true,
        status: 'AVAILABLE',
        bidsCount: 0,
        createdAt: '2026-10-30T04:30:00Z',
        updatedAt: '2026-10-30T04:30:00Z',
      },
      {
        id: 'prod_bananas_1',
        sellerId: 'usr_seller_1',
        sellerName: 'Ramesh Gowda',
        sellerPhone: '+91 98450 12345',
        sellerLocation: {
          state: 'Karnataka',
          district: 'Mandya',
          village: 'Maddur Belt',
          lat: 12.5844,
          lng: 77.0427,
        },
        name: 'Grand Naine Cavendish Bananas',
        category: 'Fruits',
        description: 'Grade-A uniform banana bunches harvested at 80% maturity for optimal transit and natural ripening. Packed in aerated corrugated crates.',
        imageUrl: '/src/assets/images/crop_bananas_plantation_1793372793275.jpg',
        images: [
          '/src/assets/images/crop_bananas_plantation_1793372793275.jpg',
          '/src/assets/images/crop_alphonso_mangoes_1793374729040.jpg',
        ],
        variety: 'Grand Naine (G9)',
        qualityGrade: 'Grade A (Export / Premium)',
        askingPrice: 38,
        priceUnit: 'per kg',
        availableQuantity: 800,
        reservedQuantity: 0,
        originalQuantity: 800,
        quantityUnit: 'kg',
        minOrderQuantity: 150,
        harvestDate: '2026-10-29',
        availableFrom: 'Ready for Immediate Dispatch',
        deliveryOptions: 'Pickup only',
        organic: true,
        status: 'AVAILABLE',
        bidsCount: 0,
        createdAt: '2026-10-29T05:00:00Z',
        updatedAt: '2026-10-29T05:00:00Z',
      },
      {
        id: 'prod_mangoes_1',
        sellerId: 'usr_both_1',
        sellerName: 'Anita Sharma',
        sellerPhone: '+91 98220 77112',
        sellerLocation: {
          state: 'Maharashtra',
          district: 'Ratnagiri',
          village: 'Deogad Belt',
          lat: 16.376,
          lng: 73.376,
        },
        name: 'GI-Tagged Ratnagiri Alphonso Mangoes',
        category: 'Fruits',
        description: 'Direct orchard picked Alphonso mangoes with authentic GI tag verification. Naturally ripened with paddy grass, fiberless saffron pulp, exquisite sweetness.',
        imageUrl: '/src/assets/images/crop_alphonso_mangoes_1793374729040.jpg',
        images: [
          '/src/assets/images/crop_alphonso_mangoes_1793374729040.jpg',
          '/src/assets/images/crop_bananas_plantation_1793372793275.jpg',
        ],
        variety: 'Ratnagiri Alphonso (Hapus)',
        qualityGrade: 'Grade A (Export / Premium)',
        askingPrice: 850,
        priceUnit: 'per crate',
        availableQuantity: 220,
        reservedQuantity: 0,
        originalQuantity: 220,
        quantityUnit: 'crates',
        minOrderQuantity: 10,
        harvestDate: '2026-10-29',
        availableFrom: 'Ready for Immediate Dispatch',
        deliveryOptions: 'Seller delivery available',
        organic: true,
        status: 'AVAILABLE',
        bidsCount: 0,
        createdAt: '2026-10-29T08:00:00Z',
        updatedAt: '2026-10-29T08:00:00Z',
      },
      {
        id: 'prod_rice_1',
        sellerId: 'usr_seller_2',
        sellerName: 'Gurpreet Singh',
        sellerPhone: '+91 98140 54321',
        sellerLocation: {
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'Samrala',
          lat: 30.9010,
          lng: 75.8573,
        },
        name: 'Aromatic Traditional 1121 Basmati Paddy',
        category: 'Grains & Cereals',
        description: 'Prime harvest long-grain Pusa 1121 Basmati paddy. Moisture certified at 12%, minimal broken grain, unpolished aromatic yield.',
        imageUrl: '/src/assets/images/crop_basmati_rice_1793372794115.jpg',
        images: [
          '/src/assets/images/crop_basmati_rice_1793372794115.jpg',
          '/src/assets/images/crop_sharbati_wheat_1793374728243.jpg',
        ],
        variety: 'Pusa Basmati 1121',
        qualityGrade: 'Grade A (Export / Premium)',
        askingPrice: 84,
        priceUnit: 'per kg',
        availableQuantity: 4000,
        reservedQuantity: 0,
        originalQuantity: 4000,
        quantityUnit: 'kg',
        minOrderQuantity: 500,
        harvestDate: '2026-10-20',
        availableFrom: 'Warehouse Ready',
        deliveryOptions: 'Seller delivery available',
        organic: false,
        status: 'AVAILABLE',
        bidsCount: 1,
        highestBidPrice: 82,
        createdAt: '2026-10-26T10:00:00Z',
        updatedAt: '2026-10-26T10:00:00Z',
      },
      {
        id: 'prod_wheat_1',
        sellerId: 'usr_seller_2',
        sellerName: 'Gurpreet Singh',
        sellerPhone: '+91 98140 54321',
        sellerLocation: {
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'Samrala',
          lat: 30.9010,
          lng: 75.8573,
        },
        name: 'Golden Grain MP Sharbati Wheat',
        category: 'Grains & Cereals',
        description: 'Sun-drenched heavy golden grains of traditional Sharbati wheat. 100% sortex cleaned, tested moisture 11.2%, ideal for stone ground premium flour.',
        imageUrl: '/src/assets/images/crop_sharbati_wheat_1793374728243.jpg',
        images: [
          '/src/assets/images/crop_sharbati_wheat_1793374728243.jpg',
          '/src/assets/images/crop_basmati_rice_1793372794115.jpg',
        ],
        variety: 'MP Sharbati C-306',
        qualityGrade: 'Grade A (Export / Premium)',
        askingPrice: 38,
        priceUnit: 'per kg',
        availableQuantity: 6000,
        reservedQuantity: 0,
        originalQuantity: 6000,
        quantityUnit: 'kg',
        minOrderQuantity: 500,
        harvestDate: '2026-10-18',
        availableFrom: 'Warehouse Ready',
        deliveryOptions: 'Seller delivery available',
        organic: false,
        status: 'AVAILABLE',
        bidsCount: 0,
        createdAt: '2026-10-26T11:00:00Z',
        updatedAt: '2026-10-26T11:00:00Z',
      },
      {
        id: 'prod_turmeric_1',
        sellerId: 'usr_1793373199457_d3ib',
        sellerName: 'Shivaji Deshmukh',
        sellerPhone: '+91 98000 11223',
        sellerLocation: {
          state: 'Maharashtra',
          district: 'Nashik',
          village: 'Rural Mandi',
          lat: 19.997,
          lng: 73.789,
        },
        name: 'Organic Raw Waigaon Turmeric Finger',
        category: 'Spices',
        description: 'Rich deep-orange turmeric fingers tested with 5.3% curcumin level. Thoroughly soil-washed and dried, free from chemical polishes.',
        imageUrl: '/src/assets/images/crop_raw_turmeric_1793374729137.jpg',
        images: [
          '/src/assets/images/crop_raw_turmeric_1793374729137.jpg',
          '/src/assets/images/crop_green_chillies_1793374728585.jpg',
        ],
        variety: 'Waigaon High-Curcumin',
        qualityGrade: 'Grade A (Export / Premium)',
        askingPrice: 110,
        priceUnit: 'per kg',
        availableQuantity: 1800,
        reservedQuantity: 0,
        originalQuantity: 1800,
        quantityUnit: 'kg',
        minOrderQuantity: 100,
        harvestDate: '2026-10-27',
        availableFrom: 'Ready for Immediate Dispatch',
        deliveryOptions: 'Shared transport',
        organic: true,
        status: 'AVAILABLE',
        bidsCount: 0,
        createdAt: '2026-10-28T12:00:00Z',
        updatedAt: '2026-10-28T12:00:00Z',
      },
    ],
    bids: [
      {
        id: 'bid_init_1',
        productId: 'prod_tomatoes_1',
        productName: 'Fresh Farm Tomatoes (Desi Hybrid)',
        sellerId: 'usr_seller_1',
        buyerId: 'usr_buyer_1',
        buyerName: 'Vikram Mehta (GreenBazaar)',
        buyerLocation: 'Bengaluru Urban, Karnataka',
        buyerPhone: '+91 97312 88990',
        offeredPrice: 25.5,
        priceUnit: 'per kg',
        requestedQuantity: 400,
        quantityUnit: 'kg',
        totalAmount: 10200,
        message: 'Can pick up tomorrow morning at 7 AM with our own reefer truck. Cash on confirmation.',
        status: 'PENDING',
        createdAt: '2026-10-29T10:30:00Z',
      },
      {
        id: 'bid_init_2',
        productId: 'prod_tomatoes_1',
        productName: 'Fresh Farm Tomatoes (Desi Hybrid)',
        sellerId: 'usr_seller_1',
        buyerId: 'usr_buyer_2',
        buyerName: 'Sanjay Deshmukh (FreshDirect)',
        buyerLocation: 'Mumbai, Maharashtra',
        buyerPhone: '+91 99201 44556',
        offeredPrice: 24.0,
        priceUnit: 'per kg',
        requestedQuantity: 600,
        quantityUnit: 'kg',
        totalAmount: 14400,
        message: 'Interested in taking 600kg if packed in 20kg plastic crates.',
        status: 'PENDING',
        createdAt: '2026-10-29T11:45:00Z',
      },
      {
        id: 'bid_init_3',
        productId: 'prod_onions_1',
        productName: 'Nashik Red Onions (Premium Storage)',
        sellerId: 'usr_both_1',
        buyerId: 'usr_buyer_1',
        buyerName: 'Vikram Mehta (GreenBazaar)',
        buyerLocation: 'Bengaluru Urban, Karnataka',
        buyerPhone: '+91 97312 88990',
        offeredPrice: 31,
        priceUnit: 'per kg',
        requestedQuantity: 1000,
        quantityUnit: 'kg',
        totalAmount: 31000,
        message: 'Requirement for our electronic city fulfillment depot.',
        status: 'PENDING',
        createdAt: '2026-10-29T13:10:00Z',
      },
      {
        id: 'bid_init_4',
        productId: 'prod_rice_1',
        productName: 'Aromatic Traditional 1121 Basmati Paddy',
        sellerId: 'usr_seller_2',
        buyerId: 'usr_buyer_2',
        buyerName: 'Sanjay Deshmukh (FreshDirect)',
        buyerLocation: 'Mumbai, Maharashtra',
        buyerPhone: '+91 99201 44556',
        offeredPrice: 82,
        priceUnit: 'per kg',
        requestedQuantity: 1500,
        quantityUnit: 'kg',
        totalAmount: 123000,
        message: 'Interstate transport permit ready. Can execute immediate RTGS transfer.',
        status: 'PENDING',
        createdAt: '2026-10-30T04:20:00Z',
      },
    ],
    orders: [
      {
        id: 'ord_sample_101',
        orderNumber: 'KC-ORD-2026-101',
        productId: 'prod_tomatoes_1',
        productName: 'Fresh Farm Tomatoes (Desi Hybrid)',
        productImageUrl: '/src/assets/images/crop_fresh_tomatoes_1793372793953.jpg',
        sellerId: 'usr_seller_1',
        sellerName: 'Ramesh Gowda',
        sellerLocation: 'Mysuru, Karnataka',
        buyerId: 'usr_buyer_1',
        buyerName: 'Vikram Mehta',
        buyerLocation: 'Bengaluru Urban, Karnataka',
        agreedUnitPrice: 25.0,
        priceUnit: 'per kg',
        quantity: 200,
        quantityUnit: 'kg',
        totalAmount: 5000,
        deliveryMethod: 'Buyer Picked Up via Tempo',
        deliveryAddress: 'APMC Yard Yard No. 4, Yeshwanthpur, Bengaluru',
        status: 'COMPLETED',
        createdAt: '2026-10-24T12:00:00Z',
        updatedAt: '2026-10-25T16:00:00Z',
      },
    ],
    messages: [
      {
        id: 'msg_1',
        conversationId: 'conv_usr_seller_1_usr_buyer_1',
        productId: 'prod_tomatoes_1',
        productName: 'Fresh Farm Tomatoes',
        senderId: 'usr_buyer_1',
        senderName: 'Vikram Mehta',
        receiverId: 'usr_seller_1',
        text: 'Namaste Ramesh ji, what is the exact moisture and firmness level of the tomatoes in lot #1?',
        createdAt: '2026-10-29T10:05:00Z',
      },
      {
        id: 'msg_2',
        conversationId: 'conv_usr_seller_1_usr_buyer_1',
        productId: 'prod_tomatoes_1',
        productName: 'Fresh Farm Tomatoes',
        senderId: 'usr_seller_1',
        senderName: 'Ramesh Gowda',
        receiverId: 'usr_buyer_1',
        text: 'Namaste Vikram ji, they are harvested early morning with green calyx intact. Firmness is prime Grade-A, perfect for 3-4 days distribution without chilling.',
        createdAt: '2026-10-29T10:15:00Z',
      },
    ],
    notifications: [
      {
        id: 'notif_1',
        userId: 'usr_seller_1',
        title: 'New Bid Received: ₹25.50/kg',
        message: 'Vikram Mehta (GreenBazaar) offered ₹25.50/kg for 400 kg of Fresh Farm Tomatoes.',
        type: 'BID_RECEIVED',
        relatedEntityType: 'bid',
        relatedEntityId: 'bid_init_1',
        isRead: false,
        createdAt: '2026-10-29T10:30:00Z',
      },
      {
        id: 'notif_2',
        userId: 'usr_seller_1',
        title: 'New Competing Bid: ₹24.00/kg',
        message: 'Sanjay Deshmukh offered ₹24.00/kg for 600 kg of Fresh Farm Tomatoes.',
        type: 'BID_RECEIVED',
        relatedEntityType: 'bid',
        relatedEntityId: 'bid_init_2',
        isRead: false,
        createdAt: '2026-10-29T11:45:00Z',
      },
    ],
    marketInsights: [
      {
        id: 'mkt_1',
        cropName: 'Tomatoes',
        market: 'Mysuru APMC Mandi',
        district: 'Mysuru',
        state: 'Karnataka',
        modalPrice: 24,
        minPrice: 20,
        maxPrice: 28,
        unit: '₹/kg',
        date: '30 Oct 2026',
        trend: 'up',
        changePercent: 6.8,
      },
      {
        id: 'mkt_2',
        cropName: 'Red Onions',
        market: 'Lasalgaon Mandi',
        district: 'Nashik',
        state: 'Maharashtra',
        modalPrice: 30,
        minPrice: 26,
        maxPrice: 35,
        unit: '₹/kg',
        date: '30 Oct 2026',
        trend: 'up',
        changePercent: 4.2,
      },
      {
        id: 'mkt_3',
        cropName: 'Basmati Paddy',
        market: 'Khanna Grain Market',
        district: 'Ludhiana',
        state: 'Punjab',
        modalPrice: 80,
        minPrice: 75,
        maxPrice: 86,
        unit: '₹/kg',
        date: '30 Oct 2026',
        trend: 'stable',
        changePercent: 0.5,
      },
      {
        id: 'mkt_4',
        cropName: 'Grand Naine Bananas',
        market: 'Kolar Mandi',
        district: 'Kolar',
        state: 'Karnataka',
        modalPrice: 36,
        minPrice: 32,
        maxPrice: 40,
        unit: '₹/kg',
        date: '30 Oct 2026',
        trend: 'up',
        changePercent: 3.1,
      },
      {
        id: 'mkt_5',
        cropName: 'Sharbati Wheat',
        market: 'Sehore Krishi Mandi',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        modalPrice: 42,
        minPrice: 38,
        maxPrice: 46,
        unit: '₹/kg',
        date: '30 Oct 2026',
        trend: 'stable',
        changePercent: -1.2,
      },
    ],
  };
};

// Database helper functions
const readDb = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db file, restoring initial data:', err);
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
};

const writeDb = (data: any) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to db:', err);
  }
};

// ------------------- API ROUTES ------------------- //

// 1. Live synchronized state (for multi-device instant polling)
app.get('/api/state', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({
    timestamp: new Date().toISOString(),
    usersCount: db.users.length,
    productsCount: db.products.length,
    bidsCount: db.bids.length,
    ordersCount: db.orders.length,
    notificationsCount: db.notifications.length,
    messagesCount: db.messages.length,
  });
});

// 2. Authentication: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = readDb();
  const user = db.users.find(
    (u: any) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email address or password' });
  }

  // Return user without password
  const { password: _, ...userProfile } = user;
  return res.json({
    user: userProfile,
    token: `token_${user.id}_${Date.now()}`,
  });
});

// 3. Authentication: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const {
    fullName,
    email,
    password,
    phone,
    role,
    state,
    district,
    villageOrTown,
    preferredLanguage,
    businessName,
  } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required' });
  }

  const db = readDb();
  const existing = db.users.find(
    (u: any) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
  );

  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const rolesArray = role === 'both' ? ['seller', 'buyer'] : [role || 'seller'];
  const activeRole = role === 'buyer' ? 'buyer' : 'seller';

  // Realistic default coordinates for states
  const stateCoordinates: Record<string, [number, number]> = {
    Karnataka: [12.9716, 77.5946],
    Maharashtra: [19.0760, 72.8777],
    Punjab: [30.9010, 75.8573],
    'Tamil Nadu': [13.0827, 80.2707],
    'Andhra Pradesh': [16.5062, 80.6480],
    Telangana: [17.3850, 78.4867],
    'Madhya Pradesh': [23.2599, 77.4126],
    Gujarat: [23.0225, 72.5714],
    Haryana: [29.0588, 76.0856],
    'Uttar Pradesh': [26.8467, 80.9462],
  };

  const coords = stateCoordinates[state] || [12.9716, 77.5946];
  // Add slight random offset for location distribution
  const lat = coords[0] + (Math.random() - 0.5) * 0.4;
  const lng = coords[1] + (Math.random() - 0.5) * 0.4;

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: email.toLowerCase().trim(),
    password,
    fullName,
    phone: phone || '+91 98000 00000',
    roles: rolesArray,
    activeRole,
    state: state || 'Karnataka',
    district: district || 'Bengaluru',
    villageOrTown: villageOrTown || 'Central Mandi',
    preferredLanguage: preferredLanguage || 'en',
    latitude: lat,
    longitude: lng,
    verified: true,
    businessName: businessName || `${fullName} Agro`,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);

  const { password: _, ...userProfile } = newUser;
  return res.status(201).json({
    user: userProfile,
    token: `token_${newUser.id}_${Date.now()}`,
    message: 'Registration successful! Welcome to Krishi Connect.',
  });
});

// 4. Directory & Adding new sellers / buyers
app.get('/api/users', (req: Request, res: Response) => {
  const { role, search } = req.query;
  const db = readDb();
  let users = db.users.map(({ password, ...u }: any) => u);

  if (role) {
    users = users.filter((u: any) => u.roles.includes(role as string));
  }

  if (search) {
    const q = (search as string).toLowerCase();
    users = users.filter(
      (u: any) =>
        u.fullName.toLowerCase().includes(q) ||
        u.district.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q) ||
        (u.businessName && u.businessName.toLowerCase().includes(q))
    );
  }

  res.json(users);
});

// Direct admin/user endpoint to add a new seller or buyer
app.post('/api/users/add', (req: Request, res: Response) => {
  const {
    fullName,
    email,
    password = 'password123',
    phone,
    role = 'seller',
    state = 'Karnataka',
    district = 'Mandya',
    villageOrTown = 'Rural Mandi',
    businessName,
    commoditiesHandled = [],
    farmSizeAcres,
  } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const db = readDb();
  const existing = db.users.find(
    (u: any) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
  );

  if (existing) {
    return res.status(409).json({ error: 'A user with this email already exists' });
  }

  const stateCoordinates: Record<string, [number, number]> = {
    Karnataka: [12.9716, 77.5946],
    Maharashtra: [19.0760, 72.8777],
    Punjab: [30.9010, 75.8573],
    'Tamil Nadu': [13.0827, 80.2707],
    Telangana: [17.3850, 78.4867],
  };

  const coords = stateCoordinates[state] || [12.9716, 77.5946];
  const lat = coords[0] + (Math.random() - 0.5) * 0.4;
  const lng = coords[1] + (Math.random() - 0.5) * 0.4;

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: email.toLowerCase().trim(),
    password,
    fullName,
    phone: phone || '+91 98000 11223',
    roles: role === 'both' ? ['seller', 'buyer'] : [role],
    activeRole: role === 'buyer' ? 'buyer' : 'seller',
    state,
    district,
    villageOrTown,
    preferredLanguage: 'en',
    latitude: lat,
    longitude: lng,
    verified: true,
    businessName: businessName || `${fullName} Agro Traders`,
    commoditiesHandled: Array.isArray(commoditiesHandled) ? commoditiesHandled : [commoditiesHandled],
    farmSizeAcres: farmSizeAcres ? Number(farmSizeAcres) : undefined,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);

  const { password: _, ...userProfile } = newUser;
  return res.status(201).json({
    user: userProfile,
    message: `Successfully registered new ${role === 'buyer' ? 'buyer' : 'seller'}!`,
  });
});

// 5. Products: List with search and filter
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, state, status, sellerId } = req.query;
  const db = readDb();
  let list = [...db.products];

  if (sellerId) {
    list = list.filter((p: any) => p.sellerId === sellerId);
  }

  if (category && category !== 'All') {
    list = list.filter((p: any) => p.category === category);
  }

  if (state && state !== 'All') {
    list = list.filter((p: any) => p.sellerLocation.state === state);
  }

  if (status && status !== 'All') {
    list = list.filter((p: any) => p.status === status);
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    list = list.filter(
      (p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.variety.toLowerCase().includes(q) ||
        p.sellerLocation.district.toLowerCase().includes(q) ||
        p.sellerLocation.state.toLowerCase().includes(q) ||
        p.sellerName.toLowerCase().includes(q)
    );
  }

  // Update real-time bidsCount and highestBidPrice from bids table
  list = list.map((prod: any) => {
    const prodBids = db.bids.filter((b: any) => b.productId === prod.id && b.status === 'PENDING');
    const highestBid = prodBids.reduce((max: number, b: any) => Math.max(max, b.offeredPrice), 0);
    return {
      ...prod,
      bidsCount: prodBids.length,
      highestBidPrice: highestBid > 0 ? highestBid : undefined,
    };
  });

  res.json(list);
});

// 6. Products: Create new listing
app.post('/api/products', (req: Request, res: Response) => {
  const {
    sellerId,
    sellerName,
    sellerPhone,
    sellerLocation,
    name,
    category,
    description,
    imageUrl,
    variety,
    qualityGrade,
    askingPrice,
    priceUnit = 'per kg',
    availableQuantity,
    quantityUnit = 'kg',
    minOrderQuantity = 50,
    harvestDate,
    availableFrom,
    deliveryOptions = 'Pickup only',
    organic = false,
  } = req.body;

  if (!name || !askingPrice || !availableQuantity) {
    return res.status(400).json({ error: 'Crop name, asking price, and quantity are required' });
  }

  const db = readDb();
  const seller = db.users.find((u: any) => u.id === sellerId);

  const productImages = (Array.isArray(req.body.images) && req.body.images.length > 0)
    ? req.body.images
    : [imageUrl || '/src/assets/images/crop_fresh_tomatoes_1793372793953.jpg'];

  try {
    const newProduct = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sellerId: sellerId || (seller ? seller.id : 'usr_seller_1'),
    sellerName: sellerName || (seller ? seller.fullName : 'Ramesh Gowda'),
    sellerPhone: sellerPhone || (seller ? seller.phone : '+91 98450 12345'),
    sellerLocation: sellerLocation || {
      state: seller?.state || 'Karnataka',
      district: seller?.district || 'Mysuru',
      village: seller?.villageOrTown || 'Hunsur Taluk',
      lat: seller?.latitude || 12.2958,
      lng: seller?.longitude || 76.6394,
    },
      name,
      category: category || 'Vegetables',
      description: description || 'Fresh farm harvest with high market quality.',
      imageUrl: productImages[0],
      images: productImages,
      variety: variety || 'Standard Mandi Grade',
      qualityGrade: qualityGrade || 'Grade A (Export / Premium)',
      askingPrice: Number(askingPrice),
      priceUnit,
      availableQuantity: Number(availableQuantity),
      reservedQuantity: 0,
      originalQuantity: Number(availableQuantity),
      quantityUnit,
      minOrderQuantity: Number(minOrderQuantity),
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      availableFrom: availableFrom || 'Immediate Dispatch',
      deliveryOptions,
      organic: Boolean(organic),
      status: 'AVAILABLE',
      bidsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    writeDb(db);

    return res.status(201).json(newProduct);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// 7. Products: Update listing
app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.products.findIndex((p: any) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updatedImages = req.body.images || db.products[index].images;
  const primaryImageUrl = (Array.isArray(updatedImages) && updatedImages.length > 0)
    ? updatedImages[0]
    : (req.body.imageUrl || db.products[index].imageUrl);

  db.products[index] = {
    ...db.products[index],
    ...req.body,
    imageUrl: primaryImageUrl,
    images: updatedImages,
    updatedAt: new Date().toISOString(),
  };

  writeDb(db);
  return res.json(db.products[index]);
});

// 7b. Products: Add more photos to listing
app.post('/api/products/:id/photos', (req: Request, res: Response) => {
  const { id } = req.params;
  const { photoUrl, photoUrls } = req.body;
  const db = readDb();
  const index = db.products.findIndex((p: any) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = Array.isArray(db.products[index].images)
    ? [...db.products[index].images]
    : (db.products[index].imageUrl ? [db.products[index].imageUrl] : []);

  const toAdd = Array.isArray(photoUrls) ? photoUrls : (photoUrl ? [photoUrl] : []);
  const combined = Array.from(new Set([...existing, ...toAdd]));

  db.products[index].images = combined;
  if (!db.products[index].imageUrl && combined.length > 0) {
    db.products[index].imageUrl = combined[0];
  }
  db.products[index].updatedAt = new Date().toISOString();

  writeDb(db);
  return res.json(db.products[index]);
});

// 8. Bids: Submit new bid
app.post('/api/bids', (req: Request, res: Response) => {
  const {
    productId,
    buyerId,
    buyerName,
    buyerLocation,
    buyerPhone,
    offeredPrice,
    priceUnit = 'per kg',
    requestedQuantity,
    quantityUnit = 'kg',
    message = '',
  } = req.body;

  if (!productId || !offeredPrice || !requestedQuantity) {
    return res.status(400).json({ error: 'Product ID, offered price, and requested quantity are required' });
  }

  const db = readDb();
  const product = db.products.find((p: any) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.status === 'SOLD_OUT') {
    return res.status(400).json({ error: 'This listing is SOLD OUT' });
  }

  if (Number(requestedQuantity) > product.availableQuantity) {
    return res.status(400).json({
      error: `Requested quantity (${requestedQuantity} ${quantityUnit}) exceeds available inventory (${product.availableQuantity} ${product.quantityUnit})`,
    });
  }

  if (product.sellerId === buyerId) {
    return res.status(400).json({ error: 'Sellers cannot place bids on their own produce listings' });
  }

  const totalAmount = Number(offeredPrice) * Number(requestedQuantity);

  const newBid = {
    id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    productId,
    productName: product.name,
    sellerId: product.sellerId,
    buyerId: buyerId || 'usr_buyer_1',
    buyerName: buyerName || 'Verified Buyer',
    buyerLocation: buyerLocation || 'State APMC Trade Hub',
    buyerPhone: buyerPhone || '+91 98000 00000',
    offeredPrice: Number(offeredPrice),
    priceUnit,
    requestedQuantity: Number(requestedQuantity),
    quantityUnit,
    totalAmount,
    message,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  db.bids.unshift(newBid);

  // Send real-time notification to seller
  const notif = {
    id: `notif_${Date.now()}`,
    userId: product.sellerId,
    title: `New Offer on ${product.name}: ₹${offeredPrice}/${priceUnit}`,
    message: `${buyerName || 'A buyer'} placed a bid for ${requestedQuantity} ${quantityUnit} at ₹${offeredPrice}/${priceUnit} (Total: ₹${totalAmount.toLocaleString('en-IN')}).`,
    type: 'BID_RECEIVED',
    relatedEntityType: 'bid',
    relatedEntityId: newBid.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  db.notifications.unshift(notif);
  writeDb(db);

  return res.status(201).json(newBid);
});

// 9. Bids: List bids (filter by productId, buyerId, or sellerId)
app.get('/api/bids', (req: Request, res: Response) => {
  const { productId, buyerId, sellerId } = req.query;
  const db = readDb();
  let list = [...db.bids];

  if (productId) {
    list = list.filter((b: any) => b.productId === productId);
  }
  if (buyerId) {
    list = list.filter((b: any) => b.buyerId === buyerId);
  }
  if (sellerId) {
    list = list.filter((b: any) => b.sellerId === sellerId);
  }

  res.json(list);
});

// 10. Bids: Accept offer (ATOMIC INVENTORY & ORDER CREATION)
app.post('/api/bids/:id/accept', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();

  const bidIndex = db.bids.findIndex((b: any) => b.id === id);
  if (bidIndex === -1) {
    return res.status(404).json({ error: 'Bid not found' });
  }

  const bid = db.bids[bidIndex];
  if (bid.status !== 'PENDING') {
    return res.status(400).json({ error: `Bid is already ${bid.status}` });
  }

  const productIndex = db.products.findIndex((p: any) => p.id === bid.productId);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const product = db.products[productIndex];

  // Atomic stock verification
  if (product.availableQuantity < bid.requestedQuantity) {
    return res.status(400).json({
      error: `Cannot accept offer. Remaining stock (${product.availableQuantity} ${product.quantityUnit}) is less than bid quantity (${bid.requestedQuantity} ${bid.quantityUnit}).`,
    });
  }

  // 1. Deduct stock atomically
  const newAvailable = product.availableQuantity - bid.requestedQuantity;
  const newReserved = (product.reservedQuantity || 0) + bid.requestedQuantity;
  const newStatus = newAvailable <= 0 ? 'SOLD_OUT' : 'PARTIALLY_RESERVED';

  db.products[productIndex] = {
    ...product,
    availableQuantity: newAvailable,
    reservedQuantity: newReserved,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  // 2. Mark bid as ACCEPTED
  db.bids[bidIndex] = {
    ...bid,
    status: 'ACCEPTED',
    updatedAt: new Date().toISOString(),
  };

  // 3. Create confirmed Order
  const orderNumber = `KC-ORD-${Date.now().toString().slice(-6)}`;
  const newOrder = {
    id: `ord_${Date.now()}`,
    orderNumber,
    productId: product.id,
    productName: product.name,
    productImageUrl: product.imageUrl,
    sellerId: product.sellerId,
    sellerName: product.sellerName,
    sellerLocation: `${product.sellerLocation.district}, ${product.sellerLocation.state}`,
    buyerId: bid.buyerId,
    buyerName: bid.buyerName,
    buyerLocation: bid.buyerLocation,
    agreedUnitPrice: bid.offeredPrice,
    priceUnit: bid.priceUnit,
    quantity: bid.requestedQuantity,
    quantityUnit: bid.quantityUnit,
    totalAmount: bid.totalAmount,
    deliveryMethod: product.deliveryOptions,
    deliveryAddress: `${bid.buyerLocation} (Confirmed for Dispatch)`,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);

  // 4. Notify Buyer in real-time
  db.notifications.unshift({
    id: `notif_${Date.now()}_buyer`,
    userId: bid.buyerId,
    title: `🎉 Offer ACCEPTED for ${product.name}!`,
    message: `${product.sellerName} accepted your bid of ₹${bid.offeredPrice}/${bid.priceUnit} for ${bid.requestedQuantity} ${bid.quantityUnit}. Order #${orderNumber} created!`,
    type: 'BID_ACCEPTED',
    relatedEntityType: 'order',
    relatedEntityId: newOrder.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // 5. Notify Seller confirmation
  db.notifications.unshift({
    id: `notif_${Date.now()}_seller`,
    userId: product.sellerId,
    title: `Order #${orderNumber} Confirmed`,
    message: `You accepted ${bid.buyerName}'s offer. Order confirmed for ₹${bid.totalAmount.toLocaleString('en-IN')}. Stock updated (${newAvailable} ${product.quantityUnit} remaining).`,
    type: 'ORDER_UPDATE',
    relatedEntityType: 'order',
    relatedEntityId: newOrder.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  writeDb(db);

  return res.json({
    message: 'Offer accepted successfully! Order created and inventory deducted.',
    order: newOrder,
    updatedProduct: db.products[productIndex],
    updatedBid: db.bids[bidIndex],
  });
});

// 11. Bids: Reject offer
app.post('/api/bids/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();

  const bidIndex = db.bids.findIndex((b: any) => b.id === id);
  if (bidIndex === -1) {
    return res.status(404).json({ error: 'Bid not found' });
  }

  const bid = db.bids[bidIndex];
  db.bids[bidIndex] = {
    ...bid,
    status: 'REJECTED',
    updatedAt: new Date().toISOString(),
  };

  // Notify buyer
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: bid.buyerId,
    title: `Offer Update: ${bid.productName}`,
    message: `Your bid of ₹${bid.offeredPrice} for ${bid.requestedQuantity} ${bid.quantityUnit} was declined by the seller. You can submit a revised offer.`,
    type: 'BID_REJECTED',
    relatedEntityType: 'bid',
    relatedEntityId: bid.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  writeDb(db);
  return res.json({ message: 'Offer rejected', bid: db.bids[bidIndex] });
});

// 12. Orders: List and status updates
app.get('/api/orders', (req: Request, res: Response) => {
  const { buyerId, sellerId } = req.query;
  const db = readDb();
  let list = [...db.orders];

  if (buyerId) {
    list = list.filter((o: any) => o.buyerId === buyerId);
  }
  if (sellerId) {
    list = list.filter((o: any) => o.sellerId === sellerId);
  }

  res.json(list);
});

app.put('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDb();

  const orderIndex = db.orders.findIndex((o: any) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.orders[orderIndex] = {
    ...db.orders[orderIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  const order = db.orders[orderIndex];

  // Notify buyer and seller
  db.notifications.unshift({
    id: `notif_${Date.now()}_status`,
    userId: order.buyerId,
    title: `Order Status: ${status.replace(/_/g, ' ')}`,
    message: `Order #${order.orderNumber} for ${order.productName} is now ${status.replace(/_/g, ' ')}.`,
    type: 'ORDER_UPDATE',
    relatedEntityType: 'order',
    relatedEntityId: order.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  writeDb(db);
  return res.json(db.orders[orderIndex]);
});

// 13. Messages: Chat between buyers & sellers
app.get('/api/messages', (req: Request, res: Response) => {
  const { userId, conversationId } = req.query;
  const db = readDb();
  let list = [...db.messages];

  if (conversationId) {
    list = list.filter((m: any) => m.conversationId === conversationId);
  } else if (userId) {
    list = list.filter((m: any) => m.senderId === userId || m.receiverId === userId);
  }

  res.json(list);
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { senderId, senderName, receiverId, text, productId, productName } = req.body;

  if (!senderId || !receiverId || !text) {
    return res.status(400).json({ error: 'Sender, receiver, and text are required' });
  }

  const db = readDb();
  // Consistent conversationId
  const conversationId = [senderId, receiverId].sort().join('_');

  const newMsg = {
    id: `msg_${Date.now()}`,
    conversationId: `conv_${conversationId}`,
    productId,
    productName,
    senderId,
    senderName,
    receiverId,
    text,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(newMsg);

  // Notify receiver
  db.notifications.unshift({
    id: `notif_${Date.now()}_msg`,
    userId: receiverId,
    title: `New message from ${senderName}`,
    message: text.length > 60 ? `${text.substring(0, 57)}...` : text,
    type: 'NEW_MESSAGE',
    relatedEntityType: 'message',
    relatedEntityId: newMsg.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  writeDb(db);
  return res.status(201).json(newMsg);
});

// 14. Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const { userId } = req.query;
  const db = readDb();
  let list = [...db.notifications];

  if (userId) {
    list = list.filter((n: any) => n.userId === userId);
  }

  res.json(list);
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();

  const idx = db.notifications.findIndex((n: any) => n.id === id);
  if (idx !== -1) {
    db.notifications[idx].isRead = true;
    writeDb(db);
  }

  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  const { userId } = req.body;
  const db = readDb();

  db.notifications.forEach((n: any) => {
    if (!userId || n.userId === userId) {
      n.isRead = true;
    }
  });

  writeDb(db);
  res.json({ success: true });
});

// 15. Market Insights data
app.get('/api/market-insights', (_req: Request, res: Response) => {
  const db = readDb();
  res.json(db.marketInsights);
});

// 16. Multi-Turn Gemini Agricultural Advisor with Google Maps Grounding
app.post('/api/gemini/advisor', async (req: Request, res: Response) => {
  const { messages, userLocation } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  if (!ai) {
    return res.json({
      text: "Namaste! I am your Krishi AI Advisor. I can assist you in comparing crop varieties (e.g. Abhinav vs Desi tomatoes, Pusa 1121 Basmati), reviewing prevailing mandi benchmarks, and discovering nearby APMC auction centers. Please ensure GEMINI_API_KEY is configured in your Secrets panel.",
      mapsSources: [],
    });
  }

  try {
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: "You are 'Krishi AI Advisor', an agricultural expert and mandi trade assistant for Krishi Connect. You provide practical, verified agricultural advisory for Indian farmers, traders, and buyers. You advise on crop varieties (such as Abhinav Hybrid Tomatoes, Fursungi Red Onions, Grand Naine G9 Bananas, Pusa 1121 Basmati), seasonal pest management, current mandi price spreads, and transport logistics. When asked about mandis, warehouses, cold storages, or APMC yards, utilize Google Maps grounding to provide real, accurate locations and links.",
        tools: [{ googleMaps: {} }],
        ...(userLocation ? {
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: Number(userLocation.lat),
                longitude: Number(userLocation.lng),
              },
            },
          },
        } : {}),
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const mapsSources = groundingChunks
      .filter((c: any) => c.maps)
      .map((c: any) => ({
        title: c.maps.title || 'APMC / Agricultural Facility',
        uri: c.maps.uri || '',
      }));

    res.json({ text, mapsSources });
  } catch (error: any) {
    console.warn('Gemini Advisor Notice (using fallback):', error.message || error);
    res.json({
      text: "Namaste! For long-distance transport in Karnataka and Maharashtra, semi-determinate hybrid varieties such as Abhinav, Arka Rakshak, and US-440 are preferred for their thick outer skin, uniform grading, and 8–10 day transit shelf life. For grain storage, Pusa 1121 Basmati paddy requires 12% moisture control. You can explore verified harvest lots directly in our Marketplace.",
      mapsSources: [
        { title: "Mysuru APMC Mandi Yard (Bandipalya)", uri: "https://maps.google.com/?q=Mysuru+APMC+Mandi+Bandipalya" },
        { title: "Yeshwanthpur APMC Wholesale Market Bengaluru", uri: "https://maps.google.com/?q=Yeshwanthpur+APMC+Market+Bengaluru" },
        { title: "Lasalgaon APMC Onion Market Nashik", uri: "https://maps.google.com/?q=Lasalgaon+APMC+Market+Nashik" }
      ],
    });
  }
});

// ------------------- DEV / PROD SERVER ------------------- //
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    // In dev mode: mount Vite middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 Krishi Connect server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
