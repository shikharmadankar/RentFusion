-- ============================================================
-- RentFusion — Core PostgreSQL Schema (v1)
-- Scope: auth, catalog, availability, bookings, payments, trust
-- Naming: snake_case, uuid PKs, soft-delete via deleted_at
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- USERS & AUTH ----------

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number        VARCHAR(20) NOT NULL UNIQUE,   -- E.164 format, e.g. +919812345678
    email               VARCHAR(255) UNIQUE,
    full_name           VARCHAR(150),
    role                VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'support')),
    is_phone_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    is_kyc_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url          TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;

CREATE TABLE otps (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number        VARCHAR(20) NOT NULL,
    code_hash           VARCHAR(255) NOT NULL,          -- never store raw OTP
    purpose             VARCHAR(20) NOT NULL DEFAULT 'login' CHECK (purpose IN ('login', 'signup', 'reset')),
    attempts            SMALLINT NOT NULL DEFAULT 0,
    max_attempts         SMALLINT NOT NULL DEFAULT 5,
    provider_message_id TEXT,                           -- Twilio SID for traceability
    expires_at          TIMESTAMPTZ NOT NULL,
    consumed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_otps_phone_active ON otps(phone_number, expires_at) WHERE consumed_at IS NULL;

CREATE TABLE refresh_tokens (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash          VARCHAR(255) NOT NULL UNIQUE,
    user_agent          TEXT,
    ip_address          INET,
    expires_at          TIMESTAMPTZ NOT NULL,
    revoked_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id) WHERE revoked_at IS NULL;

CREATE TABLE user_profiles (
    user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio                 TEXT,
    date_of_birth       DATE,
    id_document_type    VARCHAR(30),                    -- aadhaar, passport, license, etc.
    id_document_number  VARCHAR(100),
    id_document_url     TEXT,
    kyc_status          VARCHAR(20) NOT NULL DEFAULT 'not_submitted'
                         CHECK (kyc_status IN ('not_submitted', 'pending', 'approved', 'rejected')),
    average_rating       NUMERIC(3,2) DEFAULT 0,
    total_reviews        INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE addresses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label               VARCHAR(50),                    -- 'home', 'work', etc.
    line1               VARCHAR(255) NOT NULL,
    line2               VARCHAR(255),
    city                VARCHAR(100) NOT NULL,
    state               VARCHAR(100),
    postal_code         VARCHAR(20),
    country             VARCHAR(100) NOT NULL DEFAULT 'India',
    latitude            NUMERIC(9,6),
    longitude           NUMERIC(9,6),
    is_default          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_geo ON addresses(latitude, longitude);

-- ---------- CATALOG ----------

CREATE TABLE categories (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id           UUID REFERENCES categories(id),
    name                VARCHAR(100) NOT NULL,
    slug                VARCHAR(120) NOT NULL UNIQUE,
    icon                VARCHAR(50),
    description         TEXT,
    display_order       INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

CREATE TABLE rental_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id         UUID NOT NULL REFERENCES categories(id),
    title               VARCHAR(150) NOT NULL,
    description         TEXT,
    brand               VARCHAR(100),
    model               VARCHAR(100),
    condition           VARCHAR(20) CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'worn')),
    purchase_year       SMALLINT,
    price_hourly        NUMERIC(10,2),
    price_daily         NUMERIC(10,2) NOT NULL,
    price_weekly        NUMERIC(10,2),
    price_monthly       NUMERIC(10,2),
    security_deposit    NUMERIC(10,2) NOT NULL DEFAULT 0,
    min_duration_hours  INTEGER NOT NULL DEFAULT 24,
    max_duration_hours  INTEGER,
    delivery_available  BOOLEAN NOT NULL DEFAULT FALSE,
    pickup_address_id   UUID REFERENCES addresses(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'pending_review'
                         CHECK (status IN ('pending_review', 'active', 'paused', 'under_maintenance', 'rejected', 'archived')),
    view_count          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_items_owner ON rental_items(owner_id);
CREATE INDEX idx_items_category ON rental_items(category_id);
CREATE INDEX idx_items_status ON rental_items(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_items_price ON rental_items(price_daily);

CREATE TABLE item_images (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id             UUID NOT NULL REFERENCES rental_items(id) ON DELETE CASCADE,
    url                 TEXT NOT NULL,
    cloudinary_public_id VARCHAR(255),
    display_order       INTEGER NOT NULL DEFAULT 0,
    is_primary          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_item_images_item ON item_images(item_id);

CREATE TABLE item_videos (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id             UUID NOT NULL REFERENCES rental_items(id) ON DELETE CASCADE,
    url                 TEXT NOT NULL,
    cloudinary_public_id VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- AVAILABILITY & BOOKINGS ----------

CREATE TABLE availability_calendar (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id             UUID NOT NULL REFERENCES rental_items(id) ON DELETE CASCADE,
    date                DATE NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'available'
                         CHECK (status IN ('available', 'booked', 'blocked')),
    booking_id          UUID,                            -- set when status = 'booked'
    UNIQUE (item_id, date)
);
CREATE INDEX idx_availability_item_date ON availability_calendar(item_id, date);

CREATE TABLE rental_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id             UUID NOT NULL REFERENCES rental_items(id),
    renter_id           UUID NOT NULL REFERENCES users(id),
    owner_id            UUID NOT NULL REFERENCES users(id),
    start_date          TIMESTAMPTZ NOT NULL,
    end_date            TIMESTAMPTZ NOT NULL,
    duration_type       VARCHAR(20) NOT NULL CHECK (duration_type IN ('hourly', 'half_day', 'daily', 'weekly', 'monthly', 'custom')),
    message              TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'expired')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at        TIMESTAMPTZ
);
CREATE INDEX idx_requests_item ON rental_requests(item_id);
CREATE INDEX idx_requests_renter ON rental_requests(renter_id);
CREATE INDEX idx_requests_owner ON rental_requests(owner_id, status);

CREATE TABLE bookings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id          UUID NOT NULL REFERENCES rental_requests(id),
    item_id             UUID NOT NULL REFERENCES rental_items(id),
    renter_id           UUID NOT NULL REFERENCES users(id),
    owner_id            UUID NOT NULL REFERENCES users(id),
    start_date          TIMESTAMPTZ NOT NULL,
    end_date            TIMESTAMPTZ NOT NULL,
    rental_cost         NUMERIC(10,2) NOT NULL,
    platform_fee        NUMERIC(10,2) NOT NULL DEFAULT 0,
    gst_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
    security_deposit    NUMERIC(10,2) NOT NULL DEFAULT 0,
    late_fee            NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(10,2) NOT NULL,
    coupon_id           UUID,
    status              VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                         CHECK (status IN ('confirmed', 'ongoing', 'return_pending', 'returned', 'completed', 'cancelled')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_item ON bookings(item_id);
CREATE INDEX idx_bookings_renter ON bookings(renter_id);
CREATE INDEX idx_bookings_owner ON bookings(owner_id);
CREATE INDEX idx_bookings_status ON bookings(status);

ALTER TABLE availability_calendar
    ADD CONSTRAINT fk_availability_booking FOREIGN KEY (booking_id) REFERENCES bookings(id);

CREATE TABLE rental_extensions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    requested_end_date  TIMESTAMPTZ NOT NULL,
    additional_cost     NUMERIC(10,2) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    responded_at        TIMESTAMPTZ
);
CREATE INDEX idx_extensions_booking ON rental_extensions(booking_id);

-- ---------- CONDITION, RETURNS & MAINTENANCE ----------

CREATE TABLE item_condition_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    stage               VARCHAR(20) NOT NULL CHECK (stage IN ('pre_rental', 'post_rental')),
    photo_urls          TEXT[] NOT NULL,
    notes               TEXT,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_condition_reports_booking ON item_condition_reports(booking_id);

CREATE TABLE returns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    status              VARCHAR(20) NOT NULL DEFAULT 'return_pending'
                         CHECK (status IN ('return_pending', 'returned', 'inspection', 'damage_found', 'completed')),
    returned_at         TIMESTAMPTZ,
    inspected_at        TIMESTAMPTZ,
    inspector_id        UUID REFERENCES users(id),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE damage_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id           UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
    reported_by         UUID NOT NULL REFERENCES users(id),
    description         TEXT NOT NULL,
    photo_urls          TEXT[],
    estimated_cost      NUMERIC(10,2),
    status              VARCHAR(20) NOT NULL DEFAULT 'reported'
                         CHECK (status IN ('reported', 'under_review', 'resolved', 'disputed')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE maintenance_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id             UUID NOT NULL REFERENCES rental_items(id) ON DELETE CASCADE,
    reason              TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'under_maintenance'
                         CHECK (status IN ('under_maintenance', 'repair_in_progress', 'ready')),
    cost                NUMERIC(10,2),
    started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at        TIMESTAMPTZ
);
CREATE INDEX idx_maintenance_item ON maintenance_records(item_id);

-- ---------- PAYMENTS ----------

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL REFERENCES bookings(id),
    payer_id            UUID NOT NULL REFERENCES users(id),
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    amount              NUMERIC(10,2) NOT NULL,
    currency            VARCHAR(10) NOT NULL DEFAULT 'INR',
    type                VARCHAR(20) NOT NULL CHECK (type IN ('rent', 'deposit', 'extension', 'late_fee', 'refund')),
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);

CREATE TABLE security_deposits (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL UNIQUE REFERENCES bookings(id),
    amount              NUMERIC(10,2) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'held'
                         CHECK (status IN ('held', 'released', 'partially_deducted', 'forfeited')),
    deducted_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
    released_at         TIMESTAMPTZ
);

CREATE TABLE coupons (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                VARCHAR(50) NOT NULL UNIQUE,
    discount_type       VARCHAR(10) NOT NULL CHECK (discount_type IN ('flat', 'percent')),
    discount_value      NUMERIC(10,2) NOT NULL,
    max_discount        NUMERIC(10,2),
    min_order_value     NUMERIC(10,2) DEFAULT 0,
    usage_limit         INTEGER,
    times_used          INTEGER NOT NULL DEFAULT 0,
    valid_from          TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until         TIMESTAMPTZ NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------- TRUST, ENGAGEMENT & COMMS ----------

CREATE TABLE reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL REFERENCES bookings(id),
    reviewer_id         UUID NOT NULL REFERENCES users(id),
    reviewee_id         UUID NOT NULL REFERENCES users(id),
    item_id             UUID REFERENCES rental_items(id),
    rating              SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment             TEXT,
    photo_urls          TEXT[],
    is_verified         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (booking_id, reviewer_id)
);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_item ON reviews(item_id);

CREATE TABLE wishlists (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id             UUID NOT NULL REFERENCES rental_items(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, item_id)
);

CREATE TABLE messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id           UUID NOT NULL,                   -- groups a renter<->owner conversation, optionally per item
    sender_id           UUID NOT NULL REFERENCES users(id),
    recipient_id        UUID NOT NULL REFERENCES users(id),
    item_id             UUID REFERENCES rental_items(id),
    body                TEXT NOT NULL,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_thread ON messages(thread_id, created_at);
CREATE INDEX idx_messages_recipient ON messages(recipient_id) WHERE read_at IS NULL;

CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                VARCHAR(50) NOT NULL,             -- 'request_received', 'booking_accepted', etc.
    title               VARCHAR(150) NOT NULL,
    body                TEXT,
    reference_type      VARCHAR(50),                      -- 'booking', 'request', 'message', etc.
    reference_id        UUID,
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE admin_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id            UUID NOT NULL REFERENCES users(id),
    action               VARCHAR(100) NOT NULL,
    target_type         VARCHAR(50),
    target_id           UUID,
    metadata             JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);

-- ---------- TRIGGERS: keep updated_at fresh ----------

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_items_updated_at BEFORE UPDATE ON rental_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
