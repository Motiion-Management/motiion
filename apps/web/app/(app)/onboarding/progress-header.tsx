'use client'

import { Progress } from '@/components/ui/progress'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ProgressHeader() {
  const segment = useSelectedLayoutSegment()

  const [progress, setProgress] = useState(0)
  const [ header, setHeader ] = useState('')
  useEffect(() => {
    const step = parseInt(`${segment}`)
    if (step === 2) {
      setHeader('Personal Information')
    } else if (step === 3) {
      setHeader('Upload Headshots')
    } else if (step === 4) {
      setHeader('Upload Resume')
    }
    const timer = setTimeout(() => setProgress(step * 33), 100)
    return () => clearTimeout(timer)
  }, [segment])
  return (
    <div>
      <div className="flex justify-between text-sm">
        <p>Account Setup</p>
        <p>Step {segment} of 3</p>
      </div>

      <h2 className="my-4 text-xl">{header}</h2>
      <div className="flex justify-center">
        <Progress value={progress} max={100} />
      </div>
    </div>
  )
}
