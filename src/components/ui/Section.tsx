import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'

interface SectionProps {
  id?: string
  title?: string
  children: ReactNode
  isVisible?: boolean
  className?: string
}

export function Section({ id, title, children, isVisible = true, className }: SectionProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          id={id}
          className={cn('w-full', className)}
          initial={{ height: 0, opacity: 0, marginBottom: 0 }}
          animate={{ height: 'auto', opacity: 1, marginBottom: 56 }}
          exit={{ height: 0, opacity: 0, marginBottom: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <div className="flex flex-col">
            {title && (
              <>
                <h2 className="text-2xl">{title}</h2>
                <hr className="my-3 border-t-2 border-secondary opacity-25" />
              </>
            )}
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
