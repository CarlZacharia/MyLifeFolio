-- ============================================================
-- PART 1: Tables, indexes, triggers, and RLS policies
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auto-update updated_at
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
CREATE TABLE IF NOT EXISTS profiles (
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

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- TABLE: roles
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
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

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own roles" ON roles;
CREATE POLICY "Users can manage own roles"
    ON roles FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: persons
-- ============================================================
CREATE TABLE IF NOT EXISTS persons (
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

DROP TRIGGER IF EXISTS update_persons_updated_at ON persons;
CREATE TRIGGER update_persons_updated_at
    BEFORE UPDATE ON persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE persons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage persons" ON persons;
CREATE POLICY "Owners can manage persons"
    ON persons FOR ALL USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Persons can view themselves" ON persons;
CREATE POLICY "Persons can view themselves"
    ON persons FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: person_roles
-- ============================================================
CREATE TABLE IF NOT EXISTS person_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(person_id, role_id)
);

ALTER TABLE person_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage person_roles" ON person_roles;
CREATE POLICY "Owners can manage person_roles"
    ON person_roles FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
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

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage categories" ON categories;
CREATE POLICY "Owners can manage categories"
    ON categories FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: category_role_access
-- ============================================================
CREATE TABLE IF NOT EXISTS category_role_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id, role_id)
);

ALTER TABLE category_role_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage category_role_access" ON category_role_access;
CREATE POLICY "Owners can manage category_role_access"
    ON category_role_access FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: folio_items
-- ============================================================
CREATE TABLE IF NOT EXISTS folio_items (
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

CREATE INDEX IF NOT EXISTS idx_folio_items_owner ON folio_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_folio_items_category ON folio_items(category_id);
CREATE INDEX IF NOT EXISTS idx_folio_items_data ON folio_items USING gin(data);

DROP TRIGGER IF EXISTS update_folio_items_updated_at ON folio_items;
CREATE TRIGGER update_folio_items_updated_at
    BEFORE UPDATE ON folio_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE folio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage folio_items" ON folio_items;
CREATE POLICY "Owners can manage folio_items"
    ON folio_items FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: item_role_access
-- ============================================================
CREATE TABLE IF NOT EXISTS item_role_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES folio_items(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, role_id)
);

ALTER TABLE item_role_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage item_role_access" ON item_role_access;
CREATE POLICY "Owners can manage item_role_access"
    ON item_role_access FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: file_attachments
-- ============================================================
CREATE TABLE IF NOT EXISTS file_attachments (
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

DROP TRIGGER IF EXISTS update_file_attachments_updated_at ON file_attachments;
CREATE TRIGGER update_file_attachments_updated_at
    BEFORE UPDATE ON file_attachments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage file_attachments" ON file_attachments;
CREATE POLICY "Owners can manage file_attachments"
    ON file_attachments FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- TABLE: audit_log (no CHECK constraint on action — flexible)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_owner ON audit_log(owner_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view audit_log" ON audit_log;
CREATE POLICY "Owners can view audit_log"
    ON audit_log FOR SELECT USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "System can insert audit_log" ON audit_log;
CREATE POLICY "System can insert audit_log"
    ON audit_log FOR INSERT WITH CHECK (TRUE);
