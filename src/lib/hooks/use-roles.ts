"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Role } from "@/lib/types/app"

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchRoles = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("roles")
      .select("*")
      .eq("owner_id", user.id)
      .order("sort_order", { ascending: true })

    if (data) setRoles(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const createRole = async (role: { name: string; description?: string }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: new Error("Not authenticated") }

    const { data, error } = await supabase
      .from("roles")
      .insert({
        ...role,
        owner_id: user.id,
        role_type: "custom",
        is_system_role: false,
        sort_order: roles.length + 1,
      })
      .select()
      .single()

    if (data) await fetchRoles()
    return { data, error }
  }

  const deleteRole = async (id: string) => {
    const { error } = await supabase.from("roles").delete().eq("id", id)
    if (!error) await fetchRoles()
    return { error }
  }

  return { roles, loading, createRole, deleteRole, refetch: fetchRoles }
}
