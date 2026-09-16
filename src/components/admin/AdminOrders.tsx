import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, CartItem } from '../../types';
import { updateOrderStatusInStore } from '../../utils/store';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Check, 
  X, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  CreditCard, 
  Calendar, 
  FileText, 
  ChevronRight, 
  User, 
  Package, 
  Sparkles,
  ShieldCheck,
  Send,
  Eye,
  RefreshCw,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface AdminOrdersProps {
  orders: Order[];
  onRefresh: () => void;
  onOpenCustomerTracker?: (order: Order) => void;
}

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; border: string; icon: any }> = {
  'Pending': { 
    label: 'Pending Review', 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    border: 'border-amber-200', 
    icon: Clock 
  },
  'Confirmed': { 
    label: 'Confirmed', 
    bg: 'bg-blue-50', 
    text: 'text-blue-700', 
    border: 'border-blue-200', 
    icon: CheckCircle2 
  },
  'Processing': { 
    label: 'Processing / Packed', 
    bg: 'bg-indigo-50', 
    text: 'text-indigo-700', 
    border: 'border-indigo-200', 
    icon: Package 
  },
  'Shipped': { 
    label: 'Shipped / In Transit', 
    bg: 'bg-purple-50', 
    text: 'text-purple-700', 
    border: 'border-purple-200', 
    icon: Truck 
  },
  'In Transit': { 
    label: 'In Transit', 
    bg: 'bg-purple-50', 
    text: 'text-purple-700', 
    border: 'border-purple-200', 
    icon: Truck 
  },
  'Delivered': { 
    label: 'Delivered', 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700', 
    border: 'border-emerald-200', 
    icon: ShieldCheck 
  },
  'Cancelled': { 
    label: 'Cancelled', 
    bg: 'bg-rose-50', 
    text: 'text-rose-700', 
    border: 'border-rose-200', 
    icon: XCircle 
  }
};

export const AdminOrders: React.FC<AdminOrdersProps> = ({ 
  orders, 
  onRefresh,
  onOpenCustomerTracker
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Status transition note state
  const [statusNote, setStatusNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        ord.id.toLowerCase().includes(q) ||
        (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
        (ord.businessName && ord.businessName.toLowerCase().includes(q)) ||
        (ord.customerPhone && ord.customerPhone.includes(q)) ||
        (ord.shippingAddress && ord.shippingAddress.toLowerCase().includes(q));

      let matchesStatus = true;
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'Shipped') {
          matchesStatus = ord.status === 'Shipped' || ord.status === 'In Transit';
        } else {
          matchesStatus = ord.status === statusFilter;
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Handler to update status
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = updateOrderStatusInStore(orderId, newStatus, statusNote.trim() || undefined);
    if (updated) {
      showToast(`Order #${orderId} status updated to "${newStatus}"! Reflected on customer tracking.`);
      setStatusNote('');
      // Update currently selected modal view
      setSelectedOrder(updated);
      onRefresh();
    }
  };

  // Download Invoice PDF
  const handleDownloadInvoice = (order: Order) => {
    generateInvoicePDF(order, order.customerName || order.businessName || 'ACI Valued Customer');
    showToast(`PDF Invoice generated for Order #${order.id}`);
  };

  // Status counts for pills
  const statusCounts = useMemo(() => {
    const counts = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      confirmed: orders.filter(o => o.status === 'Confirmed').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped' || o.status === 'In Transit').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length
    };
    return counts;
  }, [orders]);

  return (
    <div className="space-y-6" id="admin-orders-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-red-500/30 fixed bottom-6 right-6 z-50 animate-bounce">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Control Header & Stats */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-red-50 text-red-600 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Orders & Dispatch Management</h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time feed of customer orders. Update order statuses to automatically sync customer delivery tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Quick Status Pill Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-slate-400">All Orders</div>
          <div className="text-xl font-extrabold mt-0.5">{statusCounts.total}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Pending')}
          className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
            statusFilter === 'Pending'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white hover:bg-amber-50/40 text-slate-700 border-slate-200'
          }`}
        >
          <div className="text-[10px] uppercase font-bold flex items-center justify-between text-amber-600">
            <span>Pending</span>
            {statusCounts.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </div>
          <div className="text-xl font-extrabold mt-0.5 text-amber-800">{statusCounts.pending}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Confirmed')}
          className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
            statusFilter === 'Confirmed'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white hover:bg-blue-50/40 text-slate-700 border-slate-200'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-blue-600">Confirmed</div>
          <div className="text-xl font-extrabold mt-0.5 text-blue-800">{statusCounts.confirmed}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Processing')}
          className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
            statusFilter === 'Processing'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white hover:bg-indigo-50/40 text-slate-700 border-slate-200'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-indigo-600">Processing</div>
          <div className="text-xl font-extrabold mt-0.5 text-indigo-800">{statusCounts.processing}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Shipped')}
          className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
            statusFilter === 'Shipped'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-white hover:bg-purple-50/40 text-slate-700 border-slate-200'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-purple-600">Shipped</div>
          <div className="text-xl font-extrabold mt-0.5 text-purple-800">{statusCounts.shipped}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Delivered')}
          className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
            statusFilter === 'Delivered'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white hover:bg-emerald-50/40 text-slate-700 border-slate-200'
          }`}
        >
          <div className="text-[10px] uppercase font-bold text-emerald-600">Delivered</div>
          <div className="text-xl font-extrabold mt-0.5 text-emerald-800">{statusCounts.delivered}</div>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID (ORD-...), Customer, Phone, or Business..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500 whitespace-nowrap">
          Found <strong className="text-slate-800">{filteredOrders.length}</strong> orders
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer & Business</th>
                <th className="py-3.5 px-4">Ordered Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment & Method</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 text-right">Quick Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">No orders found.</p>
                    <p className="text-xs text-slate-400 mt-1">Orders placed by customers in the shop will appear here instantly.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const statusConf = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG['Pending'];
                  const StatusIcon = statusConf.icon;

                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">
                          {order.id}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{order.date}</span>
                        </div>
                      </td>

                      {/* Customer & Business */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-bold text-slate-800">
                            {order.customerName || order.retailerName || order.businessName || 'Retail Customer'}
                          </div>
                          {order.businessName && order.businessName !== order.customerName && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              {order.businessName}
                            </div>
                          )}
                          {order.customerPhone && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {order.customerPhone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Ordered Items summary */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-700">
                            {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {order.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          ৳{order.totalPrice.toLocaleString()}
                        </div>
                        {order.deliveryCharge !== undefined && (
                          <div className="text-[10px] text-slate-400 font-medium">
                            Incl. ৳{order.deliveryCharge} delivery
                          </div>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {order.paymentMethod || 'bKash'}
                          </span>
                          <div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              order.paymentStatus === 'Paid' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {order.paymentStatus || (order.paymentMethod === 'COD' ? 'Due on Delivery' : 'Paid')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Current Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{order.status}</span>
                        </span>
                      </td>

                      {/* Quick Action Button */}
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-xl transition-all border border-slate-200 cursor-pointer"
                        >
                          Manage Order
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL & STATUS DISPATCH MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-xl text-white">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base tracking-tight font-mono">
                      Order #{selectedOrder.id}
                    </h3>
                    {(() => {
                      const conf = ORDER_STATUS_CONFIG[selectedOrder.status] || ORDER_STATUS_CONFIG['Pending'];
                      return (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${conf.bg} ${conf.text} border ${conf.border}`}>
                          {selectedOrder.status}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Placed: {selectedOrder.date} • {selectedOrder.division}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  className="px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Generate Official PDF Invoice"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin">
              {/* STATUS UPDATE ACTION PANEL (HIGHLIGHTED REQUIREMENT) */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-600" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Update Order Status & Dispatch
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Current: <strong className="text-slate-900">{selectedOrder.status}</strong>
                  </span>
                </div>

                {/* Status Transition Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Pending')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedOrder.status === 'Pending'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white hover:bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    Pending
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Confirmed')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedOrder.status === 'Confirmed'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    Confirm
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Processing')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedOrder.status === 'Processing'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    Processing
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Shipped')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedOrder.status === 'Shipped' || selectedOrder.status === 'In Transit'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    Shipped
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Delivered')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedOrder.status === 'Delivered'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    Delivered
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Cancelled')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedOrder.status === 'Cancelled'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    Cancel
                  </button>
                </div>

                {/* Optional Status Audit Note */}
                <div className="pt-2">
                  <input
                    type="text"
                    placeholder="Add an optional dispatch remark (e.g. Cleared at Tejgaon hub / Delivered by rider #4)..."
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              {/* Customer & Shipping Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Information */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    <User className="w-4 h-4 text-red-500" />
                    Customer Details
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 font-medium">Customer: </span>
                      <strong className="text-slate-800">{selectedOrder.customerName || selectedOrder.retailerName || 'Valued Retailer'}</strong>
                    </div>
                    {selectedOrder.businessName && (
                      <div>
                        <span className="text-slate-400 font-medium">Business Shop: </span>
                        <span className="font-semibold text-slate-700">{selectedOrder.businessName}</span>
                        {selectedOrder.businessType && (
                          <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium uppercase">
                            {selectedOrder.businessType}
                          </span>
                        )}
                      </div>
                    )}
                    {selectedOrder.customerPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-bold text-slate-700">{selectedOrder.customerPhone}</span>
                      </div>
                    )}
                    {selectedOrder.customerEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedOrder.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping & Delivery Location */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-red-500" />
                    Delivery Destination
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 font-medium">Address: </span>
                      <span className="font-medium text-slate-800">
                        {selectedOrder.shippingAddress || 'Store Pick-up Location, Dhaka'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Delivery Zone: </span>
                      <span className="font-semibold text-slate-700">
                        {selectedOrder.deliveryLocation === 'inside' ? 'Inside Dhaka City (৳100)' :
                         selectedOrder.deliveryLocation === 'outside' ? 'Outside Dhaka District (৳200)' :
                         selectedOrder.deliveryLocation || 'Corporate Point (Free)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Payment: <strong>{selectedOrder.paymentMethod || 'bKash'}</strong> ({selectedOrder.paymentStatus || 'Confirmed'})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ordered Products Breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Ordered Products List ({selectedOrder.items.length})
                </h4>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">Quantity</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items.map((item, idx) => {
                        const effectivePrice = item.product.discountPrice || item.product.price;
                        const lineTotal = effectivePrice * item.quantity;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={item.product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200'}
                                  alt={item.product.name}
                                  className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <div className="font-bold text-slate-800">{item.product.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {item.product.sku || item.product.id} • {item.product.unit || 'unit'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700">
                              ৳{effectivePrice.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                              {item.quantity}
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                              ৳{lineTotal.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Price Totals Footer */}
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col items-end gap-1 text-xs">
                    <div className="flex justify-between w-48 text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-slate-800">
                        ৳{(selectedOrder.subtotalPrice || (selectedOrder.totalPrice - (selectedOrder.deliveryCharge || 0))).toLocaleString()}
                      </span>
                    </div>
                    {selectedOrder.deliveryCharge !== undefined && (
                      <div className="flex justify-between w-48 text-slate-500">
                        <span>Delivery Fee:</span>
                        <span className="font-semibold text-slate-800">
                          ৳{selectedOrder.deliveryCharge.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between w-48 text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                      <span>Grand Total:</span>
                      <span className="text-red-600">৳{selectedOrder.totalPrice.toLocaleString()} BDT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Audit History Timeline */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Order Status History Audit
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    {selectedOrder.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{h.status}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{h.timestamp}</span>
                          </div>
                          {h.note && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{h.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {onOpenCustomerTracker && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenCustomerTracker(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-red-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Customer GPS Tracker View</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all ml-auto cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
