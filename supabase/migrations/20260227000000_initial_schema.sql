-- ============================================================
-- MyLifeFolio — Complete Database Migration
-- Run this in Supabase SQL Editor or as a migration file
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TRIGGER FUNCTION: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    preferred_name TEXT,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    date_of_birth DATE,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- TABLE: roles
-- ============================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    role_type TEXT CHECK (role_type IN (
        'spouse_partner',
        'healthcare_poa_agent',
        'financial_poa_agent',
        'executor_trustee',
        'financial_team',
        'legal_team',
        'healthcare_team',
        'no_restrictions',
        'owner_only',
        'custom'
    )),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, name)
);

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own roles"
    ON roles FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: persons
-- ============================================================
CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    relationship TEXT,
    notes TEXT,
    is_emergency_contact BOOLEAN DEFAULT FALSE,
    emergency_override BOOLEAN DEFAULT FALSE,
    has_user_account BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_persons_updated_at
    BEFORE UPDATE ON persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage persons"
    ON persons FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Persons can view themselves"
    ON persons FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: person_roles
-- ============================================================
CREATE TABLE person_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(person_id, role_id)
);

ALTER TABLE person_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage person_roles"
    ON person_roles FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, slug)
);

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage categories"
    ON categories FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: category_role_access
-- ============================================================
CREATE TABLE category_role_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id, role_id)
);

ALTER TABLE category_role_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage category_role_access"
    ON category_role_access FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: folio_items
-- ============================================================
CREATE TABLE folio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN (
        'text', 'rich_text', 'contact', 'document', 'credential',
        'financial', 'property', 'medical', 'instruction', 'checklist', 'custom'
    )),
    data JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    is_sensitive BOOLEAN DEFAULT FALSE,
    use_custom_access BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_folio_items_owner ON folio_items(owner_id);
CREATE INDEX idx_folio_items_category ON folio_items(category_id);
CREATE INDEX idx_folio_items_data ON folio_items USING gin(data);

CREATE TRIGGER update_folio_items_updated_at
    BEFORE UPDATE ON folio_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE folio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage folio_items"
    ON folio_items FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: item_role_access
-- ============================================================
CREATE TABLE item_role_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES folio_items(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, role_id)
);

ALTER TABLE item_role_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage item_role_access"
    ON item_role_access FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: file_attachments
-- ============================================================
CREATE TABLE file_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES folio_items(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    storage_path TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_file_attachments_updated_at
    BEFORE UPDATE ON file_attachments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage file_attachments"
    ON file_attachments FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: audit_log
-- ============================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL CHECK (action IN (
        'view', 'create', 'update', 'delete',
        'share', 'revoke', 'login', 'export',
        'emergency_access'
    )),
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_owner ON audit_log(owner_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view audit_log"
    ON audit_log FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "System can insert audit_log"
    ON audit_log FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- FUNCTION: seed_user_defaults
-- ============================================================
CREATE OR REPLACE FUNCTION seed_user_defaults(user_id UUID)
RETURNS VOID AS $$
DECLARE
    r_spouse UUID;
    r_hcpoa UUID;
    r_finpoa UUID;
    r_executor UUID;
    r_financial UUID;
    r_legal UUID;
    r_healthcare UUID;
    r_no_restrict UUID;
    r_owner_only UUID;
    c_id UUID;
BEGIN
    -- CREATE DEFAULT ROLES
    INSERT INTO roles (id, owner_id, name, description, is_system_role, role_type, sort_order)
    VALUES
        (gen_random_uuid(), user_id, 'Spouse/Partner', 'Your spouse or domestic partner', TRUE, 'spouse_partner', 1),
        (gen_random_uuid(), user_id, 'Healthcare POA Agent', 'Person(s) designated in your Healthcare Power of Attorney', TRUE, 'healthcare_poa_agent', 2),
        (gen_random_uuid(), user_id, 'Financial POA Agent', 'Person(s) designated in your Financial Power of Attorney', TRUE, 'financial_poa_agent', 3),
        (gen_random_uuid(), user_id, 'Executor/Trustee', 'Your executor, personal representative, or successor trustee', TRUE, 'executor_trustee', 4),
        (gen_random_uuid(), user_id, 'Financial Team', 'Wealth manager, CPA, banker, financial advisor', TRUE, 'financial_team', 5),
        (gen_random_uuid(), user_id, 'Legal Team', 'Estate planning attorney, business attorney', TRUE, 'legal_team', 6),
        (gen_random_uuid(), user_id, 'Healthcare Team', 'Physicians, care managers, concierge doctor', TRUE, 'healthcare_team', 7),
        (gen_random_uuid(), user_id, 'No Restrictions', 'Visible to everyone with any access to your folio', TRUE, 'no_restrictions', 8),
        (gen_random_uuid(), user_id, 'Owner Only', 'Visible only to you — no one else can see this', TRUE, 'owner_only', 9);

    SELECT id INTO r_spouse FROM roles WHERE owner_id = user_id AND role_type = 'spouse_partner';
    SELECT id INTO r_hcpoa FROM roles WHERE owner_id = user_id AND role_type = 'healthcare_poa_agent';
    SELECT id INTO r_finpoa FROM roles WHERE owner_id = user_id AND role_type = 'financial_poa_agent';
    SELECT id INTO r_executor FROM roles WHERE owner_id = user_id AND role_type = 'executor_trustee';
    SELECT id INTO r_financial FROM roles WHERE owner_id = user_id AND role_type = 'financial_team';
    SELECT id INTO r_legal FROM roles WHERE owner_id = user_id AND role_type = 'legal_team';
    SELECT id INTO r_healthcare FROM roles WHERE owner_id = user_id AND role_type = 'healthcare_team';
    SELECT id INTO r_no_restrict FROM roles WHERE owner_id = user_id AND role_type = 'no_restrictions';
    SELECT id INTO r_owner_only FROM roles WHERE owner_id = user_id AND role_type = 'owner_only';

    -- 1. Personal & Identity → Executor, Spouse, Financial POA
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Personal & Identity', 'personal-identity',
        'Legal identity documents, vital records, and personal identification information', 'fingerprint', 1)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_executor, user_id), (c_id, r_spouse, user_id), (c_id, r_finpoa, user_id);

    -- 2. Family & Relationships → No Restrictions
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Family & Relationships', 'family-relationships',
        'Family tree, contact information, and relationship notes', 'users', 2)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_no_restrict, user_id);

    -- 3. Friends & Neighbors → Spouse, HC POA, Executor
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Friends & Neighbors', 'friends-neighbors',
        'Local contacts who can check on you, have keys, or assist in emergencies', 'home', 3)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_spouse, user_id), (c_id, r_hcpoa, user_id), (c_id, r_executor, user_id);

    -- 4. Professional Advisory Team → No Restrictions
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Professional Advisory Team', 'advisory-team',
        'Your attorney, CPA, wealth manager, insurance agent, banker, and other advisors', 'briefcase', 4)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_no_restrict, user_id);

    -- 5. Medical History & Current Care → HC POA, Healthcare Team, Spouse
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Medical History & Current Care', 'medical-history',
        'Diagnoses, medications, physicians, allergies, medical devices, pharmacy information', 'heart-pulse', 5)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_hcpoa, user_id), (c_id, r_healthcare, user_id), (c_id, r_spouse, user_id);

    -- 6. Healthcare Preferences & Directives → HC POA, Healthcare Team, Spouse
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Healthcare Preferences & Directives', 'healthcare-preferences',
        'Preferred hospitals, DNR status, living will specifics, treatment preferences, pain management philosophy', 'stethoscope', 6)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_hcpoa, user_id), (c_id, r_healthcare, user_id), (c_id, r_spouse, user_id);

    -- 7. Long-Term Care Desires → HC POA, Healthcare Team, Spouse, Executor
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Long-Term Care Desires', 'long-term-care',
        'Preferred care settings, staffing preferences, quality of life definitions, transition thresholds', 'bed', 7)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_hcpoa, user_id), (c_id, r_healthcare, user_id), (c_id, r_spouse, user_id), (c_id, r_executor, user_id);

    -- 8. Mental Health & Cognitive Decline → HC POA, Healthcare Team, Spouse
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Mental Health & Cognitive Decline', 'mental-health',
        'Wishes for cognitive decline, memory care preferences, comfort routines, what you do and do not want', 'brain', 8)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_hcpoa, user_id), (c_id, r_healthcare, user_id), (c_id, r_spouse, user_id);

    -- 9. Financial Overview → Fin POA, Financial, Legal, Executor, Spouse
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Financial Overview', 'financial-overview',
        'Bank accounts, brokerage accounts, retirement accounts, insurance policies, debts, safe deposit boxes', 'landmark', 9)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_finpoa, user_id), (c_id, r_financial, user_id), (c_id, r_legal, user_id),
        (c_id, r_executor, user_id), (c_id, r_spouse, user_id);

    -- 10. Digital Life → Owner Only
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Digital Life', 'digital-life',
        'Email accounts, cloud storage, passwords, social media, cryptocurrency, subscriptions', 'monitor-smartphone', 10)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_owner_only, user_id);

    -- 11. Income Streams & Recurring Obligations → Fin POA, Financial, Legal, Executor, Spouse
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Income Streams & Recurring Obligations', 'income-obligations',
        'Pensions, Social Security, annuities, rental income, recurring bills, tax schedules, charitable pledges', 'repeat', 11)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_finpoa, user_id), (c_id, r_financial, user_id), (c_id, r_legal, user_id),
        (c_id, r_executor, user_id), (c_id, r_spouse, user_id);

    -- 12. Business Interests & Ownership → Fin POA, Financial, Legal, Executor
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Business Interests & Ownership', 'business-interests',
        'Active businesses, passive investments, PE funds, board positions, IP, key contacts, succession plans', 'building-2', 12)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_finpoa, user_id), (c_id, r_financial, user_id), (c_id, r_legal, user_id), (c_id, r_executor, user_id);

    -- 13. Royalties & Residual Income → Fin POA, Financial, Legal, Executor, Spouse
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Royalties & Residual Income', 'royalties',
        'Book, music, patent, mineral, franchise, and licensing royalties with transfer details', 'coins', 13)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_finpoa, user_id), (c_id, r_financial, user_id), (c_id, r_legal, user_id),
        (c_id, r_executor, user_id), (c_id, r_spouse, user_id);

    -- 14. Personal Property & Beneficiary Designations → Executor, Spouse
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Personal Property & Beneficiary Designations', 'personal-property',
        'Jewelry, art, collectibles, vehicles, wine collections — with specific beneficiary for each item', 'gem', 14)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_executor, user_id), (c_id, r_spouse, user_id);

    -- 15. Firearms → Executor, Spouse
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Firearms', 'firearms',
        'Complete inventory with make, model, serial numbers, locations, NFA items, transfer compliance, designated recipients', 'shield', 15)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_executor, user_id), (c_id, r_spouse, user_id);

    -- 16. Funeral, Burial & Memorial → No Restrictions
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Funeral, Burial & Memorial', 'funeral-burial',
        'Burial vs. cremation, funeral home, religious traditions, memorial wishes, obituary preferences, organ donation', 'flower-2', 16)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_no_restrict, user_id);

    -- 17. Personal Wishes & Legacy → Spouse, Executor
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Personal Wishes & Legacy', 'personal-wishes',
        'Ethical will, legacy letters, values, life lessons, family stories, charitable legacy intentions', 'scroll-text', 17)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_spouse, user_id), (c_id, r_executor, user_id);

    -- 18. Home & Property → Spouse, Financial POA
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Home & Property', 'home-property',
        'Alarm codes, household operations, seasonal instructions, vehicles, storage, staff and vendor contacts', 'house', 18)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_spouse, user_id), (c_id, r_finpoa, user_id);

    -- 19. Club Memberships & Social Commitments → Spouse, Executor
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Club Memberships & Social Commitments', 'clubs-memberships',
        'Country clubs, yacht clubs, board positions, volunteer commitments, season tickets, transferability details', 'trophy', 19)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_spouse, user_id), (c_id, r_executor, user_id);

    -- 20. Travel & Lifestyle → Spouse
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Travel & Lifestyle', 'travel-lifestyle',
        'Frequent flyer accounts, loyalty programs, travel agent, timeshares, planned trips, concierge contacts', 'plane', 20)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_spouse, user_id);

    -- 21. Pets & Pet Care → Spouse, Executor
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), user_id, 'Pets & Pet Care', 'pets',
        'Pet profiles, veterinary info, feeding and medication schedules, designated caretakers, pet trust details, and care instructions', 'paw-print', 21)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_spouse, user_id), (c_id, r_executor, user_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGER: Auto-seed defaults on new user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

    PERFORM seed_user_defaults(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FUNCTION: check_person_access
-- ============================================================
CREATE OR REPLACE FUNCTION check_person_access(
    p_person_id UUID,
    p_category_id UUID,
    p_item_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_owner_id UUID;
    v_has_emergency BOOLEAN;
    v_use_custom BOOLEAN;
    v_has_no_restrict BOOLEAN;
    v_has_access BOOLEAN;
BEGIN
    SELECT owner_id INTO v_owner_id FROM categories WHERE id = p_category_id;

    -- Emergency override
    SELECT emergency_override INTO v_has_emergency
    FROM persons WHERE id = p_person_id AND owner_id = v_owner_id;
    IF v_has_emergency THEN RETURN TRUE; END IF;

    -- No Restrictions check
    SELECT EXISTS(
        SELECT 1 FROM category_role_access cra
        JOIN roles r ON r.id = cra.role_id
        WHERE cra.category_id = p_category_id AND r.role_type = 'no_restrictions'
    ) INTO v_has_no_restrict;
    IF v_has_no_restrict THEN RETURN TRUE; END IF;

    -- Owner Only check
    IF EXISTS(
        SELECT 1 FROM category_role_access cra
        JOIN roles r ON r.id = cra.role_id
        WHERE cra.category_id = p_category_id AND r.role_type = 'owner_only'
    ) THEN RETURN FALSE; END IF;

    -- Item-level override check
    IF p_item_id IS NOT NULL THEN
        SELECT use_custom_access INTO v_use_custom
        FROM folio_items WHERE id = p_item_id;
        IF v_use_custom THEN
            SELECT EXISTS(
                SELECT 1 FROM item_role_access ira
                JOIN person_roles pr ON pr.role_id = ira.role_id
                WHERE ira.item_id = p_item_id AND pr.person_id = p_person_id
            ) INTO v_has_access;
            RETURN v_has_access;
        END IF;
    END IF;

    -- Category-level access via person's roles
    SELECT EXISTS(
        SELECT 1 FROM category_role_access cra
        JOIN person_roles pr ON pr.role_id = cra.role_id
        WHERE cra.category_id = p_category_id AND pr.person_id = p_person_id
    ) INTO v_has_access;

    RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS POLICIES FOR VIEWER ACCESS
-- ============================================================

-- Viewers can see accessible categories
CREATE POLICY "Persons can view accessible categories"
    ON categories FOR SELECT
    USING (
        auth.uid() = owner_id
        OR EXISTS (
            SELECT 1 FROM persons p
            WHERE p.user_id = auth.uid()
            AND p.owner_id = categories.owner_id
            AND check_person_access(p.id, categories.id)
        )
    );

-- Viewers can see accessible items
CREATE POLICY "Persons can view accessible items"
    ON folio_items FOR SELECT
    USING (
        auth.uid() = owner_id
        OR EXISTS (
            SELECT 1 FROM persons p
            WHERE p.user_id = auth.uid()
            AND p.owner_id = folio_items.owner_id
            AND check_person_access(p.id, folio_items.category_id, folio_items.id)
        )
    );

-- Viewers can see file attachments for items they can access
CREATE POLICY "Persons can view accessible attachments"
    ON file_attachments FOR SELECT
    USING (
        auth.uid() = owner_id
        OR EXISTS (
            SELECT 1 FROM persons p
            JOIN folio_items fi ON fi.id = file_attachments.item_id
            WHERE p.user_id = auth.uid()
            AND p.owner_id = file_attachments.owner_id
            AND check_person_access(p.id, fi.category_id, fi.id)
        )
    );
