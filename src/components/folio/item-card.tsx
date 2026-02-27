"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, Shield } from "lucide-react"
import { FileUpload } from "@/components/shared/file-upload"
import type { FolioItemWithAttachments } from "@/lib/types/app"
import type { Json } from "@/lib/types/database"

interface ItemCardProps {
  item: FolioItemWithAttachments
  onEdit: () => void
  onDelete: () => void
  onRefresh?: () => void
}

export function ItemCard({ item, onEdit, onDelete, onRefresh }: ItemCardProps) {
  const [expanded, setExpanded] = useState(false)
  const data = item.data as Record<string, Json>

  // Get the first few meaningful fields to preview
  const previewFields = Object.entries(data)
    .filter(([, value]) => value && value !== "")
    .slice(0, 3)

  return (
    <Card className="transition-all hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div
            className="flex-1 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{item.title}</h4>
              {item.is_sensitive && (
                <Badge variant="outline" className="text-[10px] text-warning">
                  Sensitive
                </Badge>
              )}
              {item.use_custom_access && (
                <Badge variant="outline" className="text-[10px]">
                  <Shield className="mr-0.5 size-2.5" />
                  Custom Access
                </Badge>
              )}
            </div>
            {!expanded && previewFields.length > 0 && (
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                {previewFields
                  .map(([key, value]) => `${formatKey(key)}: ${value}`)
                  .join(" · ")}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {expanded && (
          <div className="mt-4 space-y-2 border-t pt-3">
            {Object.entries(data)
              .filter(([, value]) => value && value !== "")
              .map(([key, value]) => (
                <div key={key} className="flex gap-2 text-sm">
                  <span className="shrink-0 font-medium text-muted-foreground">
                    {formatKey(key)}:
                  </span>
                  <span>
                    {typeof value === "boolean"
                      ? value
                        ? "Yes"
                        : "No"
                      : String(value)}
                  </span>
                </div>
              ))}
            {item.notes && (
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">
                  Notes:
                </span>{" "}
                {item.notes}
              </div>
            )}
            {/* File Attachments */}
            <div className="mt-3 border-t pt-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Attachments
              </p>
              <FileUpload
                itemId={item.id}
                ownerId={item.owner_id}
                existingFiles={item.file_attachments || []}
                onUploadComplete={() => onRefresh?.()}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
}
