"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRoles } from "@/lib/hooks/use-roles"
import { useCategories } from "@/lib/hooks/use-categories"
import { useAccess } from "@/lib/hooks/use-access"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { Plus, X, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { toast } from "sonner"

interface NewPerson {
  full_name: string
  email: string
  phone: string
  relationship: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { roles } = useRoles()
  const { categories, refetch: refetchCategories } = useCategories()
  const { setCategoryAccess } = useAccess()

  const [step, setStep] = useState(1)
  const totalSteps = 5

  // Step 2: People
  const [people, setPeople] = useState<NewPerson[]>([])
  const [newPerson, setNewPerson] = useState<NewPerson>({
    full_name: "",
    email: "",
    phone: "",
    relationship: "",
  })

  // Step 3: Role assignments (personIndex -> roleIds)
  const [personRoleMap, setPersonRoleMap] = useState<Record<number, string[]>>(
    {}
  )

  // Step 3: Custom group
  const [wantsGroup, setWantsGroup] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupMembers, setGroupMembers] = useState<number[]>([])

  const addPerson = () => {
    if (!newPerson.full_name || !newPerson.email) {
      toast.error("Name and email are required")
      return
    }
    setPeople((prev) => [...prev, { ...newPerson }])
    setNewPerson({ full_name: "", email: "", phone: "", relationship: "" })
  }

  const removePerson = (index: number) => {
    setPeople((prev) => prev.filter((_, i) => i !== index))
  }

  const togglePersonRole = (personIndex: number, roleId: string) => {
    setPersonRoleMap((prev) => {
      const current = prev[personIndex] || []
      const has = current.includes(roleId)
      return {
        ...prev,
        [personIndex]: has
          ? current.filter((id) => id !== roleId)
          : [...current, roleId],
      }
    })
  }

  const assignableRoles = roles.filter(
    (r) => r.role_type !== "no_restrictions" && r.role_type !== "owner_only"
  )

  const handleFinish = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Create all people and assign roles
      for (let i = 0; i < people.length; i++) {
        const person = people[i]
        const { data: createdPerson, error } = await supabase
          .from("persons")
          .insert({
            owner_id: user.id,
            full_name: person.full_name,
            email: person.email,
            phone: person.phone || null,
            relationship: person.relationship || null,
          })
          .select()
          .single()

        if (error || !createdPerson) continue

        // Assign roles
        const roleIds = personRoleMap[i] || []
        if (roleIds.length > 0) {
          await supabase.from("person_roles").insert(
            roleIds.map((roleId) => ({
              person_id: createdPerson.id,
              role_id: roleId,
              owner_id: user.id,
            }))
          )
        }
      }

      // Create custom group if requested
      if (wantsGroup && groupName && groupMembers.length > 0) {
        await supabase.from("roles").insert({
          owner_id: user.id,
          name: groupName,
          role_type: "custom",
          is_system_role: false,
          sort_order: roles.length + 1,
        })
      }

      // Mark onboarding complete
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id)

      toast.success("Your folio is ready!")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Something went wrong. You can finish setup later.")
      router.push("/dashboard")
    }
  }

  return (
    <>
      <Header breadcrumbs={[{ label: "Getting Started" }]} />
      <div className="mx-auto max-w-3xl p-6">
        <Progress value={(step / totalSteps) * 100} className="mb-8 h-2" />

        {/* Step 1: Welcome */}
        {step === 1 && (
          <Card>
            <CardHeader className="items-center text-center">
              <p className="font-serif text-3xl text-primary">
                Welcome to
              </p>
              <Image
                src="/MLFLogo.png"
                alt="MyLifeFolio"
                width={220}
                height={66}
                className="mx-auto"
                style={{ height: "auto" }}
                priority
              />
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Your folio is a comprehensive record of everything your family and
                advisors would need to know. Let&apos;s get it set up.
              </p>
              <p className="text-sm text-muted-foreground">
                We&apos;ve already created 20 categories and set smart default
                access controls. This quick setup will help you add the people in
                your life and assign them the right roles.
              </p>
              <Button onClick={() => setStep(2)} className="mt-4">
                Let&apos;s Get Started
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Add People */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Add Your People</CardTitle>
              <p className="text-sm text-muted-foreground">
                Start with the people closest to you — your spouse, children,
                attorney, and financial advisor.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {people.length > 0 && (
                <div className="space-y-2">
                  {people.map((person, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{person.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {person.relationship || person.email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePerson(i)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 rounded-md border border-dashed p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Full Name *</Label>
                    <Input
                      value={newPerson.full_name}
                      onChange={(e) =>
                        setNewPerson((p) => ({
                          ...p,
                          full_name: e.target.value,
                        }))
                      }
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={newPerson.email}
                      onChange={(e) =>
                        setNewPerson((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      value={newPerson.phone}
                      onChange={(e) =>
                        setNewPerson((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="(555) 555-5555"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Relationship</Label>
                    <Input
                      value={newPerson.relationship}
                      onChange={(e) =>
                        setNewPerson((p) => ({
                          ...p,
                          relationship: e.target.value,
                        }))
                      }
                      placeholder="e.g., Daughter, Attorney"
                    />
                  </div>
                </div>
                <Button variant="outline" onClick={addPerson}>
                  <Plus className="mr-2 size-4" />
                  Add Person
                </Button>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Next: Assign Roles
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Assign Roles */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Assign Roles</CardTitle>
              <p className="text-sm text-muted-foreground">
                For each person, check the roles that apply. A person can have
                multiple roles (e.g., daughter who is also Healthcare POA Agent).
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {people.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No people added yet. Go back to add people first.
                </p>
              ) : (
                people.map((person, i) => (
                  <div key={i} className="space-y-2 rounded-md border p-4">
                    <h4 className="font-medium">{person.full_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {person.relationship}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {assignableRoles.map((role) => (
                        <div key={role.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={(personRoleMap[i] || []).includes(
                              role.id
                            )}
                            onCheckedChange={() =>
                              togglePersonRole(i, role.id)
                            }
                          />
                          <span className="text-sm">{role.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {/* Custom Group */}
              <div className="space-y-3 rounded-md border border-dashed p-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={wantsGroup}
                    onCheckedChange={(c) => setWantsGroup(!!c)}
                  />
                  <span className="text-sm font-medium">
                    Create a family group?
                  </span>
                </div>
                {wantsGroup && (
                  <>
                    <Input
                      placeholder="Group name (e.g., Children, Inner Circle)"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                    <div className="space-y-1">
                      {people.map((person, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Checkbox
                            checked={groupMembers.includes(i)}
                            onCheckedChange={(c) =>
                              setGroupMembers((prev) =>
                                c
                                  ? [...prev, i]
                                  : prev.filter((idx) => idx !== i)
                              )
                            }
                          />
                          <span className="text-sm">{person.full_name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(4)}>
                  Next: Review Access
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review Access Matrix */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Access Defaults</CardTitle>
              <p className="text-sm text-muted-foreground">
                We&apos;ve set smart defaults for who can see what. Most clients
                find these work well. You can adjust any of these now or change
                them later.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="min-w-[600px]">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left font-medium">
                          Category
                        </th>
                        {assignableRoles.map((role) => (
                          <th
                            key={role.id}
                            className="px-1 py-2 text-center"
                          >
                            <div className="max-w-16 truncate text-[10px] font-medium">
                              {role.name}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => {
                        const grantedIds = new Set(
                          cat.category_role_access?.map((a) => a.role_id) ??
                            []
                        )
                        return (
                          <tr key={cat.id} className="border-b">
                            <td className="px-3 py-1.5 text-xs font-medium">
                              {cat.name}
                            </td>
                            {assignableRoles.map((role) => (
                              <td
                                key={role.id}
                                className="px-1 py-1.5 text-center"
                              >
                                <Checkbox
                                  checked={grantedIds.has(role.id)}
                                  onCheckedChange={async () => {
                                    const currentIds =
                                      cat.category_role_access?.map(
                                        (a) => a.role_id
                                      ) ?? []
                                    const newIds = grantedIds.has(role.id)
                                      ? currentIds.filter(
                                          (id) => id !== role.id
                                        )
                                      : [...currentIds, role.id]
                                    await setCategoryAccess(cat.id, newIds)
                                    await refetchCategories()
                                  }}
                                  className="size-3.5"
                                />
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(5)}>
                  Next: Finish
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Complete */}
        {step === 5 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-3xl text-primary">
                Your Folio Is Ready
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
                <Check className="size-8 text-success" />
              </div>
              <p className="text-muted-foreground">
                Where would you like to start? We suggest beginning with the
                categories that matter most: Medical History, Healthcare
                Preferences, or Friends &amp; Neighbors.
              </p>
              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={handleFinish}
                  className="bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  Go to My Dashboard
                </Button>
                <Button variant="ghost" onClick={() => setStep(4)}>
                  <ArrowLeft className="mr-2 size-4" />
                  Back to review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
