import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

import { Text } from '~/components/ui/text';

interface ProgressBarProps {
  /**
   * The current step index (0-based)
   */
  currentStep: number;
  /**
   * Total number of steps
   */
  totalSteps: number;
  /**
   * Label to display on the left side
   */
  label: string;
}

const AnimatedStep = ({ 
  stepIndex, 
  currentStep, 
  delay = 0 
}: { 
  stepIndex: number; 
  currentStep: number; 
  delay?: number;
}) => {
  const isCurrentStep = stepIndex === currentStep;
  const isCompletedStep = stepIndex < currentStep;
  
  // Initialize with correct starting values based on current state
  const initialWidth = isCurrentStep ? 48 : 6;
  const width = useSharedValue(initialWidth);
  const scale = useSharedValue(1);
  
  // Animation configuration for bouncy but professional feel
  const springConfig = {
    damping: 15,
    stiffness: 150,
    mass: 1,
  };

  // Smoother spring for less bounce on width changes
  const widthSpringConfig = {
    damping: 18,
    stiffness: 120,
    mass: 1,
  };

  useEffect(() => {
    if (isCurrentStep) {
      // Current step: animate to stretched bar
      width.value = withDelay(delay, withSpring(48, widthSpringConfig));
      // Add a subtle bounce effect
      scale.value = withSequence(
        withDelay(delay, withSpring(1.08, springConfig)),
        withSpring(1, springConfig)
      );
    } else {
      // Completed or future step: animate to dot size
      width.value = withDelay(delay, withSpring(6, widthSpringConfig));
      
      if (isCompletedStep) {
        // Completed steps get a satisfying bounce
        scale.value = withSequence(
          withDelay(delay, withSpring(1.12, springConfig)),
          withSpring(1, springConfig)
        );
      } else {
        // Future steps just scale normally
        scale.value = withDelay(delay, withSpring(1, springConfig));
      }
    }
  }, [currentStep, stepIndex, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    height: 6, // h-1.5 = 6px
    transform: [{ scale: scale.value }],
  }));

  // Determine background color classes
  const getBackgroundClass = () => {
    if (isCurrentStep || isCompletedStep) {
      return 'bg-primary-500 border-primary';
    }
    return 'bg-surface-default border-primary';
  };

  return (
    <Animated.View
      style={animatedStyle}
      className={`rounded border ${getBackgroundClass()}`}
    />
  );
};

export const ProgressBar = ({ currentStep, totalSteps, label }: ProgressBarProps) => {
  const steps = Array.from({ length: totalSteps }, (_, index) => index);

  return (
    <View className="flex-1 flex-row items-center gap-2">
      <Text variant="labelXs" color="primary" className="mr-4">
        {label}
      </Text>
      {steps.map((stepIndex) => {
        // Create a wave effect: steps closer to current get less delay
        const distanceFromCurrent = Math.abs(stepIndex - currentStep);
        const baseDelay = 30;
        const staggerDelay = distanceFromCurrent * baseDelay;
        
        return (
          <AnimatedStep
            key={stepIndex}
            stepIndex={stepIndex}
            currentStep={currentStep}
            delay={staggerDelay}
          />
        );
      })}
    </View>
  );
};