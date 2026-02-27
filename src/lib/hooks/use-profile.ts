"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/app"

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

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
  }, [supabase])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return { data: null, error: new Error("No profile loaded") }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id)
        .select()
        .single()

      if (data) setProfile(data)
      return { data, error }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error("Update failed") }
    }
  }

  return { profile, loading, updateProfile }
}
