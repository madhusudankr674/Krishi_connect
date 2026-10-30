import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { Bot, Send, X, MapPin, ExternalLink, Sparkles, Sprout, Loader2, Minimize2, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  mapsSources?: { title: string; uri: string }[];
  timestamp: string;
}

export const KisanAIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'model',
      text: 'Namaste! I am your Krishi AI Advisor powered by Gemini. Ask me about crop varieties (such as Abhinav Hybrid Tomatoes, Pusa 1121 Basmati, Fursungi Onions), current APMC mandi prices, or finding nearby agricultural markets and cold storage facilities.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Request browser geolocation for Maps Grounding
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Default to Central Karnataka coordinates if location permission denied
          setUserLocation({ lat: 13.0, lng: 77.0 });
        }
      );
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Map history for Gemini API payload
      const payload = newHistory.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await api.askGeminiAdvisor(payload, userLocation);

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: res.text,
        mapsSources: res.mapsSources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        text: 'Unable to reach Gemini Advisor at this moment. Please verify your GEMINI_API_KEY in the Settings > Secrets panel.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const starterQuestions = [
    'Compare Abhinav vs Desi tomato varieties for long transport',
    'Find nearest APMC Mandi and warehouses near Mysuru',
    'What is the current mandi price benchmark for Pusa 1121 Basmati?',
    'Best storage practices for Fursungi Red Onions',
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-emerald-800 hover:bg-emerald-900 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2 border-2 border-emerald-400/40 transition-all cursor-pointer hover:scale-105"
          aria-label="Open Krishi AI Advisor"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline text-xs font-bold tracking-wide">
            Krishi AI Advisor
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[560px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-950 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                <Sprout className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold">Krishi AI Advisor</h3>
                  <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.2 rounded font-mono">
                    Gemini 3.8
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/80">
                  Maps Grounded · Crop Variety & Mandi Intelligence
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scrollable Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/40">
            {messages.map((m) => {
              const isUser = m.role === 'user';

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-emerald-800 text-white rounded-br-xs'
                        : 'bg-white border border-stone-200 text-stone-900 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Google Maps Grounding Sources */}
                    {m.mapsSources && m.mapsSources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-700" />
                          <span>Google Maps Grounded Locations:</span>
                        </span>
                        <div className="space-y-1">
                          {m.mapsSources.map((source, idx) => (
                            <a
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between gap-2 p-1.5 bg-stone-50 hover:bg-emerald-50 rounded-lg border border-stone-200 text-[11px] text-emerald-950 hover:text-emerald-900 font-medium transition-colors"
                            >
                              <span className="truncate">{source.title}</span>
                              <ExternalLink className="w-3 h-3 text-stone-400 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-stone-500 p-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                <span>Consulting Gemini & Mandi Maps...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starters */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-stone-100/70 border-t border-stone-200 flex gap-1.5 overflow-x-auto text-[11px]">
              {starterQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-950 rounded-lg border border-stone-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crop varieties, mandi rates, APMC yards..."
              className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
