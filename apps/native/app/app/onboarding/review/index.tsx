import { router } from 'expo-router';
import { useEffect } from 'react';

export default function ReviewIndexScreen() {
  useEffect(() => {
    // Redirect to general review
    router.replace('/app/onboarding/review/general');
  }, []);

  return null;
}
