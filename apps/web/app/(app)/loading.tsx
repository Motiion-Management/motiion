import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="grid h-screen place-items-center">
      <Loader2 size="64" className="animate-spin" />
    </div>
  )
}
