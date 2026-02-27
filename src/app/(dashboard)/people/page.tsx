"use client"

import { useState, useMemo, useCallback } from "react"
import { usePersons } from "@/lib/hooks/use-persons"
import { useRoles } from "@/lib/hooks/use-roles"
import { Header } from "@/components/layout/header"
import { PersonCard } from "@/components/people/person-card"
import { PersonForm } from "@/components/people/person-form"
import { RoleAssignment } from "@/components/people/role-assignment"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { SearchInput } from "@/components/shared/search-input"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Users } from "lucide-react"
import type { PersonWithRoles } from "@/lib/types/app"
import { toast } from "sonner"

export default function PeoplePage() {
  const {
    persons,
    loading,
    createPerson,
    updatePerson,
    deletePerson,
    assignRole,
    removeRole,
  } = usePersons()
  const { roles } = useRoles()

  const [formOpen, setFormOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<PersonWithRoles | null>(null)
  const [rolesPerson, setRolesPerson] = useState<PersonWithRoles | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PersonWithRoles | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const handleSearchChange = useCallback((value: string) => setSearchQuery(value), [])

  const filteredPersons = useMemo(() => {
    if (!searchQuery) return persons
    const q = searchQuery.toLowerCase()
    return persons.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.relationship && p.relationship.toLowerCase().includes(q))
    )
  }, [persons, searchQuery])

  const handleAddPerson = async (person: {
    full_name: string
    email: string
    phone?: string
    relationship?: string
    notes?: string
    is_emergency_contact?: boolean
    emergency_override?: boolean
  }) => {
    const { error } = await createPerson(person)
    if (error) {
      toast.error("Failed to add person")
      throw error
    }
    toast.success("Person added")
  }

  const handleEditPerson = async (person: {
    full_name: string
    email: string
    phone?: string
    relationship?: string
    notes?: string
    is_emergency_contact?: boolean
    emergency_override?: boolean
  }) => {
    if (!editingPerson) return
    const { error } = await updatePerson(editingPerson.id, person)
    if (error) {
      toast.error("Failed to update person")
      throw error
    }
    setEditingPerson(null)
    toast.success("Person updated")
  }

  const handleDeletePerson = async () => {
    if (!deleteTarget) return
    const { error } = await deletePerson(deleteTarget.id)
    if (error) {
      toast.error("Failed to remove person")
    } else {
      toast.success("Person removed")
    }
    setDeleteTarget(null)
  }

  const handleInvite = async (person: PersonWithRoles) => {
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId: person.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to send invitation")
      } else {
        toast.success(`Invitation sent to ${person.email}`)
      }
    } catch {
      toast.error("Failed to send invitation")
    }
  }

  const handleToggleRole = async (roleId: string, assigned: boolean) => {
    if (!rolesPerson) return
    if (assigned) {
      const { error } = await assignRole(rolesPerson.id, roleId)
      if (error) toast.error("Failed to assign role")
    } else {
      const { error } = await removeRole(rolesPerson.id, roleId)
      if (error) toast.error("Failed to remove role")
    }
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "People & Roles" },
        ]}
      />
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-primary">
                People & Roles
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage the people who have access to your folio and assign their
                roles
              </p>
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add Person
            </Button>
          </div>

          {!loading && persons.length > 0 && (
            <SearchInput
              placeholder="Search people..."
              onChange={handleSearchChange}
            />
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : persons.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No people added yet"
              description="Start by adding your spouse, children, attorney, and financial advisor."
              action={{ label: "Add First Person", onClick: () => setFormOpen(true) }}
            />
          ) : (
            <div className="space-y-3">
              {filteredPersons.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onEdit={() => setEditingPerson(person)}
                  onDelete={() => setDeleteTarget(person)}
                  onManageRoles={() => setRolesPerson(person)}
                  onInvite={() => handleInvite(person)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Person Dialog */}
      <PersonForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleAddPerson}
      />

      {/* Edit Person Dialog */}
      {editingPerson && (
        <PersonForm
          open={!!editingPerson}
          onOpenChange={(open) => !open && setEditingPerson(null)}
          initialData={{
            full_name: editingPerson.full_name,
            email: editingPerson.email,
            phone: editingPerson.phone || undefined,
            relationship: editingPerson.relationship || undefined,
            notes: editingPerson.notes || undefined,
            is_emergency_contact: editingPerson.is_emergency_contact,
            emergency_override: editingPerson.emergency_override,
          }}
          onSubmit={handleEditPerson}
        />
      )}

      {/* Role Assignment Dialog */}
      {rolesPerson && (
        <RoleAssignment
          open={!!rolesPerson}
          onOpenChange={(open) => !open && setRolesPerson(null)}
          person={rolesPerson}
          allRoles={roles}
          onToggleRole={handleToggleRole}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Person"
        description={`Are you sure you want to remove ${deleteTarget?.full_name}? They will lose all access to your folio.`}
        confirmLabel="Remove"
        onConfirm={handleDeletePerson}
        destructive
      />
    </>
  )
}
