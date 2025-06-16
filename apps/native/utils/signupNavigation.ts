import type { SignUpResource } from '@clerk/types';
import { router } from 'expo-router';

export type SignupStep =
  | 'phone'
  | 'verify-phone'
  | 'name'
  | 'email'
  | 'dob'
  | 'username'
  | 'complete';

export interface SignupStepInfo {
  step: SignupStep;
  route: string;
  isComplete: boolean;
  requiredData: string[];
  completedData: string[];
}

export function analyzeSignupProgress(signUp: SignUpResource | null | undefined): SignupStepInfo {
  const defaultInfo: SignupStepInfo = {
    step: 'phone',
    route: '/auth/(create-account)',
    isComplete: false,
    requiredData: [
      'phone',
      'phone-verification',
      'firstName',
      'lastName',
      'email',
      'dateOfBirth',
      'preferredName',
    ],
    completedData: [],
  };

  if (!signUp) {
    return defaultInfo;
  }

  const completedData: string[] = [];

  // Check phone number
  if (signUp.phoneNumber) {
    completedData.push('phone');
  }

  // Check phone verification
  const phoneVerification = signUp.verifications.phoneNumber;
  const isPhoneVerified = phoneVerification.status === 'verified';
  if (isPhoneVerified) {
    completedData.push('phone-verification');
  }

  // Check name
  if (signUp.firstName) completedData.push('firstName');
  if (signUp.lastName) completedData.push('lastName');

  // Check email
  if (signUp.emailAddress) completedData.push('email');

  // Check metadata
  const dateOfBirth = signUp.unsafeMetadata?.dateOfBirth;
  if (dateOfBirth) completedData.push('dateOfBirth');

  const preferredName = signUp.unsafeMetadata?.preferredName;
  if (preferredName) completedData.push('preferredName');

  // Determine current step
  if (signUp.status === 'complete') {
    return {
      step: 'complete',
      route: '/home',
      isComplete: true,
      requiredData: defaultInfo.requiredData,
      completedData,
    };
  }

  if (!signUp.phoneNumber || !phoneVerification.id || phoneVerification.status === 'expired') {
    return {
      step: 'phone',
      route: '/auth/(create-account)',
      isComplete: false,
      requiredData: defaultInfo.requiredData,
      completedData,
    };
  }

  if (!isPhoneVerified) {
    return {
      step: 'verify-phone',
      route: '/auth/(create-account)/verify-phone',
      isComplete: false,
      requiredData: defaultInfo.requiredData,
      completedData,
    };
  }

  if (!signUp.firstName || !signUp.lastName) {
    return {
      step: 'name',
      route: '/auth/(create-account)/name',
      isComplete: false,
      requiredData: defaultInfo.requiredData,
      completedData,
    };
  }

  if (!signUp.emailAddress) {
    return {
      step: 'email',
      route: '/auth/(create-account)/email',
      isComplete: false,
      requiredData: defaultInfo.requiredData,
      completedData,
    };
  }

  if (!dateOfBirth) {
    return {
      step: 'dob',
      route: '/auth/(create-account)/dob',
      isComplete: false,
      requiredData: defaultInfo.requiredData,
      completedData,
    };
  }

  if (!preferredName) {
    return {
      step: 'username',
      route: '/auth/(create-account)/username',
      isComplete: false,
      requiredData: defaultInfo.requiredData,
      completedData,
    };
  }

  // All data present but not complete - go to username to finish
  return {
    step: 'username',
    route: '/auth/(create-account)/username',
    isComplete: false,
    requiredData: defaultInfo.requiredData,
    completedData,
  };
}

export function determineSignupStep(signUp: SignUpResource | null | undefined): string | null {
  const analysis = analyzeSignupProgress(signUp);
  return signUp ? analysis.route : null;
}

export function navigateToSignupStep(
  signUp: SignUpResource | null | undefined,
  currentPath?: string
): boolean {
  const step = determineSignupStep(signUp);

  // Don't navigate if we're already on the target route
  if (!step || step === currentPath) {
    return false;
  }

  router.replace(step as any);
  return true;
}

/**
 * Get a user-friendly description of signup progress
 */
export function getSignupProgressText(signUp: SignUpResource | null | undefined): string {
  const analysis = analyzeSignupProgress(signUp);
  const progress = Math.round((analysis.completedData.length / analysis.requiredData.length) * 100);

  if (analysis.isComplete) {
    return 'Account setup complete';
  }

  const stepNames: Record<SignupStep, string> = {
    phone: 'Enter phone number',
    'verify-phone': 'Verify phone number',
    name: 'Enter your name',
    email: 'Enter email address',
    dob: 'Enter date of birth',
    username: 'Choose username',
    complete: 'Complete',
  };

  return `${stepNames[analysis.step]} (${progress}% complete)`;
}
