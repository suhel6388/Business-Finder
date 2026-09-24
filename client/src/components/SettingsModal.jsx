import React, { useState, useEffect } from 'react';
import { Settings, X, Key, Shield, Sparkles, ExternalLink, Save, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [googleKey, setGoogleKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [defaultRadius, setDefaultRadius] = useState('10');
  const [defaultLimit, setDefaultLimit] = useState('20');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('bizscout_settings') || '{}');
      if (stored.googleApiKey) setGoogleKey(stored.googleApiKey);
      if (stored.geminiApiKey) setGeminiKey(stored.geminiApiKey);
      if (stored.defaultRadius) setDefaultRadius(String(stored.defaultRadius));
      if (stored.defaultLimit) setDefaultLimit(String(stored.defaultLimit));
    } catch (e) {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const newSettings = {
      googleApiKey: googleKey.trim(),
      geminiApiKey: geminiKey.trim(),
      defaultRadius: Number(defaultRadius),
      defaultLimit: Number(defaultLimit)
    };
    localStorage.setItem('bizscout_settings', JSON.stringify(newSettings));
    setSavedSuccess(true);
    confetti({ particleCount: 30, spread: 40 });
    setTimeout(() => {
      setSavedSuccess(false);
      if (onSettingsUpdated) onSettingsUpdated(newSettings);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700/80 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System & API Settings</h3>
              <p className="text-xs text-slate-400">Configure provider keys and default search parameters</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5 pt-4">
          
          {/* Notice about built-in zero-config provider */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero-Config Fallback Active by Default</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              BizScout includes an automatic local data synthesizer & OpenStreetMap engine, so searches for places like 
              <span className="font-semibold text-white"> Gorakhpur</span> or <span className="font-semibold text-white">Chauri Chaura</span> work immediately even without an API key!
            </p>
          </div>

          {/* Google Places API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Places API Key (Optional)</span>
              </label>
              <a
                href="https://console.cloud.google.com/google/maps-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Get $200 Free Credit Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              When provided, searches will query Google Places live data and place details.
            </p>
          </div>

          {/* Gemini AI API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Gemini Free API Key (Optional)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Get Free AI Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Power the AI Outreach generator with Gemini 1.5 Flash. If blank, the built-in smart template engine is used.
            </p>
          </div>

          {/* Defaults */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Radius (km):
              </label>
              <select
                value={defaultRadius}
                onChange={(e) => setDefaultRadius(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="5">5 km</option>
                <option value="10">10 km (Recommended)</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Results Limit:
              </label>
              <select
                value={defaultLimit}
                onChange={(e) => setDefaultLimit(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="10">10 results</option>
                <option value="20">20 results</option>
                <option value="30">30 results</option>
                <option value="50">50 results</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
