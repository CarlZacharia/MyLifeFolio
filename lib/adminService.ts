/**
 * Admin data service — all data-fetching and mutation functions
 * for the admin dashboard. Uses the anon Supabase client with
 * admin RLS policies (JWT email check).
 */

import { supabase } from './supabase';
import { SubscriptionTier } from './subscriptionConfig';

// ── Types ──────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  address: string | null;
  state_of_domicile: string | null;
  telephone: string | null;
  is_admin: boolean;
  is_disabled: boolean;
  created_at: string;
  // Subscription data (joined)
  tier: SubscriptionTier | null;
  sub_status: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  current_period_end: string | null;
  // Intake count
  intake_count: number;
}

export interface SubscriptionStats {
  total: number;
  trial: number;
  trialExpired: number;
  paid: number;
  cancelled: number;
  pastDue: number;
  mrr: number;
}

export interface AccessLogEntry {
  id: string;
  owner_id: string;
  owner_name: string | null;
  owner_email: string | null;
  accessor_email: string;
  access_type: string;
  section_accessed: string | null;
  query_text: string | null;
  report_id: string | null;
  created_at: string;
}

export interface FamilyAccessGrant {
  id: string;
  owner_id: string;
  owner_name: string | null;
  owner_email: string | null;
  authorized_email: string;
  display_name: string | null;
  access_sections: string[];
  is_active: boolean;
  created_at: string;
}

export interface StorageUser {
  user_id: string;
  email: string | null;
  name: string | null;
  total_size: number;
  doc_count: number;
}

// ── User Management ────────────────────────────────────────────

export async function fetchAllUsersWithSubscriptions(): Promise<AdminUser[]> {
  // Fetch profiles
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id, email, name, address, state_of_domicile, telephone, is_admin, is_disabled, created_at')
    .order('created_at', { ascending: false });

  if (pErr) throw new Error(`Failed to fetch profiles: ${pErr.message}`);

  // Fetch subscriptions
  const { data: subs, error: sErr } = await supabase
    .from('user_subscriptions')
    .select('user_id, tier, status, trial_ends_at, stripe_customer_id, current_period_end');

  if (sErr) throw new Error(`Failed to fetch subscriptions: ${sErr.message}`);

  // Fetch intake counts
  const { data: intakes, error: iErr } = await supabase
    .from('intakes_raw')
    .select('user_id');

  if (iErr) throw new Error(`Failed to fetch intakes: ${iErr.message}`);

  // Build maps
  const subMap = new Map<string, typeof subs[0]>();
  for (const s of subs || []) subMap.set(s.user_id, s);

  const intakeCountMap = new Map<string, number>();
  for (const i of intakes || []) {
    intakeCountMap.set(i.user_id, (intakeCountMap.get(i.user_id) || 0) + 1);
  }

  return (profiles || []).map((p) => {
    const sub = subMap.get(p.id);
    return {
      id: p.id,
      email: p.email || '',
      name: p.name,
      address: p.address,
      state_of_domicile: p.state_of_domicile,
      telephone: p.telephone,
      is_admin: p.is_admin || false,
      is_disabled: p.is_disabled || false,
      created_at: p.created_at,
      tier: (sub?.tier as SubscriptionTier) || null,
      sub_status: sub?.status || null,
      trial_ends_at: sub?.trial_ends_at || null,
      stripe_customer_id: sub?.stripe_customer_id || null,
      current_period_end: sub?.current_period_end || null,
      intake_count: intakeCountMap.get(p.id) || 0,
    };
  });
}

export async function updateUserTier(
  userId: string,
  tier: SubscriptionTier,
  status: string = 'active'
): Promise<void> {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ tier, status })
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to update tier: ${error.message}`);
}

export async function grantCompSubscription(
  userId: string,
  tier: SubscriptionTier
): Promise<void> {
  // Try update first, insert if no row exists
  const { data, error: selErr } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (selErr) throw new Error(`Failed to check subscription: ${selErr.message}`);

  if (data) {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ tier, status: 'active' })
      .eq('user_id', userId);
    if (error) throw new Error(`Failed to grant comp: ${error.message}`);
  } else {
    const { error } = await supabase
      .from('user_subscriptions')
      .insert({ user_id: userId, tier, status: 'active' });
    if (error) throw new Error(`Failed to insert comp: ${error.message}`);
  }
}

export async function toggleUserDisabled(userId: string, disabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_disabled: disabled })
    .eq('id', userId);

  if (error) throw new Error(`Failed to update disabled status: ${error.message}`);
}

// ── Subscription Stats ─────────────────────────────────────────

export async function fetchSubscriptionStats(): Promise<SubscriptionStats> {
  const { data: subs, error } = await supabase
    .from('user_subscriptions')
    .select('tier, status, trial_ends_at');

  if (error) throw new Error(`Failed to fetch subscription stats: ${error.message}`);

  const now = new Date();
  const stats: SubscriptionStats = {
    total: subs?.length || 0,
    trial: 0,
    trialExpired: 0,
    paid: 0,
    cancelled: 0,
    pastDue: 0,
    mrr: 0,
  };

  for (const s of subs || []) {
    if (s.status === 'cancelled') { stats.cancelled++; continue; }
    if (s.status === 'past_due') { stats.pastDue++; continue; }

    if (s.tier === 'trial') {
      const expired = s.trial_ends_at && new Date(s.trial_ends_at) < now;
      if (expired) stats.trialExpired++;
      else stats.trial++;
    } else if (s.tier === 'paid') {
      stats.paid++;
    }
  }

  // MRR: annual price / 12
  stats.mrr = (stats.paid * 149) / 12;

  return stats;
}

// ── Access & Security ──────────────────────────────────────────

export async function fetchAccessLog(limit: number = 100): Promise<AccessLogEntry[]> {
  const { data, error } = await supabase
    .from('folio_access_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch access log: ${error.message}`);

  // Fetch owner profiles for names
  const ownerIds = Array.from(new Set((data || []).map((d) => d.owner_id)));
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', ownerIds);

  const profileMap = new Map<string, { name: string | null; email: string | null }>();
  for (const p of profiles || []) profileMap.set(p.id, { name: p.name, email: p.email });

  return (data || []).map((d) => ({
    id: d.id,
    owner_id: d.owner_id,
    owner_name: profileMap.get(d.owner_id)?.name || null,
    owner_email: profileMap.get(d.owner_id)?.email || null,
    accessor_email: d.accessor_email,
    access_type: d.access_type || 'view',
    section_accessed: d.section_accessed || null,
    query_text: d.query_text || null,
    report_id: d.report_id || null,
    created_at: d.created_at,
  }));
}

export async function fetchFamilyAccessGrants(): Promise<FamilyAccessGrant[]> {
  const { data, error } = await supabase
    .from('folio_authorized_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch family access: ${error.message}`);

  const ownerIds = Array.from(new Set((data || []).map((d) => d.owner_id)));
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', ownerIds);

  const profileMap = new Map<string, { name: string | null; email: string | null }>();
  for (const p of profiles || []) profileMap.set(p.id, { name: p.name, email: p.email });

  return (data || []).map((d) => ({
    id: d.id,
    owner_id: d.owner_id,
    owner_name: profileMap.get(d.owner_id)?.name || null,
    owner_email: profileMap.get(d.owner_id)?.email || null,
    authorized_email: d.authorized_email,
    display_name: d.display_name || null,
    access_sections: d.access_sections || [],
    is_active: d.is_active,
    created_at: d.created_at,
  }));
}

export async function revokeFamilyAccess(grantId: string): Promise<void> {
  const { error } = await supabase
    .from('folio_authorized_users')
    .update({ is_active: false })
    .eq('id', grantId);

  if (error) throw new Error(`Failed to revoke access: ${error.message}`);
}

// ── System Health ──────────────────────────────────────────────

export async function fetchStorageStats(): Promise<{ users: StorageUser[]; totalSize: number }> {
  const { data, error } = await supabase
    .from('vault_documents')
    .select('user_id, file_size');

  if (error) throw new Error(`Failed to fetch storage stats: ${error.message}`);

  // Aggregate by user
  const userMap = new Map<string, { total_size: number; doc_count: number }>();
  let totalSize = 0;

  for (const d of data || []) {
    const size = d.file_size || 0;
    totalSize += size;
    const existing = userMap.get(d.user_id) || { total_size: 0, doc_count: 0 };
    existing.total_size += size;
    existing.doc_count++;
    userMap.set(d.user_id, existing);
  }

  // Get profile names
  const userIds = Array.from(userMap.keys());
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', userIds.length > 0 ? userIds : ['__none__']);

  const profileMap = new Map<string, { name: string | null; email: string | null }>();
  for (const p of profiles || []) profileMap.set(p.id, { name: p.name, email: p.email });

  const users: StorageUser[] = Array.from(userMap.entries())
    .map(([uid, stats]) => ({
      user_id: uid,
      email: profileMap.get(uid)?.email || null,
      name: profileMap.get(uid)?.name || null,
      ...stats,
    }))
    .sort((a, b) => b.total_size - a.total_size);

  return { users, totalSize };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
