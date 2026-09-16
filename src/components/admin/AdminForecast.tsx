import React, { useEffect, useState } from 'react';
import { BrainCircuit, CalendarRange, RefreshCw, Sparkles, Target, TriangleAlert } from 'lucide-react';
import { apiRequest } from '../../context/AuthContext';

interface ForecastPayload {
  model: string;
  generatedAt: string;
  usedFallback: boolean;
  forecast: string;
  context: {
    historyCount: number;
    totals: { unitsSold: number; revenue: number; orderCount: number };
    topProducts: { productId: string; productName: string; unitsSold: number; revenue: number }[];
  };
}

export const AdminForecast: React.FC = () => {
  const [data, setData] = useState<ForecastPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateForecast = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiRequest('/api/admin/forecast', { method: 'POST', body: JSON.stringify({ days: 7 }) });
      setData(payload);
    } catch (err: any) {
      setError(err.message || 'Could not generate the forecast.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generateForecast(); }, []);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-950 to-cyan-950 p-6 text-white shadow-xl shadow-indigo-950/20">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100"><BrainCircuit className="h-3.5 w-3.5" /> AI forecast engine</div>
            <h2 className="text-2xl font-black tracking-tight md:text-3xl">Demand outlook</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Gemini reviews the last 7 days of persisted sales lines and turns them into a practical replenishment brief for the admin team.</p>
          </div>
          <button onClick={generateForecast} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Generating…' : 'Regenerate forecast'}</button>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><CalendarRange className="h-5 w-5" /></div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Analysis window</p><p className="mt-1 text-2xl font-black text-slate-900">7 days</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600"><Target className="h-5 w-5" /></div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sales lines retained</p><p className="mt-1 text-2xl font-black text-slate-900">{data?.context.historyCount ?? '—'}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Sparkles className="h-5 w-5" /></div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Forecast model</p><p className="mt-1 text-lg font-black text-slate-900">Gemini 3.5 Flash Lite</p></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-base font-black text-slate-900">Forecast brief</h3><p className="mt-1 text-xs text-slate-500">Generated {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'when requested'}</p></div>{data?.usedFallback && <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700"><TriangleAlert className="h-3.5 w-3.5" /> API key needed for Gemini</span>}</div>
          <div className="min-h-[260px] whitespace-pre-wrap rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-cyan-50/60 p-5 text-sm leading-7 text-slate-700">{loading ? <div className="flex h-52 items-center justify-center text-slate-400">Reading sales history and preparing the forecast…</div> : data?.forecast || 'No forecast available yet.'}</div>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500"><BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" /> Forecasts are advisory and based only on persisted order-line data. Validate stock, seasonality, promotions, and supply constraints before making purchasing decisions.</div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-base font-black text-slate-900">Products to watch</h3><p className="mt-1 text-xs text-slate-500">Highest unit demand in the analysis window.</p><div className="mt-5 space-y-4">{(data?.context.topProducts || []).slice(0, 6).map((product, index) => <div key={product.productId} className="flex items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-black text-indigo-700">{index + 1}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{product.productName}</p><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${Math.max(8, Math.min(100, (Number(product.unitsSold) / Math.max(1, Number(data?.context.topProducts?.[0]?.unitsSold || 1))) * 100))}%` }} /></div></div><span className="text-xs font-black text-slate-700">{product.unitsSold}</span></div>)}{!loading && (data?.context.topProducts || []).length === 0 && <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">No sales data is available for forecasting yet.</div>}</div></section>
      </div>
    </div>
  );
};
