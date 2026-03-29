/**
 * Drizzle ORM schema definitions for MyLifeFolio SQLite database.
 *
 * These type definitions mirror the tables created by migrations.ts.
 * They provide TypeScript types for type-safe queries in the main process.
 *
 * Note: The actual tables are created by raw SQL in migrations.ts.
 * This file provides Drizzle table definitions for typed queries.
 */

import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// ── Helper for UUID default ─────────────────────────────────────────
const uuidPk = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());
const timestamp = (name: string) => text(name).$defaultFn(() => new Date().toISOString());

// ── Core Tables ─────────────────────────────────────────────────────

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  full_name: text('full_name'),
  preferred_name: text('preferred_name'),
  phone: text('phone'),
  address_line1: text('address_line1'),
  address_line2: text('address_line2'),
  city: text('city'),
  state: text('state'),
  zip: text('zip'),
  date_of_birth: text('date_of_birth'),
  avatar_url: text('avatar_url'),
  onboarding_completed: integer('onboarding_completed').default(0),
  spouse_name: text('spouse_name'),
  gender: text('gender'),
  marital_status: text('marital_status').default('single'),
  spouse_full_name: text('spouse_full_name'),
  spouse_date_of_birth: text('spouse_date_of_birth'),
  spouse_phone: text('spouse_phone'),
  spouse_email: text('spouse_email'),
  spouse_gender: text('spouse_gender'),
  vault_instructions: text('vault_instructions').default(''),
  created_at: text('created_at').$defaultFn(() => new Date().toISOString()),
  updated_at: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export const roles = sqliteTable('roles', {
  id: uuidPk(),
  owner_id: text('owner_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  is_system_role: integer('is_system_role').default(0),
  role_type: text('role_type'),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
}, (table) => [
  uniqueIndex('roles_owner_name_unique').on(table.owner_id, table.name),
]);

export const persons = sqliteTable('persons', {
  id: uuidPk(),
  owner_id: text('owner_id').notNull(),
  full_name: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  relationship: text('relationship'),
  notes: text('notes'),
  is_emergency_contact: integer('is_emergency_contact').default(0),
  emergency_override: integer('emergency_override').default(0),
  has_user_account: integer('has_user_account').default(0),
  user_id: text('user_id'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});

export const personRoles = sqliteTable('person_roles', {
  id: uuidPk(),
  person_id: text('person_id').notNull(),
  role_id: text('role_id').notNull(),
  owner_id: text('owner_id').notNull(),
  created_at: timestamp('created_at'),
}, (table) => [
  uniqueIndex('person_roles_unique').on(table.person_id, table.role_id),
]);

export const categories = sqliteTable('categories', {
  id: uuidPk(),
  owner_id: text('owner_id').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  icon: text('icon'),
  sort_order: integer('sort_order').default(0),
  is_active: integer('is_active').default(1),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
}, (table) => [
  uniqueIndex('categories_owner_slug_unique').on(table.owner_id, table.slug),
]);

export const categoryRoleAccess = sqliteTable('category_role_access', {
  id: uuidPk(),
  category_id: text('category_id').notNull(),
  role_id: text('role_id').notNull(),
  owner_id: text('owner_id').notNull(),
  created_at: timestamp('created_at'),
}, (table) => [
  uniqueIndex('cra_unique').on(table.category_id, table.role_id),
]);

export const folioItems = sqliteTable('folio_items', {
  id: uuidPk(),
  owner_id: text('owner_id').notNull(),
  category_id: text('category_id').notNull(),
  title: text('title').notNull(),
  item_type: text('item_type').notNull(),
  data: text('data').notNull().default('{}'),
  notes: text('notes'),
  sort_order: integer('sort_order').default(0),
  is_sensitive: integer('is_sensitive').default(0),
  use_custom_access: integer('use_custom_access').default(0),
  belongs_to: text('belongs_to').default('self'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});

export const itemRoleAccess = sqliteTable('item_role_access', {
  id: uuidPk(),
  item_id: text('item_id').notNull(),
  role_id: text('role_id').notNull(),
  owner_id: text('owner_id').notNull(),
  created_at: timestamp('created_at'),
}, (table) => [
  uniqueIndex('ira_unique').on(table.item_id, table.role_id),
]);

export const fileAttachments = sqliteTable('file_attachments', {
  id: uuidPk(),
  owner_id: text('owner_id').notNull(),
  item_id: text('item_id').notNull(),
  file_name: text('file_name').notNull(),
  file_type: text('file_type'),
  file_size: integer('file_size'),
  storage_path: text('storage_path').notNull(),
  description: text('description'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});

export const auditLog = sqliteTable('audit_log', {
  id: uuidPk(),
  owner_id: text('owner_id').notNull(),
  actor_id: text('actor_id').notNull(),
  action: text('action').notNull(),
  resource_type: text('resource_type').notNull(),
  resource_id: text('resource_id'),
  details: text('details').default('{}'),
  ip_address: text('ip_address'),
  created_at: timestamp('created_at'),
});

// ── Intake Tables ───────────────────────────────────────────────────

export const folioIntakes = sqliteTable('folio_intakes', {
  id: uuidPk(),
  user_id: text('user_id').notNull(),
  intake_raw_id: text('intake_raw_id'),
  intake_date: text('intake_date'),
  appointment_date: text('appointment_date'),
  client_name: text('client_name').notNull(),
  // This table has 100+ columns - only key ones defined for type reference.
  // All columns exist in the SQLite table via migrations.ts.
  // Use raw queries for full column access.
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});

// ── Financial Tables ────────────────────────────────────────────────

export const folioBankAccounts = sqliteTable('folio_bank_accounts', {
  id: uuidPk(),
  intake_id: text('intake_id').notNull(),
  user_id: text('user_id').notNull(),
  owner: text('owner'),
  account_type: text('account_type'),
  institution: text('institution'),
  amount: real('amount'),
  has_beneficiaries: integer('has_beneficiaries').default(0),
  primary_beneficiaries: text('primary_beneficiaries'),
  primary_distribution_type: text('primary_distribution_type'),
  secondary_beneficiaries: text('secondary_beneficiaries'),
  secondary_distribution_type: text('secondary_distribution_type'),
  has_tod: integer('has_tod').default(0),
  tod_primary_beneficiary: text('tod_primary_beneficiary'),
  tod_secondary_beneficiary: text('tod_secondary_beneficiary'),
  notes: text('notes'),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at'),
});

// ── Legacy Tables ───────────────────────────────────────────────────

export const legacyObituaryTable = sqliteTable('legacy_obituary', {
  id: uuidPk(),
  intake_id: text('intake_id').notNull(),
  user_id: text('user_id').notNull(),
  preferred_name: text('preferred_name'),
  tone: text('tone'),
  generation_count: integer('generation_count').default(0),
  last_generated_at: text('last_generated_at'),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});

export const savedReportConfigs = sqliteTable('saved_report_configs', {
  id: uuidPk(),
  user_id: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  config: text('config').notNull().default('{}'),
  is_default: integer('is_default').default(0),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});

export const vaultDocuments = sqliteTable('vault_documents', {
  id: uuidPk(),
  intake_id: text('intake_id').notNull(),
  user_id: text('user_id').notNull(),
  category: text('category').notNull(),
  document_name: text('document_name').notNull(),
  description: text('description'),
  document_date: text('document_date'),
  expiration_date: text('expiration_date'),
  sensitivity: text('sensitivity').default('normal'),
  file_path: text('file_path').notNull(),
  file_name: text('file_name').notNull(),
  file_size: integer('file_size').default(0),
  file_type: text('file_type').default(''),
  system_generated: integer('system_generated').default(0),
  sort_order: integer('sort_order').default(0),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});

export const userSubscriptions = sqliteTable('user_subscriptions', {
  id: uuidPk(),
  user_id: text('user_id').notNull(),
  tier: text('tier').default('trial'),
  status: text('status').default('active'),
  trial_started_at: text('trial_started_at'),
  trial_ends_at: text('trial_ends_at'),
  stripe_customer_id: text('stripe_customer_id'),
  stripe_subscription_id: text('stripe_subscription_id'),
  stripe_price_id: text('stripe_price_id'),
  current_period_start: text('current_period_start'),
  current_period_end: text('current_period_end'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});

export const children = sqliteTable('children', {
  id: uuidPk(),
  owner_id: text('owner_id').notNull(),
  full_name: text('full_name').notNull(),
  date_of_birth: text('date_of_birth'),
  gender: text('gender'),
  phone: text('phone'),
  email: text('email'),
  notes: text('notes'),
  parent_relationship: text('parent_relationship').default('both'),
  sort_order: integer('sort_order').default(0),
  distribution_method: text('distribution_method').default(''),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});

export const folioAuthorizedUsers = sqliteTable('folio_authorized_users', {
  id: uuidPk(),
  owner_id: text('owner_id').notNull(),
  authorized_email: text('authorized_email').notNull(),
  display_name: text('display_name').notNull(),
  access_sections: text('access_sections').default('[]'),
  is_active: integer('is_active').default(1),
  vault_instructions: text('vault_instructions').default(''),
  allowed_reports: text('allowed_reports').default('[]'),
  allowed_custom_reports: text('allowed_custom_reports').default('[]'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
}, (table) => [
  uniqueIndex('fau_owner_email_unique').on(table.owner_id, table.authorized_email),
]);

export const folioDocuments = sqliteTable('folio_documents', {
  id: uuidPk(),
  owner_id: text('owner_id').notNull(),
  file_name: text('file_name').notNull(),
  storage_path: text('storage_path').notNull(),
  file_size: integer('file_size'),
  mime_type: text('mime_type'),
  description: text('description').default(''),
  visible_to: text('visible_to').default('[]'),
  uploaded_at: text('uploaded_at').$defaultFn(() => new Date().toISOString()),
  storage_bucket: text('storage_bucket').default('folio-documents'),
  source_vault_document_id: text('source_vault_document_id'),
});

export const credentialAccounts = sqliteTable('credential_accounts', {
  id: uuidPk(),
  user_id: text('user_id').notNull(),
  account_nickname: text('account_nickname'),
  account_type: text('account_type'),
  platform_name: text('platform_name').notNull(),
  account_url: text('account_url'),
  login_email: text('login_email'),
  two_factor_enabled: integer('two_factor_enabled').default(0),
  two_factor_method: text('two_factor_method'),
  phone_on_account: text('phone_on_account'),
  on_death_action: text('on_death_action'),
  on_incapacity_action: text('on_incapacity_action'),
  special_notes: text('special_notes'),
  poa_can_access: integer('poa_can_access').default(0),
  executor_can_access: integer('executor_can_access').default(0),
  importance_tier: text('importance_tier').default('moderate'),
  linked_payment_method: text('linked_payment_method'),
  last_verified_at: text('last_verified_at'),
  enc_password: text('enc_password'),
  enc_pin: text('enc_pin'),
  enc_security_qa: text('enc_security_qa'),
  enc_backup_codes: text('enc_backup_codes'),
  enc_authenticator_note: text('enc_authenticator_note'),
  enc_recovery_email: text('enc_recovery_email'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
});

// ── Type Exports ────────────────────────────────────────────────────

export type Profile = InferSelectModel<typeof profiles>;
export type InsertProfile = InferInsertModel<typeof profiles>;
export type Role = InferSelectModel<typeof roles>;
export type Person = InferSelectModel<typeof persons>;
export type Category = InferSelectModel<typeof categories>;
export type FolioItem = InferSelectModel<typeof folioItems>;
export type FileAttachment = InferSelectModel<typeof fileAttachments>;
export type AuditLogEntry = InferSelectModel<typeof auditLog>;
export type VaultDocument = InferSelectModel<typeof vaultDocuments>;
export type SavedReportConfig = InferSelectModel<typeof savedReportConfigs>;
export type Child = InferSelectModel<typeof children>;
export type FolioAuthorizedUser = InferSelectModel<typeof folioAuthorizedUsers>;
export type FolioDocument = InferSelectModel<typeof folioDocuments>;
export type CredentialAccount = InferSelectModel<typeof credentialAccounts>;
export type UserSubscription = InferSelectModel<typeof userSubscriptions>;
