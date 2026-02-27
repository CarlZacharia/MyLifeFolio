"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { CategoryWithAccess } from "@/lib/types/app"

export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithAccess[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCategories = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("categories")
      .select(
        `
        *,
        category_role_access (
          *,
          role:roles (*)
        )
      `
      )
      .eq("owner_id", user.id)
      .order("sort_order", { ascending: true })

    if (data) {
      // Get item counts per category
      const { data: items } = await supabase
        .from("folio_items")
        .select("category_id")
        .eq("owner_id", user.id)

      const countMap: Record<string, number> = {}
      items?.forEach((item) => {
        countMap[item.category_id] = (countMap[item.category_id] || 0) + 1
      })

      const enriched = data.map((cat) => ({
        ...cat,
        item_count: countMap[cat.id] || 0,
      }))

      setCategories(enriched as CategoryWithAccess[])
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, loading, refetch: fetchCategories }
}
