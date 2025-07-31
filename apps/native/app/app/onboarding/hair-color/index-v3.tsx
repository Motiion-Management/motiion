import React from 'react';
import { GenericOnboardingScreenV3 } from '~/components/onboarding/GenericOnboardingScreenV3';

/**
 * Hair Color Screen - V3 Architecture
 *
 * This is now incredibly simple! The generic component handles:
 * - Loading the step configuration from the flow
 * - Rendering the appropriate form field (radio group for hair color)
 * - Auto-saving the selection after a delay
 * - Automatically navigating to the next step
 *
 * No need for:
 * - Manual form setup
 * - Navigation logic
 * - Validation (handled by the flow definition)
 * - Submit handlers
 */
export default function HairColorScreenV3() {
  // That's it! The generic screen handles everything based on the flow configuration
  return <GenericOnboardingScreenV3 />;
}

/**
 * Alternative: If you need custom behavior for this specific screen
 */
export function HairColorScreenV3Custom() {
  return (
    <GenericOnboardingScreenV3
      stepOverrides={{
        'hair-color': () => {
          // Custom implementation if needed
          // But for hair color, the generic implementation should work perfectly
          return <GenericOnboardingScreenV3 />;
        },
      }}
    />
  );
}
