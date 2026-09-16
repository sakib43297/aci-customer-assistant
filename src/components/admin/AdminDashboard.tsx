import React, { useState, useEffect } from 'react';
import { Category, Product, Order } from '../../types';
import { 
  getStoredCategories, 
  getStoredProducts, 
  getStoredOrders, 
  STORE_EVENTS 
} from '../../utils/store';
import { AdminCategories } from './AdminCategories';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminSales } from './AdminSales';
import { AdminForecast } from './AdminForecast';
import { 
  FolderTree, 
  Package, 
  ShoppingBag, 
  ArrowLeft, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  BarChart3, 
  Clock, 
  ExternalLink,
  Store,
  Sparkles,
  KeyRound,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardProps {
  onSwitchToCustomerStore: () => void;
  onOpenCustomerTracker?: (order: Order) => void;
  onOpenApiKeyGuide?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onSwitchToCustomerStore,
  onOpenCustomerTracker,
  onOpenApiKeyGuide
}) => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'orders' | 'sales' | 'forecast'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load from store
  const refreshData = () => {
    setCategories(getStoredCategories());
    setProducts(getStoredProducts());
    setOrders(getStoredOrders());
  };

  useEffect(() => {
    refreshData();

    // Listen to custom store events
    const handleStoreChange = () => {
      refreshData();
    };

    window.addEventListener(STORE_EVENTS.CATEGORIES_UPDATED, handleStoreChange);
    window.addEventListener(STORE_EVENTS.PRODUCTS_UPDATED, handleStoreChange);
    window.addEventListener(STORE_EVENTS.ORDERS_UPDATED, handleStoreChange);

    return () => {
      window.removeEventListener(STORE_EVENTS.CATEGORIES_UPDATED, handleStoreChange);
      window.removeEventListener(STORE_EVENTS.PRODUCTS_UPDATED, handleStoreChange);
      window.removeEventListener(STORE_EVENTS.ORDERS_UPDATED, handleStoreChange);
    };
  }, []);

  // Compute metrics
  const totalSubcategories = categories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const totalSalesRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.totalPrice, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans" id="admin-dashboard-view">
      {/* Top Admin Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black text-lg text-white shadow-md">
              ACI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  ACI Customer Assistant Admin
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                  HQ Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Customer intelligence, sales operations, and AI-assisted planning
              </p>
            </div>
          </div>

          {/* Quick Actions, Identity & Switch to Customer Storefront */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            {onOpenApiKeyGuide && (
              <button
                onClick={onOpenApiKeyGuide}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Open detailed API Key & Environment Guide"
              >
                <KeyRound className="w-3.5 h-3.5 text-red-400" />
                <span>API Key Guide</span>
              </button>
            )}

            <button
              onClick={onSwitchToCustomerStore}
              className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer group"
              id="switch-to-store-btn"
            >
              <Store className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Customer Store</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-white truncate max-w-[140px]">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[10px] text-red-400 font-mono uppercase">
                    Admin Role
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 transition-all cursor-pointer"
                  title="Sign Out of Admin Portal"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 border-t border-slate-800/80 pt-1">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'categories'
                ? 'text-white border-red-500 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/30'
            }`}
            id="tab-admin-categories"
          >
            <FolderTree className="w-4 h-4 text-red-400" />
            <span>Categories & Subcategories</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'products'
                ? 'text-white border-red-500 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/30'
            }`}
            id="tab-admin-products"
          >
            <Package className="w-4 h-4 text-red-400" />
            <span>Product Catalog</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer relative ${
              activeTab === 'orders'
                ? 'text-white border-red-500 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/30'
            }`}
            id="tab-admin-orders"
          >
            <ShoppingBag className="w-4 h-4 text-red-400" />
            <span>Orders & Dispatch</span>
            {pendingOrdersCount > 0 ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold font-mono animate-pulse">
                {pendingOrdersCount} Pending
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'sales'
                ? 'text-white border-cyan-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/30'
            }`}
            id="tab-admin-sales"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Sales Intelligence</span>
          </button>

          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'forecast'
                ? 'text-white border-violet-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/30'
            }`}
            id="tab-admin-forecast"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>AI Forecast</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {/* KPI Snapshot Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Categories */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Taxonomies
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {categories.length} <span className="text-xs text-slate-400 font-normal">Categories</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                {totalSubcategories} dynamic subcategories
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Products */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Product Inventory
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {products.length} <span className="text-xs text-slate-400 font-normal">SKUs</span>
              </div>
              <div className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                <span>{products.filter(p => p.stockQuantity > 0).length} items in stock</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Orders Received */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Orders Received
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {orders.length} <span className="text-xs text-slate-400 font-normal">Orders</span>
              </div>
              <div className="text-xs text-amber-700 mt-1 font-semibold flex items-center gap-1">
                {pendingOrdersCount > 0 ? (
                  <span className="bg-amber-100 px-1.5 py-0.2 rounded">{pendingOrdersCount} awaiting review</span>
                ) : (
                  <span className="text-slate-500">All orders processed</span>
                )}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Gross Order Value */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Gross Order Volume
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                ৳{totalSalesRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                BDT from online portal
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'categories' && (
          <AdminCategories 
            categories={categories} 
            onRefresh={refreshData} 
          />
        )}

        {activeTab === 'products' && (
          <AdminProducts 
            products={products} 
            categories={categories} 
            onRefresh={refreshData} 
          />
        )}

        {activeTab === 'orders' && (
          <AdminOrders 
            orders={orders} 
            onRefresh={refreshData} 
            onOpenCustomerTracker={onOpenCustomerTracker}
          />
        )}

        {activeTab === 'sales' && <AdminSales />}

        {activeTab === 'forecast' && <AdminForecast />}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        ACI Customer Assistant • Enterprise B2B & Retail Distribution Portal • Sales ledger and forecast engine
      </footer>
    </div>
  );
};
