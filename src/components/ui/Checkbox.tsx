'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'

interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'children'> {
  variant?: 'default' | 'accent'
  size?: 'default' | 'sm' | 'lg'
}

const sizeConfig = {
  sm: { box: 'h-4 w-4', icon: 14, stroke: 2 },
  default: { box: 'h-5 w-5', icon: 18, stroke: 2.5 },
  lg: { box: 'h-6 w-6', icon: 22, stroke: 3 },
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const config = sizeConfig[size]

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'peer shrink-0 rounded border-2 border-secondary ring-offset-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-secondary data-[state=checked]:border-secondary',
        variant === 'accent' && 'data-[state=checked]:bg-dark data-[state=checked]:border-dark',
        config.box,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
        <AnimatePresence mode="wait">
          <motion.svg
            key="check"
            xmlns="http://www.w3.org/2000/svg"
            width={config.icon}
            height={config.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <motion.path
              d="M5 12l5 5L20 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              exit={{ pathLength: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            />
          </motion.svg>
        </AnimatePresence>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})

Checkbox.displayName = 'Checkbox'
