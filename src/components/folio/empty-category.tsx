import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CATEGORY_META } from "@/lib/constants/categories"

interface EmptyCategoryProps {
  slug: string
  onAddItem: () => void
}

const categoryPrompts: Record<string, string> = {
  "personal-identity":
    "Start by adding your most critical identity documents — passport, birth certificate, Social Security card.",
  "family-relationships":
    "Add your immediate family members first — spouse, children, siblings. Include contact info and relationship context.",
  "friends-neighbors":
    "Think about who is physically close enough to help in an emergency. Who has a key? Who would check on you?",
  "advisory-team":
    "Add your key professionals — estate attorney, CPA, wealth manager, primary physician.",
  "medical-history":
    "Start with current medications, diagnoses, and your primary care physician. Add allergies and pharmacy info.",
  "healthcare-preferences":
    "Document your preferred hospital, DNR status, and any specific treatment wishes.",
  "long-term-care":
    "Think about where you'd want to live if you needed daily assistance. What matters most to you?",
  "mental-health":
    "Write down what brings you comfort — music, activities, routines — and what you wouldn't want.",
  "financial-overview":
    "Start with bank accounts and insurance policies. Include contact info for each institution.",
  "digital-life":
    "List your email accounts, important subscriptions, and where your password manager lives.",
  "income-obligations":
    "Document regular income (pension, SS, rental) and recurring obligations (bills, pledges, staff payroll).",
  "business-interests":
    "For each business, note the entity type, ownership %, key contacts, and what happens if you're incapacitated.",
  "royalties":
    "Add any ongoing royalty streams — books, patents, mineral rights, licensing agreements.",
  "personal-property":
    "Start with high-value items — jewelry, art, collectibles. Note who you'd like to receive each piece.",
  "firearms":
    "Document each firearm with make, model, serial number, and location. Note any NFA items.",
  "funeral-burial":
    "Record your preferences: burial vs. cremation, preferred funeral home, memorial service wishes.",
  "personal-wishes":
    "Write what matters most — legacy letters, life lessons, hopes for your family.",
  "home-property":
    "Start with alarm codes, safe combinations, and key vendor contacts for each property.",
  "clubs-memberships":
    "List memberships, dues, and whether they're transferable. Include season tickets.",
  "travel-lifestyle":
    "Document loyalty programs, points balances, and travel agent contacts.",
}

export function EmptyCategory({ slug, onAddItem }: EmptyCategoryProps) {
  const meta = CATEGORY_META[slug]
  const prompt = categoryPrompts[slug] || "Add your first item to get started."

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <h3 className="text-lg font-semibold">
        Start documenting {meta?.name || "this category"}
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{prompt}</p>
      <Button onClick={onAddItem} className="mt-6">
        <Plus className="mr-2 size-4" />
        Add First Item
      </Button>
    </div>
  )
}
