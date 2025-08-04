import type { SignInResource } from '@clerk/types';
import { router } from 'expo-router';

export type SigninStep = 'phone' | 'verify-phone' | 'complete';

export interface SigninStepInfo {
  step: SigninStep;
  route: string;
  isComplete: boolean;
  requiredData: string[];
  completedData: string[];
}

export function analyzeSigninProgress(signIn: SignInResource | null | undefined): SigninStepInfo {
  const defaultInfo: SigninStepInfo = {
    step: 'phone',
    route: '/auth/(login)',
    isComplete: false,
    requiredData: ['phone', 'phone-verification'],
    completedData: [],
  };

  if (!signIn) {
    return defaultInfo;
  }

  const completedData: string[] = [];

  // Check if phone number is set as identifier
  if (signIn.identifier) {
    completedData.push('phone');
  }

  // Check if phone verification is complete
  const phoneVerification = signIn.firstFactorVerification;
  const isPhoneVerified = phoneVerification?.status === 'verified';
  if (isPhoneVerified) {
    completedData.push('phone-verification');
  }

  // Determine current step based on signin status
  if (signIn.status === 'complete') {
    return {
      step: 'complete',
      route: '/home',
      isComplete: true,
      requiredData: defaultInfo.requiredData,
      completedData,
    };
  }

  // If no identifier or signin attempt is not ready for verification
  if (!signIn.identifier || !signIn.supportedFirstFactors?.length) {
    return {
      step: 'phone',
      route: '/auth/(login)',
      isComplete: false,
      requiredData: defaultInfo.requiredData,
      completedData,
    };
  }

  // If phone verification is needed
  if (
    !isPhoneVerified &&
    signIn.supportedFirstFactors?.some((factor) => factor.strategy === 'phone_code')
  ) {
    return {
      step: 'verify-phone',
      route: '/auth/(login)/verify-phone',
      isComplete: false,
      requiredData: defaultInfo.requiredData,
      completedData,
    };
  }

  // Default to phone entry if we can't determine the state
  return {
    step: 'phone',
    route: '/auth/(login)',
    isComplete: false,
    requiredData: defaultInfo.requiredData,
    completedData,
  };
}

export function determineSigninStep(signIn: SignInResource | null | undefined): string | null {
  const analysis = analyzeSigninProgress(signIn);
  return signIn ? analysis.route : null;
}

export function navigateToSigninStep(
  signIn: SignInResource | null | undefined,
  currentPath?: string
): boolean {
  const step = determineSigninStep(signIn);

  // Don't navigate if we're already on the target route
  if (!step || step === currentPath) {
    return false;
  }

  router.replace(step as any);
  return true;
}

/**
 * Get a user-friendly description of signin progress
 */
export function getSigninProgressText(signIn: SignInResource | null | undefined): string {
  const analysis = analyzeSigninProgress(signIn);
  const progress = Math.round((analysis.completedData.length / analysis.requiredData.length) * 100);

  if (analysis.isComplete) {
    return 'Sign-in complete';
  }

  const stepNames: Record = {
    phone: 'Enter phone number',
    'verify-phone': 'Verify phone number',
    complete: 'Complete',
  };

  return `${stepNames[analysis.step]} (${progress}% complete)`;
}
