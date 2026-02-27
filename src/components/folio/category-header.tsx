"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"
import type { CategoryWithAccess } from "@/lib/types/app"
import {
  Fingerprint, Users, Home, Briefcase, HeartPulse, Stethoscope,
  Bed, Brain, Landmark, MonitorSmartphone, Repeat, Building2,
  Coins, Gem, Shield, Flower2, ScrollText, House, Trophy, Plane,
  PawPrint, LucideIcon,
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
  "paw-print": PawPrint,
}

interface CategoryHeaderProps {
  category: CategoryWithAccess
  onEditAccess?: () => void
}

export function CategoryHeader({ category, onEditAccess }: CategoryHeaderProps) {
  const Icon = iconMap[category.icon || ""] || Briefcase
  const accessRoles = category.category_role_access?.map((a) => a.role) ?? []

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/5">
          <Icon className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary">
            {category.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {category.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Access:</span>
            {accessRoles.map((role) => (
              <Badge key={role.id} variant="secondary" className="text-[10px]">
                {role.name}
              </Badge>
            ))}
            {onEditAccess && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px]"
                onClick={onEditAccess}
              >
                <Settings2 className="mr-0.5 size-3" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
