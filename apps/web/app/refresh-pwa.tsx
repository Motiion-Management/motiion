'use client'

import PullToRefresh from 'pulltorefreshjs'

export function RefreshPWA() {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(display-mode: standalone)').matches
  ) {
    PullToRefresh.init({
      onRefresh() {
        window.location.reload()
      }
    })
  }
  return null
}
