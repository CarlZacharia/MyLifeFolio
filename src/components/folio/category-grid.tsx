"use client"

import { CategoryCard } from "./category-card"
import type { CategoryWithAccess } from "@/lib/types/app"

interface CategoryGridProps {
  categories: CategoryWithAccess[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}
