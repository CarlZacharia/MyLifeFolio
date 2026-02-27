"use client"

import { ItemCard } from "./item-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import type { FolioItemWithAttachments } from "@/lib/types/app"

interface ItemSectionProps {
  label: string
  items: FolioItemWithAttachments[]
  onEdit: (item: FolioItemWithAttachments) => void
  onDelete: (item: FolioItemWithAttachments) => void
  onAddItem: () => void
  onRefresh?: () => void
}

export function ItemSection({
  label,
  items,
  onEdit,
  onDelete,
  onAddItem,
  onRefresh,
}: ItemSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-primary">{label}</h3>
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onAddItem}>
          <Plus className="mr-1.5 size-3.5" />
          Add
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No items yet
        </p>
      ) : (
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
      )}
    </div>
  )
}
