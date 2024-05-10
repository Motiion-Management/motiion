'use client'
import { useMutation } from 'convex/react'
import { UploadButton, UploadFileResponse } from '@xixixao/uploadstuff/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { type VariantProps } from 'class-variance-authority'
import { buttonVariants } from './button'

export type CustomUploadButtonProps = VariantProps<typeof buttonVariants> & {
  className?: string
}
export function HeadshotsUploadButton({
  variant,
  size,
  className
}: CustomUploadButtonProps) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const saveHeadshots = useMutation(api.resumes.saveHeadshotIds)
  const saveAfterUpload = async (uploaded: UploadFileResponse[]) => {
    await saveHeadshots({
      headshots: uploaded.map(({ response }) => ({
        storageId: (response as { storageId: Id<'_storage'> }).storageId,
        uploadDate: new Date().toISOString()
      }))
    })
  }

  return (
    <UploadButton
      className={() =>
        buttonVariants({
          variant,
          size,
          className
        })
      }
      content={() => 'Upload Headshots'}
      uploadUrl={generateUploadUrl as unknown as () => Promise<string>}
      fileTypes={['.pdf', 'image/*']}
      multiple
      onUploadComplete={saveAfterUpload}
      onUploadError={(error: unknown) => {
        alert(`ERROR! ${error}`)
      }}
    />
  )
}
