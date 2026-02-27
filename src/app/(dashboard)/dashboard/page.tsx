"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { useCategories } from "@/lib/hooks/use-categories"
import { usePersons } from "@/lib/hooks/use-persons"
import { Header } from "@/components/layout/header"
import { CategoryGrid } from "@/components/folio/category-grid"
import { DashboardSkeleton } from "@/components/shared/loading-skeleton"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen, Users, Clock, ArrowRight } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils/format"
import Link from "next/link"

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const { categories, loading: catsLoading } = useCategories()
  const { persons, loading: personsLoading } = usePersons()

  const loading = authLoading || catsLoading || personsLoading

  if (loading) {
    return (
      <>
        <Header breadcrumbs={[{ label: "Dashboard" }]} />
        <div className="p-6">
          <DashboardSkeleton />
        </div>
      </>
    )
  }

  const totalItems = categories.reduce(
    (sum, cat) => sum + (cat.item_count ?? 0),
    0
  )
  const completedCategories = categories.filter(
    (cat) => (cat.item_count ?? 0) > 0
  ).length
  const completionPercent =
    categories.length > 0
      ? Math.round((completedCategories / categories.length) * 100)
      : 0

  const lastUpdatedCategory = categories
    .filter((c) => (c.item_count ?? 0) > 0)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0]

  return (
    <>
      <Header breadcrumbs={[{ label: "Dashboard" }]} />
      <div className="p-6">
        <div className="space-y-6">
          {/* Welcome */}
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary">
              Welcome back
              {profile?.preferred_name
                ? `, ${profile.preferred_name}`
                : profile?.full_name
                  ? `, ${profile.full_name.split(" ")[0]}`
                  : ""}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s an overview of your life folio
            </p>
          </div>

          {/* Onboarding prompt */}
          {!profile?.onboarding_completed && (
            <Card className="border-gold/30 bg-gold/5">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-primary">
                    Finish setting up your folio
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add your people and configure access roles
                  </p>
                </div>
                <Link href="/onboarding">
                  <Button size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">
                    Continue Setup
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/5">
                  <FolderOpen className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalItems}</p>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/5">
                  <Users className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{persons.length}</p>
                  <p className="text-xs text-muted-foreground">
                    People with Access
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/5">
                  <Clock className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {lastUpdatedCategory
                      ? formatRelativeTime(lastUpdatedCategory.updated_at)
                      : "Never"}
                  </p>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completion Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Folio Completion</span>
              <span className="font-medium">
                {completedCategories} of {categories.length} categories (
                {completionPercent}%)
              </span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>

          {/* Category Grid */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Your Categories</h2>
            <CategoryGrid categories={categories} />
          </div>
        </div>
      </div>
    </>
  )
}
