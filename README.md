# 📍 BizScout — Local Business Data Finder & Lead Generator

A modern, high-precision local business intelligence and lead-generation web application built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **SQLite**. 

BizScout allows digital agencies, coaching marketers, freelancers, and sales professionals to find local businesses (e.g. computer institutes, coaching centers, clinics, retail shops) in places like **Gorakhpur**, **Chauri Chaura**, or any city worldwide, view structured data, save leads to an integrated CRM pipeline, export clean spreadsheets to **Excel (.xlsx)** or **CSV**, and generate hyper-personalized sales outreach with **Free Gemini AI**.

---

## ✨ Key Highlights & Features

- 🌟 **Dual Search Intelligence**:
  - **Official Google Places API Support**: Plugs in your Google Maps Platform API key with cost-control limits and selective field fetching.
  - **Zero-Config Real-Time Fallback**: Built-in OpenStreetMap Nominatim/Overpass integration & regional directory synthesizer for Indian cities (like Gorakhpur and Chauri Chaura), meaning the app works **immediately out of the box** even without an API key!
- 🎨 **Visual Excellence & Micro-Animations**:
  - Glowing mesh hero section with animated floating value badges.
  - Interactive quick-search pills (e.g., *"Computer Institutes in Gorakhpur"*, *"Coaching Centers in Chauri Chaura"*).
  - Glassmorphic navigation and responsive mobile drawer.
- ⚡ **Dynamic Results Table**:
  - Configurable data fields (Name, Address, Phone, Website, Maps Link, Rating, Reviews, Hours).
  - Search within results & sort by Rating, Review Count, or Name.
  - Row multi-selection & batch actions (Save Selected to CRM, Export Selected).
  - 1-Click actions: Copy Phone, Open Website, Open Google Maps, WhatsApp chat.
- 👥 **Built-in Leads CRM Pipeline**:
  - Track lead status lifecycle: `New` → `Contacted` → `Interested` → `Follow-up` → `Converted` → `Not interested`.
  - Inline meeting notes editor & follow-up calendar date picker.
  - Categorize by service interest (`Web Development`, `Computer Training`, `Digital Marketing`).
  - 1-Click WhatsApp launch (`https://wa.me/...`) with pre-crafted introductory pitch.
- 🤖 **AI Sales Outreach Studio (Powered by Gemini AI)**:
  - Select an outreach angle: *Modern Website & SEO Pitch*, *Student Admissions Tie-up*, or *Local Business Growth*.
  - Generates ready-to-send WhatsApp messages, high-converting cold email sequences, and AI lead opportunity audits.
- 📊 **Analytics & Pipeline Dashboard**:
  - Conversion rate tracking, saved leads breakdown, and recent search history with 1-click re-run.
- 📥 **Flexible Spreadsheet Exports**:
  - 1-click client & server-side export to formatted **Excel (.xlsx)** with auto-sized columns and **CSV**.
- 🛡️ **Zero-Scraping Compliance & Security**:
  - Strictly follows official API access and privacy guidelines (no brittle or unauthorized HTML scraping).
  - Server-side rate limiting to prevent API quota exhaustion.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, Axios, SheetJS (`xlsx`), Canvas Confetti |
| **Backend** | Node.js v22, Express.js, CORS, `express-rate-limit`, `dotenv`, Axios, SheetJS |
| **Database** | Built-in SQLite (`node:sqlite`) with persistent JSON fallback (Zero configuration required) |
| **External APIs** | Google Places API (New & Text Search), OpenStreetMap Overpass, Google Gemini 1.5 Flash |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18 or higher (Node v20/v22 recommended)
- **npm** v9 or higher

### 2. Quick Launch

#### Start Backend Server:
```bash
cd server
npm run dev
```
*The backend API will run at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*

#### Start Frontend Client (in a separate terminal):
```bash
cd client
npm run dev
```
*The Vite application will start at `http://localhost:5173`.*

---

## ⚙️ Configuration (Optional)

You can run searches immediately without any keys! To use live Google Places API or custom Gemini AI models:

1. Click **Settings** in the top navigation bar.
2. Enter your keys:
   - **Google Places API Key**: From [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) (includes $200 free monthly credit).
   - **Gemini AI Key**: 100% Free from [Google AI Studio](https://aistudio.google.com/app/apikey).
3. Click **Save Preferences**. Keys are stored safely in local storage and sent via secure headers.

Alternatively, add them to `server/.env`:
```env
PORT=5000
GOOGLE_MAPS_API_KEY=your_google_places_api_key
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

---

## 📂 Project Structure

```
Business Finder/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Glassmorphic header & tab switcher
│   │   │   ├── HeroSection.jsx     # Glowing hero, quick-search chips & stats
│   │   │   ├── SearchForm.jsx      # Location, category, radius & field controls
│   │   │   ├── ResultsTable.jsx    # Dynamic columns, batch actions & export
│   │   │   ├── LeadManagement.jsx  # Full CRM pipeline with inline editing
│   │   │   ├── Dashboard.jsx       # Analytics & search history re-run
│   │   │   ├── AiStudio.jsx        # Standalone AI pitch workshop
│   │   │   ├── AiOutreachModal.jsx # Instant modal for lead pitch generation
│   │   │   ├── SettingsModal.jsx   # API key and preferences manager
│   │   │   └── Footer.jsx          # Legal compliance & links
│   │   ├── services/
│   │   │   └── api.js              # Central Axios client with interceptors
│   │   ├── App.jsx                 # Main application state coordinator
│   │   ├── index.css               # Tailwind CSS & glowing animations
│   │   └── main.jsx                # React root mount
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # SQLite Database schema & repository
│   │   ├── controllers/
│   │   │   ├── businessController.js # Search & history endpoints
│   │   │   ├── leadController.js     # Lead CRUD, CRM stats & export
│   │   │   └── aiController.js       # AI outreach generator
│   │   ├── routes/
│   │   │   ├── businessRoutes.js
│   │   │   ├── leadRoutes.js
│   │   │   └── aiRoutes.js
│   │   ├── services/
│   │   │   ├── placesService.js    # Google Places + OSM + Fallback engine
│   │   │   ├── aiService.js        # Gemini AI + Smart template synthesizer
│   │   │   └── exportService.js    # Excel (.xlsx) & CSV generation
│   │   └── server.js               # Express app, rate limiter, middleware
│   ├── .env
│   └── package.json
│
├── database/
│   └── schema.sql              # Production SQL schema for MySQL / PostgreSQL
├── package.json                # Root package scripts
└── README.md
```

---

## 📡 API Reference

### Business Search
- `POST /api/businesses/search`
  - Body: `{ "location": "Gorakhpur", "businessType": "Computer Institutes", "radius": 10000, "limit": 20, "fields": ["name", "phone", "address"] }`
  - Returns normalized business listings with cross-referenced CRM saved status.

- `GET /api/businesses/history`
  - Returns recent queries.

### Leads CRM
- `GET /api/leads?status=All&search=` — Get saved leads.
- `POST /api/leads` — Save single lead or `{ leads: [...] }` bulk save.
- `PATCH /api/leads/:id` — Update status, notes, follow-up date, or service interest.
- `DELETE /api/leads/:id` — Remove lead from CRM.
- `GET /api/leads/stats` — Dashboard KPIs & conversion rate.
- `GET /api/leads/export?format=xlsx` — Export database leads to Excel spreadsheet.

### AI Outreach
- `POST /api/ai/outreach`
  - Body: `{ "business": { ... }, "objective": "web_dev", "senderName": "Apex Agency" }`
  - Returns customized WhatsApp message, cold email, and AI lead score.

---

## 📜 Compliance & Ethics
BizScout is built in accordance with official data use terms:
- Data is collected exclusively from public directory listings and official APIs.
- No personal non-business consumer data is stored.
- Users must abide by applicable telemarketing and communications laws before contacting leads.
#   B u s i n e s s - F i n d e r  
 