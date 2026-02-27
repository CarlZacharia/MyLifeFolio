"use client"

import { PersonCard } from "./person-card"
import { EmptyState } from "@/components/shared/empty-state"
import { Users } from "lucide-react"
import type { PersonWithRoles } from "@/lib/types/app"

interface PersonListProps {
  persons: PersonWithRoles[]
  onEdit: (person: PersonWithRoles) => void
  onDelete: (person: PersonWithRoles) => void
  onManageRoles: (person: PersonWithRoles) => void
  onAddPerson: () => void
}

export function PersonList({
  persons,
  onEdit,
  onDelete,
  onManageRoles,
  onAddPerson,
}: PersonListProps) {
  if (persons.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No people added yet"
        description="Start by adding your spouse, children, attorney, and financial advisor."
        action={{ label: "Add First Person", onClick: onAddPerson }}
      />
    )
  }

  return (
    <div className="space-y-3">
      {persons.map((person) => (
        <PersonCard
          key={person.id}
          person={person}
          onEdit={() => onEdit(person)}
          onDelete={() => onDelete(person)}
          onManageRoles={() => onManageRoles(person)}
        />
      ))}
    </div>
  )
}
