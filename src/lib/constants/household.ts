export const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "domestic_partnership", label: "Domestic Partnership" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
]

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
]

export const PARENT_RELATIONSHIP_OPTIONS = [
  { value: "both", label: "Child of Both" },
  { value: "owner_only", label: "My Child Only" },
  { value: "spouse_only", label: "Spouse's Child Only" },
]

/** Returns true for marital statuses that imply a current partner */
export function isPartnered(status?: string | null): boolean {
  return status === "married" || status === "domestic_partnership"
}
