import { motion } from 'framer-motion'

export function AnimatedCheckmark() {
  return (
    <motion.svg
      className="h-14 w-14"
      viewBox="0 0 52 52"
      initial="hidden"
      animate="visible"
    >
      {/* Circle */}
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-secondary"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.5, ease: 'easeOut' },
          },
        }}
      />

      {/* Filled circle background */}
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        className="text-secondary"
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: { delay: 0.4, duration: 0.3, ease: 'easeOut' },
          },
        }}
        fill="currentColor"
      />

      {/* Checkmark */}
      <motion.path
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: { delay: 0.6, duration: 0.4, ease: 'easeOut' },
          },
        }}
      />
    </motion.svg>
  )
}
