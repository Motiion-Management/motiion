import React from 'react';
import { View } from 'react-native';
import { Button } from '../ui/button';
import { Text } from '../ui/text';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface OnboardingV3ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ComponentType;
}

export class OnboardingV3ErrorBoundary extends React.Component<
  OnboardingV3ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: OnboardingV3ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    console.error('[OnboardingV3ErrorBoundary] Caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('[OnboardingV3ErrorBoundary] Error details:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      // If error contains "displayName", it's likely a React component reference error
      // Fall back to V1 component instead of showing error UI
      const isComponentError = this.state.error?.message?.includes('displayName');

      if (isComponentError) {
        console.log(
          '[OnboardingV3ErrorBoundary] Component reference error detected, falling back to V1'
        );
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent />;
      }

      // For other errors, show error UI
      return (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="mb-2 text-lg font-semibold text-red-600">Onboarding Error</Text>
          <Text className="mb-4 text-center text-base text-gray-600">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button onPress={() => this.setState({ hasError: false, error: null })}>
            <Text>Try Again</Text>
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}
