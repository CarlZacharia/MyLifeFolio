"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { itemTemplates } from "@/lib/constants/item-templates"
import type { ItemTemplateField } from "@/lib/types/app"
import type { Json } from "@/lib/types/database"
import { toast } from "sonner"

interface ItemFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categorySlug: string
  initialData?: { title: string; data: Record<string, Json>; notes?: string; is_sensitive?: boolean }
  onSubmit: (item: {
    title: string
    data: Record<string, Json>
    notes?: string
    is_sensitive?: boolean
  }) => Promise<void>
}

export function ItemForm({
  open,
  onOpenChange,
  categorySlug,
  initialData,
  onSubmit,
}: ItemFormProps) {
  const fields = itemTemplates[categorySlug] || []
  const [title, setTitle] = useState(initialData?.title || "")
  const [formData, setFormData] = useState<Record<string, Json>>(
    initialData?.data || {}
  )
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [isSensitive, setIsSensitive] = useState(
    initialData?.is_sensitive || false
  )
  const [saving, setSaving] = useState(false)

  const setValue = (key: string, value: Json) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }

    setSaving(true)
    try {
      await onSubmit({
        title,
        data: formData,
        notes: notes || undefined,
        is_sensitive: isSensitive,
      })
      onOpenChange(false)
      setTitle("")
      setFormData({})
      setNotes("")
      setIsSensitive(false)
    } catch {
      toast.error("Failed to save item")
    } finally {
      setSaving(false)
    }
  }

  const renderField = (field: ItemTemplateField) => {
    const value = formData[field.key]

    switch (field.type) {
      case "select":
        return (
          <Select
            value={(value as string) || ""}
            onValueChange={(v) => setValue(field.key, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "textarea":
      case "rich_text":
        return (
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => setValue(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        )

      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={!!value}
              onCheckedChange={(checked) => setValue(field.key, !!checked)}
            />
            <span className="text-sm text-muted-foreground">Yes</span>
          </div>
        )

      case "date":
        return (
          <Input
            type="date"
            value={(value as string) || ""}
            onChange={(e) => setValue(field.key, e.target.value)}
          />
        )

      case "phone":
        return (
          <Input
            type="tel"
            value={(value as string) || ""}
            onChange={(e) => setValue(field.key, e.target.value)}
            placeholder={field.placeholder || "(555) 555-5555"}
          />
        )

      case "email":
        return (
          <Input
            type="email"
            value={(value as string) || ""}
            onChange={(e) => setValue(field.key, e.target.value)}
            placeholder={field.placeholder || "email@example.com"}
          />
        )

      default:
        return (
          <Input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => setValue(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Item" : "Add New Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this item a name"
              required
            />
          </div>

          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label>
                {field.label}
                {field.sensitive && (
                  <span className="ml-1 text-xs text-warning">
                    (sensitive)
                  </span>
                )}
              </Label>
              {renderField(field)}
            </div>
          ))}

          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other notes..."
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isSensitive}
              onCheckedChange={setIsSensitive}
            />
            <Label>Mark as sensitive (masked for viewers by default)</Label>
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
              {saving ? "Saving..." : initialData ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
