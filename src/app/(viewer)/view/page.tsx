"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { FolderOpen } from "lucide-react"

interface SharedFolio {
  owner_id: string
  owner_name: string
}

export default function ViewerListPage() {
  const [folios, setFolios] = useState<SharedFolio[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchSharedFolios = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Find all persons entries where this user is linked
      const { data: personEntries } = await supabase
        .from("persons")
        .select("owner_id")
        .eq("user_id", user.id)

      if (personEntries && personEntries.length > 0) {
        const ownerIds = [...new Set(personEntries.map((p) => p.owner_id))]

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ownerIds)

        if (profiles) {
          setFolios(
            profiles.map((p) => ({
              owner_id: p.id,
              owner_name: p.full_name || "Unknown",
            }))
          )
        }
      }

      setLoading(false)
    }

    fetchSharedFolios()
  }, [supabase])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">
          Shared Folios
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Life folios that have been shared with you
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : folios.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No shared folios"
          description="When someone shares their life folio with you, it will appear here."
        />
      ) : (
        <div className="space-y-3">
          {folios.map((folio) => (
            <Link key={folio.owner_id} href={`/view/${folio.owner_id}`}>
              <Card className="transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {folio.owner_name}&apos;s Life Folio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click to view the categories shared with you
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
