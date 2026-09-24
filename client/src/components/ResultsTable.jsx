import React, { useState, useMemo } from 'react';
import { 
  Download, BookmarkPlus, Check, Copy, ExternalLink, Star, 
  MapPin, Phone, Globe, MessageCircle, Sparkles, ArrowUpDown, 
  Search, Eye, ShieldCheck, Clock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';

export default function ResultsTable({ 
  results = [], 
  onSaveLead, 
  onSaveBulkLeads, 
  onOpenAiOutreach, 
  searchParams = {} 
}) {
  const [selectedPlaceIds, setSelectedPlaceIds] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'reviews', 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered & Sorted items
  const processedResults = useMemo(() => {
    let list = [...results];

    // Search filter
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      list = list.filter(item => 
        (item.name || '').toLowerCase().includes(q) ||
        (item.address || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.phone || '').includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'rating') {
        valA = a.rating || 0;
        valB = b.rating || 0;
      } else if (sortBy === 'reviews') {
        valA = a.reviewCount || 0;
        valB = b.reviewCount || 0;
      } else {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [results, filterQuery, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedResults.length / itemsPerPage) || 1;
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedResults.slice(start, start + itemsPerPage);
  }, [processedResults, currentPage]);

  // Handle Multi-Selection
  const isAllSelected = paginatedResults.length > 0 && paginatedResults.every(r => selectedPlaceIds.includes(r.placeId));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedPlaceIds([]);
    } else {
      const allIds = processedResults.map(r => r.placeId);
      setSelectedPlaceIds(allIds);
    }
  };

  const toggleSelectRow = (placeId) => {
    if (selectedPlaceIds.includes(placeId)) {
      setSelectedPlaceIds(selectedPlaceIds.filter(id => id !== placeId));
    } else {
      setSelectedPlaceIds([...selectedPlaceIds, placeId]);
    }
  };

  // Copy Phone Number
  const handleCopyPhone = (phone) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Bulk Save Leads
  const handleBulkSave = () => {
    const selectedItems = results.filter(r => selectedPlaceIds.includes(r.placeId));
    if (selectedItems.length === 0) return;

    onSaveBulkLeads(selectedItems);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    setSelectedPlaceIds([]);
  };

  // Export to Excel (Client-side fast generation)
  const exportToExcel = (onlySelected = false) => {
    const targetItems = onlySelected
      ? results.filter(r => selectedPlaceIds.includes(r.placeId))
      : processedResults;

    if (targetItems.length === 0) return;

    const rows = targetItems.map((item, idx) => ({
      '#': idx + 1,
      'Business Name': item.name || '',
      'Category': item.category || '',
      'Address': item.address || '',
      'Phone Number': item.phone || 'Not Listed',
      'Website': item.website || 'Not Listed',
      'Rating': item.rating || 0,
      'Reviews Count': item.reviewCount || 0,
      'Google Maps Link': item.mapsUrl || '',
      'Business Status': item.businessStatus || 'OPERATIONAL',
      'Extraction City': searchParams.location || '',
      'Extraction Query': searchParams.businessType || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Verified Businesses');

    const fileName = `BizScout_${(searchParams.location || 'leads').replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    confetti({ particleCount: 50, spread: 50 });
  };

  // Export to CSV
  const exportToCsv = (onlySelected = false) => {
    const targetItems = onlySelected
      ? results.filter(r => selectedPlaceIds.includes(r.placeId))
      : processedResults;

    if (targetItems.length === 0) return;

    const rows = targetItems.map((item, idx) => ({
      '#': idx + 1,
      'Business Name': item.name || '',
      'Category': item.category || '',
      'Address': item.address || '',
      'Phone Number': item.phone || '',
      'Website': item.website || '',
      'Rating': item.rating || 0,
      'Reviews': item.reviewCount || 0,
      'Google Maps Link': item.mapsUrl || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `BizScout_leads_${Date.now()}.csv`;
    link.click();
  };

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div id="results-area" className="max-w-7xl mx-auto space-y-4 pt-4">
      
      {/* Control Bar: Title + Results Search + Sort + Batch Actions */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Count & Meta */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Discovered Businesses</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {results.length} results
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Query: <span className="text-slate-200 font-medium">"{searchParams.businessType}"</span> near{' '}
            <span className="text-slate-200 font-medium">"{searchParams.location}"</span>
          </p>
        </div>

        {/* Right: Search in Results & Sorting */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Search within results */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter list..."
              value={filterQuery}
              onChange={(e) => { setFilterQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none text-xs cursor-pointer"
            >
              <option value="rating" className="bg-slate-900">Highest Rating</option>
              <option value="reviews" className="bg-slate-900">Most Reviews</option>
              <option value="name" className="bg-slate-900">Business Name</option>
            </select>
          </div>

          {/* Export Dropdown Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => exportToExcel(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all shadow-sm"
              title="Export All Results to Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            <button
              onClick={() => exportToCsv(false)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
              title="Export All to CSV"
            >
              <span>CSV</span>
            </button>
          </div>

        </div>
      </div>

      {/* Floating Batch Actions Bar (Shows when rows are selected) */}
      {selectedPlaceIds.length > 0 && (
        <div className="sticky top-20 z-30 flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-950/90 via-slate-900/95 to-blue-950/90 border border-cyan-500/40 backdrop-blur-md shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs text-cyan-200 font-semibold pl-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{selectedPlaceIds.length} businesses selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Save Selected to CRM</span>
            </button>

            <button
              onClick={() => exportToExcel(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected (XLSX)</span>
            </button>

            <button
              onClick={() => setSelectedPlaceIds([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300 uppercase tracking-wider font-semibold">
                <th className="py-3.5 pl-4 pr-2 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3 min-w-[220px]">Business & Category</th>
                <th className="py-3.5 px-3 min-w-[200px]">Address</th>
                <th className="py-3.5 px-3 min-w-[150px]">Phone Number</th>
                <th className="py-3.5 px-3 min-w-[130px]">Rating & Reviews</th>
                <th className="py-3.5 px-3 min-w-[140px]">Website / Maps</th>
                <th className="py-3.5 pr-4 pl-2 text-right min-w-[160px]">Quick Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60">
              {paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No matching businesses found for "{filterQuery}". Try a different keyword.
                  </td>
                </tr>
              ) : (
                paginatedResults.map((item) => {
                  const isSelected = selectedPlaceIds.includes(item.placeId);
                  const isSaved = item.isSaved;

                  return (
                    <tr
                      key={item.placeId}
                      className={`group transition-colors ${
                        isSelected
                          ? 'bg-cyan-950/30 hover:bg-cyan-950/40'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Checkbox Column */}
                      <td className="py-3.5 pl-4 pr-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(item.placeId)}
                          className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Business Name & Category */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                            {item.category || searchParams.businessType}
                          </span>
                          {item.businessStatus === 'OPERATIONAL' && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" /> Operational
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-start gap-1.5 text-slate-300 line-clamp-2" title={item.address}>
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{item.address || 'Address not listed'}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3">
                        {item.phone ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-200 font-medium">{item.phone}</span>
                            <button
                              onClick={() => handleCopyPhone(item.phone)}
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              title="Copy Phone"
                            >
                              {copiedPhone === item.phone ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No phone listed</span>
                        )}
                      </td>

                      {/* Rating & Reviews */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1 font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{item.rating || '4.0'}</span>
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            ({item.reviewCount || 0} reviews)
                          </span>
                        </div>
                      </td>

                      {/* Website & Google Maps */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          {item.website ? (
                            <a
                              href={item.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                              title="Visit Website"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[90px]">Website</span>
                            </a>
                          ) : (
                            <span className="text-slate-500 text-[11px]">No site</span>
                          )}

                          {item.mapsUrl && (
                            <a
                              href={item.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Open in Google Maps"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 pr-4 pl-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* AI Outreach Pitch Generator */}
                          <button
                            onClick={() => onOpenAiOutreach(item)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:scale-105"
                            title="Generate AI Outreach & WhatsApp Script"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>AI Pitch</span>
                          </button>

                          {/* Save Lead to CRM */}
                          {isSaved ? (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                              <Check className="w-3 h-3" />
                              <span>{item.savedStatus || 'Saved'}</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                onSaveLead(item);
                                confetti({ particleCount: 35, spread: 45 });
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-cyan-500 text-xs font-semibold transition-all"
                              title="Save to Leads CRM"
                            >
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-400">
            <div>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, processedResults.length)} of{' '}
              {processedResults.length} leads
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
              >
                Previous
              </button>

              <span className="px-2 font-semibold text-slate-200">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
