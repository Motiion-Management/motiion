'use client'

import PullToRefresh from 'pulltorefreshjs'

export function RefreshPWA() {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(display-mode: standalone)').matches
  ) {
    let shouldRefresh = true
    document.body.addEventListener('touchstart', (ev) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let el = ev.target as any
      while (el?.parentNode && el !== document.body) {
        if (el.scrollTop > 0) {
          shouldRefresh = false
        }

        // Check if element has role=dialog
        if (el.getAttribute('role') === 'dialog') {
          shouldRefresh = false
          break
        }
        el = el.parentNode as HTMLElement
      }
    })

    document.body.addEventListener('touchend', () => {
      shouldRefresh = true
    })

    PullToRefresh.init({
      distThreshold: 120,
      shouldPullToRefresh: () => !window.scrollY && shouldRefresh
    })
  }
  return null
}
