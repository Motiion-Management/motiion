'use client'
import { FC, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export interface ScrollCollapseProps {
  children: React.ReactNode
  collapsedTitle: string
}

export const ScrollCollapse: FC<ScrollCollapseProps> = ({
  children,
  collapsedTitle
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  function collapse() {
    setIsCollapsed(true)
  }
  function expand() {
    setIsCollapsed(false)
  }
  return (
    <motion.div
      drag="y"
      dragSnapToOrigin
      onDrag={(event, info) => {
        console.log('drag offset', info.offset.y)

        if (info.offset.y < 0) {
          collapse()
        }
      }}
      onClick={expand}
      animate={{
        height: isCollapsed ? 50 : 'auto'
      }}
      data-open={isCollapsed}
      className={'group relative overflow-hidden rounded-xl'}
    >
      {children}
      <motion.div
        animate={{
          opacity: isCollapsed ? 1 : 0,
          display: isCollapsed ? 'flex' : 'none'
        }}
        className="text-primary-foreground text-h5 bg-primary/20 absolute top-0 flex h-full w-full items-center justify-between px-4"
      >
        {collapsedTitle}
        <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }}>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
