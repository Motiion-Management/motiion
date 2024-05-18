'use client'

import { Progress } from '@/components/ui/progress'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ProgressHeader() {
  const segment = useSelectedLayoutSegment()

  const [progress, setProgress] = useState(0)

  const headerOptions = {
    1: 'Welcome',
    2: 'Personal Information',
    3: 'Upload Headshots',
    4: 'Upload Resume'
  } as const

  const step = (parseInt(`${segment}`) || 1) as keyof typeof headerOptions

  const header = headerOptions[step]

  useEffect(() => {
    const timer = setTimeout(() => setProgress(step * 25), 100)
    return () => clearTimeout(timer)
  }, [step])

  return (
    <div className="grid grid-cols-2 justify-between gap-2">
      <h1 className="text-h3 col-span-2">{header}</h1>
      <p className="text-label-xs">Account Setup</p>
      <p className="text-label-xs text-right">Step {segment} of 4</p>

      <Progress className="col-span-2 mt-2 h-2" value={progress} max={100} />
    </div>
  )
}
