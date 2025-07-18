// Tailwind CSS Configuration
export * from './tailwind-config'

// Next.js Configuration Patterns
export * from './next-config-patterns'

// Re-export key utilities
export {
  customFontSizes,
  motiionTailwindConfig as defaultTailwindConfig
} from './tailwind-config'

export {
  motiionNextConfigPatterns as nextConfigPatterns
} from './next-config-patterns'