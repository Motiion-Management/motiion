'use client'

import { useUploadFiles } from '@xixixao/uploadstuff/react'
import { useMutation, useQuery } from 'convex/react'
import { Plus } from 'lucide-react'
import { api } from '@packages/backend/convex/_generated/api'

export function SecondaryHeadshotUploadButton() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const { startUpload } = useUploadFiles(
    generateUploadUrl as unknown as () => Promise<string>
  )

  return (
    <button className="bg-input-background border-accent grid h-[148px] w-[100px] place-items-center rounded-lg border">
      <input
        type="file"
        className="absolute h-full w-full cursor-pointer opacity-0"
        onChange={async (event) => {
          if (event.target.files) {
            const files = Array.from(event.target.files)
            if (files.length === 0) {
              return
            }
            const uploaded = await startUpload(files)
            console.log(uploaded)
          }
        }}
      />
      <Plus className="stroke-white" />
    </button>
  )
}
