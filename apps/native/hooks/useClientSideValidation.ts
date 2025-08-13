import { useMemo } from 'react';
import { OnboardingStep } from '~/contexts/OnboardingFlowContext';

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

/**
 * Hook for client-side validation of onboarding steps
 * Validates required fields without backend round trips
 */
export function useClientSideValidation() {
  const validateStep = useMemo(() => {
    return (step: OnboardingStep | undefined, userData: any): ValidationResult => {
      if (!step || !userData) {
        return { isValid: false, missingFields: [] };
      }

      const missingFields: string[] = [];

      // Check each required field
      for (const requiredField of step.required) {
        const value = getFieldValue(userData, requiredField);

        if (value === undefined || value === null || value === '') {
          missingFields.push(requiredField);
        }

        // Special handling for arrays (like skills, experiences)
        if (Array.isArray(value) && value.length === 0) {
          missingFields.push(requiredField);
        }

        // Check minItems constraint if specified
        if (step.minItems && Array.isArray(value) && value.length < step.minItems) {
          missingFields.push(requiredField);
        }
      }

      return {
        isValid: missingFields.length === 0,
        missingFields,
      };
    };
  }, []);

  return { validateStep };
}

/**
 * Helper to get nested field values from user data
 * Supports paths like 'attributes.hairColor' or 'sizing.general.waist'
 */
function getFieldValue(userData: any, fieldPath: string): any {
  const parts = fieldPath.split('.');
  let value = userData;

  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = value[part];
    } else {
      return undefined;
    }
  }

  return value;
}
