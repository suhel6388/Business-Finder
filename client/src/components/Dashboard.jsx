import React from 'react';
import { 
  BarChart3, Users, Search, CheckCircle2, TrendingUp, 
  ArrowRight, Clock, MapPin, Briefcase, Zap, ShieldCheck 
} from 'lucide-react';

export default function Dashboard({ stats, searchHistory = [], onReRunSearch }) {
  const safeStats = stats || {
    totalSearches: 0,
    totalBusinessesFound: 0,
    savedLeads: 0,
    contactedLeads: 0,
    interestedLeads: 0,
    convertedLeads: 0,
    statusBreakdown: { New: 0, Contacted: 0, Interested: 0, 'Follow-up': 0, Converted: 0, 'Not interested': 0 }
  };

  const conversionRate = safeStats.savedLeads > 0 
    ? ((safeStats.convertedLeads / safeStats.savedLeads) * 100).toFixed(1) 
    : '0.0';

  const kpis = [
    {
      title: 'Total Searches',
      value: safeStats.totalSearches || searchHistory.length,
      icon: Search,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    },
    {
      title: 'Businesses Found',
      value: safeStats.totalBusinessesFound || (searchHistory.length * 15),
      icon: Briefcase,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      title: 'Saved Leads in CRM',
      value: safeStats.savedLeads,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      title: 'Active Outreach',
      value: safeStats.contactedLeads + (safeStats.interestedLeads || 0),
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      title: 'Converted Clients',
      value: safeStats.convertedLeads,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      suffix: `(${conversionRate}% rate)`
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-2 pb-12">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>Analytics & Pipeline Overview</span>
        </h2>
        <p className="text-xs text-slate-400">
          Track your local lead discovery activity, pipeline status, and recent geographic queries.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{kpi.title}</span>
                <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color} border ${kpi.border}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white">{kpi.value}</span>
                {kpi.suffix && (
                  <span className="text-[10px] font-semibold text-emerald-400">{kpi.suffix}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column: Pipeline Breakdown + Recent Searches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pipeline Breakdown */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Lead Status Pipeline</span>
            </h3>
            <span className="text-xs text-slate-400">{safeStats.savedLeads} total saved leads</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'New', count: safeStats.statusBreakdown?.New || 0, color: 'bg-blue-500' },
              { label: 'Contacted', count: safeStats.statusBreakdown?.Contacted || 0, color: 'bg-amber-500' },
              { label: 'Interested', count: safeStats.statusBreakdown?.Interested || 0, color: 'bg-cyan-500' },
              { label: 'Follow-up', count: safeStats.statusBreakdown?.['Follow-up'] || 0, color: 'bg-purple-500' },
              { label: 'Converted', count: safeStats.statusBreakdown?.Converted || 0, color: 'bg-emerald-500' },
              { label: 'Not interested', count: safeStats.statusBreakdown?.['Not interested'] || 0, color: 'bg-slate-600' },
            ].map((item, idx) => {
              const pct = safeStats.savedLeads > 0 ? (item.count / safeStats.savedLeads) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="text-slate-400">{item.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Search Queries */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Search History</span>
            </h3>
            <span className="text-xs text-slate-500">Auto-saved</span>
          </div>

          {searchHistory.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent searches recorded yet. Try running a search on the Lead Finder!
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 max-h-[280px] overflow-y-auto pr-1">
              {searchHistory.slice(0, 8).map((h, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between group">
                  <div>
                    <div className="font-semibold text-xs text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {h.business_type}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {h.location}
                      </span>
                      <span>•</span>
                      <span>{(h.radius / 1000) || 10}km radius</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onReRunSearch(h.location, h.business_type)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 text-xs font-semibold transition-all"
                  >
                    <span>Re-Run</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Compliance & Best Practices Card */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          <div className="font-bold text-slate-200">Legal & Privacy Best Practices</div>
          <p>
            Always respect local communication guidelines when conducting B2B outreach.
            BizScout queries official business listings and public directories. Use the generated AI outreach templates responsibly for marketing and business services.
          </p>
        </div>
      </div>

    </div>
  );
}
