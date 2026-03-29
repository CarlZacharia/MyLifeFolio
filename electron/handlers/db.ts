import { ipcMain } from 'electron';
import { getDb } from '../db';
import { executeQuery } from './query-engine';

export function registerDbHandlers(): void {
  ipcMain.handle('db:query', async (_event, table: string, _method: string, params: unknown) => {
    try {
      const db = getDb();
      if (!db) return { data: null, error: { message: 'Database not unlocked' } };
      return executeQuery(db, table, params as Parameters<typeof executeQuery>[2]);
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('db:execute', async (_event, sql: string, params?: unknown[]) => {
    try {
      const db = getDb();
      if (!db) return { data: null, error: { message: 'Database not unlocked' } };
      const result = db.prepare(sql).run(...(params || []));
      return { data: result, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });

  ipcMain.handle('db:rpc', async (_event, functionName: string, params: unknown) => {
    try {
      const db = getDb();
      if (!db) return { data: null, error: { message: 'Database not unlocked' } };

      const handler = rpcHandlers[functionName];
      if (!handler) return { data: null, error: { message: `Unknown RPC: ${functionName}` } };

      return await handler(db, params);
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  });
}

// RPC handlers — mirrors Supabase RPC functions
import type Database from 'better-sqlite3';

const rpcHandlers: Record<
  string,
  (db: Database.Database, params: unknown) => Promise<{ data: unknown; error: unknown }>
> = {
  seed_user_defaults: async (db, params) => {
    const { p_user_id } = params as { p_user_id: string };
    try {
      // Replicate the seed_user_defaults PostgreSQL function in SQLite
      const roleTypes = [
        { name: 'Spouse/Partner', desc: 'Your spouse or domestic partner', type: 'spouse_partner', order: 1 },
        { name: 'Healthcare POA Agent', desc: 'Person(s) designated in your Healthcare Power of Attorney', type: 'healthcare_poa_agent', order: 2 },
        { name: 'Financial POA Agent', desc: 'Person(s) designated in your Financial Power of Attorney', type: 'financial_poa_agent', order: 3 },
        { name: 'Executor/Trustee', desc: 'Your executor, personal representative, or successor trustee', type: 'executor_trustee', order: 4 },
        { name: 'Financial Team', desc: 'Wealth manager, CPA, banker, financial advisor', type: 'financial_team', order: 5 },
        { name: 'Legal Team', desc: 'Estate planning attorney, business attorney', type: 'legal_team', order: 6 },
        { name: 'Healthcare Team', desc: 'Physicians, care managers, concierge doctor', type: 'healthcare_team', order: 7 },
        { name: 'No Restrictions', desc: 'Visible to everyone with any access to your folio', type: 'no_restrictions', order: 8 },
        { name: 'Owner Only', desc: 'Visible only to you — no one else can see this', type: 'owner_only', order: 9 },
      ];

      const insertRole = db.prepare(
        `INSERT OR IGNORE INTO roles (id, owner_id, name, description, is_system_role, role_type, sort_order)
         VALUES (?, ?, ?, ?, 1, ?, ?)`
      );

      const roleIds: Record<string, string> = {};
      for (const r of roleTypes) {
        const id = crypto.randomUUID();
        insertRole.run(id, p_user_id, r.name, r.desc, r.type, r.order);
        roleIds[r.type] = id;
      }

      // Default categories with role assignments
      const cats = [
        { name: 'Personal & Identity', slug: 'personal-identity', desc: 'Legal identity documents, vital records, and personal identification information', icon: 'fingerprint', order: 1, roles: ['executor_trustee', 'spouse_partner', 'financial_poa_agent'] },
        { name: 'Family & Relationships', slug: 'family-relationships', desc: 'Family tree, contact information, and relationship notes', icon: 'users', order: 2, roles: ['no_restrictions'] },
        { name: 'Friends & Neighbors', slug: 'friends-neighbors', desc: 'Local contacts who can check on you, have keys, or assist in emergencies', icon: 'home', order: 3, roles: ['spouse_partner', 'healthcare_poa_agent', 'executor_trustee'] },
        { name: 'Professional Advisory Team', slug: 'advisory-team', desc: 'Your attorney, CPA, wealth manager, insurance agent, banker, and other advisors', icon: 'briefcase', order: 4, roles: ['no_restrictions'] },
        { name: 'Medical History & Current Care', slug: 'medical-history', desc: 'Diagnoses, medications, physicians, allergies, medical devices, pharmacy information', icon: 'heart-pulse', order: 5, roles: ['healthcare_poa_agent', 'healthcare_team', 'spouse_partner'] },
        { name: 'Healthcare Preferences & Directives', slug: 'healthcare-preferences', desc: 'Preferred hospitals, DNR status, living will specifics, treatment preferences', icon: 'stethoscope', order: 6, roles: ['healthcare_poa_agent', 'healthcare_team', 'spouse_partner'] },
        { name: 'Long-Term Care Desires', slug: 'long-term-care', desc: 'Preferred care settings, staffing preferences, quality of life definitions', icon: 'bed', order: 7, roles: ['healthcare_poa_agent', 'healthcare_team', 'spouse_partner', 'executor_trustee'] },
        { name: 'Mental Health & Cognitive Decline', slug: 'mental-health', desc: 'Wishes for cognitive decline, memory care preferences, comfort routines', icon: 'brain', order: 8, roles: ['healthcare_poa_agent', 'healthcare_team', 'spouse_partner'] },
        { name: 'Financial Overview', slug: 'financial-overview', desc: 'Bank accounts, brokerage accounts, retirement accounts, insurance policies, debts', icon: 'landmark', order: 9, roles: ['financial_poa_agent', 'financial_team', 'legal_team', 'executor_trustee', 'spouse_partner'] },
        { name: 'Digital Life', slug: 'digital-life', desc: 'Email accounts, cloud storage, passwords, social media, cryptocurrency', icon: 'monitor-smartphone', order: 10, roles: ['owner_only'] },
        { name: 'Income Streams & Recurring Obligations', slug: 'income-obligations', desc: 'Pensions, Social Security, annuities, rental income, recurring bills', icon: 'repeat', order: 11, roles: ['financial_poa_agent', 'financial_team', 'legal_team', 'executor_trustee', 'spouse_partner'] },
        { name: 'Business Interests & Ownership', slug: 'business-interests', desc: 'Active businesses, passive investments, PE funds, board positions', icon: 'building-2', order: 12, roles: ['financial_poa_agent', 'financial_team', 'legal_team', 'executor_trustee'] },
        { name: 'Royalties & Residual Income', slug: 'royalties', desc: 'Book, music, patent, mineral, franchise, and licensing royalties', icon: 'coins', order: 13, roles: ['financial_poa_agent', 'financial_team', 'legal_team', 'executor_trustee', 'spouse_partner'] },
        { name: 'Personal Property & Beneficiary Designations', slug: 'personal-property', desc: 'Jewelry, art, collectibles, vehicles, wine collections', icon: 'gem', order: 14, roles: ['executor_trustee', 'spouse_partner'] },
        { name: 'Firearms', slug: 'firearms', desc: 'Complete inventory with make, model, serial numbers, locations', icon: 'shield', order: 15, roles: ['executor_trustee', 'spouse_partner'] },
        { name: 'Funeral, Burial & Memorial', slug: 'funeral-burial', desc: 'Burial vs. cremation, funeral home, religious traditions', icon: 'flower-2', order: 16, roles: ['no_restrictions'] },
        { name: 'Personal Wishes & Legacy', slug: 'personal-wishes', desc: 'Ethical will, legacy letters, values, life lessons', icon: 'scroll-text', order: 17, roles: ['spouse_partner', 'executor_trustee'] },
        { name: 'Home & Property', slug: 'home-property', desc: 'Alarm codes, household operations, seasonal instructions', icon: 'house', order: 18, roles: ['spouse_partner', 'financial_poa_agent'] },
        { name: 'Club Memberships & Social Commitments', slug: 'clubs-memberships', desc: 'Country clubs, yacht clubs, board positions', icon: 'trophy', order: 19, roles: ['spouse_partner', 'executor_trustee'] },
        { name: 'Travel & Lifestyle', slug: 'travel-lifestyle', desc: 'Frequent flyer accounts, loyalty programs, travel agent', icon: 'plane', order: 20, roles: ['spouse_partner'] },
        { name: 'Pets & Pet Care', slug: 'pets', desc: 'Pet profiles, veterinary info, feeding schedules, designated caretakers', icon: 'paw-print', order: 21, roles: ['spouse_partner', 'executor_trustee'] },
      ];

      const insertCat = db.prepare(
        `INSERT OR IGNORE INTO categories (id, owner_id, name, slug, description, icon, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      const insertCRA = db.prepare(
        `INSERT OR IGNORE INTO category_role_access (id, category_id, role_id, owner_id)
         VALUES (?, ?, ?, ?)`
      );

      for (const cat of cats) {
        const catId = crypto.randomUUID();
        insertCat.run(catId, p_user_id, cat.name, cat.slug, cat.desc, cat.icon, cat.order);
        for (const roleType of cat.roles) {
          const rId = roleIds[roleType];
          if (rId) {
            insertCRA.run(crypto.randomUUID(), catId, rId, p_user_id);
          }
        }
      }

      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: { message: (err as Error).message } };
    }
  },
};
