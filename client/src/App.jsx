import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import LeadManagement from './components/LeadManagement';
import Dashboard from './components/Dashboard';
import AiStudio from './components/AiStudio';
import AiOutreachModal from './components/AiOutreachModal';
import SettingsModal from './components/SettingsModal';
import Footer from './components/Footer';

import { businessApi, leadApi } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchParams, setSearchParams] = useState({ location: 'Gorakhpur', businessType: 'Computer Institutes' });
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedAiBusiness, setSelectedAiBusiness] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial Data Fetch
  const refreshLeadsAndStats = async () => {
    try {
      const [leadsRes, statsRes, historyRes] = await Promise.allSettled([
        leadApi.getLeads(),
        leadApi.getStats(),
        businessApi.getHistory()
      ]);

      if (leadsRes.status === 'fulfilled' && leadsRes.value.success) {
        setLeads(leadsRes.value.leads || []);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.stats);
      }
      if (historyRes.status === 'fulfilled' && historyRes.value.success) {
        setSearchHistory(historyRes.value.history || []);
      }
    } catch (err) {
      console.warn('Backend offline or initializing:', err.message);
    }
  };

  useEffect(() => {
    refreshLeadsAndStats();
  }, []);

  // Handle Search Execution
  const handleSearch = async (params) => {
    setLoading(true);
    setSearchParams(params);

    try {
      const data = await businessApi.search(params);
      if (data.success) {
        setSearchResults(data.results || []);
        showToast(`Discovered ${data.count} verified businesses in ${params.location}!`, 'success');
        refreshLeadsAndStats();

        // Smooth scroll to results
        setTimeout(() => {
          document.getElementById('results-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        showToast(data.message || 'Search failed', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to complete search. Check connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick search from Hero Chips or Recent History
  const handleQuickSearch = (location, businessType) => {
    setActiveTab('search');
    setSearchParams(prev => ({ ...prev, location, businessType }));
    handleSearch({
      location,
      businessType,
      radius: 10000,
      limit: 20,
      fields: ['name', 'address', 'phone', 'website', 'mapsUrl', 'rating', 'reviewCount']
    });
  };

  // Save Single Lead
  const handleSaveLead = async (business) => {
    try {
      const res = await leadApi.saveLead({
        placeId: business.placeId,
        business,
        status: 'New'
      });

      if (res.success) {
        // Update local search results saved status
        setSearchResults(prev => prev.map(item => 
          item.placeId === business.placeId ? { ...item, isSaved: true, savedStatus: 'New' } : item
        ));
        showToast(`Saved "${business.name}" to CRM!`, 'success');
        refreshLeadsAndStats();
      }
    } catch (err) {
      showToast('Failed to save lead', 'error');
    }
  };

  // Save Bulk Leads
  const handleSaveBulkLeads = async (selectedList) => {
    try {
      const res = await leadApi.saveBulkLeads(selectedList);
      if (res.success) {
        const savedIds = new Set(selectedList.map(s => s.placeId));
        setSearchResults(prev => prev.map(item => 
          savedIds.has(item.placeId) ? { ...item, isSaved: true, savedStatus: 'New' } : item
        ));
        showToast(`Saved ${selectedList.length} businesses to your CRM leads!`, 'success');
        refreshLeadsAndStats();
      }
    } catch (err) {
      showToast('Bulk save failed', 'error');
    }
  };

  // Update Lead in CRM
  const handleUpdateLead = async (leadId, updates) => {
    try {
      const res = await leadApi.updateLead(leadId, updates);
      if (res.success) {
        setLeads(prev => prev.map(l => l.id === leadId ? res.lead : l));
        refreshLeadsAndStats();
      }
    } catch (err) {
      showToast('Failed to update lead', 'error');
    }
  };

  // Delete Lead
  const handleDeleteLead = async (leadId) => {
    try {
      const res = await leadApi.deleteLead(leadId);
      if (res.success) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        showToast('Lead removed from CRM', 'info');
        refreshLeadsAndStats();
      }
    } catch (err) {
      showToast('Failed to delete lead', 'error');
    }
  };

  // Open AI Modal
  const handleOpenAiModal = (business) => {
    setSelectedAiBusiness(business);
    setIsAiModalOpen(true);
  };

  const scrollToSearch = () => {
    setActiveTab('search');
    setTimeout(() => {
      document.getElementById('search-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        leadCount={leads.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main App Content Body */}
      <main className="flex-1">
        {activeTab === 'search' && (
          <div className="space-y-8 pb-16">
            <HeroSection
              onQuickSearch={handleQuickSearch}
              onScrollToSearch={scrollToSearch}
            />

            <div className="px-4 sm:px-6 lg:px-8 space-y-8">
              <SearchForm
                onSearch={handleSearch}
                loading={loading}
                initialLocation={searchParams.location}
                initialType={searchParams.businessType}
              />

              <ResultsTable
                results={searchResults}
                onSaveLead={handleSaveLead}
                onSaveBulkLeads={handleSaveBulkLeads}
                onOpenAiOutreach={handleOpenAiModal}
                searchParams={searchParams}
              />
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="px-4 sm:px-6 lg:px-8 pt-6">
            <LeadManagement
              leads={leads}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
              onOpenAiOutreach={handleOpenAiModal}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="px-4 sm:px-6 lg:px-8 pt-6">
            <Dashboard
              stats={stats}
              searchHistory={searchHistory}
              onReRunSearch={handleQuickSearch}
            />
          </div>
        )}

        {activeTab === 'ai-studio' && (
          <div className="px-4 sm:px-6 lg:px-8 pt-6">
            <AiStudio
              leads={leads}
              onSelectLeadForPitch={handleOpenAiModal}
            />
          </div>
        )}
      </main>

      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-500/50 shadow-red-950/50'
              : toast.type === 'info'
              ? 'bg-slate-900/90 text-slate-200 border-slate-700 shadow-slate-950/50'
              : 'bg-gradient-to-r from-cyan-950/95 to-slate-900/95 text-cyan-200 border-cyan-500/50 shadow-cyan-950/50'
          }`}>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* AI Outreach Pitch Modal */}
      <AiOutreachModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        business={selectedAiBusiness}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={() => {
          showToast('Settings saved successfully!');
          refreshLeadsAndStats();
        }}
      />

      {/* Footer */}
      <Footer onNavigate={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

    </div>
  );
}
