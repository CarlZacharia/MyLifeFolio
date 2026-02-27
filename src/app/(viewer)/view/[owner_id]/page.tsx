"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { FolderOpen } from "lucide-react"
import type { Category, Profile } from "@/lib/types/app"

export default function ViewerFolioPage() {
  const params = useParams()
  const ownerId = params.owner_id as string
  const supabase = createClient()

  const [owner, setOwner] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<(Category & { item_count: number })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch owner profile (if the viewer can see it via persons table)
      const { data: ownerData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", ownerId)
        .single()

      if (ownerData) setOwner(ownerData)

      // Fetch accessible categories (RLS handles the filtering)
      const { data: cats } = await supabase
        .from("categories")
        .select("*")
        .eq("owner_id", ownerId)
        .order("sort_order", { ascending: true })

      if (cats) {
        // Get item counts
        const { data: items } = await supabase
          .from("folio_items")
          .select("category_id")
          .eq("owner_id", ownerId)

        const countMap: Record<string, number> = {}
        items?.forEach((item) => {
          countMap[item.category_id] = (countMap[item.category_id] || 0) + 1
        })

        setCategories(
          cats.map((c) => ({ ...c, item_count: countMap[c.id] || 0 }))
        )
      }

      setLoading(false)
    }

    fetchData()
  }, [ownerId, supabase])

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-primary/5 p-4">
        <p className="text-sm text-primary">
          You are viewing{" "}
          <strong>
            {owner?.full_name || "Unknown"}&apos;s Life Folio
          </strong>
        </p>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">
          Accessible Categories
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Categories that have been shared with you
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No accessible categories"
          description="The folio owner hasn't shared any categories with your role."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/view/${ownerId}/${cat.slug}`}>
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <h3 className="font-medium">{cat.name}</h3>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {cat.description}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-[10px]">
                    {cat.item_count} item{cat.item_count !== 1 ? "s" : ""}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
