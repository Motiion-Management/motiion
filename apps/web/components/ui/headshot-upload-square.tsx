'use client'

import { useUploadFiles, UploadFileResponse } from '@xixixao/uploadstuff/react'
import { useMutation } from 'convex/react'
import { Plus } from 'lucide-react'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'

import { Button } from './button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export interface HeadshotUploadSquareProps {
  className?: string
}

export function HeadshotUploadSquare({ className }: HeadshotUploadSquareProps) {
  const [loading, setLoading] = useState(false)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const { startUpload } = useUploadFiles(
    generateUploadUrl as unknown as () => Promise<string>
  )
  const saveHeadshots = useMutation(api.resumes.saveHeadshotIds)
  const saveAfterUpload = async (uploaded: UploadFileResponse[]) => {
    await saveHeadshots({
      headshots: uploaded.map(({ name, response }) => ({
        title: name,
        storageId: (response as { storageId: Id<'_storage'> }).storageId,
        uploadDate: new Date().toISOString()
      }))
    })
  }
  return (
    <div className={cn('h-[148px] w-[100px]', className)}>
      <Button variant="image-upload" size="container" loading={loading}>
        <Plus
          size={25}
          className="color-inherit stroke-current"
          strokeWidth={3}
        />
        <input
          type="file"
          className="absolute h-full w-full cursor-pointer opacity-0"
          multiple
          onChange={async (event) => {
            if (event.target.files) {
              const files = Array.from(event.target.files)
              if (files.length === 0) {
                return
              }
              setLoading(true)
              const uploaded = await startUpload(files)
              await saveAfterUpload(uploaded)
              setLoading(false)
            }
          }}
        />
      </Button>
    </div>
  )
}
