"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useSupabase } from "@/lib/supabase/use-supabase"
import { useAuditLog } from "@/lib/hooks/use-audit-log"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { ArrowLeft, FolderOpen, Eye, EyeOff } from "lucide-react"
import type { Category, FolioItem } from "@/lib/types/app"
import type { Json } from "@/lib/types/database"

export default function ViewerCategoryPage() {
  const params = useParams()
  const ownerId = params.owner_id as string
  const slug = params.slug as string
  const supabase = useSupabase()
  const { log } = useAuditLog()
  const loggedRef = useRef(false)

  const [category, setCategory] = useState<Category | null>(null)
  const [items, setItems] = useState<FolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      const { data: cat } = await supabase
        .from("categories")
        .select("*")
        .eq("owner_id", ownerId)
        .eq("slug", slug)
        .single()

      if (cat) {
        setCategory(cat)

        const { data: catItems } = await supabase
          .from("folio_items")
          .select("*")
          .eq("category_id", cat.id)
          .order("sort_order", { ascending: true })

        if (catItems) setItems(catItems)

        // Log viewer access event once
        if (!loggedRef.current) {
          loggedRef.current = true
          log({
            action: "category.view",
            resourceType: "category",
            resourceId: cat.id,
            details: { owner_id: ownerId, slug, item_count: catItems?.length ?? 0 },
          })
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [ownerId, slug, supabase])

  const toggleReveal = (itemId: string, key: string) => {
    const fieldKey = `${itemId}-${key}`
    setRevealedFields((prev) => {
      const next = new Set(prev)
      if (next.has(fieldKey)) {
        next.delete(fieldKey)
      } else {
        next.add(fieldKey)
      }
      return next
    })
  }

  const sensitiveKeys = new Set([
    "document_number",
    "account_number",
    "serial_number",
    "ein",
    "username",
    "password_hint",
    "recovery_info",
    "access_codes",
    "safe_info",
  ])

  return (
    <div className="space-y-6">
      <Link href={`/view/${ownerId}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 size-4" />
          Back to categories
        </Button>
      </Link>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : !category ? (
        <EmptyState
          icon={FolderOpen}
          title="Category not found"
          description="This category may not exist or you may not have access to it."
        />
      ) : (
        <>
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary">
              {category.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {category.description}
            </p>
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No items"
              description="There are no items in this category yet."
            />
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const data = item.data as Record<string, Json>
                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{item.title}</h3>
                        {item.is_sensitive && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-warning"
                          >
                            Sensitive
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3 space-y-2">
                        {Object.entries(data)
                          .filter(([, value]) => value && value !== "")
                          .map(([key, value]) => {
                            const isSensitive =
                              sensitiveKeys.has(key) || item.is_sensitive
                            const isRevealed = revealedFields.has(
                              `${item.id}-${key}`
                            )
                            const displayValue =
                              isSensitive && !isRevealed
                                ? "••••••••"
                                : typeof value === "boolean"
                                  ? value
                                    ? "Yes"
                                    : "No"
                                  : String(value)

                            return (
                              <div
                                key={key}
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="shrink-0 font-medium text-muted-foreground">
                                  {key
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  :
                                </span>
                                <span className="flex items-center gap-1">
                                  {displayValue}
                                  {isSensitive && (
                                    <button
                                      onClick={() =>
                                        toggleReveal(item.id, key)
                                      }
                                      className="ml-1 text-muted-foreground hover:text-foreground"
                                    >
                                      {isRevealed ? (
                                        <EyeOff className="size-3.5" />
                                      ) : (
                                        <Eye className="size-3.5" />
                                      )}
                                    </button>
                                  )}
                                </span>
                              </div>
                            )
                          })}
                        {item.notes && (
                          <div className="text-sm">
                            <span className="font-medium text-muted-foreground">
                              Notes:
                            </span>{" "}
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
