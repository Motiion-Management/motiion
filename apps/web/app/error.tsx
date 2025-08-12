'use client'

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string }
}) {
  // Minimal client error boundary
  return (
    <html>
      <body>
        <h2>Something went wrong</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{error?.message}</pre>
      </body>
    </html>
  )
}
