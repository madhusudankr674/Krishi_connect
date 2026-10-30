import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { ProductListing, UserProfile, CropCategory, QualityGrade } from '../types';
import { X, Sprout, Image, CheckCircle2, Upload, Plus, Link, Trash2, Star, Camera } from 'lucide-react';

interface AddProduceModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  onClose: () => void;
  onProductCreated: (product: ProductListing) => void;
}

export const AddProduceModal: React.FC<AddProduceModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onProductCreated,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CropCategory>('Vegetables');
  const [description, setDescription] = useState('');
  const [variety, setVariety] = useState('');
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade A (Export / Premium)');
  const [askingPrice, setAskingPrice] = useState<string>('30');
  const [priceUnit, setPriceUnit] = useState<'per kg' | 'per quintal' | 'per tonne' | 'per crate'>('per kg');
  const [availableQuantity, setAvailableQuantity] = useState<string>('500');
  const [quantityUnit, setQuantityUnit] = useState<'kg' | 'quintals' | 'tonnes' | 'crates'>('kg');
  const [minOrderQuantity, setMinOrderQuantity] = useState<string>('50');
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableFrom, setAvailableFrom] = useState<string>('Ready for Immediate Dispatch');
  const [deliveryOptions, setDeliveryOptions] = useState<'Pickup only' | 'Seller delivery available' | 'Shared transport' | 'Negotiable'>('Seller delivery available');
  const [organic, setOrganic] = useState(false);

  // Multi-photo state
  const [selectedImages, setSelectedImages] = useState<string[]>([
    '/src/assets/images/crop_fresh_tomatoes_1793372793953.jpg',
  ]);
  const [photoSourceTab, setPhotoSourceTab] = useState<'library' | 'upload' | 'url'>('library');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Curated agricultural library photos
  const libraryPhotos = [
    { label: 'Fresh Tomatoes', category: 'Vegetables', path: '/src/assets/images/crop_fresh_tomatoes_1793372793953.jpg' },
    { label: 'Red Onions', category: 'Vegetables', path: '/src/assets/images/crop_red_onions_1793372793295.jpg' },
    { label: 'Kufri Jyoti Potatoes', category: 'Vegetables', path: '/src/assets/images/crop_fresh_potatoes_1793374728226.jpg' },
    { label: 'G4 Green Chillies', category: 'Vegetables', path: '/src/assets/images/crop_green_chillies_1793374728585.jpg' },
    { label: 'Grand Naine Bananas', category: 'Fruits', path: '/src/assets/images/crop_bananas_plantation_1793372793275.jpg' },
    { label: 'Alphonso Mangoes', category: 'Fruits', path: '/src/assets/images/crop_alphonso_mangoes_1793374729040.jpg' },
    { label: '1121 Basmati Paddy', category: 'Grains', path: '/src/assets/images/crop_basmati_rice_1793372794115.jpg' },
    { label: 'Sharbati Wheat', category: 'Grains', path: '/src/assets/images/crop_sharbati_wheat_1793374728243.jpg' },
    { label: 'Organic Raw Turmeric', category: 'Spices', path: '/src/assets/images/crop_raw_turmeric_1793374729137.jpg' },
  ];

  const handleToggleLibraryPhoto = (path: string) => {
    if (selectedImages.includes(path)) {
      if (selectedImages.length === 1) return; // Keep at least one photo
      setSelectedImages((prev) => prev.filter((p) => p !== path));
    } else {
      setSelectedImages((prev) => [...prev, path]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setSelectedImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setSelectedImages((prev) => [...prev, customUrlInput.trim()]);
    setCustomUrlInput('');
  };

  const handleRemovePhoto = (index: number) => {
    if (selectedImages.length === 1) return;
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setSelectedImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setError(null);
    setLoading(true);

    try {
      const finalImages = selectedImages.length > 0
        ? selectedImages
        : ['/src/assets/images/crop_fresh_tomatoes_1793372793953.jpg'];

      const newProduct = await api.createProduct({
        sellerId: currentUser.id,
        sellerName: currentUser.fullName,
        sellerPhone: currentUser.phone,
        sellerLocation: {
          state: currentUser.state,
          district: currentUser.district,
          village: currentUser.villageOrTown,
          lat: currentUser.latitude,
          lng: currentUser.longitude,
        },
        name,
        category,
        description,
        variety: variety || 'Standard Mandi Grade',
        qualityGrade,
        askingPrice: Number(askingPrice),
        priceUnit,
        availableQuantity: Number(availableQuantity),
        originalQuantity: Number(availableQuantity),
        quantityUnit,
        minOrderQuantity: Number(minOrderQuantity),
        harvestDate,
        availableFrom,
        deliveryOptions,
        organic,
        imageUrl: finalImages[0],
        images: finalImages,
      });

      onProductCreated(newProduct);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to list product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/60 shrink-0">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-800" />
            <h2 className="text-lg font-bold text-stone-900 font-serif">
              List New Agricultural Produce
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* MULTI-PHOTO GALLERY MANAGEMENT SECTION */}
          <div className="space-y-3 p-4 bg-stone-50/80 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-emerald-800" />
                  <span>Product Photos ({selectedImages.length} Attached)</span>
                </label>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Add multiple photos to showcase crop condition, crates, and harvest quality.
                </p>
              </div>

              {/* Photo Source Tabs */}
              <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPhotoSourceTab('library')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    photoSourceTab === 'library' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Crop Library
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoSourceTab('upload')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    photoSourceTab === 'upload' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoSourceTab('url')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    photoSourceTab === 'url' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Photo URL
                </button>
              </div>
            </div>

            {/* TAB 1: CURATED CROP PHOTO LIBRARY */}
            {photoSourceTab === 'library' && (
              <div>
                <p className="text-[11px] text-stone-600 mb-2 font-medium">
                  Click images below to add/remove them from your listing:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                  {libraryPhotos.map((img) => {
                    const isSelected = selectedImages.includes(img.path);
                    return (
                      <button
                        type="button"
                        key={img.path}
                        onClick={() => handleToggleLibraryPhoto(img.path)}
                        className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-700 ring-2 ring-emerald-600/30'
                            : 'border-stone-200 opacity-60 hover:opacity-100 hover:border-stone-300'
                        }`}
                      >
                        <img src={img.path} alt={img.label} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-stone-950/70 text-white text-[9px] p-0.5 text-center truncate">
                          {img.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: LOCAL FILE / CAMERA UPLOAD */}
            {photoSourceTab === 'upload' && (
              <div className="text-center py-4 px-3 border-2 border-dashed border-stone-300 rounded-xl bg-white">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Camera className="w-8 h-8 text-emerald-700 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-stone-800">
                  Upload Farm Crop Photographs
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Select JPG, PNG, or WEBP photos from your computer or phone camera.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2.5 px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photos</span>
                </button>
              </div>
            )}

            {/* TAB 3: CUSTOM URL */}
            {photoSourceTab === 'url' && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="Paste direct photo link (e.g. https://...)"
                  className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomUrl}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add URL</span>
                </button>
              </div>
            )}

            {/* ACTIVE SELECTED PHOTOS TRAY */}
            {selectedImages.length > 0 && (
              <div className="pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between mb-1.5 text-[11px] text-stone-500 font-medium">
                  <span>Selected Photos ({selectedImages.length}):</span>
                  <span className="text-[10px] text-stone-400">First photo is used as main listing cover</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedImages.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-16 rounded-lg overflow-hidden border border-stone-300 shrink-0 group bg-stone-100"
                    >
                      <img src={src} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      {idx === 0 ? (
                        <span className="absolute top-1 left-1 bg-emerald-800 text-white text-[8px] font-bold px-1 rounded shadow-xs">
                          Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          title="Set as Cover Photo"
                          className="absolute bottom-1 left-1 bg-black/70 hover:bg-black text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-0.5"
                        >
                          <Star className="w-2.5 h-2.5" /> Cover
                        </button>
                      )}

                      {selectedImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-red-700 hover:bg-red-800 text-white rounded-full cursor-pointer shadow-xs"
                          title="Remove Photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Crop Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fresh Red Hybrid Tomatoes"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none bg-white"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains & Cereals">Grains & Cereals</option>
                <option value="Pulses">Pulses</option>
                <option value="Spices">Spices</option>
                <option value="Oilseeds">Oilseeds</option>
              </select>
            </div>
          </div>

          {/* Variety & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Crop Variety</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. Abhinav Semi-Determinate"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Quality Grade</label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none bg-white"
              >
                <option value="Grade A (Export / Premium)">Grade A (Export / Premium)</option>
                <option value="Grade B (Standard Mandi)">Grade B (Standard Mandi)</option>
                <option value="Grade C (Processing)">Grade C (Processing)</option>
              </select>
            </div>
          </div>

          {/* Pricing & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Asking Price *</label>
              <div className="flex">
                <input
                  type="number"
                  step="0.5"
                  required
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  placeholder="30"
                  className="flex-1 px-3 py-2 text-xs border border-r-0 border-stone-300 rounded-l-lg outline-none font-mono"
                />
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value as any)}
                  className="px-2.5 py-2 text-xs border border-stone-300 rounded-r-lg bg-stone-50 outline-none"
                >
                  <option value="per kg">₹ / kg</option>
                  <option value="per quintal">₹ / quintal</option>
                  <option value="per tonne">₹ / tonne</option>
                  <option value="per crate">₹ / crate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Available Quantity *</label>
              <div className="flex">
                <input
                  type="number"
                  required
                  value={availableQuantity}
                  onChange={(e) => setAvailableQuantity(e.target.value)}
                  placeholder="500"
                  className="flex-1 px-3 py-2 text-xs border border-r-0 border-stone-300 rounded-l-lg outline-none font-mono"
                />
                <select
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value as any)}
                  className="px-2.5 py-2 text-xs border border-stone-300 rounded-r-lg bg-stone-50 outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="quintals">quintals</option>
                  <option value="tonnes">tonnes</option>
                  <option value="crates">crates</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Crop Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe ripening status, moisture, packing, and mandi transport readiness..."
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
            />
          </div>

          {/* Harvest Date & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Harvest Date</label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Delivery / Pickup Terms</label>
              <select
                value={deliveryOptions}
                onChange={(e) => setDeliveryOptions(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg outline-none bg-white"
              >
                <option value="Seller delivery available">Seller delivery available</option>
                <option value="Pickup only">Pickup only</option>
                <option value="Shared transport">Shared transport</option>
                <option value="Negotiable">Negotiable</option>
              </select>
            </div>
          </div>

          {/* Organic checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="organicCheck"
              checked={organic}
              onChange={(e) => setOrganic(e.target.checked)}
              className="w-4 h-4 text-emerald-800 rounded border-stone-300"
            />
            <label htmlFor="organicCheck" className="text-xs text-stone-700 font-medium">
              Naturally grown / Organic certified produce
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Publishing Produce...' : 'Publish Produce with Photos'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
