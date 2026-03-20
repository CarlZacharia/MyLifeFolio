"use client"

import { useCategories } from "@/lib/hooks/use-categories"
import { Header } from "@/components/layout/header"
import { CategoryGrid } from "@/components/folio/category-grid"
import { HouseholdSummaryCard } from "@/components/folio/household-summary-card"
import { DashboardSkeleton } from "@/components/shared/loading-skeleton"

export default function FolioPage() {
  const { categories, loading } = useCategories()

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Folio" },
        ]}
      />
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary">
              My Folio
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your life documentation
            </p>
          </div>

          <HouseholdSummaryCard />

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <CategoryGrid categories={categories} />
          )}
        </div>
      </div>
    </>
  )
}
