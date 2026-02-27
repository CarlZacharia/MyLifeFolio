"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, Download } from "lucide-react"
import type { FileAttachment } from "@/lib/types/app"
import { toast } from "sonner"

interface FileUploadProps {
  itemId: string
  ownerId: string
  existingFiles?: FileAttachment[]
  onUploadComplete: () => void
}

export function FileUpload({
  itemId,
  ownerId,
  existingFiles = [],
  onUploadComplete,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be under 50MB")
      return
    }

    setUploading(true)
    setProgress(30)

    const filePath = `${ownerId}/${itemId}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(filePath, file)

    if (uploadError) {
      toast.error("Failed to upload file")
      setUploading(false)
      setProgress(0)
      return
    }

    setProgress(70)

    const { error: dbError } = await supabase.from("file_attachments").insert({
      owner_id: ownerId,
      item_id: itemId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: filePath,
    })

    if (dbError) {
      toast.error("Failed to save file record")
      setUploading(false)
      setProgress(0)
      return
    }

    setProgress(100)
    toast.success("File uploaded")
    onUploadComplete()
    setUploading(false)
    setProgress(0)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (attachment: FileAttachment) => {
    await supabase.storage
      .from("attachments")
      .remove([attachment.storage_path])

    const { error } = await supabase
      .from("file_attachments")
      .delete()
      .eq("id", attachment.id)

    if (error) {
      toast.error("Failed to delete file")
    } else {
      toast.success("File deleted")
      onUploadComplete()
    }
  }

  const handleDownload = async (attachment: FileAttachment) => {
    const { data } = await supabase.storage
      .from("attachments")
      .createSignedUrl(attachment.storage_path, 60)

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank")
    }
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div className="flex items-center gap-2">
                <File className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{file.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.file_size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(file)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleUpload}
          className="hidden"
          id="file-upload"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="mr-2 size-4" />
          {uploading ? "Uploading..." : "Attach File"}
        </Button>
        {uploading && <Progress value={progress} className="mt-2 h-1.5" />}
      </div>
    </div>
  )
}
