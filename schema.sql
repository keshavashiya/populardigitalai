-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMs
CREATE TYPE room_type_enum AS ENUM ('SINGLE', 'DOUBLE', 'SUITE', 'DELUXE');
CREATE TYPE room_status_enum AS ENUM ('AVAILABLE', 'OCCUPIED', 'NOT_AVAILABLE');
CREATE TYPE room_stay_status_enum AS ENUM ('CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');
CREATE TYPE audit_type_enum AS ENUM ('CHECK_IN', 'CHECK_OUT');
CREATE TYPE condition_status_enum AS ENUM ('GOOD', 'DAMAGED', 'MISSING');

-- tables
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(10) NOT NULL UNIQUE,
    room_type room_type_enum NOT NULL,
    floor_number INT NOT NULL,
    status room_status_enum NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE item_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category_id UUID NOT NULL REFERENCES item_categories(id),
    unit_price DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_stays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    guest_name VARCHAR(100) NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    status room_stay_status_enum NOT NULL DEFAULT 'CHECKED_IN',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_stay_id UUID NOT NULL REFERENCES room_stays(id),
    audit_type audit_type_enum NOT NULL,
    auditor_name VARCHAR(100) NOT NULL,
    audit_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_record_id UUID NOT NULL REFERENCES audit_records(id),
    item_id UUID NOT NULL REFERENCES items(id),
    quantity INT NOT NULL CHECK (quantity >= 0),
    condition_status condition_status_enum NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- indexes
CREATE INDEX idx_rooms_status_type ON rooms(status, room_type);
CREATE INDEX idx_items_category_active ON items(category_id, is_active);
CREATE INDEX idx_room_stays_status_dates ON room_stays(status, check_in_time, check_out_time);
CREATE INDEX idx_audit_records_composite ON audit_records(room_stay_id, audit_type, audit_time);
CREATE INDEX idx_audit_items_composite ON audit_items(audit_record_id, item_id, condition_status);
