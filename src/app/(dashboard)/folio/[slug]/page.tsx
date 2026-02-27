"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { useSupabase } from "@/lib/supabase/use-supabase"
import { useFolioItems } from "@/lib/hooks/use-folio-items"
import { Header } from "@/components/layout/header"
import { ItemList } from "@/components/folio/item-list"
import { ItemSection } from "@/components/folio/item-section"
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
  const supabase = useSupabase()
  const { profile } = useAuth()
  const spouseName = profile?.spouse_name

  const [category, setCategory] = useState<Category | null>(null)
  const [catLoading, setCatLoading] = useState(true)
  const { items, loading: itemsLoading, createItem, updateItem, deleteItem, refetch } =
    useFolioItems(category?.id)

  const [formOpen, setFormOpen] = useState(false)
  const [addingForSection, setAddingForSection] = useState<string>("self")
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
  }, [slug, supabase])  // supabase is now stable via useRef

  const handleAddItem = async (item: {
    title: string
    data: Record<string, Json>
    notes?: string
    is_sensitive?: boolean
    belongs_to?: string
  }) => {
    if (!category) return
    const { error } = await createItem({
      category_id: category.id,
      title: item.title,
      item_type: meta?.defaultItemType || "custom",
      data: item.data as Json,
      notes: item.notes,
      is_sensitive: item.is_sensitive,
      belongs_to: item.belongs_to,
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
    belongs_to?: string
  }) => {
    if (!editingItem) return
    const { error } = await updateItem(editingItem.id, {
      title: item.title,
      data: item.data as Json,
      notes: item.notes,
      is_sensitive: item.is_sensitive,
      belongs_to: item.belongs_to,
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

  const filtered = useMemo(() => {
    const base = searchQuery
      ? items.filter((item) => {
          const q = searchQuery.toLowerCase()
          return (
            item.title.toLowerCase().includes(q) ||
            (item.notes && item.notes.toLowerCase().includes(q)) ||
            JSON.stringify(item.data).toLowerCase().includes(q)
          )
        })
      : items
    return base
  }, [items, searchQuery])

  const { selfItems, spouseItems, jointItems } = useMemo(() => ({
    selfItems: filtered.filter((i) => !i.belongs_to || i.belongs_to === "self"),
    spouseItems: filtered.filter((i) => i.belongs_to === "spouse"),
    jointItems: filtered.filter((i) => i.belongs_to === "joint"),
  }), [filtered])

  const openAddForm = (section: string = "self") => {
    setAddingForSection(section)
    setFormOpen(true)
  }

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
            {!spouseName && (
              <Button onClick={() => openAddForm("self")}>
                <Plus className="mr-2 size-4" />
                Add Item
              </Button>
            )}
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
          ) : !spouseName ? (
            <ItemList
              items={filtered}
              onEdit={(item) => setEditingItem(item)}
              onDelete={(item) => setDeleteTarget(item)}
              onAddItem={() => openAddForm("self")}
              onRefresh={refetch}
            />
          ) : (
            <div className="space-y-8">
              <ItemSection
                label={profile?.preferred_name || profile?.full_name?.split(" ")[0] || "My Items"}
                items={selfItems}
                onEdit={(item) => setEditingItem(item)}
                onDelete={(item) => setDeleteTarget(item)}
                onAddItem={() => openAddForm("self")}
                onRefresh={refetch}
              />
              <ItemSection
                label={spouseName}
                items={spouseItems}
                onEdit={(item) => setEditingItem(item)}
                onDelete={(item) => setDeleteTarget(item)}
                onAddItem={() => openAddForm("spouse")}
                onRefresh={refetch}
              />
              <ItemSection
                label="Joint / Shared"
                items={jointItems}
                onEdit={(item) => setEditingItem(item)}
                onDelete={(item) => setDeleteTarget(item)}
                onAddItem={() => openAddForm("joint")}
                onRefresh={refetch}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Item Dialog */}
      <ItemForm
        key={addingForSection}
        open={formOpen}
        onOpenChange={setFormOpen}
        categorySlug={slug}
        spouseName={spouseName}
        initialData={spouseName ? { title: "", data: {}, belongs_to: addingForSection } : undefined}
        onSubmit={handleAddItem}
      />

      {/* Edit Item Dialog */}
      {editingItem && (
        <ItemForm
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          categorySlug={slug}
          spouseName={spouseName}
          initialData={{
            title: editingItem.title,
            data: editingItem.data as Record<string, Json>,
            notes: editingItem.notes || undefined,
            is_sensitive: editingItem.is_sensitive,
            belongs_to: editingItem.belongs_to || "self",
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
