"use client"

import { useEffect, useState, useCallback } from "react"
import { useSupabase } from "@/lib/supabase/use-supabase"
import type { Profile } from "@/lib/types/app"

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useSupabase()

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error("Not authenticated") }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single()

    if (data) setProfile(data)
    return { data, error }
  }, [])

  return { profile, loading, updateProfile }
}
