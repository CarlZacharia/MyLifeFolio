"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types/app"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchOrCreateProfile = async (currentUser: User) => {
    // Try to fetch existing profile
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single()

    if (data) {
      setProfile(data)
      return
    }

    // If email is not confirmed yet, skip profile creation.
    // The auth callback will handle it when the user confirms.
    if (!currentUser.email_confirmed_at) {
      return
    }

    // Profile doesn't exist but user is confirmed - create it as fallback
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: currentUser.id,
        email: currentUser.email ?? "",
        full_name:
          (currentUser.user_metadata?.full_name as string) ?? null,
      })
      .select("*")
      .single()

    if (insertError) {
      console.error("Failed to create profile in auth provider:", insertError)
      return
    }

    setProfile(newProfile)

    // Seed defaults via RPC
    const { error: seedError } = await supabase.rpc("seed_user_defaults", {
      p_user_id: currentUser.id,
    })

    if (seedError) {
      console.error("Failed to seed defaults in auth provider:", seedError)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        await fetchOrCreateProfile(currentUser)
      }

      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchOrCreateProfile(session.user)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
