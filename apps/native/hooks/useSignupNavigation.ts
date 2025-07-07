import { useSignUp } from '@clerk/clerk-expo';
import { router, usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import {
  analyzeSignupProgress,
  determineSignupStep,
  type SignupStepInfo,
} from '~/utils/signupNavigation';

/**
 * Hook to automatically handle signup navigation based on current signup state
 */
export function useSignupNavigation(options?: {
  autoNavigate?: boolean;
  onStepChange?: (stepInfo: SignupStepInfo) => void;
  currentRoute?: string;
}) {
  const { autoNavigate = false, onStepChange, currentRoute } = options || {};
  const { signUp, isLoaded } = useSignUp();
  const [hasNavigated, setHasNavigated] = useState(false);
  const lastSignUpRef = useRef(signUp);

  const stepInfo = analyzeSignupProgress(signUp);

  useEffect(() => {
    if (!isLoaded || !signUp) return;

    // Only trigger callbacks if the signUp object actually changed
    const signUpChanged = lastSignUpRef.current !== signUp;
    lastSignUpRef.current = signUp;

    if (signUpChanged) {
      onStepChange?.(stepInfo);
    }

    if (autoNavigate && !hasNavigated && signUpChanged) {
      const targetRoute = determineSignupStep(signUp);

      // Only navigate if we have a target route and it's different from current route
      if (targetRoute && targetRoute !== currentRoute) {
        setHasNavigated(true);
        router.replace(targetRoute as any);
      }
    }
  }, [signUp, isLoaded, autoNavigate, onStepChange, currentRoute, hasNavigated, stepInfo]);

  return {
    stepInfo,
    signUp,
    isLoaded,
    navigateToCurrentStep: () => {
      const targetRoute = determineSignupStep(signUp);
      if (targetRoute) {
        router.replace(targetRoute as any);
      }
    },
    resetNavigation: () => setHasNavigated(false),
  };
}

/**
 * Hook to get detailed signup progress information
 */
export function useSignupProgress() {
  const { signUp, isLoaded } = useSignUp();
  const pathname = usePathname();
  const previousPathnameRef = useRef<string>();
  
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
