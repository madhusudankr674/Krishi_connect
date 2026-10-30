import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ProductListing, UserProfile } from '../types';
import { MapPin, Sprout, ShoppingCart, Eye, ArrowRight } from 'lucide-react';

interface AgriculturalMapViewProps {
  products: ProductListing[];
  users: UserProfile[];
  onSelectProduct: (product: ProductListing) => void;
}

export const AgriculturalMapView: React.FC<AgriculturalMapViewProps> = ({
  products,
  users,
  onSelectProduct,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<ProductListing | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'crops' | 'sellers' | 'buyers'>('all');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Central/South India (latitude 15.0, longitude 76.5) zoom 6
      const map = L.map(mapContainerRef.current).setView([16.5, 76.5], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers (excluding tiles)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // 1. Add crop produce markers
    if (activeFilter === 'all' || activeFilter === 'crops') {
      products.forEach((prod) => {
        const { lat, lng } = prod.sellerLocation;
        if (!lat || !lng) return;

        const cropIcon = L.divIcon({
          className: 'custom-crop-marker',
          html: `<div style="background-color: #166534; color: white; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
                  <span>🌾</span>
                  <span>${prod.name.split(' ')[0]} · ₹${prod.askingPrice}</span>
                 </div>`,
          iconSize: [120, 30],
          iconAnchor: [60, 15],
        });

        const marker = L.marker([lat, lng], { icon: cropIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px; min-width: 180px;">
            <strong style="color: #14532D; font-size: 13px;">${prod.name}</strong><br/>
            <span>Seller: ${prod.sellerName}</span><br/>
            <span>Location: ${prod.sellerLocation.district}, ${prod.sellerLocation.state}</span><br/>
            <strong>Price: ₹${prod.askingPrice}/${prod.priceUnit.replace('per ', '')}</strong><br/>
            <span>Available: ${prod.availableQuantity} ${prod.quantityUnit}</span>
          </div>
        `);

        marker.on('click', () => {
          setSelectedCrop(prod);
        });
      });
    }

    // 2. Add Buyer markers
    if (activeFilter === 'all' || activeFilter === 'buyers') {
      users
        .filter((u) => u.roles.includes('buyer'))
        .forEach((buyer) => {
          if (!buyer.latitude || !buyer.longitude) return;

          const buyerIcon = L.divIcon({
            className: 'custom-buyer-marker',
            html: `<div style="background-color: #b45309; color: white; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); white-space: nowrap;">
                    <span>🛒</span> ${buyer.fullName.split(' ')[0]}
                   </div>`,
            iconSize: [100, 26],
            iconAnchor: [50, 13],
          });

          L.marker([buyer.latitude, buyer.longitude], { icon: buyerIcon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: system-ui, sans-serif; font-size: 12px;">
                <strong style="color: #92400e;">Buyer / Trader</strong><br/>
                <strong>${buyer.fullName}</strong><br/>
                <span>${buyer.businessName || 'Wholesale Buyer'}</span><br/>
                <span>${buyer.district}, ${buyer.state}</span>
              </div>
            `);
        });
    }

    // Auto cleanup on unmount
    return () => {
      // Keep map instance alive or clean markers
    };
  }, [products, users, activeFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif tracking-tight">
            Agricultural Produce & Trader Radar
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Geographic distribution of available farm harvests, wholesale buyers, and regional APMC mandi nodes.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'all' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Markers
          </button>
          <button
            onClick={() => setActiveFilter('crops')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'crops' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>Farm Produce</span>
          </button>
          <button
            onClick={() => setActiveFilter('buyers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'buyers' ? 'bg-white text-amber-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />
            <span>Mandi Buyers</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Map + Produce List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet Map (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs h-[520px] relative">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Legend Bar */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-stone-200 shadow-md z-10 flex items-center gap-4 text-[11px] text-stone-700 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-800" />
              <span>Crops Listed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span>Wholesale Buyers</span>
            </span>
          </div>
        </div>

        {/* Nearby Produce List Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between h-[520px]">
          <div>
            <h3 className="text-sm font-bold text-stone-900 font-serif mb-3">
              Regional Produce Listings
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    selectedCrop?.id === prod.id
                      ? 'border-emerald-700 bg-emerald-50/50 shadow-xs'
                      : 'border-stone-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-stone-900 truncate">
                      {prod.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{prod.sellerLocation.district}, {prod.sellerLocation.state}</span>
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-bold text-emerald-900 font-mono">
                        ₹{prod.askingPrice}/{prod.priceUnit.replace('per ', '')}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {prod.availableQuantity} {prod.quantityUnit} left
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedCrop && (
            <button
              onClick={() => onSelectProduct(selectedCrop)}
              className="mt-3 w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View & Bid on {selectedCrop.name.split(' ')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
