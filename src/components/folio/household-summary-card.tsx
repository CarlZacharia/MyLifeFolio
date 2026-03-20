"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { isPartnered } from "@/lib/constants/household"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, User, Users } from "lucide-react"

export function HouseholdSummaryCard() {
  const { profile } = useAuth()

  if (!profile) return null

  const name = profile.preferred_name || profile.full_name || "Not set"
  const partnered = isPartnered(profile.marital_status)
  const spouseName = profile.spouse_name || profile.spouse_full_name

  const details: string[] = []
  if (profile.email) details.push(profile.email)
  if (profile.phone) details.push(profile.phone)
  if (profile.city && profile.state) {
    details.push(`${profile.city}, ${profile.state}`)
  } else if (profile.city) {
    details.push(profile.city)
  } else if (profile.state) {
    details.push(profile.state)
  }

  return (
    <Link href="/folio/household">
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {partnered ? <Users className="size-5" /> : <User className="size-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-primary">{name}</h3>
              {partnered && spouseName && (
                <Badge variant="secondary" className="text-xs">
                  &amp; {spouseName}
                </Badge>
              )}
            </div>
            {details.length > 0 && (
              <p className="truncate text-sm text-muted-foreground">
                {details.join(" \u00B7 ")}
              </p>
            )}
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  )
}
