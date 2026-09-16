import React, { useEffect, useState } from 'react';
import { apiRequest } from '../context/AuthContext';
import { Cpu, ExternalLink, KeyRound, Lock, X } from 'lucide-react';

interface ApiKeyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyGuideModal: React.FC<ApiKeyGuideModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [keyConfigured, setKeyConfigured] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [keyNotice, setKeyNotice] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/settings/gemini')
      .then(res => res.json())
      .then(data => setKeyConfigured(Boolean(data.configured)))
      .catch(() => {});
  }, [isOpen]);

  const saveApiKey = async () => {
    setSavingKey(true);
    setKeyNotice('');
    try {
      const data = await apiRequest('/api/settings/gemini', {
        method: 'PUT',
        body: JSON.stringify({ apiKey })
      });
      setKeyConfigured(Boolean(data.configured));
      setApiKey('');
      setKeyNotice('Gemini key saved securely.');
    } catch (error: any) {
      setKeyNotice(error.message || 'Could not save the key.');
    } finally {
      setSavingKey(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-600/20 text-red-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white">Gemini API Key Guide</h2>
              <p className="text-xs text-slate-400">Set up Gemini AI features securely</p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto p-6 text-sm">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-bold text-white">Google Gemini API Key</h3>
              <span className="rounded border border-red-800 bg-red-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">Private</span>
            </div>

            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300">
              <p><strong>What it does:</strong> Powers the AI Customer Assistant, sales forecast engine, and voice search features using Gemini 3.5 Flash Lite.</p>

              <div className="flex items-start gap-2.5 rounded-lg border border-red-800/40 bg-red-950/30 p-3 text-red-300">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span><strong>Keep your key private:</strong> The key is used securely for Gemini features and is never displayed in the application interface.</span>
              </div>

              <div className="space-y-3 rounded-xl border border-red-900/50 bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-bold text-white">Add or replace your Gemini key</label>
                  <span className={keyConfigured ? 'text-[10px] font-bold text-emerald-400' : 'text-[10px] font-bold text-amber-400'}>{keyConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}</span>
                </div>
                <div className="flex gap-2">
                  <input value={apiKey} onChange={event => setApiKey(event.target.value)} type="password" placeholder="AIza..." className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-red-400" />
                  <button disabled={savingKey || !apiKey.trim()} onClick={saveApiKey} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{savingKey ? 'Saving…' : 'Save key'}</button>
                </div>
                {keyNotice && <p className="text-[11px] text-slate-300">{keyNotice}</p>}
                <p className="text-[11px] text-slate-400">Your key is handled securely and is not shown to other users.</p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1 text-slate-400">
                <span>Get your key from <strong>Google AI Studio</strong></span>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="flex items-center gap-1 font-semibold text-red-400 hover:text-red-300">
                  <span>Open Google AI Studio</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end border-t border-slate-800 bg-slate-950/90 px-6 py-4">
          <button onClick={onClose} className="cursor-pointer rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-slate-700">Close Guide</button>
        </div>
      </div>
    </div>
  );
};
