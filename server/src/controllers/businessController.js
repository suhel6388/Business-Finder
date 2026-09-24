import { PlacesService } from '../services/placesService.js';
import { dbService } from '../config/db.js';

export const businessController = {
  /**
   * Search for businesses
   * POST /api/businesses/search
   */
  async search(req, res) {
    try {
      const { location, businessType, radius = 10000, fields = [], limit = 20 } = req.body;

      if (!location || !location.trim()) {
        return res.status(400).json({ success: false, message: 'Location is required' });
      }
      if (!businessType || !businessType.trim()) {
        return res.status(400).json({ success: false, message: 'Business type is required' });
      }

      // Check for user-provided Google API key header or server env
      const clientApiKey = req.headers['x-google-api-key'] || null;

      const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 60);
      const parsedRadius = Math.min(Math.max(parseInt(radius) || 10000, 500), 50000);

      const rawResults = await PlacesService.searchBusinesses({
        location: location.trim(),
        businessType: businessType.trim(),
        radius: parsedRadius,
        limit: parsedLimit,
        fields: Array.isArray(fields) ? fields : [],
        apiKey: clientApiKey
      });

      // Cross-reference with saved leads in database
      const savedLeads = dbService.getSavedPlaceIds();
      const savedMap = new Map();
      savedLeads.forEach(item => {
        savedMap.set(item.provider_place_id, item);
      });

      const enrichedResults = rawResults.map(biz => {
        const savedInfo = savedMap.get(biz.placeId);
        return {
          ...biz,
          isSaved: Boolean(savedInfo),
          savedStatus: savedInfo ? savedInfo.status : null,
          savedLeadId: savedInfo ? savedInfo.lead_id : null
        };
      });

      // Record in search history
      dbService.recordSearch(location.trim(), businessType.trim(), parsedRadius, enrichedResults.length);

      return res.json({
        success: true,
        count: enrichedResults.length,
        location: location.trim(),
        businessType: businessType.trim(),
        results: enrichedResults
      });
    } catch (error) {
      console.error('[businessController.search] Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to search businesses'
      });
    }
  },

  /**
   * Get search history
   * GET /api/businesses/history
   */
  async getHistory(req, res) {
    try {
      const history = dbService.getSearchHistory(20);
      return res.json({ success: true, history });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
