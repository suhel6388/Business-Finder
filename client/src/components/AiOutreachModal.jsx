import React, { useState } from 'react';
import { 
  Sparkles, X, Send, Copy, Check, MessageCircle, Mail, 
  ExternalLink, TrendingUp, AlertCircle, RefreshCw 
} from 'lucide-react';
import { aiApi } from '../services/api.js';
import confetti from 'canvas-confetti';

export default function AiOutreachModal({ isOpen, onClose, business }) {
  const [objective, setObjective] = useState('web_dev');
  const [senderName, setSenderName] = useState(() => {
    return localStorage.getItem('bizscout_sender_name') || 'Apex Digital Growth';
  });
  const [loading, setLoading] = useState(false);
  const [outreach, setOutreach] = useState(null);
  const [copiedType, setCopiedType] = useState(null);

  if (!isOpen || !business) return null;

  const handleGenerate = async () => {
    setLoading(true);
    localStorage.setItem('bizscout_sender_name', senderName);

    try {
      const res = await aiApi.generateOutreach({
        business,
        objective,
        senderName
      });
      if (res.success && res.outreach) {
        setOutreach(res.outreach);
        confetti({ particleCount: 35, spread: 45 });
      }
    } catch (err) {
      console.error('AI generation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const openWhatsApp = () => {
    if (!outreach?.whatsappMessage) return;
    const rawPhone = business.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(outreach.whatsappMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const openMailto = () => {
    if (!outreach) return;
    const subject = encodeURIComponent(outreach.emailSubject || 'Business inquiry');
    const body = encodeURIComponent(outreach.emailBody || '');
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700/80 shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-md">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Sales Outreach Kit</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Gemini Flash AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalized pitch for <span className="text-cyan-300 font-semibold">{business.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-5 py-4 pr-1">
          
          {/* Target Business Context Pill */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-400">Category: </span>
              <span className="text-slate-200 font-semibold">{business.category || 'Local Business'}</span>
            </div>
            <div>
              <span className="text-slate-400">Website: </span>
              <span className={business.website ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                {business.website ? 'Has Website' : 'No Website Detected (High Intent)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Phone: </span>
              <span className="text-slate-200 font-mono font-medium">{business.phone || 'Not Listed'}</span>
            </div>
          </div>

          {/* Goal / Objective Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Your Pitch Angle & Goal:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setObjective('web_dev')}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                  objective === 'web_dev'
                    ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-200 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white mb-0.5">🌐 Modern Website</div>
                <div className="text-[11px] text-slate-400">Pitch mobile site, portfolio & SEO</div>
              </button>

              <button
                type="button"
                onClick={() => setObjective('computer_students')}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                  objective === 'computer_students'
                    ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-200 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white mb-0.5">🎓 Student Marketing</div>
                <div className="text-[11px] text-slate-400">Admissions tie-up & course leads</div>
              </button>

              <button
                type="button"
                onClick={() => setObjective('general_growth')}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                  objective === 'general_growth'
                    ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-200 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white mb-0.5">📈 Local Growth</div>
                <div className="text-[11px] text-slate-400">WhatsApp automation & Maps boost</div>
              </button>
            </div>
          </div>

          {/* Sender Name */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Agency / Sender Name:
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Apex Tech Solutions"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div className="pt-5">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Pitch...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Generate Outreach</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Results Area */}
          {outreach && (
            <div className="space-y-4 pt-2 animate-in fade-in duration-300">
              
              {/* Opportunity & Lead Score Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-200">AI Lead Score:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      outreach.leadScore === 'Hot' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {outreach.leadScore || 'High Potential'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {outreach.opportunityAudit}
                  </p>
                </div>
              </div>

              {/* WhatsApp Script Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Pitch Script</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(outreach.whatsappMessage, 'whatsapp')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors"
                    >
                      {copiedType === 'whatsapp' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {business.phone && (
                      <button
                        onClick={openWhatsApp}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 font-sans whitespace-pre-line leading-relaxed">
                  {outreach.whatsappMessage}
                </div>
              </div>

              {/* Cold Email Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span>Cold Outreach Email</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(`Subject: ${outreach.emailSubject}\n\n${outreach.emailBody}`, 'email')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors"
                    >
                      {copiedType === 'email' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={openMailto}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[11px] font-bold transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Draft Email</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-200">
                  <div className="text-slate-400 font-semibold border-b border-slate-800 pb-1.5">
                    Subject: <span className="text-white">{outreach.emailSubject}</span>
                  </div>
                  <div className="whitespace-pre-line leading-relaxed text-slate-300">
                    {outreach.emailBody}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
