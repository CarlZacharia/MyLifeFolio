"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CategoryWithAccess } from "@/lib/types/app"
import {
  Fingerprint, Users, Home, Briefcase, HeartPulse, Stethoscope,
  Bed, Brain, Landmark, MonitorSmartphone, Repeat, Building2,
  Coins, Gem, Shield, Flower2, ScrollText, House, Trophy, Plane,
  LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  fingerprint: Fingerprint,
  users: Users,
  home: Home,
  briefcase: Briefcase,
  "heart-pulse": HeartPulse,
  stethoscope: Stethoscope,
  bed: Bed,
  brain: Brain,
  landmark: Landmark,
  "monitor-smartphone": MonitorSmartphone,
  repeat: Repeat,
  "building-2": Building2,
  coins: Coins,
  gem: Gem,
  shield: Shield,
  "flower-2": Flower2,
  "scroll-text": ScrollText,
  house: House,
  trophy: Trophy,
  plane: Plane,
}

interface CategoryCardProps {
  category: CategoryWithAccess
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon || ""] || Briefcase
  const hasItems = (category.item_count ?? 0) > 0
  const accessRoles = category.category_role_access?.map((a) => a.role) ?? []
  const isOwnerOnly = accessRoles.some((r) => r.role_type === "owner_only")
  const isNoRestrictions = accessRoles.some(
    (r) => r.role_type === "no_restrictions"
  )

  return (
    <Link href={`/folio/${category.slug}`}>
      <Card
        className={`transition-all hover:shadow-md ${
          hasItems
            ? "border-l-4 border-l-success"
            : "border-l-4 border-l-transparent"
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                <Icon className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium leading-tight">{category.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {category.item_count ?? 0} item
                  {(category.item_count ?? 0) !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {category.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {isOwnerOnly && (
              <Badge variant="secondary" className="text-[10px]">
                Owner Only
              </Badge>
            )}
            {isNoRestrictions && (
              <Badge variant="secondary" className="text-[10px]">
                No Restrictions
              </Badge>
            )}
            {!isOwnerOnly &&
              !isNoRestrictions &&
              accessRoles.slice(0, 3).map((role) => (
                <Badge key={role.id} variant="secondary" className="text-[10px]">
                  {role.name}
                </Badge>
              ))}
            {!isOwnerOnly &&
              !isNoRestrictions &&
              accessRoles.length > 3 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{accessRoles.length - 3}
                </Badge>
              )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
