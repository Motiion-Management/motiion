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
      {children}
      <div className="flex basis-full">
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
