-- Local Business Data Finder - Database Schema
-- Compatible with MySQL and PostgreSQL

-- 1. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_place_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    website TEXT,
    maps_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    business_status VARCHAR(100) DEFAULT 'OPERATIONAL',
    opening_hours TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'New',
    notes TEXT,
    follow_up_date DATE,
    service_interest VARCHAR(100) DEFAULT 'Web Development',
    lead_source VARCHAR(100) DEFAULT 'Local Search',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- 3. Search History Table
CREATE TABLE IF NOT EXISTS search_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    location VARCHAR(255) NOT NULL,
    business_type VARCHAR(255) NOT NULL,
    radius INT DEFAULT 10000,
    results_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_businesses_place_id ON businesses(provider_place_id);
CREATE INDEX idx_leads_business_id ON leads(business_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_search_history_created_at ON search_history(created_at);
