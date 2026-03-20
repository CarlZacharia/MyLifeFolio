"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { useProfile } from "@/lib/hooks/use-profile"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user } = useAuth()
  const { profile, loading, updateProfile } = useProfile()
  const [saving, setSaving] = useState(false)

  const [preferredName, setPreferredName] = useState("")

  // Initialize form once profile loads
  useEffect(() => {
    if (profile) {
      setPreferredName(profile.preferred_name || "")
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const result = await updateProfile({
        preferred_name: preferredName || null,
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
              Manage your account preferences
            </p>
          </div>

          {loading ? (
            <Skeleton className="h-48 rounded-lg" />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
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

                    <div className="space-y-2">
                      <Label htmlFor="preferredName">Preferred Name</Label>
                      <Input
                        id="preferredName"
                        value={preferredName}
                        onChange={(e) => setPreferredName(e.target.value)}
                        placeholder="What should we call you?"
                      />
                    </div>

                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Manage your personal details, spouse information, and children on the{" "}
                    <Link
                      href="/folio/household"
                      className="font-medium text-primary underline underline-offset-4"
                    >
                      Household Profile
                    </Link>{" "}
                    page.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  )
}
