'use client'
import { FC, useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useMainRef } from '@/components/main-with-ref'

export interface ScrollCollapseProps {
  children: React.ReactNode
  collapsedTitle: string
}

export const ScrollCollapse: FC<ScrollCollapseProps> = ({
  children,
  collapsedTitle
}) => {
  const mainRef = useMainRef()

  const { scrollYProgress } = useScroll({ container: mainRef })
  const [isCollapsed, setIsCollapsed] = useState(false)
  function collapse() {
    setIsCollapsed(true)
  }
  function expand() {
    setIsCollapsed(false)
  }

  useMotionValueEvent(scrollYProgress, 'change', (y) => {
    if (y > 0.01) {
      collapse()
    }
  })

  return (
    <motion.div
      onClick={expand}
      animate={{
        height: isCollapsed ? 50 : 'auto'
      }}
      transition={{ duration: 0.35 }}
      data-collapsed={isCollapsed ? 'true' : 'false'}
      className={'group sticky top-0 z-20 overflow-clip rounded-xl'}
    >
      {children}
      <motion.button
        animate={{
          opacity: isCollapsed ? 1 : 0,
          display: isCollapsed ? 'flex' : 'none'
        }}
        className="text-primary-foreground text-h5 from-primary/50 to-primary absolute top-0 flex h-full w-full items-center justify-between bg-gradient-to-t px-4"
      >
        {collapsedTitle}
        <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }}>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.button>
    </motion.div>
  )
}
