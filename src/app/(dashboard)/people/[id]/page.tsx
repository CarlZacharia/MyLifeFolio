"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRoles } from "@/lib/hooks/use-roles"
import { Header } from "@/components/layout/header"
import { PersonForm } from "@/components/people/person-form"
import { RoleAssignment } from "@/components/people/role-assignment"
import { RoleBadge } from "@/components/people/role-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Pencil, Shield } from "lucide-react"
import type { PersonWithRoles } from "@/lib/types/app"
import { toast } from "sonner"

export default function PersonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const personId = params.id as string
  const supabase = createClient()
  const { roles } = useRoles()

  const [person, setPerson] = useState<PersonWithRoles | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [rolesOpen, setRolesOpen] = useState(false)

  const fetchPerson = async () => {
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
      .eq("id", personId)
      .single()

    if (data) setPerson(data as PersonWithRoles)
    setLoading(false)
  }

  useEffect(() => {
    fetchPerson()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId])

  const handleEdit = async (updates: {
    full_name: string
    email: string
    phone?: string
    relationship?: string
    notes?: string
    is_emergency_contact?: boolean
    emergency_override?: boolean
  }) => {
    const { error } = await supabase
      .from("persons")
      .update(updates)
      .eq("id", personId)

    if (error) throw error
    await fetchPerson()
    setEditOpen(false)
    toast.success("Person updated")
  }

  const handleToggleRole = async (roleId: string, assigned: boolean) => {
    if (!person) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (assigned) {
      await supabase.from("person_roles").insert({
        person_id: person.id,
        role_id: roleId,
        owner_id: user.id,
      })
    } else {
      await supabase
        .from("person_roles")
        .delete()
        .eq("person_id", person.id)
        .eq("role_id", roleId)
    }
    await fetchPerson()
  }

  if (loading) {
    return (
      <>
        <Header breadcrumbs={[{ label: "People", href: "/people" }, { label: "..." }]} />
        <div className="p-6">
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </>
    )
  }

  if (!person) {
    router.push("/people")
    return null
  }

  const personRoles = person.person_roles?.map((pr) => pr.role) ?? []

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "People & Roles", href: "/people" },
          { label: person.full_name },
        ]}
      />
      <div className="mx-auto max-w-2xl p-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
                {person.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-primary">
                  {person.full_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {person.relationship || person.email}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 size-4" />
              Edit
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                {person.email}
              </div>
              {person.phone && (
                <div>
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  {person.phone}
                </div>
              )}
              {person.relationship && (
                <div>
                  <span className="text-muted-foreground">Relationship:</span>{" "}
                  {person.relationship}
                </div>
              )}
              {person.notes && (
                <div>
                  <span className="text-muted-foreground">Notes:</span>{" "}
                  {person.notes}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Assigned Roles</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRolesOpen(true)}
              >
                <Shield className="mr-2 size-3.5" />
                Manage Roles
              </Button>
            </CardHeader>
            <CardContent>
              {personRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No roles assigned yet
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {personRoles.map((role) => (
                    <RoleBadge
                      key={role.id}
                      name={role.name}
                      roleType={role.role_type}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {editOpen && (
        <PersonForm
          open={editOpen}
          onOpenChange={setEditOpen}
          initialData={{
            full_name: person.full_name,
            email: person.email,
            phone: person.phone || undefined,
            relationship: person.relationship || undefined,
            notes: person.notes || undefined,
            is_emergency_contact: person.is_emergency_contact,
            emergency_override: person.emergency_override,
          }}
          onSubmit={handleEdit}
        />
      )}

      {rolesOpen && (
        <RoleAssignment
          open={rolesOpen}
          onOpenChange={setRolesOpen}
          person={person}
          allRoles={roles}
          onToggleRole={handleToggleRole}
        />
      )}
    </>
  )
}
