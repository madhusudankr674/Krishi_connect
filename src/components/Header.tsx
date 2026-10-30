import React from 'react';
import { UserProfile } from '../types';
import { LANGUAGES, LanguageCode, TRANSLATIONS } from '../translations';
import { Sprout, Bell, Globe, User, LogOut, ArrowLeftRight, PlusCircle, Users } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  onOpenAddProduce: () => void;
  onOpenAddUser: () => void;
  onLogout: () => void;
  onSwitchRole: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  unreadCount,
  onOpenNotifications,
  onOpenAuth,
  onOpenAddProduce,
  onOpenAddUser,
  onLogout,
  onSwitchRole,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isBoth = currentUser?.roles.includes('seller') && currentUser?.roles.includes('buyer');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          
          {/* Zone 1: Brand Wordmark (Single text element with logo) */}
          <button
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
              <Sprout className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="leading-tight">
              <span className="text-xl font-bold tracking-tight text-emerald-950 font-serif block">
                {t.appName}
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === 'marketplace' ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800' : 'hover:text-stone-900'
              }`}
            >
              {t.marketplace}
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'directory' ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800' : 'hover:text-stone-900'
              }`}
            >
              <Users className="w-4 h-4 text-stone-400" />
              <span>{t.directory}</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === 'map' ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800' : 'hover:text-stone-900'
              }`}
            >
              {t.nearbyMap}
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                activeTab === 'insights' ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800' : 'hover:text-stone-900'
              }`}
            >
              {t.marketInsights}
            </button>
            {currentUser && (
              <button
                onClick={() => setActiveTab('orders')}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                  activeTab === 'orders' ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800' : 'hover:text-stone-900'
                }`}
              >
                {t.orders}
              </button>
            )}
          </nav>

          {/* Zone 3: Actions & Auth Zone */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Selector */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 rounded-md hover:bg-stone-200 transition-colors cursor-pointer"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                <span className="uppercase">{language}</span>
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-lg shadow-lg border border-stone-200 py-1 hidden group-hover:block z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer hover:bg-emerald-50 ${
                      language === lang.code ? 'font-semibold text-emerald-800 bg-emerald-50/50' : 'text-stone-700'
                    }`}
                  >
                    {lang.nativeName} ({lang.name})
                  </button>
                ))}
              </div>
            </div>

            {/* Quick action: Add Produce or Add Buyer/Seller */}
            {currentUser ? (
              <>
                {currentUser.activeRole === 'seller' ? (
                  <button
                    onClick={onOpenAddProduce}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t.addProduce}</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAddUser}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-stone-500" />
                    <span>{t.addBuyerSeller}</span>
                  </button>
                )}

                {/* Notifications Bell */}
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-amber-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* User Role Switcher & Menu */}
                <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                  {isBoth && (
                    <button
                      onClick={onSwitchRole}
                      title={`Currently viewing as ${currentUser.activeRole}. Click to toggle.`}
                      className="px-2 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      <span className="capitalize">{currentUser.activeRole}</span>
                    </button>
                  )}

                  <div className="hidden lg:block text-right leading-none">
                    <span className="text-xs font-semibold text-stone-900 block truncate max-w-[120px]">
                      {currentUser.fullName}
                    </span>
                    <span className="text-[11px] text-stone-500 capitalize">
                      {currentUser.activeRole} · {currentUser.district}
                    </span>
                  </div>

                  <button
                    onClick={onLogout}
                    title="Log Out"
                    className="p-1.5 text-stone-500 hover:text-red-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
                >
                  {t.login}
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {t.register}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
