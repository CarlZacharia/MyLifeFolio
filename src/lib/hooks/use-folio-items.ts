"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuditLog } from "@/lib/hooks/use-audit-log"
import type { FolioItemWithAttachments } from "@/lib/types/app"
import type { Json } from "@/lib/types/database"

export function useFolioItems(categoryId?: string) {
  const [items, setItems] = useState<FolioItemWithAttachments[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { log } = useAuditLog()

  const fetchItems = useCallback(async () => {
    if (!categoryId) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("folio_items")
      .select(
        `
        *,
        file_attachments (*),
        item_role_access (
          *,
          role:roles (*)
        )
      `
      )
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: true })

    if (data) {
      setItems(data as FolioItemWithAttachments[])
    }

    setLoading(false)
  }, [categoryId, supabase])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const createItem = async (item: {
    category_id: string
    title: string
    item_type: string
    data: Json
    notes?: string
    is_sensitive?: boolean
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: new Error("Not authenticated") }

    const { data, error } = await supabase
      .from("folio_items")
      .insert({
        ...item,
        owner_id: user.id,
        sort_order: items.length,
      })
      .select()
      .single()

    if (data) {
      await fetchItems()
      log({
        action: "item.create",
        resourceType: "folio_item",
        resourceId: data.id,
        details: { title: item.title, category_id: item.category_id },
      })
    }
    return { data, error }
  }

  const updateItem = async (
    id: string,
    updates: {
      title?: string
      data?: Json
      notes?: string
      is_sensitive?: boolean
      use_custom_access?: boolean
    }
  ) => {
    const { data, error } = await supabase
      .from("folio_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (data) {
      await fetchItems()
      log({
        action: "item.update",
        resourceType: "folio_item",
        resourceId: id,
        details: { updated_fields: Object.keys(updates) },
      })
    }
    return { data, error }
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("folio_items").delete().eq("id", id)
    if (!error) {
      await fetchItems()
      log({
        action: "item.delete",
        resourceType: "folio_item",
        resourceId: id,
      })
    }
    return { error }
  }

  return { items, loading, createItem, updateItem, deleteItem, refetch: fetchItems }
}
