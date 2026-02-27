export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          preferred_name: string | null
          phone: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          zip: string | null
          date_of_birth: string | null
          avatar_url: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          preferred_name?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          date_of_birth?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          preferred_name?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          date_of_birth?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          is_system_role: boolean
          role_type: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          is_system_role?: boolean
          role_type: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          is_system_role?: boolean
          role_type?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      persons: {
        Row: {
          id: string
          owner_id: string
          full_name: string
          email: string
          phone: string | null
          relationship: string | null
          notes: string | null
          is_emergency_contact: boolean
          emergency_override: boolean
          has_user_account: boolean
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          full_name: string
          email: string
          phone?: string | null
          relationship?: string | null
          notes?: string | null
          is_emergency_contact?: boolean
          emergency_override?: boolean
          has_user_account?: boolean
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          full_name?: string
          email?: string
          phone?: string | null
          relationship?: string | null
          notes?: string | null
          is_emergency_contact?: boolean
          emergency_override?: boolean
          has_user_account?: boolean
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      person_roles: {
        Row: {
          id: string
          person_id: string
          role_id: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          person_id: string
          role_id: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          role_id?: string
          owner_id?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      category_role_access: {
        Row: {
          id: string
          category_id: string
          role_id: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          role_id: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          role_id?: string
          owner_id?: string
          created_at?: string
        }
      }
      folio_items: {
        Row: {
          id: string
          owner_id: string
          category_id: string
          title: string
          item_type: string
          data: Json
          notes: string | null
          sort_order: number
          is_sensitive: boolean
          use_custom_access: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          category_id: string
          title: string
          item_type: string
          data?: Json
          notes?: string | null
          sort_order?: number
          is_sensitive?: boolean
          use_custom_access?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          category_id?: string
          title?: string
          item_type?: string
          data?: Json
          notes?: string | null
          sort_order?: number
          is_sensitive?: boolean
          use_custom_access?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      item_role_access: {
        Row: {
          id: string
          item_id: string
          role_id: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          role_id: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          role_id?: string
          owner_id?: string
          created_at?: string
        }
      }
      file_attachments: {
        Row: {
          id: string
          owner_id: string
          item_id: string
          file_name: string
          file_type: string | null
          file_size: number | null
          storage_path: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          item_id: string
          file_name: string
          file_type?: string | null
          file_size?: number | null
          storage_path: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          item_id?: string
          file_name?: string
          file_type?: string | null
          file_size?: number | null
          storage_path?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          owner_id: string
          actor_id: string
          action: string
          resource_type: string
          resource_id: string | null
          details: Json
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          actor_id: string
          action: string
          resource_type: string
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          actor_id?: string
          action?: string
          resource_type?: string
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          created_at?: string
        }
      }
    }
  }
}
