'use client'

import { useMemo, useState } from 'react'
import {
  ConvexProvider,
  ConvexReactClient,
  useAction,
  useMutation
} from 'convex/react'
// Import runtime-only JS to avoid TS pulling full backend sources
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { api } from '@packages/backend/convex/_generated/api.js'

function ResumeParserTester() {
  const [uploading, setUploading] = useState(false)
  const [storageId, setStorageId] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateUploadUrl = useMutation(api.dev.resumeTest.generateUploadUrlDev)
  const parseResume = useAction(api.dev.resumeTest.parseResumeImageDev)

  const onUpload = async (files: File[]) => {
    setError(null)
    setResult(null)
    setStorageId(null)
    setUploading(true)
    try {
      const file = files[0]
      const uploadUrl = await generateUploadUrl()
      const resp = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      })
      if (!resp.ok) throw new Error('Upload failed')
      const { storageId } = (await resp.json()) as { storageId: string }
      setStorageId(storageId)
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onParse = async () => {
    if (!storageId) return
    setError(null)
    setResult(null)
    try {
      const parsed = await parseResume({ imageStorageId: storageId })
      setResult(parsed)
    } catch (e: any) {
      setError(e?.message || 'Parsing failed')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Dev: Resume Parser Tester</h1>
      <p className="text-sm text-gray-600">
        This page uploads a resume image to Convex storage and runs the AI
        parser. It does not modify any user data.
      </p>
      <div className="space-y-3 rounded border p-4">
        <label className="block text-sm font-medium">
          Select resume image (PNG/JPG/PDF)
        </label>
        <input
          type="file"
          accept="image/*,application/pdf"
          disabled={uploading}
          onChange={async (e) => {
            const files = e.target.files ? Array.from(e.target.files) : []
            if (files.length > 0) await onUpload(files)
          }}
        />
        {storageId && (
          <p className="text-xs text-green-700">
            Uploaded. storageId: {storageId}
          </p>
        )}
        <div className="flex gap-2">
          <button
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            disabled={!storageId || uploading}
            onClick={onParse}
          >
            {uploading ? 'Uploading…' : 'Parse Resume'}
          </button>
          <button
            className="rounded border px-4 py-2"
            onClick={() => {
              setError(null)
              setResult(null)
              setStorageId(null)
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Parsed JSON</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  if (process.env.NODE_ENV === 'production') return null

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <p className="text-red-700">
          NEXT_PUBLIC_CONVEX_URL is not set. Add it to apps/web/.env.local.
        </p>
      </div>
    )
  }

  const client = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl])

  return (
    <ConvexProvider client={client}>
      <ResumeParserTester />
    </ConvexProvider>
  )
}
