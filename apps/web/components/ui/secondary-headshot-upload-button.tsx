'use client'

import { useUploadFiles, UploadFileResponse } from '@xixixao/uploadstuff/react'
import { useMutation } from 'convex/react'
import { Plus } from 'lucide-react'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'

export function SecondaryHeadshotUploadButton() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const { startUpload } = useUploadFiles(
    generateUploadUrl as unknown as () => Promise<string>
  )
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
    <button className="bg-input-background border-accent relative grid h-[148px] w-[100px] place-items-center rounded-lg border">
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
            const uploaded = await startUpload(files)
            await saveAfterUpload(uploaded)
          }
        }}
      />
      <Plus className="stroke-white" />
    </button>
  )
}
