import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Message, UserProfile } from '../types';
import { X, Send, MessageSquare, Sprout } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  receiverId: string;
  receiverName: string;
  productId?: string;
  productName?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  receiverId,
  receiverName,
  productId,
  productName,
}) => {
  if (!isOpen || !currentUser) return null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const conversationId = [currentUser.id, receiverId].sort().join('_');

  const fetchMessages = async () => {
    try {
      const data = await api.getMessages({ conversationId: `conv_${conversationId}` });
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    try {
      await api.sendMessage({
        senderId: currentUser.id,
        senderName: currentUser.fullName,
        receiverId,
        text: inputText.trim(),
        productId,
        productName,
      });
      setInputText('');
      await fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[520px]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50/70">
          <div>
            <span className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider block">
              Direct Farmer & Buyer Trade Chat
            </span>
            <h3 className="text-sm font-bold text-stone-900 leading-tight">
              {receiverName}
            </h3>
            {productName && (
              <span className="text-[11px] text-stone-500 truncate block max-w-xs">
                Ref: {productName}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/30">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No messages yet. Send a trade inquiry.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === currentUser.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMine
                        ? 'bg-emerald-800 text-white rounded-br-none'
                        : 'bg-white border border-stone-200 text-stone-900 rounded-bl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-stone-200 bg-white flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message regarding crop lot..."
            className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="p-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
