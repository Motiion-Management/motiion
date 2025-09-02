import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { View, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { BackgroundGradientView } from '~/components/ui/background-gradient-view';
import { OnboardingFormRef } from '~/components/forms/onboarding/types';
import { GestureTutorial } from './GestureTutorial';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingGroupPagerProps {
  forms: Array<{
    key: string;
    component: React.ComponentType<any>;
    props?: any;
  }>;
  onFormComplete: (formIndex: number, data?: any) => void | Promise<void>;
  onPageChange?: (page: number) => void;
  onValidationChange?: (formIndex: number, isValid: boolean) => void;
  initialPage?: number;
  enableGestureNavigation?: boolean;
  showGestureTutorial?: boolean;
  className?: string;
}

export interface OnboardingGroupPagerRef {
  goToPage: (page: number, animated?: boolean) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  getCurrentPage: () => number;
  isFirstPage: () => boolean;
  isLastPage: () => boolean;
}

export const OnboardingGroupPager = forwardRef<OnboardingGroupPagerRef, OnboardingGroupPagerProps>(
  (
    {
      forms,
      onFormComplete,
      onPageChange,
      onValidationChange,
      initialPage = 0,
      enableGestureNavigation = true,
      showGestureTutorial = false,
      className,
    },
    ref
  ) => {
    const pagerRef = useRef<PagerView>(null);
    const formRefs = useRef<Array<OnboardingFormRef | null>>([]);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [formValidStates, setFormValidStates] = useState<boolean[]>(
      new Array(forms.length).fill(false)
    );
    const [showTutorial, setShowTutorial] = useState(showGestureTutorial);

    // Animated values for gesture handling
    const translateX = useSharedValue(0);
    const gestureActive = useSharedValue(false);
    const validationFeedback = useSharedValue(0);

    // Update form refs array when forms change
    useEffect(() => {
      formRefs.current = new Array(forms.length).fill(null);
    }, [forms.length]);

    // Handle page changes
    const handlePageSelected = useCallback(
      (pageIndex: number) => {
        setCurrentPage(pageIndex);
        onPageChange?.(pageIndex);
      },
      [onPageChange]
    );

    // Navigation methods
    const goToPage = useCallback(
      (page: number, animated = true) => {
        if (page >= 0 && page < forms.length) {
          pagerRef.current?.setPage(page);
          handlePageSelected(page);
        }
      },
      [forms.length, handlePageSelected]
    );

    const goToNextPage = useCallback(() => {
      if (currentPage < forms.length - 1) {
        goToPage(currentPage + 1);
      }
    }, [currentPage, forms.length, goToPage]);

    const goToPreviousPage = useCallback(() => {
      if (currentPage > 0) {
        goToPage(currentPage - 1);
      }
    }, [currentPage, goToPage]);

    const getCurrentPage = useCallback(() => currentPage, [currentPage]);
    const isFirstPage = useCallback(() => currentPage === 0, [currentPage]);
    const isLastPage = useCallback(
      () => currentPage === forms.length - 1,
      [currentPage, forms.length]
    );

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      goToPage,
      goToNextPage,
      goToPreviousPage,
      getCurrentPage,
      isFirstPage,
      isLastPage,
    }));

    // Handle form completion
    const handleFormComplete = useCallback(
      async (formIndex: number, data?: any) => {
        try {
          await onFormComplete(formIndex, data);

          // Auto-advance to next page if not last
          if (formIndex < forms.length - 1) {
            setTimeout(() => {
              goToNextPage();
            }, 200); // Small delay for better UX
          }
        } catch (error) {
          console.error('Error completing form:', error);
        }
      },
      [onFormComplete, forms.length, goToNextPage]
    );

    // Update form validation state
    const updateFormValidation = useCallback(
      (formIndex: number, isValid: boolean) => {
        setFormValidStates((prev) => {
          const newStates = [...prev];
          newStates[formIndex] = isValid;
          return newStates;
        });
        onValidationChange?.(formIndex, isValid);
      },
      [onValidationChange]
    );

    // Hide tutorial after first interaction
    useEffect(() => {
      if (showTutorial && currentPage > initialPage) {
        setShowTutorial(false);
      }
    }, [currentPage, initialPage, showTutorial]);

    // Gesture handling for enhanced navigation
    const panGesture = Gesture.Pan()
      .enabled(enableGestureNavigation)
      .onBegin(() => {
        gestureActive.value = true;
      })
      .onUpdate((event) => {
        const progress = -event.translationX / screenWidth;
        const clampedProgress = Math.max(0, Math.min(1, progress));
        translateX.value = clampedProgress;
      })
      .onEnd((event) => {
        const progress = -event.translationX / screenWidth;
        const velocity = -event.velocityX / screenWidth;

        runOnJS(() => {
          // Determine if we should advance/go back based on gesture
          if (progress > 0.3 || velocity > 0.5) {
            // Swipe left - advance if current form is valid
            if (formValidStates[currentPage] && !isLastPage()) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              goToNextPage();
              setShowTutorial(false);
            } else if (!formValidStates[currentPage]) {
              // Validation feedback
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              validationFeedback.value = withSequence(
                withTiming(1, { duration: 150 }),
                withTiming(0, { duration: 150 })
              );
            }
          } else if (progress < -0.3 || velocity < -0.5) {
            // Swipe right - go back
            if (!isFirstPage()) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              goToPreviousPage();
              setShowTutorial(false);
            }
          }
        })();

        // Reset gesture state
        translateX.value = withSpring(0);
        gestureActive.value = false;
      });

    // Animated style for gesture feedback
    const animatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(translateX.value, [0, 0.3], [1, 0.8], 'clamp');

      const shake = interpolate(validationFeedback.value, [0, 1], [0, 10], 'clamp');

      return {
        opacity: gestureActive.value ? opacity : 1,
        transform: [{ translateX: shake * Math.sin(validationFeedback.value * Math.PI * 6) }],
      };
    });

    return (
      <BackgroundGradientView>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <PagerView
              ref={pagerRef}
              style={{ flex: 1 }}
              initialPage={initialPage}
              onPageSelected={(e) => handlePageSelected(e.nativeEvent.position)}
              scrollEnabled={false} // Disable native scrolling, use gesture handler
            >
              {forms.map((form, index) => {
                const FormComponent = form.component;
                return (
                  <View key={form.key} style={{ flex: 1 }}>
                    <FormComponent
                      ref={(ref: OnboardingFormRef) => {
                        formRefs.current[index] = ref;
                      }}
                      mode="fullscreen"
                      autoFocus={index === currentPage}
                      enableGestureHints={enableGestureNavigation}
                      onValidationChange={(isValid: boolean) =>
                        updateFormValidation(index, isValid)
                      }
                      onComplete={(data: any) => handleFormComplete(index, data)}
                      {...form.props}
                    />
                  </View>
                );
              })}
            </PagerView>
          </Animated.View>
        </GestureDetector>

        <GestureTutorial
          visible={showTutorial}
          direction="both"
          message="Swipe to navigate between forms"
        />
      </BackgroundGradientView>
    );
  }
);

OnboardingGroupPager.displayName = 'OnboardingGroupPager';
