"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface PersonFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    full_name: string
    email: string
    phone?: string
    relationship?: string
    notes?: string
    is_emergency_contact?: boolean
    emergency_override?: boolean
  }
  onSubmit: (person: {
    full_name: string
    email: string
    phone?: string
    relationship?: string
    notes?: string
    is_emergency_contact?: boolean
    emergency_override?: boolean
  }) => Promise<void>
}

export function PersonForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: PersonFormProps) {
  const [fullName, setFullName] = useState(initialData?.full_name || "")
  const [email, setEmail] = useState(initialData?.email || "")
  const [phone, setPhone] = useState(initialData?.phone || "")
  const [relationship, setRelationship] = useState(
    initialData?.relationship || ""
  )
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [isEmergencyContact, setIsEmergencyContact] = useState(
    initialData?.is_emergency_contact || false
  )
  const [emergencyOverride, setEmergencyOverride] = useState(
    initialData?.emergency_override || false
  )
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) {
      toast.error("Name and email are required")
      return
    }

    setSaving(true)
    try {
      await onSubmit({
        full_name: fullName,
        email,
        phone: phone || undefined,
        relationship: relationship || undefined,
        notes: notes || undefined,
        is_emergency_contact: isEmergencyContact,
        emergency_override: emergencyOverride,
      })
      onOpenChange(false)
      setFullName("")
      setEmail("")
      setPhone("")
      setRelationship("")
      setNotes("")
      setIsEmergencyContact(false)
      setEmergencyOverride(false)
    } catch {
      toast.error("Failed to save person")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Person" : "Add Person"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personEmail">Email *</Label>
            <Input
              id="personEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personPhone">Phone</Label>
            <Input
              id="personPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 555-5555"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g., Daughter, Attorney, Neighbor"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personNotes">Notes</Label>
            <Textarea
              id="personNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this person..."
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Emergency Contact</Label>
              <Switch
                checked={isEmergencyContact}
                onCheckedChange={setIsEmergencyContact}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Emergency Override</Label>
                <p className="text-xs text-muted-foreground">
                  Can access everything upon incapacity/death
                </p>
              </div>
              <Switch
                checked={emergencyOverride}
                onCheckedChange={setEmergencyOverride}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : initialData
                  ? "Save Changes"
                  : "Add Person"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
