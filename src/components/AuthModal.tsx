import React, { useState } from 'react';
import { api } from '../services/api';
import { UserProfile } from '../types';
import { X, Lock, Mail, User, Phone, MapPin, Building, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'seller' | 'buyer' | 'both'>('seller');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Mysuru');
  const [villageOrTown, setVillageOrTown] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(loginEmail, loginPassword);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(email, 'password123');
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!agreeTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        fullName,
        email: regEmail,
        password: regPassword,
        phone,
        role,
        state,
        district,
        villageOrTown,
        businessName,
      });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-emerald-950 font-serif">Krishi Connect Auth</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-stone-200 px-6 bg-stone-50/30">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
              mode === 'login' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
              mode === 'register' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Register New Account
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* LOGIN VIEW */}
          {mode === 'login' && (
            <div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. ramesh@krishiconnect.in"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-stone-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-emerald-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-10 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Marketplace'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Instant Test Accounts Bar */}
              <div className="mt-6 pt-5 border-t border-stone-200">
                <p className="text-xs font-semibold text-stone-600 mb-2.5">
                  1-Click Test Accounts (Simulate Buyer & Seller roles):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ramesh@krishiconnect.in')}
                    className="text-left p-2.5 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-emerald-950 block">Ramesh Gowda</span>
                    <span className="text-[11px] text-emerald-800">Farmer / Seller · Mysuru, KA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('greenbazaar@trade.in')}
                    className="text-left p-2.5 border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-amber-950 block">Vikram Mehta</span>
                    <span className="text-[11px] text-amber-800">Trader / Buyer · Bengaluru, KA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('gurpreet@krishiconnect.in')}
                    className="text-left p-2.5 border border-stone-200 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-stone-900 block">Gurpreet Singh</span>
                    <span className="text-[11px] text-stone-600">Paddy Farmer · Punjab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('anita@krishifarm.in')}
                    className="text-left p-2.5 border border-stone-200 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-stone-900 block">Anita Sharma</span>
                    <span className="text-[11px] text-stone-600">Producer & Buyer (Both) · Pune</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REGISTER VIEW */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Suresh Patel"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@krishiconnect.in"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>
              </div>

              {/* Account Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Select Your Primary Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`p-2.5 text-center rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      role === 'seller' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Farmer / Seller
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`p-2.5 text-center rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      role === 'buyer' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Buyer / Trader
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('both')}
                    className={`p-2.5 text-center rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      role === 'both' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Both Roles
                  </button>
                </div>
              </div>

              {/* Location details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
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
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Mysuru"
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Village / APMC</label>
                  <input
                    type="text"
                    value={villageOrTown}
                    onChange={(e) => setVillageOrTown(e.target.value)}
                    placeholder="e.g. Maddur"
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Farm / Business Entity Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Patel Organic Agro"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-700"
                />
                <label htmlFor="agreeTerms" className="text-xs text-stone-600 leading-relaxed">
                  I agree to fair mandi trade terms, transparent bidding rules, and verified harvest guidelines.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {forgotSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-sm">
                  <p className="font-semibold mb-1">Reset instructions sent!</p>
                  <p className="text-xs text-emerald-800">
                    If an account matches that email, a password reset link has been dispatched. (For development, test accounts use <code className="bg-emerald-100 px-1 py-0.5 rounded">password123</code>).
                  </p>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setForgotSuccess(false); }}
                    className="mt-3 text-xs font-semibold text-emerald-900 hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-xs text-stone-600">
                    Enter your registered email address to receive password reset guidance.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh@krishiconnect.in"
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
