import axios from 'axios';

export class AiService {
  /**
   * Generate customized sales outreach and lead pitch for a business
   */
  static async generateOutreach({ business, objective = 'web_dev', senderName = 'Our Agency', apiKey = null }) {
    const geminiKey = apiKey || process.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey.trim().length > 10 && !geminiKey.includes('your_gemini')) {
      try {
        return await this.callGeminiApi({ business, objective, senderName, apiKey: geminiKey });
      } catch (err) {
        console.error('[AiService] Gemini API call failed, using intelligent template engine:', err.message);
      }
    }

    // High quality intelligent template engine
    return this.generateSmartFallback({ business, objective, senderName });
  }

  /**
   * Google Gemini API free model (gemini-1.5-flash)
   */
  static async callGeminiApi({ business, objective, senderName, apiKey }) {
    const prompt = `You are a top sales and outreach specialist. Generate an outreach kit for this local business:
Business Name: ${business.name}
Category: ${business.category || 'Local Business'}
Address: ${business.address || 'Local area'}
Rating: ${business.rating || 'N/A'} (${business.reviewCount || 0} reviews)
Current Website: ${business.website || 'No website found'}
Objective: ${objective === 'web_dev' ? 'Pitch professional modern website & SEO services' : objective === 'computer_students' ? 'Pitch student admissions marketing & partnership' : 'Pitch digital marketing & lead generation'}
Sender Name: ${senderName}

Respond strictly in valid JSON format matching this structure:
{
  "whatsappMessage": "Friendly, punchy WhatsApp message in natural conversational tone with emojis and clear call to action.",
  "emailSubject": "High open-rate cold email subject line",
  "emailBody": "Professional 3-paragraph cold email focusing on business growth and value proposition.",
  "leadScore": "Hot / Warm / Moderate",
  "opportunityAudit": "2-3 key growth opportunities identified from their profile (e.g. missing website, building reviews, student acquisition)",
  "icebreaker": "A 1-sentence personalized opening line referencing their business."
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    }, { timeout: 15000 });

    const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      return JSON.parse(rawText);
    }
    throw new Error('Invalid response from Gemini');
  }

  /**
   * Intelligent template engine for instant zero-config generation
   */
  static generateSmartFallback({ business, objective, senderName }) {
    const bizName = business.name || 'Business Owner';
    const category = business.category || 'Business';
    const hasWebsite = Boolean(business.website && business.website.length > 5);
    const rating = business.rating || 4.5;
    const reviews = business.reviewCount || 20;

    let whatsappMessage = '';
    let emailSubject = '';
    let emailBody = '';
    let opportunityAudit = '';
    let leadScore = 'Warm';

    if (objective === 'web_dev') {
      leadScore = !hasWebsite ? 'Hot' : 'Warm';
      whatsappMessage = `Namaste! 👋 I noticed *${bizName}* has great local reputation (${rating}⭐ with ${reviews} reviews) in ${business.address ? business.address.split(',')[0] : 'your city'}.\n\n` +
        (!hasWebsite
          ? `I saw you don't currently have a dedicated website, meaning you could be losing high-intent students/customers searching on Google.\n\nWe build lightning-fast, mobile-friendly websites with 1-click WhatsApp enquiry buttons. Could I share a free 2-minute demo mockup tailored for ${bizName}? 🚀`
          : `We help established ${category} centers double their direct inquiries with modern web design and local SEO. Would you be open to a quick 2-minute review of your current digital setup? 🚀`);

      emailSubject = !hasWebsite
        ? `Quick question regarding ${bizName}'s digital presence`
        : `Idea to increase admissions & inquiries for ${bizName}`;

      emailBody = `Hi ${bizName} Team,\n\nI came across ${bizName} while researching leading ${category} institutes in your area. Congratulations on maintaining a stellar ${rating}-star rating!\n\n` +
        (!hasWebsite
          ? `I noticed that students and clients searching for ${category} online can't easily find a full course catalog or booking portal for your center. Having a dedicated, high-converting website can easily generate 30-50+ new inquiries each month.\n\n`
          : `While you already have a presence online, modern students expect instant course syllabus downloads, online fee payment, and WhatsApp instant chat. We specialize in upgrading education & service websites to convert visitors into paying clients.\n\n`) +
        `Would you be open to seeing a free 3-minute video showing what we could build for ${bizName}?\n\nBest regards,\n${senderName}`;

      opportunityAudit = !hasWebsite
        ? `High priority: Currently lacks an official website. High potential to capture search traffic for "${category} near me".`
        : `Strong ${rating}★ rating. Opportunity to add live chat, course brochures, and Google Maps local SEO optimization.`;
    } else if (objective === 'computer_students') {
      leadScore = 'Hot';
      whatsappMessage = `Hello Sir/Ma'am! 👋 Greetings from ${senderName}.\n\nWe are running a career guidance & skill-marketing drive in your area. We have over 150+ students actively looking for certified courses (DCA, ADCA, Python, Web Dev, Tally) at *${bizName}*.\n\nCan we connect for 5 mins to discuss how we can partner to fill your upcoming batch? 🎓`;

      emailSubject = `Student batch admission tie-up for ${bizName}`;
      emailBody = `Dear Administrator at ${bizName},\n\nHope this finds you well. We are actively directing local college students and job-seekers to verified training institutes like yours.\n\nWe would love to feature ${bizName} in our upcoming local education guide and direct student inquiries directly to your admissions desk.\n\nAre you accepting new admissions for the upcoming month? Let me know a good time to speak briefly.\n\nWarm regards,\n${senderName}`;

      opportunityAudit = `Excellent fit for student marketing partnerships. Can run targeted local Instagram/WhatsApp ad campaigns for new batches.`;
    } else {
      // General Lead Gen
      whatsappMessage = `Hello ${bizName}! 🌟 Noticed your top-rated business profile. We help local businesses in your category generate 3x more phone calls and customer visits using automated local outreach. Would love to send you a free audit report!`;
      emailSubject = `Growth opportunity for ${bizName}`;
      emailBody = `Hi team,\n\nWe love what you are doing with ${bizName}. We have prepared a customized growth report for your business to help increase daily walk-ins and phone calls.\n\nLet me know if you would like me to email it over.\n\nRegards,\n${senderName}`;
      opportunityAudit = `Active listing with ${reviews} reviews. Ready for proactive WhatsApp remarketing and customer retention.`;
    }

    return {
      whatsappMessage,
      emailSubject,
      emailBody,
      leadScore,
      opportunityAudit,
      icebreaker: `Impressive track record with ${rating}★ rating and ${reviews} verified reviews in ${business.address?.split(',')?.[0] || 'the area'}.`
    };
  }
}
