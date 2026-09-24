import { AiService } from '../services/aiService.js';

export const aiController = {
  /**
   * Generate customized AI sales outreach
   * POST /api/ai/outreach
   */
  async generateOutreach(req, res) {
    try {
      const { business, objective = 'web_dev', senderName = 'Our Agency', apiKey } = req.body;

      if (!business || !business.name) {
        return res.status(400).json({ success: false, message: 'Business details are required' });
      }

      const clientApiKey = apiKey || req.headers['x-gemini-api-key'] || null;

      const outreach = await AiService.generateOutreach({
        business,
        objective,
        senderName,
        apiKey: clientApiKey
      });

      return res.json({
        success: true,
        businessName: business.name,
        outreach
      });
    } catch (error) {
      console.error('[aiController.generateOutreach] Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate AI outreach'
      });
    }
  }
};
