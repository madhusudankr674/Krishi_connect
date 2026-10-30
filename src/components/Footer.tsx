import React from 'react';
import { Sprout, ShieldCheck, PhoneCall, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                <Sprout className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="text-lg font-bold text-white font-serif tracking-tight">
                Krishi Connect
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              From Farm to Market. Direct connections, transparent bidding, and real-time agricultural mandi trade.
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-1">
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                <span>support@krishiconnect.in</span>
              </p>
              <p className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                <span>Kisan Helpline: 1800-180-1551</span>
              </p>
            </div>
          </div>

          {/* Marketplace Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Fresh Vegetables</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Commercial Fruits</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Grains & Paddy Cereals</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Pulses & Oilseeds</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Organic Harvest Lots</span></li>
            </ul>
          </div>

          {/* Trade Guidelines */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Trade Guidelines
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Farmer Seller Code of Conduct</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Wholesale Buyer Settlement Terms</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Produce Quality Grading Standards</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Dispute Resolution Procedure</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Agmarknet Verification Criteria</span></li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Transparency & Legal
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">APMC Yard Safety Compliance</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Fair Price Assurance</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 Krishi Connect. Dedicated to agricultural prosperity and direct farm trade across India.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Verified Mandi Exchange</span>
            <span aria-hidden="true">·</span>
            <span>Zero Brokerage Markups</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
