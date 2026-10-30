import React from 'react';
import { Notification } from '../types';
import { X, Bell, CheckCircle2, AlertCircle, ShoppingCart, MessageSquare, CheckCheck } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectEntity: (type: string, id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectEntity,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-stone-200 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-800" />
            <h3 className="text-sm font-bold text-stone-900 font-serif">
              Notifications ({notifications.filter((n) => !n.isRead).length} Unread)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              title="Mark all as read"
              className="text-xs text-emerald-800 hover:text-emerald-950 font-medium cursor-pointer flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isAccepted = notif.type === 'BID_ACCEPTED';
              const isReceived = notif.type === 'BID_RECEIVED';

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) onMarkAsRead(notif.id);
                    onSelectEntity(notif.relatedEntityType, notif.relatedEntityId);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                    notif.isRead
                      ? 'bg-white border-stone-100 text-stone-600'
                      : 'bg-emerald-50/50 border-emerald-200 text-stone-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold block leading-tight">
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-700 shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-2 text-[10px] text-stone-400 flex justify-between items-center">
                    <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="capitalize text-emerald-800 font-medium">View Details →</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
