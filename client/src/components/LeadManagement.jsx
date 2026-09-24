import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Download, Trash2, Calendar, Phone, MessageSquare, 
  ExternalLink, Sparkles, Star, Tag, Check, Filter, AlertCircle, 
  Building, ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';

const STATUS_CONFIG = {
  'New': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Contacted': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Interested': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'Follow-up': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  'Converted': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Not interested': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export default function LeadManagement({ 
  leads = [], 
  onUpdateLead, 
  onDeleteLead, 
  onOpenAiOutreach 
}) {
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotes, setTempNotes] = useState('');

  // Status Counts
  const counts = useMemo(() => {
    return {
      All: leads.length,
      New: leads.filter(l => l.status === 'New').length,
      Contacted: leads.filter(l => l.status === 'Contacted').length,
      Interested: leads.filter(l => l.status === 'Interested').length,
      'Follow-up': leads.filter(l => l.status === 'Follow-up').length,
      Converted: leads.filter(l => l.status === 'Converted').length,
      'Not interested': leads.filter(l => l.status === 'Not interested').length,
    };
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    let list = leads;

    if (activeStatus !== 'All') {
      list = list.filter(l => l.status.toLowerCase() === activeStatus.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => 
        (l.business?.name || '').toLowerCase().includes(q) ||
        (l.business?.category || '').toLowerCase().includes(q) ||
        (l.business?.address || '').toLowerCase().includes(q) ||
        (l.business?.phone || '').includes(q) ||
        (l.notes || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [leads, activeStatus, searchQuery]);

  // Handle Note Save
  const handleSaveNotes = (leadId) => {
    onUpdateLead(leadId, { notes: tempNotes });
    setEditingNotesId(null);
  };

  // Launch WhatsApp with contextual introduction
  const launchWhatsApp = (lead) => {
    const rawPhone = lead.business?.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const bizName = lead.business?.name || 'Sir/Ma\'am';

    const message = encodeURIComponent(
      `Hello! 👋 Greetings from BizScout. We noticed ${bizName} is one of the top rated local centers in your area. Would love to share ideas on boosting direct inquiries & website presence!`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Export Saved Leads to Excel (.xlsx)
  const exportSavedLeads = () => {
    if (filteredLeads.length === 0) return;

    const rows = filteredLeads.map((l, idx) => ({
      'Lead ID': l.id,
      'Status': l.status,
      'Business Name': l.business?.name || '',
      'Category': l.business?.category || '',
      'Address': l.business?.address || '',
      'Phone Number': l.business?.phone || '',
      'Website': l.business?.website || '',
      'Rating': l.business?.rating || '',
      'Reviews Count': l.business?.reviewCount || 0,
      'Service Interest': l.serviceInterest || 'Web Development',
      'Follow-up Date': l.followUpDate || '',
      'Notes': l.notes || '',
      'Saved On': l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CRM Leads');
    XLSX.writeFile(wb, `BizScout_CRM_Leads_${Date.now()}.xlsx`);
    confetti({ particleCount: 40, spread: 50 });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-2 pb-12">
      
      {/* Header & Export Bar */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Saved Leads CRM</h2>
              <p className="text-xs text-slate-400">
                Track outreach status, schedule follow-ups, and launch WhatsApp pitches directly.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Export */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <button
            onClick={exportSavedLeads}
            disabled={filteredLeads.length === 0}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {['All', 'New', 'Contacted', 'Interested', 'Follow-up', 'Converted', 'Not interested'].map((status) => {
          const isActive = activeStatus === status;
          const count = counts[status] || 0;
          return (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{status}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Leads Cards Grid */}
      {filteredLeads.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No leads found in this view</h3>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? `No businesses matching "${searchQuery}". Try clearing the search.`
              : 'Go to the Lead Finder tab, search for local businesses, and click "Save" to build your pipeline!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            const biz = lead.business || {};
            const statusStyle = STATUS_CONFIG[lead.status] || STATUS_CONFIG['New'];

            return (
              <div
                key={lead.id}
                className="glass-panel rounded-xl p-5 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
              >
                {/* Top: Business Info + Status Dropdown */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {biz.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {biz.category || 'Local Business'}
                      </span>
                    </div>

                    {/* Status Dropdown Selector */}
                    <div className="relative">
                      <select
                        value={lead.status}
                        onChange={(e) => {
                          onUpdateLead(lead.id, { status: e.target.value });
                          if (e.target.value === 'Converted') {
                            confetti({ particleCount: 50, spread: 60 });
                          }
                        }}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {Object.keys(STATUS_CONFIG).map((st) => (
                          <option key={st} value={st} className="bg-slate-900 text-slate-200">
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Rating + Location + Phone */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{biz.rating || 4.5}</span>
                      </div>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 truncate">{biz.address || 'Address on file'}</span>
                    </div>

                    {biz.phone && (
                      <div className="flex items-center gap-1.5 font-mono text-slate-300">
                        <Phone className="w-3 h-3 text-cyan-400" />
                        <span>{biz.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle: Notes & Follow-up date */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                  {/* Service Interest tag & Follow-up picker */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Service:</span>
                      <select
                        value={lead.serviceInterest || 'Web Development'}
                        onChange={(e) => onUpdateLead(lead.id, { serviceInterest: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                      >
                        <option value="Web Development">Web Development</option>
                        <option value="Computer Training">Computer Courses</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Custom Software">Custom Software</option>
                      </select>
                    </div>

                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Follow-up:</span>
                      <input
                        type="date"
                        value={lead.followUpDate || ''}
                        onChange={(e) => onUpdateLead(lead.id, { followUpDate: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Notes Field */}
                  <div>
                    {editingNotesId === lead.id ? (
                      <div className="space-y-1.5">
                        <textarea
                          rows={2}
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="Add meeting notes, client response..."
                          className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNotes(lead.id)}
                            className="px-2.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold text-[10px]"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingNotesId(lead.id);
                          setTempNotes(lead.notes || '');
                        }}
                        className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 cursor-pointer min-h-[36px] flex items-center transition-colors"
                      >
                        {lead.notes ? (
                          <span className="line-clamp-2 text-slate-300">{lead.notes}</span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">+ Add quick note or outcome...</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp 1-Click */}
                    {biz.phone && (
                      <button
                        onClick={() => launchWhatsApp(lead)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </button>
                    )}

                    {/* AI Pitch Generator */}
                    <button
                      onClick={() => onOpenAiOutreach(biz)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:scale-105"
                      title="Generate AI Outreach Pitch"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>AI Pitch</span>
                    </button>
                  </div>

                  {/* Delete Lead */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove ${biz.name} from saved leads?`)) {
                        onDeleteLead(lead.id);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete Lead"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
