"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuditLog } from "@/lib/hooks/use-audit-log"
import type { PersonWithRoles } from "@/lib/types/app"

export function usePersons() {
  const [persons, setPersons] = useState<PersonWithRoles[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { log } = useAuditLog()

  const fetchPersons = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("persons")
      .select(
        `
        *,
        person_roles (
          *,
          role:roles (*)
        )
      `
      )
      .eq("owner_id", user.id)
      .order("full_name", { ascending: true })

    if (data) {
      setPersons(data as PersonWithRoles[])
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchPersons()
  }, [fetchPersons])

  const createPerson = async (person: {
    full_name: string
    email: string
    phone?: string
    relationship?: string
    notes?: string
    is_emergency_contact?: boolean
    emergency_override?: boolean
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: new Error("Not authenticated") }

    const { data, error } = await supabase
      .from("persons")
      .insert({
        ...person,
        owner_id: user.id,
      })
      .select()
      .single()

    if (data) {
      await fetchPersons()
      log({
        action: "person.create",
        resourceType: "person",
        resourceId: data.id,
        details: { full_name: person.full_name },
      })
    }
    return { data, error }
  }

  const updatePerson = async (
    id: string,
    updates: {
      full_name?: string
      email?: string
      phone?: string
      relationship?: string
      notes?: string
      is_emergency_contact?: boolean
      emergency_override?: boolean
    }
  ) => {
    const { data, error } = await supabase
      .from("persons")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (data) {
      await fetchPersons()
      log({
        action: "person.update",
        resourceType: "person",
        resourceId: id,
        details: { updated_fields: Object.keys(updates) },
      })
    }
    return { data, error }
  }

  const deletePerson = async (id: string) => {
    const { error } = await supabase.from("persons").delete().eq("id", id)
    if (!error) {
      await fetchPersons()
      log({
        action: "person.delete",
        resourceType: "person",
        resourceId: id,
      })
    }
    return { error }
  }

  const assignRole = async (personId: string, roleId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: new Error("Not authenticated") }

    const { error } = await supabase.from("person_roles").insert({
      person_id: personId,
      role_id: roleId,
      owner_id: user.id,
    })

    if (!error) {
      await fetchPersons()
      log({
        action: "role.assign",
        resourceType: "person_role",
        resourceId: personId,
        details: { role_id: roleId },
      })
    }
    return { error }
  }

  const removeRole = async (personId: string, roleId: string) => {
    const { error } = await supabase
      .from("person_roles")
      .delete()
      .eq("person_id", personId)
      .eq("role_id", roleId)

    if (!error) {
      await fetchPersons()
      log({
        action: "role.revoke",
        resourceType: "person_role",
        resourceId: personId,
        details: { role_id: roleId },
      })
    }
    return { error }
  }

  return {
    persons,
    loading,
    createPerson,
    updatePerson,
    deletePerson,
    assignRole,
    removeRole,
    refetch: fetchPersons,
  }
}
