import React, { useState, useEffect } from 'react';
import { Order, UserProfile, OrderStatus } from '../types';
import { api } from '../services/api';
import { Package, Truck, CheckCircle, Clock, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

interface OrdersViewProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ currentUser, onOpenAuth }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const isSeller = currentUser.activeRole === 'seller';
      const data = await api.getOrders({
        sellerId: isSeller ? currentUser.id : undefined,
        buyerId: !isSeller ? currentUser.id : undefined,
      });
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser?.id, currentUser?.activeRole]);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-stone-800">Please Sign In to Access Orders</h2>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          Log in with your farmer or buyer account to view active transactions and order tracking.
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-4 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  const isSeller = currentUser.activeRole === 'seller';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif tracking-tight">
            {isSeller ? 'Farm Orders & Sales Fulfillment' : 'Purchased Produce & Order Tracking'}
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Confirmed trade agreements resulting from accepted marketplace bids.
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Viewing as {isSeller ? 'Seller / Farmer' : 'Buyer / Trader'}
        </span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-stone-200 animate-pulse h-32" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No Orders Found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {isSeller
              ? 'When you accept an incoming bid on your crops, the confirmed order will appear here.'
              : 'Browse the marketplace, place bids on produce, and accepted deals will generate orders here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isCompleted = order.status === 'COMPLETED';
            const isDelivered = order.status === 'DELIVERED';
            const isInTransit = order.status === 'IN_TRANSIT';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 transition-all p-5 sm:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.productImageUrl}
                      alt={order.productName}
                      className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0"
                    />
                    <div>
                      <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
                        Order #{order.orderNumber}
                      </span>
                      <h3 className="text-base font-bold text-stone-900 tracking-tight">
                        {order.productName}
                      </h3>
                      <p className="text-xs text-stone-600">
                        {isSeller ? `Buyer: ${order.buyerName}` : `Farmer: ${order.sellerName}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[11px] text-stone-500 block">Agreed Trade Total</span>
                      <span className="text-lg font-bold font-mono text-emerald-950 tabular-nums">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-stone-500 block font-mono">
                        ({order.quantity} {order.quantityUnit} @ ₹{order.agreedUnitPrice}/{order.priceUnit.replace('per ', '')})
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-stone-500 block">Status</span>
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-900'
                          : isDelivered
                          ? 'bg-blue-100 text-blue-900'
                          : isInTransit
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-100 text-stone-800'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logistics & Address details */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-stone-400" />
                      <span>{order.deliveryMethod}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{order.deliveryAddress}</span>
                    </span>
                  </div>

                  {/* Seller Workflow Next Status Action */}
                  {isSeller && !isCompleted && (
                    <div className="flex items-center gap-2">
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          disabled={updatingId === order.id}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Mark as Preparing
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'IN_TRANSIT')}
                          disabled={updatingId === order.id}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Dispatch / In Transit
                        </button>
                      )}
                      {order.status === 'IN_TRANSIT' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          disabled={updatingId === order.id}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Confirm Delivered
                        </button>
                      )}
                      {order.status === 'DELIVERED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                          disabled={updatingId === order.id}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Close Deal / Completed</span>
                        </button>
                      )}
                    </div>
                  )}

                  {!isSeller && !isCompleted && order.status === 'DELIVERED' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                      disabled={updatingId === order.id}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Acknowledge Receipt & Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
