"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useFolioItems } from "@/lib/hooks/use-folio-items"
import { Header } from "@/components/layout/header"
import { ItemList } from "@/components/folio/item-list"
import { ItemForm } from "@/components/folio/item-form"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { SearchInput } from "@/components/shared/search-input"
import { ItemListSkeleton } from "@/components/shared/loading-skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CATEGORY_META } from "@/lib/constants/categories"
import type { Category, FolioItemWithAttachments } from "@/lib/types/app"
import type { Json } from "@/lib/types/database"
import { toast } from "sonner"

export default function CategoryDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const meta = CATEGORY_META[slug]
  const supabase = createClient()

  const [category, setCategory] = useState<Category | null>(null)
  const [catLoading, setCatLoading] = useState(true)
  const { items, loading: itemsLoading, createItem, updateItem, deleteItem, refetch } =
    useFolioItems(category?.id)

  const [formOpen, setFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const handleSearchChange = useCallback((value: string) => setSearchQuery(value), [])
  const [editingItem, setEditingItem] = useState<FolioItemWithAttachments | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FolioItemWithAttachments | null>(null)

  useEffect(() => {
    const fetchCategory = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("owner_id", user.id)
        .eq("slug", slug)
        .single()

      setCategory(data)
      setCatLoading(false)
    }

    fetchCategory()
  }, [slug, supabase])

  const handleAddItem = async (item: {
    title: string
    data: Record<string, Json>
    notes?: string
    is_sensitive?: boolean
  }) => {
    if (!category) return
    const { error } = await createItem({
      category_id: category.id,
      title: item.title,
      item_type: meta?.defaultItemType || "custom",
      data: item.data as Json,
      notes: item.notes,
      is_sensitive: item.is_sensitive,
    })
    if (error) {
      toast.error("Failed to add item")
      throw error
    }
    toast.success("Item added")
  }

  const handleEditItem = async (item: {
    title: string
    data: Record<string, Json>
    notes?: string
    is_sensitive?: boolean
  }) => {
    if (!editingItem) return
    const { error } = await updateItem(editingItem.id, {
      title: item.title,
      data: item.data as Json,
      notes: item.notes,
      is_sensitive: item.is_sensitive,
    })
    if (error) {
      toast.error("Failed to update item")
      throw error
    }
    setEditingItem(null)
    toast.success("Item updated")
  }

  const handleDeleteItem = async () => {
    if (!deleteTarget) return
    const { error } = await deleteItem(deleteTarget.id)
    if (error) {
      toast.error("Failed to delete item")
    } else {
      toast.success("Item deleted")
    }
    setDeleteTarget(null)
  }

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const q = searchQuery.toLowerCase()
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        JSON.stringify(item.data).toLowerCase().includes(q)
    )
  }, [items, searchQuery])

  const loading = catLoading || itemsLoading

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Folio", href: "/folio" },
          { label: meta?.name || slug },
        ]}
      />
      <div className="p-6">
        <div className="space-y-6">
          {/* Category Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-primary">
                {meta?.name || category?.name || slug}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {meta?.description || category?.description}
              </p>
              {category && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              )}
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add Item
            </Button>
          </div>

          {/* Search */}
          {!loading && items.length > 0 && (
            <SearchInput
              placeholder="Search items..."
              onChange={handleSearchChange}
            />
          )}

          {/* Items */}
          {loading ? (
            <ItemListSkeleton />
          ) : (
            <ItemList
              items={filteredItems}
              onEdit={(item) => {
                setEditingItem(item)
              }}
              onDelete={(item) => setDeleteTarget(item)}
              onAddItem={() => setFormOpen(true)}
              onRefresh={refetch}
            />
          )}
        </div>
      </div>

      {/* Add Item Dialog */}
      <ItemForm
        open={formOpen}
        onOpenChange={setFormOpen}
        categorySlug={slug}
        onSubmit={handleAddItem}
      />

      {/* Edit Item Dialog */}
      {editingItem && (
        <ItemForm
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          categorySlug={slug}
          initialData={{
            title: editingItem.title,
            data: editingItem.data as Record<string, Json>,
            notes: editingItem.notes || undefined,
            is_sensitive: editingItem.is_sensitive,
          }}
          onSubmit={handleEditItem}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Item"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteItem}
        destructive
      />
    </>
  )
}
