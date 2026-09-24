import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject optional client-stored Google Places and Gemini keys
api.interceptors.request.use((config) => {
  try {
    const settings = JSON.parse(localStorage.getItem('bizscout_settings') || '{}');
    if (settings.googleApiKey) {
      config.headers['x-google-api-key'] = settings.googleApiKey;
    }
    if (settings.geminiApiKey) {
      config.headers['x-gemini-api-key'] = settings.geminiApiKey;
    }
  } catch (e) {
    // Ignore storage parsing error
  }
  return config;
});

export const businessApi = {
  // Search businesses
  search: async (params) => {
    const res = await api.post('/businesses/search', params);
    return res.data;
  },

  // Get search history
  getHistory: async () => {
    const res = await api.get('/businesses/history');
    return res.data;
  }
};

export const leadApi = {
  // Save single or bulk leads
  saveLead: async (leadData) => {
    const res = await api.post('/leads', leadData);
    return res.data;
  },

  // Bulk save
  saveBulkLeads: async (leads) => {
    const res = await api.post('/leads', { leads });
    return res.data;
  },

  // Get all leads
  getLeads: async (params = {}) => {
    const res = await api.get('/leads', { params });
    return res.data;
  },

  // Update lead
  updateLead: async (id, data) => {
    const res = await api.patch(`/leads/${id}`, data);
    return res.data;
  },

  // Delete lead
  deleteLead: async (id) => {
    const res = await api.delete(`/leads/${id}`);
    return res.data;
  },

  // Get statistics
  getStats: async () => {
    const res = await api.get('/leads/stats');
    return res.data;
  }
};

export const aiApi = {
  // Generate AI Outreach Kit
  generateOutreach: async ({ business, objective, senderName }) => {
    const res = await api.post('/ai/outreach', { business, objective, senderName });
    return res.data;
  }
};

export default api;
