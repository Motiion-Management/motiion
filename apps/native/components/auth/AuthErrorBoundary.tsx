import React from 'react';
import { View, ActivityIndicator } from 'react-native';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { Text } from '~/components/ui/text';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  isAuthError: boolean;
}

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, isAuthError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    // Only catch actual authentication errors, not render loops
    const isAuthError =
      error.message.includes('must be logged in') ||
      error.message.includes('user not found') ||
      error.message.includes('User not found in database') ||
      error.message.includes('Authentication') ||
      error.message.includes('Unauthorized');

    return {
      hasError: true,
      error,
      isAuthError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Show fallback or generic error UI (no redirects)
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <BackgroundGradientView>
          <View className="flex-1 items-center justify-center px-6">
            <Text variant="heading" className="mb-4 text-center">
              Something went wrong
            </Text>
            <Text variant="body" className="text-text-muted mb-6 text-center">
              We're having trouble loading this page. Please try again.
            </Text>
            <ActivityIndicator size="large" />
          </View>
        </BackgroundGradientView>
      );
    }

    return this.props.children;
  }
}
