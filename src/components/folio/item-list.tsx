"use client"

import { ItemCard } from "./item-card"
import { EmptyState } from "@/components/shared/empty-state"
import { FolderOpen } from "lucide-react"
import type { FolioItemWithAttachments } from "@/lib/types/app"

interface ItemListProps {
  items: FolioItemWithAttachments[]
  onEdit: (item: FolioItemWithAttachments) => void
  onDelete: (item: FolioItemWithAttachments) => void
  onAddItem: () => void
  onRefresh?: () => void
}

export function ItemList({ items, onEdit, onDelete, onAddItem, onRefresh }: ItemListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No items yet"
        description="Start adding items to this category to document important information."
        action={{ label: "Add First Item", onClick: onAddItem }}
      />
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  )
}
