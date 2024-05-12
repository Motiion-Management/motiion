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
    <div>
      <div className="flex justify-between text-sm">
        <p>Account Setup</p>
        <p>Step {segment} of 4</p>
      </div>

      <h2 className="my-4 text-xl">{header}</h2>
      <div className="flex justify-center">
        <Progress value={progress} max={100} />
      </div>
    </div>
  )
}
