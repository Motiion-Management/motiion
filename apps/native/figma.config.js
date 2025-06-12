/**
 * Figma Code Connect Configuration
 * 
 * This configuration prepares the project for Figma Code Connect integration.
 * Note: Code Connect requires Figma Organization or Enterprise plan.
 * 
 * When enabled, this will map Figma design components to React Native components.
 */

export default {
  // Base configuration for the project
  include: [
    'components/ui/**/*.tsx',
    'components/nativewindui/**/*.tsx'
  ],
  
  // Exclude certain files from Code Connect scanning
  exclude: [
    'components/**/*.stories.tsx',
    'components/**/*.test.tsx',
    '**/*.d.ts'
  ],
  
  // Component mapping configuration
  components: {
    // Button component mapping
    'Button': {
      figmaNodeId: null, // Will be set when connected to Figma
      componentPath: 'components/nativewindui/Button.tsx',
      variants: {
        primary: 'variant="primary"',
        secondary: 'variant="secondary"', 
        outline: 'variant="outline"',
        accent: 'variant="accent"',
        destructive: 'variant="destructive"'
      },
      sizes: {
        small: 'size="sm"',
        medium: 'size="md"', 
        large: 'size="lg"'
      }
    }
  },
  
  // Design token mapping
  tokens: {
    colors: {
      // Map Figma semantic tokens to CSS variables
      'background/default': '--background-default',
      'surface/default': '--surface-default',
      'text/default': '--text-default',
      'button-surface/default': '--button-surface-default',
      'primary/500': '--primary-500'
    }
  }
}