-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliveries Table
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    mobile_no TEXT NOT NULL,
    location TEXT NOT NULL,
    delivery_date DATE NOT NULL,
    product_details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'cancelled')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_deliveries_created_by ON deliveries(created_by);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

-- Note: Password hashing is handled by the Node.js backend (bcrypt).
-- Seed initial admin (manual step or via setup script)
