"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useProfile } from "@/lib/hooks/use-profile"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user } = useAuth()
  const { profile, loading, updateProfile } = useProfile()
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState("")
  const [preferredName, setPreferredName] = useState("")
  const [phone, setPhone] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zip, setZip] = useState("")
  const [spouseName, setSpouseName] = useState("")
  // Initialize form once profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setPreferredName(profile.preferred_name || "")
      setPhone(profile.phone || "")
      setAddressLine1(profile.address_line1 || "")
      setAddressLine2(profile.address_line2 || "")
      setCity(profile.city || "")
      setState(profile.state || "")
      setZip(profile.zip || "")
      setSpouseName(profile.spouse_name || "")
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const result = await updateProfile({
        full_name: fullName,
        preferred_name: preferredName || null,
        phone: phone || null,
        address_line1: addressLine1 || null,
        address_line2: addressLine2 || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        spouse_name: spouseName || null,
      })

      if (result?.error) {
        toast.error("Failed to save settings")
      } else {
        toast.success("Settings saved")
      }
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />
      <div className="p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary">
              Account Settings
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your profile and account preferences
            </p>
          </div>

          {loading ? (
            <Skeleton className="h-96 rounded-lg" />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || ""} disabled />
                      <p className="text-xs text-muted-foreground">
                        Contact support to change your email
                      </p>
                    </div>

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
                      <Label htmlFor="settingsPhone">Phone</Label>
                      <Input
                        id="settingsPhone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
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
                        <Label htmlFor="settingsCity">City</Label>
                        <Input
                          id="settingsCity"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="settingsState">State</Label>
                        <Input
                          id="settingsState"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="settingsZip">ZIP</Label>
                        <Input
                          id="settingsZip"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Household</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="spouseName">Spouse / Partner Name</Label>
                      <Input
                        id="spouseName"
                        value={spouseName}
                        onChange={(e) => setSpouseName(e.target.value)}
                        placeholder="Leave blank if not applicable"
                      />
                      <p className="text-xs text-muted-foreground">
                        When set, each category will show separate sections for
                        your items and your spouse&apos;s items.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  )
}
