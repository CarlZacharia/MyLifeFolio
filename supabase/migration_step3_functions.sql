-- ============================================================
-- STEP 3: Functions and viewer RLS policies
-- Run this AFTER Step 2 succeeds and you see all 10 tables
-- NOTE: NO trigger on auth.users - profile creation is handled
-- in application code (auth callback) for reliability
-- ============================================================

-- ============================================================
-- FUNCTION: seed_user_defaults (called via RPC from app code)
-- ============================================================
CREATE OR REPLACE FUNCTION seed_user_defaults(p_user_id UUID)
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
        (gen_random_uuid(), p_user_id, 'Spouse/Partner', 'Your spouse or domestic partner', TRUE, 'spouse_partner', 1),
        (gen_random_uuid(), p_user_id, 'Healthcare POA Agent', 'Person(s) designated in your Healthcare Power of Attorney', TRUE, 'healthcare_poa_agent', 2),
        (gen_random_uuid(), p_user_id, 'Financial POA Agent', 'Person(s) designated in your Financial Power of Attorney', TRUE, 'financial_poa_agent', 3),
        (gen_random_uuid(), p_user_id, 'Executor/Trustee', 'Your executor, personal representative, or successor trustee', TRUE, 'executor_trustee', 4),
        (gen_random_uuid(), p_user_id, 'Financial Team', 'Wealth manager, CPA, banker, financial advisor', TRUE, 'financial_team', 5),
        (gen_random_uuid(), p_user_id, 'Legal Team', 'Estate planning attorney, business attorney', TRUE, 'legal_team', 6),
        (gen_random_uuid(), p_user_id, 'Healthcare Team', 'Physicians, care managers, concierge doctor', TRUE, 'healthcare_team', 7),
        (gen_random_uuid(), p_user_id, 'No Restrictions', 'Visible to everyone with any access to your folio', TRUE, 'no_restrictions', 8),
        (gen_random_uuid(), p_user_id, 'Owner Only', 'Visible only to you - no one else can see this', TRUE, 'owner_only', 9);

    SELECT id INTO r_spouse FROM roles WHERE owner_id = p_user_id AND role_type = 'spouse_partner';
    SELECT id INTO r_hcpoa FROM roles WHERE owner_id = p_user_id AND role_type = 'healthcare_poa_agent';
    SELECT id INTO r_finpoa FROM roles WHERE owner_id = p_user_id AND role_type = 'financial_poa_agent';
    SELECT id INTO r_executor FROM roles WHERE owner_id = p_user_id AND role_type = 'executor_trustee';
    SELECT id INTO r_financial FROM roles WHERE owner_id = p_user_id AND role_type = 'financial_team';
    SELECT id INTO r_legal FROM roles WHERE owner_id = p_user_id AND role_type = 'legal_team';
    SELECT id INTO r_healthcare FROM roles WHERE owner_id = p_user_id AND role_type = 'healthcare_team';
    SELECT id INTO r_no_restrict FROM roles WHERE owner_id = p_user_id AND role_type = 'no_restrictions';
    SELECT id INTO r_owner_only FROM roles WHERE owner_id = p_user_id AND role_type = 'owner_only';

    -- 1. Personal & Identity
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Personal & Identity', 'personal-identity',
        'Legal identity documents, vital records, and personal identification information', 'fingerprint', 1)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_executor, p_user_id), (c_id, r_spouse, p_user_id), (c_id, r_finpoa, p_user_id);

    -- 2. Family & Relationships
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Family & Relationships', 'family-relationships',
        'Family tree, contact information, relationship notes, and pet care instructions', 'users', 2)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_no_restrict, p_user_id);

    -- 3. Friends & Neighbors
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Friends & Neighbors', 'friends-neighbors',
        'Local contacts who can check on you, have keys, or assist in emergencies', 'home', 3)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_spouse, p_user_id), (c_id, r_hcpoa, p_user_id), (c_id, r_executor, p_user_id);

    -- 4. Professional Advisory Team
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Professional Advisory Team', 'advisory-team',
        'Your attorney, CPA, wealth manager, insurance agent, banker, and other advisors', 'briefcase', 4)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_no_restrict, p_user_id);

    -- 5. Medical History & Current Care
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Medical History & Current Care', 'medical-history',
        'Diagnoses, medications, physicians, allergies, medical devices, pharmacy information', 'heart-pulse', 5)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_hcpoa, p_user_id), (c_id, r_healthcare, p_user_id), (c_id, r_spouse, p_user_id);

    -- 6. Healthcare Preferences & Directives
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Healthcare Preferences & Directives', 'healthcare-preferences',
        'Preferred hospitals, DNR status, living will specifics, treatment preferences, pain management philosophy', 'stethoscope', 6)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_hcpoa, p_user_id), (c_id, r_healthcare, p_user_id), (c_id, r_spouse, p_user_id);

    -- 7. Long-Term Care Desires
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Long-Term Care Desires', 'long-term-care',
        'Preferred care settings, staffing preferences, quality of life definitions, transition thresholds', 'bed', 7)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_hcpoa, p_user_id), (c_id, r_healthcare, p_user_id), (c_id, r_spouse, p_user_id), (c_id, r_executor, p_user_id);

    -- 8. Mental Health & Cognitive Decline
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Mental Health & Cognitive Decline', 'mental-health',
        'Wishes for cognitive decline, memory care preferences, comfort routines, what you do and do not want', 'brain', 8)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_hcpoa, p_user_id), (c_id, r_healthcare, p_user_id), (c_id, r_spouse, p_user_id);

    -- 9. Financial Overview
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Financial Overview', 'financial-overview',
        'Bank accounts, brokerage accounts, retirement accounts, insurance policies, debts, safe deposit boxes', 'landmark', 9)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_finpoa, p_user_id), (c_id, r_financial, p_user_id), (c_id, r_legal, p_user_id),
        (c_id, r_executor, p_user_id), (c_id, r_spouse, p_user_id);

    -- 10. Digital Life
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Digital Life', 'digital-life',
        'Email accounts, cloud storage, passwords, social media, cryptocurrency, subscriptions', 'monitor-smartphone', 10)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_owner_only, p_user_id);

    -- 11. Income Streams & Recurring Obligations
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Income Streams & Recurring Obligations', 'income-obligations',
        'Pensions, Social Security, annuities, rental income, recurring bills, tax schedules, charitable pledges', 'repeat', 11)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_finpoa, p_user_id), (c_id, r_financial, p_user_id), (c_id, r_legal, p_user_id),
        (c_id, r_executor, p_user_id), (c_id, r_spouse, p_user_id);

    -- 12. Business Interests & Ownership
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Business Interests & Ownership', 'business-interests',
        'Active businesses, passive investments, PE funds, board positions, IP, key contacts, succession plans', 'building-2', 12)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_finpoa, p_user_id), (c_id, r_financial, p_user_id), (c_id, r_legal, p_user_id), (c_id, r_executor, p_user_id);

    -- 13. Royalties & Residual Income
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Royalties & Residual Income', 'royalties',
        'Book, music, patent, mineral, franchise, and licensing royalties with transfer details', 'coins', 13)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_finpoa, p_user_id), (c_id, r_financial, p_user_id), (c_id, r_legal, p_user_id),
        (c_id, r_executor, p_user_id), (c_id, r_spouse, p_user_id);

    -- 14. Personal Property & Beneficiary Designations
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Personal Property & Beneficiary Designations', 'personal-property',
        'Jewelry, art, collectibles, vehicles, wine collections - with specific beneficiary for each item', 'gem', 14)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_executor, p_user_id), (c_id, r_spouse, p_user_id);

    -- 15. Firearms
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Firearms', 'firearms',
        'Complete inventory with make, model, serial numbers, locations, NFA items, transfer compliance, designated recipients', 'shield', 15)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_executor, p_user_id), (c_id, r_spouse, p_user_id);

    -- 16. Funeral, Burial & Memorial
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Funeral, Burial & Memorial', 'funeral-burial',
        'Burial vs. cremation, funeral home, religious traditions, memorial wishes, obituary preferences, organ donation', 'flower-2', 16)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_no_restrict, p_user_id);

    -- 17. Personal Wishes & Legacy
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Personal Wishes & Legacy', 'personal-wishes',
        'Ethical will, legacy letters, values, life lessons, family stories, charitable legacy intentions', 'scroll-text', 17)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_spouse, p_user_id), (c_id, r_executor, p_user_id);

    -- 18. Home & Property
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Home & Property', 'home-property',
        'Alarm codes, household operations, seasonal instructions, vehicles, storage, staff and vendor contacts', 'house', 18)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_spouse, p_user_id), (c_id, r_finpoa, p_user_id);

    -- 19. Club Memberships & Social Commitments
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Club Memberships & Social Commitments', 'clubs-memberships',
        'Country clubs, yacht clubs, board positions, volunteer commitments, season tickets, transferability details', 'trophy', 19)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_spouse, p_user_id), (c_id, r_executor, p_user_id);

    -- 20. Travel & Lifestyle
    INSERT INTO categories (id, owner_id, name, slug, description, icon, sort_order)
    VALUES (gen_random_uuid(), p_user_id, 'Travel & Lifestyle', 'travel-lifestyle',
        'Frequent flyer accounts, loyalty programs, travel agent, timeshares, planned trips, concierge contacts', 'plane', 20)
    RETURNING id INTO c_id;
    INSERT INTO category_role_access (category_id, role_id, owner_id) VALUES
        (c_id, r_spouse, p_user_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- ============================================================
-- RLS POLICIES FOR VIEWER ACCESS
-- ============================================================

-- Viewers can see accessible categories
DROP POLICY IF EXISTS "Persons can view accessible categories" ON categories;
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
DROP POLICY IF EXISTS "Persons can view accessible items" ON folio_items;
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
DROP POLICY IF EXISTS "Persons can view accessible attachments" ON file_attachments;
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

-- ============================================================
-- NO TRIGGER on auth.users!
-- Profile creation + seeding is handled in application code
-- (auth callback route) for reliability.
-- ============================================================

-- Verify functions exist
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';
