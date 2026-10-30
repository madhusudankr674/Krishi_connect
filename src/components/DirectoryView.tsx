import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserProfile } from '../types';
import { Users, Plus, Search, MapPin, Phone, Building, CheckCircle2, Sprout, ShoppingCart, ArrowRight, X } from 'lucide-react';

interface DirectoryViewProps {
  currentUser: UserProfile | null;
  onSwitchUser: (user: UserProfile) => void;
  isAddUserModalOpen: boolean;
  setIsAddUserModalOpen: (open: boolean) => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  currentUser,
  onSwitchUser,
  isAddUserModalOpen,
  setIsAddUserModalOpen,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<'all' | 'seller' | 'buyer'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add User Form State
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('+91 98');
  const [addRole, setAddRole] = useState<'seller' | 'buyer' | 'both'>('seller');
  const [addState, setAddState] = useState('Karnataka');
  const [addDistrict, setAddDistrict] = useState('Mysuru');
  const [addVillage, setAddVillage] = useState('');
  const [addBusinessName, setAddBusinessName] = useState('');
  const [addCommodities, setAddCommodities] = useState('Tomatoes, Onions');
  const [addFarmSize, setAddFarmSize] = useState('10');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers(roleFilter === 'all' ? undefined : roleFilter, searchQuery);
      setUsers(data);
    } catch (err) {
      console.error('Error fetching directory users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchQuery]);

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(null);

    try {
      const commoditiesList = addCommodities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.addUser({
        fullName: addName,
        email: addEmail,
        phone: addPhone,
        role: addRole,
        state: addState,
        district: addDistrict,
        villageOrTown: addVillage || 'Mandi Yard',
        businessName: addBusinessName || `${addName} Agro Enterprise`,
        commoditiesHandled: commoditiesList,
        farmSizeAcres: addRole === 'buyer' ? undefined : addFarmSize,
      });

      setAddSuccess(`User "${res.user.fullName}" added successfully!`);
      // Reset form
      setAddName('');
      setAddEmail('');
      setAddPhone('+91 98');
      setAddVillage('');
      setAddBusinessName('');
      await fetchUsers();

      setTimeout(() => {
        setIsAddUserModalOpen(false);
        setAddSuccess(null);
      }, 1400);
    } catch (err: any) {
      setAddError(err.message || 'Failed to add user');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Onboard CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-serif">
            Sellers & Buyers Directory
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Registered farmers, agricultural producer organizations, and wholesale mandi buyers.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Seller or Buyer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Interactive Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Accounts ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('seller')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              roleFilter === 'seller'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>Farmers / Sellers</span>
          </button>
          <button
            onClick={() => setRoleFilter('buyer')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              roleFilter === 'buyer'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />
            <span>Traders / Buyers</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, district, or crop..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
          />
        </div>
      </div>

      {/* User Directory Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-stone-200 animate-pulse h-48" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">No users match your criteria</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or click "Onboard New Seller or Buyer" to register new agricultural participants.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((user) => {
            const isSeller = user.roles.includes('seller');
            const isBuyer = user.roles.includes('buyer');
            const isCurrent = currentUser?.id === user.id;

            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all shadow-xs hover:shadow-md p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Role & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      {isSeller && isBuyer ? (
                        <span className="font-semibold text-purple-800">Producer & Trader</span>
                      ) : isSeller ? (
                        <span className="font-semibold text-emerald-800 flex items-center gap-1">
                          <Sprout className="w-3.5 h-3.5" /> Farmer / Seller
                        </span>
                      ) : (
                        <span className="font-semibold text-amber-800 flex items-center gap-1">
                          <ShoppingCart className="w-3.5 h-3.5" /> Trader / Buyer
                        </span>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-400">Verified</span>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        Active Account
                      </span>
                    )}
                  </div>

                  {/* Name and Entity */}
                  <h3 className="text-base font-bold text-stone-900 tracking-tight">
                    {user.fullName}
                  </h3>
                  {user.businessName && (
                    <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{user.businessName}</span>
                    </p>
                  )}

                  {/* Location & Contact info */}
                  <div className="mt-3 space-y-1 text-xs text-stone-600">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{user.villageOrTown}, {user.district}, {user.state}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-mono text-[11px] text-stone-500">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{user.phone}</span>
                    </p>
                  </div>

                  {/* Commodities or Farm Details */}
                  {user.commoditiesHandled && user.commoditiesHandled.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <span className="text-[11px] font-semibold text-stone-500 block mb-1">
                        Commodities Handled:
                      </span>
                      <p className="text-xs text-stone-800">
                        {user.commoditiesHandled.join(' · ')}
                      </p>
                    </div>
                  )}

                  {user.farmSizeAcres && (
                    <p className="text-[11px] text-stone-500 mt-1">
                      Cultivated Holding: <span className="font-semibold text-stone-800">{user.farmSizeAcres} Acres</span>
                    </p>
                  )}
                </div>

                {/* Footer action: Switch to this user for testing */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-mono">
                    ID: {user.id.slice(0, 10)}
                  </span>
                  {!isCurrent ? (
                    <button
                      onClick={() => onSwitchUser(user)}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Simulate Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-medium">Logged In</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ONBOARD NEW SELLER OR BUYER */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-800" />
                <h2 className="text-lg font-bold text-stone-900 font-serif">
                  Onboard New Seller or Buyer
                </h2>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {addError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {addError}
                </div>
              )}
              {addSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{addSuccess}</span>
                </div>
              )}

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Select User Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddRole('seller')}
                    className={`py-2 px-3 text-center rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      addRole === 'seller'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Farmer / Seller
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddRole('buyer')}
                    className={`py-2 px-3 text-center rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      addRole === 'buyer'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Trader / Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddRole('both')}
                    className={`py-2 px-3 text-center rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      addRole === 'both'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Both Roles
                  </button>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Mahadev Patil"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="e.g. mahadev@krishiconnect.in"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>
              </div>

              {/* Phone & Business/Farm Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="+91 98450 11223"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {addRole === 'buyer' ? 'Trading Entity / Company' : 'Farm / Producer Name'}
                  </label>
                  <input
                    type="text"
                    value={addBusinessName}
                    onChange={(e) => setAddBusinessName(e.target.value)}
                    placeholder="e.g. Patil Organic Farms"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
                  <select
                    value={addState}
                    onChange={(e) => setAddState(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={addDistrict}
                    onChange={(e) => setAddDistrict(e.target.value)}
                    placeholder="e.g. Mandya"
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Village / APMC</label>
                  <input
                    type="text"
                    value={addVillage}
                    onChange={(e) => setAddVillage(e.target.value)}
                    placeholder="e.g. Maddur"
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Commodities & Farm Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Commodities Handled (comma separated)
                  </label>
                  <input
                    type="text"
                    value={addCommodities}
                    onChange={(e) => setAddCommodities(e.target.value)}
                    placeholder="e.g. Tomatoes, Bananas, Onions"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>

                {addRole !== 'buyer' ? (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Farm Land Holding (Acres)
                    </label>
                    <input
                      type="number"
                      value={addFarmSize}
                      onChange={(e) => setAddFarmSize(e.target.value)}
                      placeholder="e.g. 12"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Default Trade Password
                    </label>
                    <input
                      type="text"
                      disabled
                      value="password123 (Ready to login)"
                      className="w-full px-3 py-2 text-xs border border-stone-200 bg-stone-50 rounded-lg text-stone-500"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {addLoading ? 'Onboarding...' : 'Save & Register in Directory'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
