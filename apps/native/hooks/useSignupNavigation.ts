import { useSignUp } from '@clerk/clerk-expo';
import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { analyzeSignupProgress } from '~/utils/signupNavigation';

/**
 * Hook to get detailed signup progress information
 */
export function useSignupProgress() {
  const { signUp, isLoaded } = useSignUp();
  const pathname = usePathname();
  const previousPathnameRef = useRef<string>('');

  // Only refresh when pathname actually changes
  useEffect(() => {
    if (isLoaded && signUp && pathname !== previousPathnameRef.current) {
      previousPathnameRef.current = pathname;
      signUp.reload();
    }
  }, [isLoaded, signUp, pathname]);

  const stepInfo = analyzeSignupProgress(signUp);

  return {
    ...stepInfo,
    isLoaded,
    progressPercentage: Math.round(
      (stepInfo.completedData.length / stepInfo.requiredData.length) * 100
    ),
  };
}
