import React from 'react';
import { Search, Sparkles, Download, CheckCircle2, Building2, MapPin, Zap, ArrowRight } from 'lucide-react';

export default function HeroSection({ onQuickSearch, onScrollToSearch }) {
  const quickSearches = [
    { location: 'Gorakhpur', type: 'Computer Institutes', icon: '💻' },
    { location: 'Chauri Chaura, Gorakhpur', type: 'Coaching Centers', icon: '📚' },
    { location: 'Gorakhpur', type: 'Clinics & Hospitals', icon: '🏥' },
    { location: 'Chauri Chaura', type: 'Computer Centers', icon: '🖥️' },
    { location: 'Gorakhpur', type: 'Retail & Electronics Shops', icon: '🛍️' },
  ];

  return (
    <div className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16">
      {/* Background Glowing Mesh Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/20 to-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-lg shadow-cyan-500/10 animate-float">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI-Powered Local Business Lead Generation</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 font-normal">Official API Standards</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Discover Verified Local Leads in{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
              Any City or Town
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Extract high-intent local businesses, institutes, clinics, and shops. 
            Export clean phone numbers & addresses directly to <span className="text-emerald-400 font-semibold">Excel & CSV</span>, and generate personalized sales pitches in 1-click.
          </p>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onScrollToSearch}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-200"
            >
              <Search className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>Start Business Search</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#results-area"
              onClick={onScrollToSearch}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-sm font-semibold transition-all hover:border-slate-600"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Demo Sheet</span>
            </a>
          </div>

          {/* Quick Filter Search Chips */}
          <div className="pt-4">
            <p className="text-xs font-medium text-slate-400 mb-2.5 flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Popular Local Searches (Click to quick-fill):</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {quickSearches.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onQuickSearch(item.location, item.type)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition-all duration-200 group"
                >
                  <span>{item.icon}</span>
                  <span className="font-semibold text-cyan-300">{item.type}</span>
                  <span className="text-slate-500">in</span>
                  <span className="text-slate-300 group-hover:text-cyan-200">{item.location}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-slate-800/60 max-w-4xl mx-auto">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-left">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Zero Scraping</span>
              </div>
              <p className="text-xs text-slate-400">100% compliant with official Places API data rules.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-left">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Excel & CSV</span>
              </div>
              <p className="text-xs text-slate-400">Formatted spreadsheets ready for your sales CRM.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-left">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Cold Pitch</span>
              </div>
              <p className="text-xs text-slate-400">Personalized WhatsApp and cold email outreach kits.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-left">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Built-in CRM</span>
              </div>
              <p className="text-xs text-slate-400">Track status from Contacted to Converted easily.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
