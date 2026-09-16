import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, Database, RefreshCw, TrendingUp, ShoppingBag } from 'lucide-react';
import { apiRequest } from '../../context/AuthContext';

interface SalesProduct {
  productId: string;
  productName: string;
  division?: string;
  category?: string;
  unitsSold: number;
  revenue: number;
  orderCount: number;
  lastSoldAt: string;
}

interface SalesHistoryItem {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName?: string;
  customerEmail?: string;
  orderStatus: string;
  soldAt: string;
}

interface SalesResponse {
  summary: {
    days: number;
    totals: { unitsSold: number; revenue: number; orderCount: number };
    products: SalesProduct[];
    daily: { date: string; unitsSold: number; revenue: number; orderCount: number }[];
  };
  history: SalesHistoryItem[];
}

const money = (value: number) => `৳${Number(value || 0).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`;

export const AdminSales: React.FC = () => {
  const [data, setData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSales = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiRequest('/api/admin/sales?days=7');
      setData(payload);
    } catch (err: any) {
      setError(err.message || 'Could not load sales data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSales(); }, []);

  const maxDailyUnits = useMemo(() => Math.max(...(data?.summary.daily || []).map(item => Number(item.unitsSold)), 1), [data]);
  const totals = data?.summary.totals || { unitsSold: 0, revenue: 0, orderCount: 0 };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl shadow-indigo-950/15">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-200">
              <BarChart3 className="h-3.5 w-3.5" /> Sales intelligence
            </div>
            <h2 className="text-2xl font-black tracking-tight md:text-3xl">Sales performance</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Every order line is retained in the sales ledger. This view aggregates the last 7 days while preserving the complete historical record below.</p>
          </div>
          <button onClick={loadSales} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/15" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh data
          </button>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Units sold · 7 days', value: totals.unitsSold.toLocaleString(), icon: ShoppingBag, tone: 'indigo' },
          { label: 'Sales value · 7 days', value: money(totals.revenue), icon: TrendingUp, tone: 'emerald' },
          { label: 'Orders represented', value: totals.orderCount.toLocaleString(), icon: CalendarDays, tone: 'amber' }
        ].map(card => {
          const Icon = card.icon;
          const toneClass = card.tone === 'indigo' ? 'bg-indigo-50 text-indigo-600' : card.tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600';
          return <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}><Icon className="h-5 w-5" /></div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{card.label}</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{card.value}</p>
          </div>;
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><h3 className="text-base font-black text-slate-900">Top products · last 7 days</h3><p className="mt-1 text-xs text-slate-500">Quantities are aggregated across every customer order.</p></div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-700">{data?.summary.products.length || 0} products</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400"><th className="pb-3">Product</th><th className="pb-3">Units</th><th className="pb-3">Orders</th><th className="pb-3 text-right">Revenue</th></tr></thead>
              <tbody>{loading ? <tr><td colSpan={4} className="py-10 text-center text-slate-400">Loading sales ledger…</td></tr> : (data?.summary.products || []).map(product => <tr key={product.productId} className="border-b border-slate-50 last:border-0">
                <td className="py-3 pr-4"><div className="font-bold text-slate-800">{product.productName}</div><div className="mt-0.5 text-[10px] text-slate-400">{product.category || 'Catalog item'}</div></td>
                <td className="py-3 font-black text-indigo-700">{Number(product.unitsSold).toLocaleString()}</td>
                <td className="py-3 text-slate-500">{product.orderCount}</td>
                <td className="py-3 text-right font-bold text-slate-800">{money(product.revenue)}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5"><h3 className="text-base font-black text-slate-900">Daily sales pulse</h3><p className="mt-1 text-xs text-slate-500">A quick view of unit volume by selling date.</p></div>
          <div className="space-y-4">{(data?.summary.daily || []).length === 0 ? <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400">No sales recorded in the selected window.</div> : data?.summary.daily.map(day => <div key={day.date}>
            <div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-bold text-slate-600">{new Date(`${day.date}T00:00:00`).toLocaleDateString()}</span><span className="font-black text-slate-900">{day.unitsSold} units · {money(day.revenue)}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${Math.max(5, (Number(day.unitsSold) / maxDailyUnits) * 100)}%` }} /></div>
          </div>)}</div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3"><div><h3 className="text-base font-black text-slate-900">Historical sales ledger</h3><p className="mt-1 text-xs text-slate-500">Persisted records across all dates, not just the 7-day aggregation window.</p></div><div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-600"><Database className="h-3.5 w-3.5" /> {data?.history.length || 0} retained lines</div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400"><th className="pb-3">Sold at</th><th className="pb-3">Product</th><th className="pb-3">Order</th><th className="pb-3">Customer</th><th className="pb-3">Status</th><th className="pb-3 text-right">Value</th></tr></thead><tbody>{(data?.history || []).map(item => <tr key={item.id} className="border-b border-slate-50 last:border-0"><td className="py-3 text-slate-500">{new Date(item.soldAt).toLocaleString()}</td><td className="py-3 font-bold text-slate-800">{item.productName}<div className="text-[10px] font-normal text-slate-400">{item.quantity} units</div></td><td className="py-3 font-mono text-[10px] text-slate-500">{item.orderId}</td><td className="py-3 text-slate-600">{item.customerName || item.customerEmail || 'Guest buyer'}</td><td className="py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.orderStatus === 'Cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{item.orderStatus}</span></td><td className="py-3 text-right font-black text-slate-800">{money(item.totalAmount)}</td></tr>)}</tbody></table>{!loading && (data?.history || []).length === 0 && <div className="p-10 text-center text-sm text-slate-400">No sales lines have been stored yet.</div>}</div>
      </section>
    </div>
  );
};
