'use client'

import { type ComponentProps, useState } from 'react'
import { Alert } from './alert'
import { Button } from './button'

export type DismissableAlertProps = ComponentProps<typeof Alert> & {
  onDismiss?: () => void
}
export function DismissableAlert({
  children,
  onDismiss,
  ...props
}: DismissableAlertProps) {
  const [shown, setShown] = useState(true)
  function dismiss() {
    setShown(false)
  }
  if (!shown) return null
  return (
    <Alert {...props}>
      <div className="flex flex-col items-start gap-4">
        {children}
        <Button
          variant="link"
          size="min"
          className=""
          onClick={onDismiss ?? dismiss}
        >
          Dismiss
        </Button>
      </div>
    </Alert>
  )
}
