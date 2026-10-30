import React, { useState, useEffect, useRef } from 'react';
import { ProductListing, Bid, UserProfile } from '../types';
import { api } from '../services/api';
import {
  X,
  MapPin,
  Calendar,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
  ImagePlus,
  Trash2,
  Star,
  Upload,
  Plus,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductListing | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onProductUpdated: (updatedProduct: ProductListing) => void;
  onOpenAuth: () => void;
  onOpenChat: (receiverId: string, receiverName: string, productId: string, productName: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currentUser,
  onClose,
  onProductUpdated,
  onOpenAuth,
  onOpenChat,
}) => {
  if (!product) return null;

  const isSellerOwner = currentUser?.id === product.sellerId;
  const isSoldOut = product.status === 'SOLD_OUT';

  // Multi-Photo Carousel State
  const photos = (product.images && product.images.length > 0) ? product.images : [product.imageUrl];
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isManagePhotosOpen, setIsManagePhotosOpen] = useState(false);

  // Manage Photos State
  const [editablePhotos, setEditablePhotos] = useState<string[]>(photos);
  const [photoSourceTab, setPhotoSourceTab] = useState<'upload' | 'library' | 'url'>('upload');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [photoSaveMessage, setPhotoSaveMessage] = useState<string | null>(null);
  const manageFileInputRef = useRef<HTMLInputElement>(null);

  // Curated agricultural library photos for quick insertion
  const curatedLibraryPhotos = [
    { label: 'Fresh Tomatoes', path: '/src/assets/images/crop_fresh_tomatoes_1793372793953.jpg' },
    { label: 'Red Onions', path: '/src/assets/images/crop_red_onions_1793372793295.jpg' },
    { label: 'Kufri Jyoti Potatoes', path: '/src/assets/images/crop_fresh_potatoes_1793374728226.jpg' },
    { label: 'G4 Green Chillies', path: '/src/assets/images/crop_green_chillies_1793374728585.jpg' },
    { label: 'Grand Naine Bananas', path: '/src/assets/images/crop_bananas_plantation_1793372793275.jpg' },
    { label: 'Alphonso Mangoes', path: '/src/assets/images/crop_alphonso_mangoes_1793374729040.jpg' },
    { label: '1121 Basmati Paddy', path: '/src/assets/images/crop_basmati_rice_1793372794115.jpg' },
    { label: 'Sharbati Wheat', path: '/src/assets/images/crop_sharbati_wheat_1793374728243.jpg' },
    { label: 'Raw Turmeric', path: '/src/assets/images/crop_raw_turmeric_1793374729137.jpg' },
  ];

  // Bids State
  const [bids, setBids] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(true);

  // Buyer Bid Form State
  const [offeredPrice, setOfferedPrice] = useState<number>(product.askingPrice);
  const [requestedQuantity, setRequestedQuantity] = useState<number>(
    Math.min(product.minOrderQuantity, product.availableQuantity)
  );
  const [bidMessage, setBidMessage] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);

  // Seller Action State
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchBids = async () => {
    try {
      setLoadingBids(true);
      const data = await api.getBids({ productId: product.id });
      setBids(data);
    } catch (err) {
      console.error('Error fetching bids:', err);
    } finally {
      setLoadingBids(false);
    }
  };

  useEffect(() => {
    fetchBids();
    setOfferedPrice(product.askingPrice);
    setRequestedQuantity(Math.min(product.minOrderQuantity, product.availableQuantity));
    setActivePhotoIdx(0);
    setEditablePhotos((product.images && product.images.length > 0) ? product.images : [product.imageUrl]);
    setIsManagePhotosOpen(false);
    setPhotoSaveMessage(null);
  }, [product.id]);

  // Ensure activePhotoIdx stays in bounds
  useEffect(() => {
    if (activePhotoIdx >= photos.length) {
      setActivePhotoIdx(Math.max(0, photos.length - 1));
    }
  }, [photos.length, activePhotoIdx]);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  // Manage Photos Handlers
  const handleOpenManagePhotos = () => {
    setEditablePhotos(photos);
    setPhotoSaveMessage(null);
    setIsManagePhotosOpen(true);
  };

  const handleManageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setEditablePhotos((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleAddLibraryPhoto = (path: string) => {
    if (!editablePhotos.includes(path)) {
      setEditablePhotos((prev) => [...prev, path]);
    }
  };

  const handleAddCustomUrl = () => {
    if (!customPhotoUrl.trim()) return;
    setEditablePhotos((prev) => [...prev, customPhotoUrl.trim()]);
    setCustomPhotoUrl('');
  };

  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return;
    setEditablePhotos((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  };

  const handleRemovePhoto = (index: number) => {
    if (editablePhotos.length <= 1) {
      alert('A product listing must contain at least one photo.');
      return;
    }
    setEditablePhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePhotoGallery = async () => {
    if (editablePhotos.length === 0) return;
    setSavingPhotos(true);
    setPhotoSaveMessage(null);
    try {
      const updated = await api.updateProduct(product.id, {
        images: editablePhotos,
        imageUrl: editablePhotos[0],
      });
      onProductUpdated(updated);
      setPhotoSaveMessage('Photos updated successfully!');
      setTimeout(() => {
        setIsManagePhotosOpen(false);
        setPhotoSaveMessage(null);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to update photos');
    } finally {
      setSavingPhotos(false);
    }
  };

  const totalCalculated = (offeredPrice || 0) * (requestedQuantity || 0);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setBidError(null);
    setBidSuccess(null);

    if (offeredPrice <= 0) {
      setBidError('Offered price must be greater than zero');
      return;
    }
    if (requestedQuantity <= 0) {
      setBidError('Quantity must be greater than zero');
      return;
    }
    if (requestedQuantity > product.availableQuantity) {
      setBidError(`Cannot exceed available stock of ${product.availableQuantity} ${product.quantityUnit}`);
      return;
    }

    setSubmittingBid(true);
    try {
      await api.createBid({
        productId: product.id,
        buyerId: currentUser.id,
        buyerName: currentUser.fullName,
        buyerLocation: `${currentUser.district}, ${currentUser.state}`,
        buyerPhone: currentUser.phone,
        offeredPrice: Number(offeredPrice),
        priceUnit: product.priceUnit,
        requestedQuantity: Number(requestedQuantity),
        quantityUnit: product.quantityUnit,
        message: bidMessage,
      });

      setBidSuccess('Bid submitted successfully! The farmer has been notified.');
      setBidMessage('');
      await fetchBids();
    } catch (err: any) {
      setBidError(err.message || 'Failed to submit bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bid: Bid) => {
    setActionLoadingId(bid.id);
    setActionSuccess(null);
    try {
      const res = await api.acceptBid(bid.id);
      setActionSuccess(`Offer accepted! Order #${res.order.orderNumber} generated.`);
      onProductUpdated(res.updatedProduct);
      await fetchBids();
    } catch (err: any) {
      alert(err.message || 'Error accepting bid');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    setActionLoadingId(bidId);
    try {
      await api.rejectBid(bidId);
      await fetchBids();
    } catch (err: any) {
      alert(err.message || 'Error rejecting bid');
    } finally {
      setActionLoadingId(null);
    }
  };

  const activePhotoUrl = photos[activePhotoIdx] || product.imageUrl;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
          
          {/* Modal Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/60 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Crop Listing #{product.id.slice(-6)}
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-xs text-stone-500 font-medium">Verified Agricultural Produce</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Crop Photography & Key Details (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* INTERACTIVE MULTI-PHOTO CAROUSEL */}
                <div className="space-y-2">
                  <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-xs group">
                    <img
                      src={activePhotoUrl}
                      alt={`${product.name} - Photo ${activePhotoIdx + 1}`}
                      className="w-full h-full object-cover transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Status & Organic Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                      <span className={`text-xs font-bold px-3 py-1 rounded shadow-xs text-white ${
                        isSoldOut ? 'bg-red-800' : 'bg-emerald-800'
                      }`}>
                        {product.status.replace(/_/g, ' ')}
                      </span>
                      {product.organic && (
                        <span className="bg-white/95 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded shadow-xs border border-emerald-200">
                          Organic Certified
                        </span>
                      )}
                    </div>

                    {/* Top Right: Photo Counter & Fullscreen Zoom button */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-md shadow-xs">
                        {activePhotoIdx + 1} / {photos.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsZoomOpen(true)}
                        title="View Fullscreen Photo"
                        className="p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white rounded-md transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Prev & Next Arrow Controls (visible when > 1 photo) */}
                    {photos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevPhoto}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer backdrop-blur-xs opacity-80 group-hover:opacity-100 z-10"
                          title="Previous Photo"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextPhoto}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer backdrop-blur-xs opacity-80 group-hover:opacity-100 z-10"
                          title="Next Photo"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* THUMBNAIL STRIP & PHOTO MANAGEMENT BAR */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {/* Thumbnail items */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-[calc(100%-140px)]">
                      {photos.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePhotoIdx(idx)}
                          className={`relative w-14 h-11 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            activePhotoIdx === idx
                              ? 'border-emerald-700 ring-2 ring-emerald-600/30 shadow-xs scale-102'
                              : 'border-stone-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-800 text-white text-[7px] font-bold text-center leading-tight">
                              Cover
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Manage & Add Photos Button */}
                    <button
                      type="button"
                      onClick={handleOpenManagePhotos}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:border-emerald-300 text-stone-800 hover:text-emerald-900 border border-stone-200 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                    >
                      <ImagePlus className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Manage Photos</span>
                    </button>
                  </div>
                </div>

                {/* INLINE MANAGE / ADD PHOTOS DRAWER */}
                {isManagePhotosOpen && (
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-emerald-800" />
                        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                          Manage & Add Photos ({editablePhotos.length} Total)
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsManagePhotosOpen(false)}
                        className="text-stone-400 hover:text-stone-700 p-1 rounded cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-600">
                      Add real harvest photos, arrange your primary cover photo, or upload files directly.
                    </p>

                    {photoSaveMessage && (
                      <div className="p-2 bg-emerald-100 text-emerald-900 text-xs rounded-lg flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>{photoSaveMessage}</span>
                      </div>
                    )}

                    {/* Source Tab Switcher */}
                    <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setPhotoSourceTab('upload')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                          photoSourceTab === 'upload' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-stone-600'
                        }`}
                      >
                        Upload Local File
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoSourceTab('library')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                          photoSourceTab === 'library' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-stone-600'
                        }`}
                      >
                        Crop Library
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoSourceTab('url')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                          photoSourceTab === 'url' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-stone-600'
                        }`}
                      >
                        Direct URL
                      </button>
                    </div>

                    {/* Option 1: File / Camera Upload */}
                    {photoSourceTab === 'upload' && (
                      <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                        <input
                          type="file"
                          ref={manageFileInputRef}
                          accept="image/*"
                          multiple
                          onChange={handleManageFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => manageFileInputRef.current?.click()}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Photos from Device or Camera</span>
                        </button>
                        <p className="text-[10px] text-stone-500 mt-1">Supports JPG, PNG, WEBP files</p>
                      </div>
                    )}

                    {/* Option 2: Curated Library */}
                    {photoSourceTab === 'library' && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-stone-200">
                        {curatedLibraryPhotos.map((item) => {
                          const isAlreadyAdded = editablePhotos.includes(item.path);
                          return (
                            <button
                              key={item.path}
                              type="button"
                              onClick={() => handleAddLibraryPhoto(item.path)}
                              disabled={isAlreadyAdded}
                              className={`relative aspect-4/3 rounded-lg overflow-hidden border text-left cursor-pointer transition-all ${
                                isAlreadyAdded ? 'opacity-40 border-stone-200 cursor-not-allowed' : 'border-stone-300 hover:border-emerald-700'
                              }`}
                            >
                              <img src={item.path} alt={item.label} className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] p-0.5 truncate text-center">
                                {item.label}
                              </span>
                              {!isAlreadyAdded && (
                                <span className="absolute top-1 right-1 bg-emerald-700 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                                  +
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Option 3: Direct URL */}
                    {photoSourceTab === 'url' && (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={customPhotoUrl}
                          onChange={(e) => setCustomPhotoUrl(e.target.value)}
                          placeholder="Paste image URL (https://...)"
                          className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-none bg-white focus:ring-1 focus:ring-emerald-700"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomUrl}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Add URL
                        </button>
                      </div>
                    )}

                    {/* Current Photos Grid with Reordering & Deletion */}
                    <div className="pt-2 border-t border-emerald-200">
                      <span className="text-[11px] font-semibold text-stone-700 block mb-1.5">
                        Gallery Order (first image is default cover photo):
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {editablePhotos.map((src, i) => (
                          <div
                            key={i}
                            className="relative aspect-4/3 rounded-lg overflow-hidden border border-stone-300 group bg-stone-100"
                          >
                            <img src={src} alt={`Pic ${i + 1}`} className="w-full h-full object-cover" />
                            {i === 0 ? (
                              <span className="absolute top-1 left-1 bg-emerald-800 text-white text-[8px] font-bold px-1 rounded shadow-2xs">
                                Cover
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetCoverPhoto(i)}
                                title="Set as Cover Photo"
                                className="absolute bottom-1 left-1 bg-black/80 hover:bg-black text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-0.5"
                              >
                                <Star className="w-2.5 h-2.5" /> Cover
                              </button>
                            )}

                            {editablePhotos.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(i)}
                                title="Remove Photo"
                                className="absolute top-1 right-1 p-0.5 bg-red-700 hover:bg-red-800 text-white rounded-full cursor-pointer shadow-xs"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsManagePhotosOpen(false)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePhotoGallery}
                        disabled={savingPhotos}
                        className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        {savingPhotos ? 'Saving Gallery...' : 'Save Photo Gallery'}
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Crop Name & Unboxed Meta */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                    <span>{product.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{product.variety}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-stone-700">{product.qualityGrade}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-stone-900 font-serif tracking-tight">
                    {product.name}
                  </h2>

                  <p className="mt-3 text-sm text-stone-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Technical Crop Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <div>
                    <span className="text-stone-500 block">Asking Price</span>
                    <span className="font-bold text-stone-900 font-mono text-sm">
                      ₹{product.askingPrice} <span className="font-normal text-[11px] text-stone-600">/{product.priceUnit.replace('per ', '')}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Available Inventory</span>
                    <span className="font-bold text-stone-900 font-mono text-sm">
                      {product.availableQuantity} <span className="font-normal text-[11px] text-stone-600">{product.quantityUnit}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Min. Order Lot</span>
                    <span className="font-semibold text-stone-800">
                      {product.minOrderQuantity} {product.quantityUnit}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Harvest Date</span>
                    <span className="font-medium text-stone-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {product.harvestDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Delivery Terms</span>
                    <span className="font-medium text-stone-800 flex items-center gap-1 mt-0.5">
                      <Truck className="w-3.5 h-3.5 text-stone-400" />
                      {product.deliveryOptions}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-500 block">Farmer Mandi Location</span>
                    <span className="font-medium text-stone-800 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {product.sellerLocation.district}, {product.sellerLocation.state}
                    </span>
                  </div>
                </div>

                {/* Seller Contact & Direct Message Box */}
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block">
                      Listed By Farmer / Producer
                    </span>
                    <h4 className="text-sm font-bold text-stone-900">
                      {product.sellerName}
                    </h4>
                    <p className="text-xs text-stone-600">
                      {product.sellerLocation.village}, {product.sellerLocation.district}
                    </p>
                  </div>

                  {currentUser?.id !== product.sellerId && (
                    <button
                      onClick={() => onOpenChat(product.sellerId, product.sellerName, product.id, product.name)}
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Contact Farmer</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Live Bidding System & Incoming Bids (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* If User is SELLER: Bidding Dashboard */}
                {isSellerOwner ? (
                  <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-stone-900 font-serif">
                        Incoming Buyer Offers ({bids.length})
                      </h3>
                      <span className="text-xs text-stone-500">
                        Seller Controls
                      </span>
                    </div>

                    {actionSuccess && (
                      <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{actionSuccess}</span>
                      </div>
                    )}

                    {loadingBids ? (
                      <p className="text-xs text-stone-500">Checking live bids...</p>
                    ) : bids.length === 0 ? (
                      <div className="text-center py-8 bg-stone-50 rounded-xl p-4">
                        <AlertCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-stone-700">No bids received yet</p>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Buyers exploring the marketplace can submit competitive bids directly here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {bids.map((bid) => {
                          const isPending = bid.status === 'PENDING';
                          const isAccepted = bid.status === 'ACCEPTED';
                          const isRejected = bid.status === 'REJECTED';

                          return (
                            <div
                              key={bid.id}
                              className={`p-3.5 rounded-xl border text-xs transition-all ${
                                isAccepted
                                  ? 'bg-emerald-50/60 border-emerald-300'
                                  : isRejected
                                  ? 'bg-stone-50/80 border-stone-200 opacity-60'
                                  : 'bg-white border-stone-200 hover:border-emerald-300 shadow-xs'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="font-bold text-stone-900 text-sm block">
                                    {bid.buyerName}
                                  </span>
                                  <span className="text-[11px] text-stone-500">
                                    {bid.buyerLocation}
                                  </span>
                                </div>

                                <div className="text-right">
                                  <span className="font-bold text-emerald-900 font-mono text-sm block">
                                    ₹{bid.offeredPrice}/{bid.priceUnit.replace('per ', '')}
                                  </span>
                                  <span className="text-[11px] text-stone-500">
                                    Qty: {bid.requestedQuantity} {bid.quantityUnit}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2 pt-2 border-t border-stone-100 flex justify-between items-center text-[11px]">
                                <span className="text-stone-500">
                                  Total Value: <strong className="text-stone-900 font-mono">₹{bid.totalAmount.toLocaleString('en-IN')}</strong>
                                </span>

                                <span className={`font-semibold uppercase tracking-wider text-[10px] ${
                                  isAccepted ? 'text-emerald-800' : isRejected ? 'text-red-700' : 'text-amber-800'
                                }`}>
                                  {bid.status}
                                </span>
                              </div>

                              {bid.message && (
                                <p className="mt-1.5 text-stone-600 bg-stone-50 p-2 rounded text-[11px] italic">
                                  "{bid.message}"
                                </p>
                              )}

                              {isPending && !isSoldOut && (
                                <div className="mt-3 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptBid(bid)}
                                    disabled={actionLoadingId === bid.id}
                                    className="flex-1 py-1.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    {actionLoadingId === bid.id ? 'Accepting...' : 'Accept Offer'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectBid(bid.id)}
                                    disabled={actionLoadingId === bid.id}
                                    className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* If User is BUYER (or guest): Live Bidding Panel */
                  <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-stone-900 font-serif">
                        Place Purchase Bid
                      </h3>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Submit your competitive offer to the farmer in real time.
                      </p>
                    </div>

                    {bidError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                        {bidError}
                      </div>
                    )}
                    {bidSuccess && (
                      <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{bidSuccess}</span>
                      </div>
                    )}

                    {isSoldOut ? (
                      <div className="p-4 bg-stone-100 rounded-xl text-center">
                        <p className="text-xs font-bold text-stone-700">This harvest lot is SOLD OUT</p>
                        <p className="text-[11px] text-stone-500 mt-1">
                          All inventory has been committed to accepted orders. Check similar crops in the marketplace.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handlePlaceBid} className="space-y-4">
                        {/* Offered Price */}
                        <div>
                          <div className="flex justify-between items-center mb-1 text-xs">
                            <label className="font-semibold text-stone-700">Proposed Price</label>
                            <span className="text-stone-500">Asking: ₹{product.askingPrice}/{product.priceUnit.replace('per ', '')}</span>
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-stone-400 font-semibold text-xs">₹</span>
                            <input
                              type="number"
                              step="0.5"
                              required
                              value={offeredPrice}
                              onChange={(e) => setOfferedPrice(Number(e.target.value))}
                              className="w-full pl-7 pr-16 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none font-mono font-bold"
                            />
                            <span className="absolute right-3 top-2.5 text-stone-400 text-xs">
                              /{product.priceUnit.replace('per ', '')}
                            </span>
                          </div>
                        </div>

                        {/* Requested Quantity */}
                        <div>
                          <div className="flex justify-between items-center mb-1 text-xs">
                            <label className="font-semibold text-stone-700">Purchase Quantity</label>
                            <span className="text-stone-500">Available: {product.availableQuantity} {product.quantityUnit}</span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              min={product.minOrderQuantity}
                              max={product.availableQuantity}
                              required
                              value={requestedQuantity}
                              onChange={(e) => setRequestedQuantity(Number(e.target.value))}
                              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none font-mono"
                            />
                            <span className="absolute right-3 top-2.5 text-stone-400 text-xs">
                              {product.quantityUnit}
                            </span>
                          </div>
                        </div>

                        {/* Total Calculation Strip */}
                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center text-xs">
                          <span className="text-stone-600 font-medium">Estimated Deal Total:</span>
                          <span className="text-base font-bold text-emerald-950 font-mono tabular-nums">
                            ₹{totalCalculated.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Delivery / Note */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Delivery Note / Trade Message (Optional)
                          </label>
                          <textarea
                            rows={2}
                            value={bidMessage}
                            onChange={(e) => setBidMessage(e.target.value)}
                            placeholder="e.g. Can pick up tomorrow with own transport. Payment on inspection."
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingBid}
                          className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          {submittingBid ? 'Submitting Offer...' : 'Submit Competing Bid'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    )}

                    {/* Competing offers visibility */}
                    <div className="mt-5 pt-4 border-t border-stone-100">
                      <span className="text-xs font-semibold text-stone-700 block mb-2">
                        Active Competing Offers ({bids.length})
                      </span>
                      {bids.length === 0 ? (
                        <p className="text-[11px] text-stone-400">Be the first to place an offer on this crop.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {bids.slice(0, 4).map((b) => (
                            <div key={b.id} className="flex justify-between items-center text-[11px] p-2 bg-stone-50 rounded-lg">
                              <span className="text-stone-600 truncate max-w-[140px]">{b.buyerName}</span>
                              <span className="font-mono font-semibold text-stone-900">
                                ₹{b.offeredPrice}/{b.priceUnit.replace('per ', '')} · {b.requestedQuantity} {b.quantityUnit}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN PHOTO ZOOM LIGHTBOX */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsZoomOpen(false)}
        >
          <div className="absolute top-4 inset-x-4 flex items-center justify-between text-white z-20">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base sm:text-lg">{product.name}</span>
              <span className="text-stone-400 text-xs">({activePhotoIdx + 1} of {photos.length})</span>
            </div>
            <button
              onClick={() => setIsZoomOpen(false)}
              className="p-2 bg-white/10 hover:bg-white/25 rounded-full text-white cursor-pointer transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative max-w-5xl max-h-[82vh] w-full flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={activePhotoUrl}
              alt={product.name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-20" onClick={(e) => e.stopPropagation()}>
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`w-12 h-9 rounded overflow-hidden border-2 cursor-pointer transition-all ${
                    activePhotoIdx === idx ? 'border-amber-400 scale-110 shadow-lg' : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
