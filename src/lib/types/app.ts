import type { Database } from './database'

// Table row type shortcuts
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Role = Database['public']['Tables']['roles']['Row']
export type Person = Database['public']['Tables']['persons']['Row']
export type PersonRole = Database['public']['Tables']['person_roles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryRoleAccess = Database['public']['Tables']['category_role_access']['Row']
export type FolioItem = Database['public']['Tables']['folio_items']['Row']
export type ItemRoleAccess = Database['public']['Tables']['item_role_access']['Row']
export type FileAttachment = Database['public']['Tables']['file_attachments']['Row']
export type AuditLogEntry = Database['public']['Tables']['audit_log']['Row']

// Role types enum
export type RoleType =
  | 'spouse_partner'
  | 'healthcare_poa_agent'
  | 'financial_poa_agent'
  | 'executor_trustee'
  | 'financial_team'
  | 'legal_team'
  | 'healthcare_team'
  | 'no_restrictions'
  | 'owner_only'
  | 'custom'

// Item types
export type ItemType =
  | 'text'
  | 'rich_text'
  | 'contact'
  | 'document'
  | 'credential'
  | 'financial'
  | 'property'
  | 'medical'
  | 'instruction'
  | 'checklist'
  | 'custom'

// Audit actions
export type AuditAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'share'
  | 'revoke'
  | 'login'
  | 'export'
  | 'emergency_access'
  | 'item.create'
  | 'item.update'
  | 'item.delete'
  | 'person.create'
  | 'person.update'
  | 'person.delete'
  | 'role.assign'
  | 'role.revoke'
  | 'access.update'
  | 'category.view'

// Item template field definition
export interface ItemTemplateField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'boolean' | 'phone' | 'email' | 'file' | 'rich_text'
  options?: string[]
  placeholder?: string
  sensitive?: boolean
}

// Person with roles joined
export interface PersonWithRoles extends Person {
  person_roles: (PersonRole & { role: Role })[]
}

// Category with access info
export interface CategoryWithAccess extends Category {
  category_role_access: (CategoryRoleAccess & { role: Role })[]
  item_count?: number
}

// Folio item with attachments
export interface FolioItemWithAttachments extends FolioItem {
  file_attachments: FileAttachment[]
  item_role_access?: (ItemRoleAccess & { role: Role })[]
}
