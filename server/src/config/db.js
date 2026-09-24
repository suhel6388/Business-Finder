import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'local_business_finder.db');

let db = null;
let isNativeSqlite = false;

try {
  const { DatabaseSync } = await import('node:sqlite');
  db = new DatabaseSync(dbPath);
  isNativeSqlite = true;
  console.log(`[DB] Connected to SQLite database at: ${dbPath}`);
} catch (err) {
  console.warn('[DB] Built-in node:sqlite not supported, utilizing reliable persistent JSON fallback store.', err.message);
}

// Fallback JSON-backed storage if node:sqlite is unavailable
class JsonDbFallback {
  constructor(filePath) {
    this.filePath = filePath.replace('.db', '.json');
    this.data = { businesses: [], leads: [], search_history: [] };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
      }
    } catch (e) {
      console.error('[DB Fallback] Read error:', e);
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB Fallback] Write error:', e);
    }
  }

  exec(sql) {}
}

const fallbackDb = !isNativeSqlite ? new JsonDbFallback(dbPath) : null;

// Initialize tables if native SQLite is active
if (isNativeSqlite && db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_place_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      address TEXT,
      phone TEXT,
      website TEXT,
      maps_url TEXT,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      latitude REAL,
      longitude REAL,
      business_status TEXT DEFAULT 'OPERATIONAL',
      opening_hours TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      status TEXT DEFAULT 'New',
      notes TEXT DEFAULT '',
      follow_up_date TEXT,
      service_interest TEXT DEFAULT 'Web Development',
      lead_source TEXT DEFAULT 'Local Search',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT NOT NULL,
      business_type TEXT NOT NULL,
      radius INTEGER,
      results_count INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_businesses_place_id ON businesses(provider_place_id);
    CREATE INDEX IF NOT EXISTS idx_leads_business_id ON leads(business_id);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  `);
}

// Database helper operations
export const dbService = {
  // Upsert business and return business row
  upsertBusiness(biz) {
    const placeId = biz.placeId || biz.provider_place_id || `biz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    if (isNativeSqlite) {
      const selectStmt = db.prepare('SELECT * FROM businesses WHERE provider_place_id = ?');
      const existing = selectStmt.get(placeId);
      
      const now = new Date().toISOString();
      if (existing) {
        const updateStmt = db.prepare(`
          UPDATE businesses SET
            name = ?, category = ?, address = ?, phone = ?, website = ?, maps_url = ?,
            rating = ?, review_count = ?, latitude = ?, longitude = ?, business_status = ?,
            opening_hours = ?, updated_at = ?
          WHERE id = ?
        `);
        updateStmt.run(
          biz.name || existing.name || '',
          biz.category || existing.category || '',
          biz.address || existing.address || '',
          biz.phone || existing.phone || '',
          biz.website || existing.website || '',
          biz.mapsUrl || biz.maps_url || existing.maps_url || '',
          biz.rating ?? existing.rating ?? 0,
          biz.reviewCount ?? biz.review_count ?? existing.review_count ?? 0,
          biz.latitude ?? existing.latitude ?? null,
          biz.longitude ?? existing.longitude ?? null,
          biz.businessStatus || biz.business_status || existing.business_status || 'OPERATIONAL',
          Array.isArray(biz.openingHours) ? JSON.stringify(biz.openingHours) : (biz.opening_hours || existing.opening_hours || ''),
          now,
          existing.id
        );
        return { ...existing, ...biz, placeId, id: existing.id };
      } else {
        const insertStmt = db.prepare(`
          INSERT INTO businesses (
            provider_place_id, name, category, address, phone, website, maps_url,
            rating, review_count, latitude, longitude, business_status, opening_hours, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = insertStmt.run(
          placeId,
          biz.name || 'Unknown Business',
          biz.category || '',
          biz.address || '',
          biz.phone || '',
          biz.website || '',
          biz.mapsUrl || biz.maps_url || '',
          biz.rating ?? 0,
          biz.reviewCount ?? biz.review_count ?? 0,
          biz.latitude ?? null,
          biz.longitude ?? null,
          biz.businessStatus || biz.business_status || 'OPERATIONAL',
          Array.isArray(biz.openingHours) ? JSON.stringify(biz.openingHours) : (biz.opening_hours || ''),
          now,
          now
        );
        return { ...biz, placeId, id: Number(result.lastInsertRowid) };
      }
    } else {
      // JSON Fallback
      let existingIndex = fallbackDb.data.businesses.findIndex(b => b.provider_place_id === placeId);
      const now = new Date().toISOString();
      if (existingIndex >= 0) {
        fallbackDb.data.businesses[existingIndex] = {
          ...fallbackDb.data.businesses[existingIndex],
          ...biz,
          placeId,
          updated_at: now
        };
        fallbackDb.save();
        return fallbackDb.data.businesses[existingIndex];
      } else {
        const newBiz = {
          id: fallbackDb.data.businesses.length + 1,
          provider_place_id: placeId,
          placeId,
          name: biz.name || 'Unknown Business',
          category: biz.category || '',
          address: biz.address || '',
          phone: biz.phone || '',
          website: biz.website || '',
          maps_url: biz.mapsUrl || biz.maps_url || '',
          rating: biz.rating || 0,
          review_count: biz.reviewCount || 0,
          latitude: biz.latitude || null,
          longitude: biz.longitude || null,
          business_status: biz.businessStatus || 'OPERATIONAL',
          opening_hours: Array.isArray(biz.openingHours) ? JSON.stringify(biz.openingHours) : '',
          created_at: now,
          updated_at: now
        };
        fallbackDb.data.businesses.push(newBiz);
        fallbackDb.save();
        return newBiz;
      }
    }
  },

  // Save Lead
  saveLead({ placeId, businessData, status = 'New', notes = '', followUpDate = null, serviceInterest = 'Web Development' }) {
    const business = this.upsertBusiness({ ...(businessData || {}), placeId: placeId || businessData?.placeId });
    const now = new Date().toISOString();
    const cleanStatus = status || 'New';
    const cleanNotes = notes || '';
    const cleanFollowUp = followUpDate || null;
    const cleanInterest = serviceInterest || 'Web Development';

    if (isNativeSqlite) {
      // Check if lead already exists for this business
      const existingLeadStmt = db.prepare('SELECT * FROM leads WHERE business_id = ?');
      const existingLead = existingLeadStmt.get(business.id);

      if (existingLead) {
        const updateLeadStmt = db.prepare(`
          UPDATE leads SET status = ?, notes = ?, follow_up_date = ?, service_interest = ?, updated_at = ?
          WHERE id = ?
        `);
        updateLeadStmt.run(cleanStatus, cleanNotes, cleanFollowUp, cleanInterest, now, existingLead.id);
        return { ...existingLead, status: cleanStatus, notes: cleanNotes, follow_up_date: cleanFollowUp, service_interest: cleanInterest, business };
      } else {
        const insertLeadStmt = db.prepare(`
          INSERT INTO leads (business_id, status, notes, follow_up_date, service_interest, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const result = insertLeadStmt.run(business.id, cleanStatus, cleanNotes, cleanFollowUp, cleanInterest, now, now);
        return {
          id: Number(result.lastInsertRowid),
          business_id: business.id,
          status: cleanStatus,
          notes: cleanNotes,
          follow_up_date: cleanFollowUp,
          service_interest: cleanInterest,
          created_at: now,
          business
        };
      }
    } else {
      let existingLead = fallbackDb.data.leads.find(l => l.business_id === business.id);
      if (existingLead) {
        existingLead.status = cleanStatus;
        existingLead.notes = cleanNotes;
        existingLead.follow_up_date = cleanFollowUp;
        existingLead.service_interest = cleanInterest;
        existingLead.updated_at = now;
        fallbackDb.save();
        return { ...existingLead, business };
      } else {
        const newLead = {
          id: fallbackDb.data.leads.length + 1,
          business_id: business.id,
          status: cleanStatus,
          notes: cleanNotes,
          follow_up_date: cleanFollowUp,
          service_interest: cleanInterest,
          created_at: now,
          updated_at: now
        };
        fallbackDb.data.leads.push(newLead);
        fallbackDb.save();
        return { ...newLead, business };
      }
    }
  },

  // Get all leads with business details
  getAllLeads() {
    if (isNativeSqlite) {
      const stmt = db.prepare(`
        SELECT 
          l.id, l.business_id, l.status, l.notes, l.follow_up_date, l.service_interest, l.lead_source, l.created_at, l.updated_at,
          b.provider_place_id, b.name, b.category, b.address, b.phone, b.website, b.maps_url, b.rating, b.review_count,
          b.latitude, b.longitude, b.business_status, b.opening_hours
        FROM leads l
        JOIN businesses b ON l.business_id = b.id
        ORDER BY l.updated_at DESC
      `);
      const rows = stmt.all();
      return rows.map(r => ({
        id: r.id,
        businessId: r.business_id,
        status: r.status,
        notes: r.notes,
        followUpDate: r.follow_up_date,
        serviceInterest: r.service_interest,
        leadSource: r.lead_source,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        business: {
          id: r.business_id,
          placeId: r.provider_place_id,
          name: r.name,
          category: r.category,
          address: r.address,
          phone: r.phone,
          website: r.website,
          mapsUrl: r.maps_url,
          rating: r.rating,
          reviewCount: r.review_count,
          latitude: r.latitude,
          longitude: r.longitude,
          businessStatus: r.business_status,
          openingHours: r.opening_hours ? safeParse(r.opening_hours) : []
        }
      }));
    } else {
      return fallbackDb.data.leads.map(l => {
        const b = fallbackDb.data.businesses.find(biz => biz.id === l.business_id) || {};
        return {
          id: l.id,
          businessId: l.business_id,
          status: l.status,
          notes: l.notes,
          followUpDate: l.follow_up_date,
          serviceInterest: l.service_interest,
          createdAt: l.created_at,
          updatedAt: l.updated_at,
          business: {
            ...b,
            placeId: b.provider_place_id,
            openingHours: b.opening_hours ? safeParse(b.opening_hours) : []
          }
        };
      });
    }
  },

  // Update lead
  updateLead(id, updates) {
    const leadId = Number(id);
    const now = new Date().toISOString();
    if (isNativeSqlite) {
      const fields = [];
      const values = [];
      if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
      if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
      if (updates.followUpDate !== undefined) { fields.push('follow_up_date = ?'); values.push(updates.followUpDate); }
      if (updates.serviceInterest !== undefined) { fields.push('service_interest = ?'); values.push(updates.serviceInterest); }
      fields.push('updated_at = ?');
      values.push(now);
      values.push(leadId);

      const stmt = db.prepare(`UPDATE leads SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
      return this.getAllLeads().find(l => l.id === leadId);
    } else {
      const idx = fallbackDb.data.leads.findIndex(l => l.id === leadId);
      if (idx >= 0) {
        fallbackDb.data.leads[idx] = { ...fallbackDb.data.leads[idx], ...updates, updated_at: now };
        fallbackDb.save();
        return this.getAllLeads().find(l => l.id === leadId);
      }
      return null;
    }
  },

  // Delete lead
  deleteLead(id) {
    const leadId = Number(id);
    if (isNativeSqlite) {
      const stmt = db.prepare('DELETE FROM leads WHERE id = ?');
      stmt.run(leadId);
      return true;
    } else {
      fallbackDb.data.leads = fallbackDb.data.leads.filter(l => l.id !== leadId);
      fallbackDb.save();
      return true;
    }
  },

  // Save search history
  recordSearch(location, businessType, radius, count) {
    if (isNativeSqlite) {
      const stmt = db.prepare('INSERT INTO search_history (location, business_type, radius, results_count) VALUES (?, ?, ?, ?)');
      stmt.run(location, businessType, radius, count);
    } else {
      fallbackDb.data.search_history.unshift({
        id: Date.now(),
        location,
        business_type: businessType,
        radius,
        results_count: count,
        created_at: new Date().toISOString()
      });
      if (fallbackDb.data.search_history.length > 50) fallbackDb.data.search_history.pop();
      fallbackDb.save();
    }
  },

  // Get search history
  getSearchHistory(limit = 10) {
    if (isNativeSqlite) {
      const stmt = db.prepare('SELECT * FROM search_history ORDER BY id DESC LIMIT ?');
      return stmt.all(limit);
    } else {
      return fallbackDb.data.search_history.slice(0, limit);
    }
  },

  // Get saved lead place IDs (to indicate in search results whether a business is already saved)
  getSavedPlaceIds() {
    if (isNativeSqlite) {
      const stmt = db.prepare(`
        SELECT b.provider_place_id, l.status, l.id as lead_id
        FROM leads l
        JOIN businesses b ON l.business_id = b.id
      `);
      return stmt.all();
    } else {
      return fallbackDb.data.leads.map(l => {
        const b = fallbackDb.data.businesses.find(biz => biz.id === l.business_id);
        return {
          provider_place_id: b ? b.provider_place_id : null,
          status: l.status,
          lead_id: l.id
        };
      }).filter(x => x.provider_place_id);
    }
  },

  // Get Stats
  getStats() {
    const leads = this.getAllLeads();
    const history = this.getSearchHistory(100);
    const totalSearches = history.length;
    const totalBusinessesFound = history.reduce((sum, h) => sum + (h.results_count || 0), 0);
    const savedLeads = leads.length;
    const contactedLeads = leads.filter(l => l.status === 'Contacted').length;
    const interestedLeads = leads.filter(l => l.status === 'Interested').length;
    const followUpLeads = leads.filter(l => l.status === 'Follow-up').length;
    const convertedLeads = leads.filter(l => l.status === 'Converted').length;

    return {
      totalSearches,
      totalBusinessesFound,
      savedLeads,
      contactedLeads,
      interestedLeads,
      followUpLeads,
      convertedLeads,
      statusBreakdown: {
        New: leads.filter(l => l.status === 'New').length,
        Contacted: contactedLeads,
        Interested: interestedLeads,
        'Follow-up': followUpLeads,
        Converted: convertedLeads,
        'Not interested': leads.filter(l => l.status === 'Not interested').length
      }
    };
  }
};

function safeParse(str) {
  try { return JSON.parse(str); } catch { return []; }
}
