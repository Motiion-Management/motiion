import React from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { Text } from '~/components/ui/text';
import { useOnboardingGroupFlow } from '~/hooks/useOnboardingGroupFlow';
import { cn } from '~/lib/cn';

interface GroupIndicatorProps {
  isActive: boolean;
  isCompleted: boolean;
  label: string;
  progress?: number;
}

function GroupIndicator({ isActive, isCompleted, label, progress = 0 }: GroupIndicatorProps) {
  const scale = useSharedValue(isActive ? 1.2 : 1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  return (
    <View className="items-center gap-1">
      <Animated.View
        style={animatedStyle}
        className={cn(
          'h-3 w-3 rounded-full border-2',
          isCompleted
            ? 'bg-accent-primary border-accent-primary'
            : isActive
              ? 'bg-accent-primary/30 border-accent-primary'
              : 'border-border-default bg-transparent'
        )}>
        {isActive && progress > 0 && (
          <View
            className="bg-accent-primary absolute inset-0 rounded-full"
            style={{
              transform: [{ scaleX: progress / 100 }],
              transformOrigin: 'left',
            }}
          />
        )}
      </Animated.View>
      <Text
        variant="labelXs"
        className={cn('text-center', isActive ? 'text-text-default' : 'text-text-low')}>
        {label}
      </Text>
    </View>
  );
}

export function GroupProgressBar() {
  const flow = useOnboardingGroupFlow();

  return (
    <View className="flex-1 flex-row items-center justify-between pr-4">
      {flow.groups.map((group, index) => (
        <React.Fragment key={group.key}>
          <GroupIndicator
            isActive={group.isActive}
            isCompleted={group.completed}
            label={group.label}
            progress={group.progress}
          />
          {index < flow.groups.length - 1 && (
            <View className="mx-2 h-px flex-1 bg-border-default" />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}
