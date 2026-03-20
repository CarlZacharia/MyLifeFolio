"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useProfile } from "@/lib/hooks/use-profile"
import { useChildren } from "@/lib/hooks/use-children"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MARITAL_STATUS_OPTIONS,
  GENDER_OPTIONS,
  PARENT_RELATIONSHIP_OPTIONS,
  isPartnered,
} from "@/lib/constants/household"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Child } from "@/lib/types/app"

export default function HouseholdPage() {
  const { user } = useAuth()
  const { profile, loading: profileLoading, updateProfile } = useProfile()
  const { children, loading: childrenLoading, createChild, updateChild, deleteChild } = useChildren()

  // Owner form state
  const [fullName, setFullName] = useState("")
  const [preferredName, setPreferredName] = useState("")
  const [phone, setPhone] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zip, setZip] = useState("")
  const [maritalStatus, setMaritalStatus] = useState("single")
  const [ownerSaving, setOwnerSaving] = useState(false)

  // Spouse form state
  const [spouseName, setSpouseName] = useState("")
  const [spouseDateOfBirth, setSpouseDateOfBirth] = useState("")
  const [spouseGender, setSpouseGender] = useState("")
  const [spousePhone, setSpousePhone] = useState("")
  const [spouseEmail, setSpouseEmail] = useState("")
  const [spouseSaving, setSpouseSaving] = useState(false)

  // Child form state
  const [childFormOpen, setChildFormOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null)
  const [childName, setChildName] = useState("")
  const [childDob, setChildDob] = useState("")
  const [childGender, setChildGender] = useState("")
  const [childPhone, setChildPhone] = useState("")
  const [childEmail, setChildEmail] = useState("")
  const [childNotes, setChildNotes] = useState("")
  const [childRelationship, setChildRelationship] = useState("both")
  const [childSaving, setChildSaving] = useState(false)

  // Initialize owner form from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setPreferredName(profile.preferred_name || "")
      setPhone(profile.phone || "")
      setDateOfBirth(profile.date_of_birth || "")
      setGender(profile.gender || "")
      setAddressLine1(profile.address_line1 || "")
      setAddressLine2(profile.address_line2 || "")
      setCity(profile.city || "")
      setState(profile.state || "")
      setZip(profile.zip || "")
      setMaritalStatus(profile.marital_status || "single")
      setSpouseName(profile.spouse_name || profile.spouse_full_name || "")
      setSpouseDateOfBirth(profile.spouse_date_of_birth || "")
      setSpouseGender(profile.spouse_gender || "")
      setSpousePhone(profile.spouse_phone || "")
      setSpouseEmail(profile.spouse_email || "")
    }
  }, [profile])

  const handleSaveOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    setOwnerSaving(true)
    try {
      const result = await updateProfile({
        full_name: fullName || null,
        preferred_name: preferredName || null,
        phone: phone || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        address_line1: addressLine1 || null,
        address_line2: addressLine2 || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        marital_status: maritalStatus,
      })
      if (result?.error) {
        toast.error("Failed to save profile")
      } else {
        toast.success("Profile saved")
      }
    } catch {
      toast.error("Failed to save profile")
    } finally {
      setOwnerSaving(false)
    }
  }

  const handleSaveSpouse = async (e: React.FormEvent) => {
    e.preventDefault()
    setSpouseSaving(true)
    try {
      const result = await updateProfile({
        spouse_name: spouseName || null,
        spouse_full_name: spouseName || null,
        spouse_date_of_birth: spouseDateOfBirth || null,
        spouse_gender: spouseGender || null,
        spouse_phone: spousePhone || null,
        spouse_email: spouseEmail || null,
      })
      if (result?.error) {
        toast.error("Failed to save spouse details")
      } else {
        toast.success("Spouse details saved")
      }
    } catch {
      toast.error("Failed to save spouse details")
    } finally {
      setSpouseSaving(false)
    }
  }

  const resetChildForm = () => {
    setChildName("")
    setChildDob("")
    setChildGender("")
    setChildPhone("")
    setChildEmail("")
    setChildNotes("")
    setChildRelationship(partnered ? "both" : "owner_only")
    setEditingChild(null)
    setChildFormOpen(false)
  }

  const openAddChild = () => {
    resetChildForm()
    setChildRelationship(partnered ? "both" : "owner_only")
    setChildFormOpen(true)
  }

  const openEditChild = (child: Child) => {
    setEditingChild(child)
    setChildName(child.full_name)
    setChildDob(child.date_of_birth || "")
    setChildGender(child.gender || "")
    setChildPhone(child.phone || "")
    setChildEmail(child.email || "")
    setChildNotes(child.notes || "")
    setChildRelationship(child.parent_relationship || "both")
    setChildFormOpen(true)
  }

  const handleSaveChild = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!childName.trim()) return
    setChildSaving(true)
    try {
      const childData = {
        full_name: childName.trim(),
        date_of_birth: childDob || null,
        gender: childGender || null,
        phone: childPhone || null,
        email: childEmail || null,
        notes: childNotes || null,
        parent_relationship: childRelationship,
      }

      if (editingChild) {
        const { error } = await updateChild(editingChild.id, childData)
        if (error) {
          toast.error("Failed to update child")
        } else {
          toast.success("Child updated")
          resetChildForm()
        }
      } else {
        const { error } = await createChild(childData)
        if (error) {
          toast.error("Failed to add child")
        } else {
          toast.success("Child added")
          resetChildForm()
        }
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setChildSaving(false)
    }
  }

  const handleDeleteChild = async () => {
    if (!deleteTarget) return
    const { error } = await deleteChild(deleteTarget.id)
    if (error) {
      toast.error("Failed to delete child")
    } else {
      toast.success("Child removed")
    }
    setDeleteTarget(null)
  }

  const partnered = isPartnered(maritalStatus)
  const loading = profileLoading || childrenLoading

  const relationshipOptions = partnered
    ? PARENT_RELATIONSHIP_OPTIONS
    : PARENT_RELATIONSHIP_OPTIONS.filter((o) => o.value !== "spouse_only")

  const getRelationshipLabel = (value: string) =>
    PARENT_RELATIONSHIP_OPTIONS.find((o) => o.value === value)?.label || value

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Folio", href: "/folio" },
          { label: "Household Profile" },
        ]}
      />
      <div className="p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary">
              Household Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your personal details, spouse information, and children
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-96 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          ) : (
            <>
              {/* Section A: Owner Profile */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveOwner} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferredName">Preferred Name</Label>
                        <Input
                          id="preferredName"
                          value={preferredName}
                          onChange={(e) => setPreferredName(e.target.value)}
                          placeholder="What should we call you?"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || ""} disabled />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="ownerPhone">Phone</Label>
                        <Input
                          id="ownerPhone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerDob">Date of Birth</Label>
                        <Input
                          id="ownerDob"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDER_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="address1">Address Line 1</Label>
                      <Input
                        id="address1"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address2">Address Line 2</Label>
                      <Input
                        id="address2"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="ownerCity">City</Label>
                        <Input
                          id="ownerCity"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerState">State</Label>
                        <Input
                          id="ownerState"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerZip">ZIP</Label>
                        <Input
                          id="ownerZip"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Marital Status</Label>
                      <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MARITAL_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Setting this to Married or Domestic Partnership enables spouse
                        sections throughout the app.
                      </p>
                    </div>

                    <Button type="submit" disabled={ownerSaving}>
                      {ownerSaving ? "Saving..." : "Save Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Section B: Spouse Details (conditional) */}
              {partnered && (
                <Card>
                  <CardHeader>
                    <CardTitle>Spouse / Partner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveSpouse} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="spouseName">Full Name</Label>
                        <Input
                          id="spouseName"
                          value={spouseName}
                          onChange={(e) => setSpouseName(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="spouseDob">Date of Birth</Label>
                          <Input
                            id="spouseDob"
                            type="date"
                            value={spouseDateOfBirth}
                            onChange={(e) => setSpouseDateOfBirth(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Gender</Label>
                          <Select value={spouseGender} onValueChange={setSpouseGender}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {GENDER_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="spousePhoneField">Phone</Label>
                          <Input
                            id="spousePhoneField"
                            type="tel"
                            value={spousePhone}
                            onChange={(e) => setSpousePhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="spouseEmailField">Email</Label>
                        <Input
                          id="spouseEmailField"
                          type="email"
                          value={spouseEmail}
                          onChange={(e) => setSpouseEmail(e.target.value)}
                        />
                      </div>

                      <Button type="submit" disabled={spouseSaving}>
                        {spouseSaving ? "Saving..." : "Save Spouse Details"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Section C: Children */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>Children</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {children.length}
                      </Badge>
                    </div>
                    {!childFormOpen && (
                      <Button variant="outline" size="sm" onClick={openAddChild}>
                        <Plus className="mr-1.5 size-3.5" />
                        Add Child
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Existing children */}
                    {children.length === 0 && !childFormOpen && (
                      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                        No children added yet
                      </p>
                    )}

                    {children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{child.full_name}</span>
                            {partnered && (
                              <Badge variant="outline" className="text-xs">
                                {getRelationshipLabel(child.parent_relationship)}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {[
                              child.date_of_birth,
                              child.phone,
                              child.email,
                            ]
                              .filter(Boolean)
                              .join(" \u00B7 ")}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditChild(child)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(child)}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Add/Edit child form */}
                    {childFormOpen && (
                      <div className="rounded-md border bg-muted/30 p-4">
                        <h4 className="mb-3 text-sm font-semibold">
                          {editingChild ? "Edit Child" : "Add Child"}
                        </h4>
                        <form onSubmit={handleSaveChild} className="space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="childName">Full Name</Label>
                              <Input
                                id="childName"
                                value={childName}
                                onChange={(e) => setChildName(e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="childDob">Date of Birth</Label>
                              <Input
                                id="childDob"
                                type="date"
                                value={childDob}
                                onChange={(e) => setChildDob(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Gender</Label>
                              <Select value={childGender} onValueChange={setChildGender}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {GENDER_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Parent Relationship</Label>
                              <Select
                                value={childRelationship}
                                onValueChange={setChildRelationship}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {relationshipOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="childPhoneField">Phone</Label>
                              <Input
                                id="childPhoneField"
                                type="tel"
                                value={childPhone}
                                onChange={(e) => setChildPhone(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="childEmailField">Email</Label>
                              <Input
                                id="childEmailField"
                                type="email"
                                value={childEmail}
                                onChange={(e) => setChildEmail(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="childNotesField">Notes</Label>
                            <Input
                              id="childNotesField"
                              value={childNotes}
                              onChange={(e) => setChildNotes(e.target.value)}
                              placeholder="Optional notes"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={childSaving}>
                              {childSaving
                                ? "Saving..."
                                : editingChild
                                  ? "Update"
                                  : "Add"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={resetChildForm}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Delete child confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Child"
        description={`Are you sure you want to remove "${deleteTarget?.full_name}"? This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={handleDeleteChild}
        destructive
      />
    </>
  )
}
