import React, { useState, useEffect } from 'react';
import { MarketPriceRecord } from '../types';
import { api } from '../services/api';
import { TrendingUp, TrendingDown, Minus, Info, CheckCircle2, BarChart3, Building } from 'lucide-react';

export const MarketInsightsView: React.FC = () => {
  const [insights, setInsights] = useState<MarketPriceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const data = await api.getMarketInsights();
        setInsights(data);
      } catch (err) {
        console.error('Error fetching market insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Agmarknet & e-NAM Synchronized Price Feeds</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif tracking-tight">
          Mandi Market Prices & Regional Trade Indices
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
          Official daily modal prices reported across key APMC agriculture yards. Use these benchmarks to negotiate competitive bids and determine optimal harvest timing.
        </p>
      </div>

      {/* Benchmark Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-stone-200 animate-pulse h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {insights.map((item) => {
            const isUp = item.trend === 'up';
            const isDown = item.trend === 'down';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
                        {item.state} · {item.district}
                      </span>
                      <h3 className="text-lg font-bold text-stone-900 font-serif tracking-tight">
                        {item.cropName}
                      </h3>
                    </div>

                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold font-mono ${
                      isUp ? 'bg-emerald-50 text-emerald-800' : isDown ? 'bg-red-50 text-red-800' : 'bg-stone-50 text-stone-700'
                    }`}>
                      {isUp && <TrendingUp className="w-3.5 h-3.5" />}
                      {isDown && <TrendingDown className="w-3.5 h-3.5" />}
                      {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
                      <span>{item.changePercent > 0 ? `+${item.changePercent}%` : `${item.changePercent}%`}</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 flex items-center gap-1.5 mb-4">
                    <Building className="w-3.5 h-3.5 text-stone-400" />
                    <span>{item.market}</span>
                  </p>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500 font-medium">Modal Mandi Price:</span>
                      <span className="font-bold text-stone-900 font-mono text-base tabular-nums">
                        ₹{item.modalPrice} <span className="text-xs font-normal text-stone-600">{item.unit}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-stone-500 pt-1 border-t border-stone-200/50">
                      <span>Daily Price Spread:</span>
                      <span className="font-mono text-stone-700">
                        ₹{item.minPrice} — ₹{item.maxPrice} {item.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center text-[10px] text-stone-400">
                  <span>Reported: {item.date}</span>
                  <span>Source: Agmarknet API</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Advisory Note */}
      <div className="mt-8 p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Mandi Pricing Transparency Notice</p>
          <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
            Modal prices reflect the weighted average of actual trades conducted at agricultural produce market committee (APMC) auction yards on the stated date. Actual farmgate offers negotiated on Krishi Connect may vary based on transport assistance, lot quantity, and produce quality grades.
          </p>
        </div>
      </div>
    </div>
  );
};
