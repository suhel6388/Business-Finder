import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Sliders, CheckSquare, Square, RotateCcw, Sparkles, Filter } from 'lucide-react';

const AVAILABLE_FIELDS = [
  { id: 'name', label: 'Business Name', required: true },
  { id: 'address', label: 'Address', required: false },
  { id: 'phone', label: 'Phone Number', required: false },
  { id: 'website', label: 'Website', required: false },
  { id: 'mapsUrl', label: 'Google Maps Link', required: false },
  { id: 'rating', label: 'Rating', required: false },
  { id: 'reviewCount', label: 'Review Count', required: false },
  { id: 'openingHours', label: 'Opening Hours', required: false },
  { id: 'category', label: 'Category', required: false },
];

const PRESET_CATEGORIES = [
  'Computer Institutes',
  'Coaching Centers',
  'Clinics & Hospitals',
  'Retail & Electronics Shops',
  'Web & Digital Agencies',
  'Gyms & Fitness',
  'Cafes & Restaurants'
];

export default function SearchForm({ onSearch, loading, initialLocation = '', initialType = '' }) {
  const [location, setLocation] = useState(initialLocation || 'Gorakhpur');
  const [businessType, setBusinessType] = useState(initialType || 'Computer Institutes');
  const [radius, setRadius] = useState(10); // in km
  const [limit, setLimit] = useState(20);
  const [selectedFields, setSelectedFields] = useState([
    'name', 'address', 'phone', 'website', 'mapsUrl', 'rating', 'reviewCount'
  ]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update when parent sends quick search chips
  React.useEffect(() => {
    if (initialLocation) setLocation(initialLocation);
    if (initialType) setBusinessType(initialType);
  }, [initialLocation, initialType]);

  const toggleField = (fieldId) => {
    if (fieldId === 'name') return; // Business name cannot be unchecked
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(f => f !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  const selectAllFields = () => {
    setSelectedFields(AVAILABLE_FIELDS.map(f => f.id));
  };

  const resetFields = () => {
    setSelectedFields(['name', 'address', 'phone', 'website', 'mapsUrl', 'rating', 'reviewCount']);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location.trim() || !businessType.trim()) return;

    onSearch({
      location: location.trim(),
      businessType: businessType.trim(),
      radius: radius * 1000, // convert km to meters
      limit: Number(limit),
      fields: selectedFields
    });
  };

  return (
    <div id="search-card" className="max-w-4xl mx-auto">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl shadow-slate-950/60 border border-slate-800 relative">
        {/* Glowing border highlight */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Main 2-Input Row: Location + Business Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Location Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Target Location / City</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Gorakhpur, Chauri Chaura, Lucknow..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            {/* Business Category Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>Business Type / Category</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Institutes, Coaching, Clinics..."
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

          </div>

          {/* Quick Category Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Quick Select:</span>
            {PRESET_CATEGORIES.map((cat, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setBusinessType(cat)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                  businessType === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Advanced Sliders & Field Selector Toggle */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide Search Options & Fields' : 'Customize Search Radius & Data Fields'}</span>
              <span className="text-slate-500 text-[10px]">({radius} km radius, {limit} max results, {selectedFields.length} fields)</span>
            </button>
          </div>

          {/* Expanded Advanced Controls */}
          {showAdvanced && (
            <div className="space-y-5 pt-2 animate-in fade-in duration-200">
              
              {/* Radius & Limit Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-300 mb-2">
                    <span className="flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-cyan-400" />
                      Search Radius:
                    </span>
                    <span className="font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      {radius} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1 km (Local)</span>
                    <span>25 km</span>
                    <span>50 km (Regional)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-300 mb-2">
                    <span>Maximum Results:</span>
                    <span className="font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                      {limit} leads
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 30, 50].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setLimit(num)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          limit === num
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Required Data Fields Selection */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Required Data Fields To Extract
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllFields}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={resetFields}
                      className="text-[11px] text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AVAILABLE_FIELDS.map((field) => {
                    const isChecked = selectedFields.includes(field.id);
                    return (
                      <label
                        key={field.id}
                        onClick={() => toggleField(field.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                            : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:border-slate-700'
                        } ${field.required ? 'opacity-80 cursor-not-allowed' : ''}`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate">{field.label}</span>
                        {field.required && (
                          <span className="text-[10px] text-cyan-500 ml-auto">(Req)</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* Submit Search Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 transition-all duration-200 shadow-xl ${
                loading
                  ? 'bg-cyan-600 cursor-wait opacity-80'
                  : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.005]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning Public Places Data for {businessType}...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-slate-950" />
                  <span>Search Businesses in {location || 'City'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
