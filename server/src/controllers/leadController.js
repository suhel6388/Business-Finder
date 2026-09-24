import { dbService } from '../config/db.js';
import { ExportService } from '../services/exportService.js';

export const leadController = {
  /**
   * Save a single lead or bulk leads
   * POST /api/leads
   */
  async saveLead(req, res) {
    try {
      const body = req.body;

      // Handle bulk save
      if (Array.isArray(body.leads)) {
        const saved = body.leads.map(leadItem => {
          return dbService.saveLead({
            placeId: leadItem.placeId || leadItem.business?.placeId,
            businessData: leadItem.business || leadItem,
            status: leadItem.status || 'New',
            notes: leadItem.notes || '',
            followUpDate: leadItem.followUpDate || null,
            serviceInterest: leadItem.serviceInterest || 'Web Development'
          });
        });
        return res.json({ success: true, count: saved.length, leads: saved });
      }

      // Single save
      const { placeId, business, status = 'New', notes = '', followUpDate = null, serviceInterest = 'Web Development' } = body;
      const targetBusiness = business || body;
      const targetPlaceId = placeId || targetBusiness.placeId;

      if (!targetPlaceId) {
        return res.status(400).json({ success: false, message: 'placeId is required' });
      }

      const lead = dbService.saveLead({
        placeId: targetPlaceId,
        businessData: targetBusiness,
        status,
        notes,
        followUpDate,
        serviceInterest
      });

      return res.status(201).json({ success: true, lead });
    } catch (error) {
      console.error('[leadController.saveLead] Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get all saved leads
   * GET /api/leads
   */
  async getLeads(req, res) {
    try {
      const { status, search } = req.query;
      let leads = dbService.getAllLeads();

      if (status && status !== 'All') {
        leads = leads.filter(l => l.status.toLowerCase() === status.toLowerCase());
      }

      if (search && search.trim()) {
        const q = search.toLowerCase();
        leads = leads.filter(l => 
          (l.business?.name || '').toLowerCase().includes(q) ||
          (l.business?.category || '').toLowerCase().includes(q) ||
          (l.business?.address || '').toLowerCase().includes(q) ||
          (l.business?.phone || '').includes(q) ||
          (l.notes || '').toLowerCase().includes(q)
        );
      }

      return res.json({ success: true, count: leads.length, leads });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Update lead status, notes, or follow-up date
   * PATCH /api/leads/:id
   */
  async updateLead(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = dbService.updateLead(id, updates);

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Lead not found' });
      }

      return res.json({ success: true, lead: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Delete lead
   * DELETE /api/leads/:id
   */
  async deleteLead(req, res) {
    try {
      const { id } = req.params;
      dbService.deleteLead(id);
      return res.json({ success: true, message: 'Lead removed successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get CRM & Lead Dashboard statistics
   * GET /api/leads/stats
   */
  async getStats(req, res) {
    try {
      const stats = dbService.getStats();
      return res.json({ success: true, stats });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Export leads to Excel or CSV
   * GET /api/leads/export?format=xlsx|csv&status=All
   */
  async exportLeads(req, res) {
    try {
      const format = (req.query.format || 'xlsx').toLowerCase();
      const status = req.query.status;
      let leads = dbService.getAllLeads();

      if (status && status !== 'All') {
        leads = leads.filter(l => l.status.toLowerCase() === status.toLowerCase());
      }

      if (leads.length === 0) {
        return res.status(400).json({ success: false, message: 'No leads available to export' });
      }

      const timestamp = new Date().toISOString().slice(0, 10);

      if (format === 'csv') {
        const csvContent = ExportService.generateCsv(leads);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="bizscout_leads_${timestamp}.csv"`);
        return res.send(csvContent);
      } else {
        const xlsxBuffer = ExportService.generateXlsx(leads, 'Saved Leads');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="bizscout_leads_${timestamp}.xlsx"`);
        return res.send(xlsxBuffer);
      }
    } catch (error) {
      console.error('[leadController.exportLeads] Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
