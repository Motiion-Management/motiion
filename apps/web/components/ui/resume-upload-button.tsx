'use client'
import { useMutation } from 'convex/react'
import { useUploadFiles, UploadFileResponse } from '@xixixao/uploadstuff/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { type VariantProps } from 'class-variance-authority'
import { buttonVariants } from './button'
import { useState } from 'react'
import { Button } from './button'

export type ResumeUploadButtonProps = VariantProps<typeof buttonVariants> & {
  className?: string
}
export function ResumeUploadButton({ className }: ResumeUploadButtonProps) {
  const [loading, setLoading] = useState(false)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const { startUpload } = useUploadFiles(
    generateUploadUrl as unknown as () => Promise<string>
  )
  const saveResume = useMutation(api.resumes.saveResumeUploadIds)
  const saveAfterUpload = async (uploaded: UploadFileResponse[]) => {
    await saveResume({
      resumeUploads: uploaded.map(({ name, response }) => ({
        title: name,
        storageId: (response as { storageId: Id<'_storage'> }).storageId,
        uploadDate: new Date().toISOString()
      }))
    })
  }

  return (
    <Button loading={loading} className={className}>
      Upload
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
  )
}
