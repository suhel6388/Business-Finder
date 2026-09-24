import React from 'react';
import { MapPin, ShieldCheck, Heart, ExternalLink, Code2, Database } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 pt-12 pb-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top 3-Column Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Biz<span className="text-cyan-400">Scout</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A high-precision local business intelligence & lead-generation suite. Designed for digital agencies, course marketers, and sales professionals to extract verified business contacts legally via official API protocols.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Compliant: Zero HTML scraping or unauthorized browser scraping.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">Features & Tools</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-cyan-400 transition-colors">
                  Local Lead Search
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('leads')} className="hover:text-cyan-400 transition-colors">
                  Saved Leads CRM
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-cyan-400 transition-colors">
                  Analytics & Pipeline
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ai-studio')} className="hover:text-cyan-400 transition-colors">
                  AI Outreach Studio
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture & Compliance */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">Provider Ecosystem</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Google Places API Support</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>OpenStreetMap & Overpass</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Google Gemini 1.5 Flash AI</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Zero-Friction Local SQLite / JSON DB</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} BizScout Lead Generator. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Built for Modern Growth Teams</span>
            <span>•</span>
            <span className="text-cyan-400">Gorakhpur & Global Coverage</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
