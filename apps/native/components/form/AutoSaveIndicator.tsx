import React from 'react';
import { View, Animated } from 'react-native';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react-native';
import { Text } from '~/components/ui/text';
import { AutoSaveState } from '~/hooks/useAutoSaveForm';
import { cn } from '~/lib/utils';

interface AutoSaveIndicatorProps {
  saveState: AutoSaveState;
  className?: string;
  position?: 'top-right' | 'bottom-right' | 'inline';
  size?: 'sm' | 'md';
}

export function AutoSaveIndicator({
  saveState,
  className,
  position = 'top-right',
  size = 'sm',
}: AutoSaveIndicatorProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (saveState.isSaving || saveState.lastSaved || saveState.error) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [saveState.isSaving, saveState.lastSaved, saveState.error, fadeAnim]);

  const positionClasses = {
    'top-right': 'absolute -top-6 right-0',
    'bottom-right': 'absolute -bottom-6 right-0',
    inline: '',
  };

  const iconSize = size === 'sm' ? 14 : 18;
  const textVariant = size === 'sm' ? 'footnote' : 'caption2';

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={cn('flex-row items-center gap-1', positionClasses[position], className)}>
      {saveState.isSaving && (
        <>
          <Loader2 size={iconSize} className="text-text-low" />
          <Text variant={textVariant} className="text-text-low">
            Saving...
          </Text>
        </>
      )}

      {!saveState.isSaving && saveState.lastSaved && !saveState.error && (
        <>
          <CheckCircle2 size={iconSize} className="text-accent" />
          <Text variant={textVariant} className="text-accent">
            Saved
          </Text>
        </>
      )}

      {saveState.error && (
        <>
          <AlertCircle size={iconSize} className="text-destructive" />
          <Text variant={textVariant} className="text-destructive">
            Failed to save
          </Text>
        </>
      )}
    </Animated.View>
  );
}
