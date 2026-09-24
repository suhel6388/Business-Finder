import React, { useState } from 'react';
import { Sparkles, MessageCircle, Mail, Copy, Check, ExternalLink, Send, ArrowRight, Building, Wand2 } from 'lucide-react';
import { aiApi } from '../services/api.js';
import confetti from 'canvas-confetti';

export default function AiStudio({ leads = [], onSelectLeadForPitch }) {
  const [customBizName, setCustomBizName] = useState('');
  const [customCategory, setCustomCategory] = useState('Computer Institute');
  const [customAddress, setCustomAddress] = useState('Gorakhpur');
  const [customPhone, setCustomPhone] = useState('+91 98390 12345');
  const [hasWebsite, setHasWebsite] = useState(false);
  const [objective, setObjective] = useState('web_dev');
  const [senderName, setSenderName] = useState(() => localStorage.getItem('bizscout_sender_name') || 'Apex Agency');
  const [outreach, setOutreach] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedType, setCopiedType] = useState(null);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!customBizName.trim()) return;

    setLoading(true);
    localStorage.setItem('bizscout_sender_name', senderName);

    try {
      const res = await aiApi.generateOutreach({
        business: {
          name: customBizName.trim(),
          category: customCategory,
          address: customAddress,
          phone: customPhone,
          website: hasWebsite ? 'https://example.com' : '',
          rating: 4.6,
          reviewCount: 48
        },
        objective,
        senderName
      });

      if (res.success && res.outreach) {
        setOutreach(res.outreach);
        confetti({ particleCount: 40, spread: 50 });
      }
    } catch (err) {
      console.error(err);
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
    const cleanPhone = customPhone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(outreach.whatsappMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-2 pb-12">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">AI Outreach Studio</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Powered by Gemini Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate hyper-personalized WhatsApp messages and cold email sequences tailored to any local business.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Generator Input Form & Output Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Quick Select from Saved Leads */}
          {leads.length > 0 && (
            <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Pick from Saved Leads:
              </label>
              <select
                onChange={(e) => {
                  const selectedLead = leads.find(l => String(l.id) === e.target.value);
                  if (selectedLead?.business) {
                    setCustomBizName(selectedLead.business.name || '');
                    setCustomCategory(selectedLead.business.category || 'Computer Institute');
                    setCustomAddress(selectedLead.business.address || '');
                    setCustomPhone(selectedLead.business.phone || '');
                    setHasWebsite(Boolean(selectedLead.business.website));
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">-- Or choose a saved lead --</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.business?.name} ({l.business?.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Business Details Form */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Business Profile</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Computer Institute"
                  value={customBizName}
                  onChange={(e) => setCustomBizName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category:</label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City / Town:</label>
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">WhatsApp / Phone:</label>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasWebsite}
                    onChange={(e) => setHasWebsite(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500"
                  />
                  <span>Already has an existing website</span>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-semibold mb-1.5">Outreach Objective:</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'web_dev', label: 'Pitch Professional Website & SEO', desc: 'Best for local businesses without modern site' },
                    { id: 'computer_students', label: 'Student Admissions Tie-up', desc: 'Direct students to institute batches' },
                    { id: 'general_growth', label: 'Local Lead Gen & Maps Ranking', desc: 'Google profile & review boost' },
                  ].map(opt => (
                    <label
                      key={opt.id}
                      onClick={() => setObjective(opt.id)}
                      className={`block p-2 rounded-lg border cursor-pointer transition-all ${
                        objective === opt.id
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">{opt.label}</div>
                      <div className="text-[10px] text-slate-400">{opt.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-slate-300 font-semibold mb-1">Your Agency / Name:</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !customBizName.trim()}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Wand2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Outreach with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Generate Outreach Kit</span>
                  </>
                )}
              </button>

            </div>
          </div>

        </div>

        {/* Right Column: Output Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {outreach ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Audit Card */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20">
                <div className="flex items-center gap-2 mb-1 text-xs">
                  <span className="font-bold text-slate-300">Lead Score:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {outreach.leadScore || 'Hot Lead'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {outreach.opportunityAudit}
                </p>
              </div>

              {/* WhatsApp Card */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Pitch Script</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(outreach.whatsappMessage, 'whatsapp')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
                    >
                      {copiedType === 'whatsapp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'whatsapp' ? 'Copied' : 'Copy'}</span>
                    </button>
                    {customPhone && (
                      <button
                        onClick={openWhatsApp}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Send on WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                  {outreach.whatsappMessage}
                </div>
              </div>

              {/* Email Card */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span>Cold Email Sequence</span>
                  </div>
                  <button
                    onClick={() => handleCopy(`Subject: ${outreach.emailSubject}\n\n${outreach.emailBody}`, 'email')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
                  >
                    {copiedType === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'email' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-200">
                  <div className="text-slate-400 font-semibold pb-2 border-b border-slate-800">
                    Subject: <span className="text-white font-medium">{outreach.emailSubject}</span>
                  </div>
                  <div className="whitespace-pre-line leading-relaxed text-slate-300 pt-1">
                    {outreach.emailBody}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center space-y-3 min-h-[380px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Wand2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">AI Pitch Generator Ready</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Enter a business name on the left or select any business from your saved leads to create instant customized cold outreach scripts!
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
