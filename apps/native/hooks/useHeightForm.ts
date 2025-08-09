import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useState, useCallback, useEffect } from 'react';

import { HeightValue } from '~/components/form/HeightPicker';

export function useHeightForm() {
  const user = useQuery(api.users.getMyUser);
  const patchUserAttributes = useMutation(api.users.patchUserAttributes);

  const [height, setHeight] = useState<HeightValue>({ feet: 5, inches: 6 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing height from user profile
  useEffect(() => {
    if (user?.attributes?.height) {
      setHeight(user.attributes.height);
    }
  }, [user?.attributes?.height]);

  const handleHeightChange = useCallback((newHeight: HeightValue) => {
    setHeight(newHeight);
    setError(null);
  }, []);

  const validateHeight = useCallback((heightValue: HeightValue): boolean => {
    // Basic validation - ensure reasonable height range
    if (heightValue.feet < 3 || heightValue.feet > 7) {
      setError('Height must be between 3 and 7 feet');
      return false;
    }

    if (heightValue.inches < 0 || heightValue.inches > 11) {
      setError('Inches must be between 0 and 11');
      return false;
    }

    // Check minimum height (3'0")
    const totalInches = heightValue.feet * 12 + heightValue.inches;
    if (totalInches < 36) {
      setError('Height must be at least 3 feet');
      return false;
    }

    // Check maximum height (7'11")
    if (totalInches > 95) {
      setError('Height cannot exceed 7 feet 11 inches');
      return false;
    }

    return true;
  }, []);

  const submitHeight = useCallback(async () => {
    if (!validateHeight(height)) {
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await patchUserAttributes({
        attributes: { height },
      });

      return true;
    } catch (err) {
      console.error('Error updating height:', err);
      setError('Failed to save height. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [height, validateHeight, patchUserAttributes]);

  const formatHeight = useCallback((heightValue: HeightValue): string => {
    return `${heightValue.feet}'${heightValue.inches}"`;
  }, []);

  const isValid = validateHeight(height) && !isSubmitting;

  return {
    models: {
      height,
      isSubmitting,
      error,
      isValid,
      formattedHeight: formatHeight(height),
    },
    actions: {
      setHeight: handleHeightChange,
      submitHeight,
      clearError: () => setError(null),
    },
  };
}
