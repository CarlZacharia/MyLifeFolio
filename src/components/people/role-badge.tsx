import { Badge } from "@/components/ui/badge"
import type { RoleType } from "@/lib/types/app"

const roleColors: Record<string, string> = {
  spouse_partner: "bg-rose-100 text-rose-800",
  healthcare_poa_agent: "bg-emerald-100 text-emerald-800",
  financial_poa_agent: "bg-blue-100 text-blue-800",
  executor_trustee: "bg-purple-100 text-purple-800",
  financial_team: "bg-amber-100 text-amber-800",
  legal_team: "bg-slate-100 text-slate-800",
  healthcare_team: "bg-teal-100 text-teal-800",
  no_restrictions: "bg-green-100 text-green-800",
  owner_only: "bg-gray-100 text-gray-800",
  custom: "bg-indigo-100 text-indigo-800",
}

interface RoleBadgeProps {
  name: string
  roleType: RoleType | string
}

export function RoleBadge({ name, roleType }: RoleBadgeProps) {
  const colorClass = roleColors[roleType] || roleColors.custom

  return (
    <Badge variant="secondary" className={`${colorClass} text-[11px] font-normal`}>
      {name}
    </Badge>
  )
}
