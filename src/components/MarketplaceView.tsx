import React, { useState, useMemo } from 'react';
import { ProductListing, UserProfile } from '../types';
import { LanguageCode, TRANSLATIONS } from '../translations';
import { Search, MapPin, Tag, ArrowUpDown, Plus, ShieldCheck, TrendingUp, Sparkles, Filter, X, Check, Dna, Images } from 'lucide-react';

interface MarketplaceViewProps {
  products: ProductListing[];
  currentUser: UserProfile | null;
  language: LanguageCode;
  onSelectProduct: (product: ProductListing) => void;
  onOpenAddProduce: () => void;
  onOpenAddUser: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  products,
  currentUser,
  language,
  onSelectProduct,
  onOpenAddProduce,
  onOpenAddUser,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVariety, setSelectedVariety] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'bids'>('newest');

  const categories = [
    'All',
    'Vegetables',
    'Fruits',
    'Grains & Cereals',
    'Pulses',
    'Spices',
  ];

  const states = ['All', 'Karnataka', 'Maharashtra', 'Punjab', 'Tamil Nadu', 'Madhya Pradesh'];

  // Dynamically extract distinct crop varieties from available products
  const availableVarieties = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.variety && p.variety.trim()) {
        set.add(p.variety.trim());
      }
    });
    return Array.from(set);
  }, [products]);

  // Filter & Sort by Crop Type and Variety
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category filter
      if (selectedCategory !== 'All' && prod.category !== selectedCategory) return false;

      // Variety dropdown filter
      if (selectedVariety !== 'All' && prod.variety !== selectedVariety) return false;

      // State filter
      if (selectedState !== 'All' && prod.sellerLocation.state !== selectedState) return false;

      // Search bar filter: matches crop name, crop category, or crop variety
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = prod.name.toLowerCase().includes(q);
        const matchVariety = prod.variety.toLowerCase().includes(q);
        const matchCategory = prod.category.toLowerCase().includes(q);
        const matchDistrict = prod.sellerLocation.district.toLowerCase().includes(q);
        const matchState = prod.sellerLocation.state.toLowerCase().includes(q);

        if (!matchName && !matchVariety && !matchCategory && !matchDistrict && !matchState) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.askingPrice - b.askingPrice;
      if (sortBy === 'price-desc') return b.askingPrice - a.askingPrice;
      if (sortBy === 'bids') return (b.bidsCount || 0) - (a.bidsCount || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, selectedVariety, selectedState, search, sortBy]);

  const hasActiveFilters = search.trim() !== '' || selectedCategory !== 'All' || selectedVariety !== 'All' || selectedState !== 'All';

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedVariety('All');
    setSelectedState('All');
  };

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative bg-emerald-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src="/src/assets/images/hero_farmer_harvest_1793372792936.jpg"
            alt="Farmers harvesting crops at golden hour"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Direct Agricultural Exchange · Zero Intermediary Markups</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif text-balance leading-tight">
              {t.heroHeadline}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-xl">
              {t.heroSubtext}
            </p>

            {/* Quick Action buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {currentUser?.activeRole === 'seller' ? (
                <button
                  onClick={onOpenAddProduce}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addProduce}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAddUser}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addBuyerSeller}</span>
                </button>
              )}

              <a
                href="#marketplace-grid"
                className="px-5 py-2.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 text-xs font-semibold rounded-xl border border-emerald-700/60 transition-all cursor-pointer"
              >
                {t.exploreMarketplace}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH AND FILTERS BAR */}
      <section id="marketplace-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-4 sm:p-6 space-y-4">
          
          {/* Main Search Row */}
          <div className="flex flex-col lg:flex-row items-center gap-3">
            
            {/* Dedicated Search Input for Crop Type & Variety */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-emerald-700" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by crop type (e.g. Tomato, Onion, Rice) or variety (e.g. Abhinav, Fursungi, Pusa 1121)..."
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border-2 border-emerald-100 rounded-xl bg-stone-50/60 focus:bg-white focus:border-emerald-700 focus:ring-3 focus:ring-emerald-700/15 outline-none transition-all placeholder:text-stone-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 p-1 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Variety Quick Dropdown */}
            <div className="w-full lg:w-52">
              <div className="relative">
                <select
                  value={selectedVariety}
                  onChange={(e) => setSelectedVariety(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-semibold border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none cursor-pointer"
                >
                  <option value="All">All Crop Varieties</option>
                  {availableVarieties.map((v) => (
                    <option key={v} value={v}>Variety: {v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Select */}
            <div className="w-full lg:w-44">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>

            {/* State Select */}
            <div className="w-full lg:w-40">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none cursor-pointer"
              >
                {states.map((s) => (
                  <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="w-full lg:w-44">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 text-xs font-medium border border-stone-300 rounded-xl bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest Listed</option>
                <option value="price-asc">Sort: Price (Low to High)</option>
                <option value="price-desc">Sort: Price (High to Low)</option>
                <option value="bids">Sort: Most Bids</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Variety & Crop Type Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100 text-xs">
            <span className="text-stone-500 font-medium flex items-center gap-1 shrink-0">
              <Dna className="w-3.5 h-3.5 text-emerald-800" />
              <span>Popular Crop Types & Varieties:</span>
            </span>

            {['Tomatoes', 'Red Onions', 'Abhinav Hybrid', 'Fursungi Red', 'Grand Naine (G9)', 'Pusa Basmati 1121'].map((tag) => {
              const isActive = search.toLowerCase() === tag.toLowerCase() || selectedVariety === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      setSearch('');
                      setSelectedVariety('All');
                    } else {
                      setSearch(tag);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                    isActive
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-stone-100/80 text-stone-700 border-stone-200 hover:bg-emerald-50 hover:border-emerald-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="ml-auto text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* PRODUCT LISTINGS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span className="font-bold text-stone-900 text-sm">{filteredProducts.length}</span>
            <span>crops available</span>
            {search && (
              <span className="text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                matching "{search}"
              </span>
            )}
            {selectedVariety !== 'All' && (
              <span className="text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                variety: {selectedVariety}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>Verified mandi produce</span>
            <span aria-hidden="true">·</span>
            <span>Live bidding enabled</span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 p-8 shadow-xs">
            <Tag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">No matching agricultural produce found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              No crops matched your filter for crop type or variety "{search || selectedVariety}". Try searching for another variety like "Abhinav", "Pusa", or "Fursungi".
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
            >
              Clear Search & Show All Crops
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const isSoldOut = product.status === 'SOLD_OUT';
              const isPartiallyReserved = product.status === 'PARTIALLY_RESERVED';

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group bg-white rounded-2xl border border-stone-200 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Top Media: High-res crop photograph */}
                    <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />

                      {/* Top Overlay status tags */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        {isSoldOut ? (
                          <span className="bg-red-800 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-xs uppercase tracking-wider">
                            SOLD OUT
                          </span>
                        ) : isPartiallyReserved ? (
                          <span className="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-xs">
                            Partially Reserved
                          </span>
                        ) : (
                          <span className="bg-emerald-800/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-xs">
                            Ready for Dispatch
                          </span>
                        )}

                        <div className="flex items-center gap-1.5">
                          {product.images && product.images.length > 1 && (
                            <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                              <Images className="w-3 h-3 text-emerald-400" />
                              <span>{product.images.length} photos</span>
                            </span>
                          )}
                          {product.organic && (
                            <span className="bg-white/90 backdrop-blur-xs text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs border border-emerald-200">
                              Organic
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Image Scrim: Asking Price */}
                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-between text-white">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-stone-300 block">
                            Asking Price
                          </span>
                          <span className="text-xl font-bold font-mono tabular-nums">
                            ₹{product.askingPrice}
                            <span className="text-xs font-normal text-stone-300 ml-1">
                              /{product.priceUnit.replace('per ', '')}
                            </span>
                          </span>
                        </div>

                        {product.highestBidPrice && (
                          <div className="text-right">
                            <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-semibold">
                              Top Bid
                            </span>
                            <span className="text-sm font-bold text-amber-300 font-mono tabular-nums">
                              ₹{product.highestBidPrice}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      {/* Quiet unboxed metadata */}
                      <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
                        <span className="font-semibold text-emerald-800">{product.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-stone-700 font-medium">Grade A</span>
                      </div>

                      <h3 className="text-base font-bold text-stone-900 tracking-tight leading-snug group-hover:text-emerald-900 transition-colors">
                        {product.name}
                      </h3>

                      {/* Highlighted Crop Variety Field */}
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-900 font-medium bg-emerald-50/70 px-2.5 py-1 rounded-lg border border-emerald-100">
                        <Dna className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">Variety: <strong>{product.variety}</strong></span>
                      </div>

                      <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Stock & Location info */}
                      <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500">Available Stock:</span>
                          <span className="font-bold text-stone-900 font-mono tabular-nums">
                            {product.availableQuantity} {product.quantityUnit}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-stone-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" /> Location:
                          </span>
                          <span className="font-medium text-stone-800">
                            {product.sellerLocation.district}, {product.sellerLocation.state}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-stone-500">Seller:</span>
                          <span className="font-medium text-emerald-900">
                            {product.sellerName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="px-5 pb-5 pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                      disabled={isSoldOut}
                      className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center ${
                        isSoldOut
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
                      }`}
                    >
                      {isSoldOut ? 'Sold Out' : 'Place Price Bid'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="py-2 px-3 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
