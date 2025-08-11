import DateTimePicker from '@react-native-community/datetimepicker';
import * as React from 'react';
import { Dimensions, Modal, Pressable, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Input } from '~/components/ui/input';
import Calendar from '~/lib/icons/Calendar';
import { cn } from '~/lib/cn';

type IOSDatePickerProps = React.ComponentProps<typeof DateTimePicker> & {
  mode: 'date' | 'time' | 'datetime';
  // Custom display formatters for the trigger field
  formatDate?: (date: Date) => string;
  formatTime?: (date: Date) => string;
  // Deprecated material props kept for backward compatibility
  materialDateClassName?: string;
  materialDateLabel?: string;
  materialDateLabelClassName?: string;
  materialTimeClassName?: string;
  materialTimeLabel?: string;
  materialTimeLabelClassName?: string;
};

type OverlayState = {
  open: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function DatePicker(props: IOSDatePickerProps) {
  const dateAnchorRef = React.useRef<View>(null);
  const timeAnchorRef = React.useRef<View>(null);

  const [dateOverlay, setDateOverlay] = React.useState<OverlayState>({
    open: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [timeOverlay, setTimeOverlay] = React.useState<OverlayState>({
    open: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [dateContentWidth, setDateContentWidth] = React.useState(0);
  const [timeContentWidth, setTimeContentWidth] = React.useState(0);

  const anim = useSharedValue(0);

  const runOpenAnim = React.useCallback(() => {
    anim.value = 0;
    anim.value = withTiming(1, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const runCloseAnim = React.useCallback((after?: () => void) => {
    anim.value = withTiming(
      0,
      {
        duration: 150,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        'worklet';
        if (finished && after) runOnJS(after)();
      }
    );
  }, []);

  const formatDate = React.useCallback(
    (d: Date) =>
      props.formatDate?.(d) ?? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(d),
    [props.formatDate]
  );

  const formatTime = React.useCallback(
    (d: Date) =>
      props.formatTime?.(d) ?? new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(d),
    [props.formatTime]
  );

  const openDate = React.useCallback(() => {
    dateAnchorRef.current?.measureInWindow((x, y, width, height) => {
      setDateOverlay({ open: true, x, y, width, height });
      runOpenAnim();
    });
  }, [runOpenAnim]);

  const closeDate = React.useCallback(() => {
    runCloseAnim(() => setDateOverlay((s) => ({ ...s, open: false })));
  }, [runCloseAnim]);

  const openTime = React.useCallback(() => {
    timeAnchorRef.current?.measureInWindow((x, y, width, height) => {
      setTimeOverlay({ open: true, x, y, width, height });
      runOpenAnim();
    });
  }, [runOpenAnim]);

  const closeTime = React.useCallback(() => {
    runCloseAnim(() => setTimeOverlay((s) => ({ ...s, open: false })));
  }, [runCloseAnim]);

  const screen = Dimensions.get('window');
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(anim.value, [0, 1], [0.96, 1]);
    return {
      opacity: anim.value,
      transform: [{ scale }],
    };
  });

  return (
    <View className="flex-row gap-2.5">
      {props.mode.includes('date') && (
        <View ref={dateAnchorRef} className={cn('flex-1', props.materialDateClassName)}>
          <Pressable onPress={openDate}>
            <Input
              value={formatDate(props.value as Date)}
              readOnly
              rightView={<Calendar className="text-text-default opacity-50" size={20} />}
            />
          </Pressable>

          <Modal
            visible={dateOverlay.open}
            transparent
            animationType="none"
            onRequestClose={closeDate}>
            <Pressable style={{ flex: 1 }} onPress={closeDate}>
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: Math.min(dateOverlay.y + dateOverlay.height + 8, screen.height - 360),
                    left:
                      dateContentWidth > 0
                        ? Math.min(dateOverlay.x, screen.width - dateContentWidth - 8)
                        : dateOverlay.x,
                  },
                  animatedStyle,
                ]}
                className="rounded-2xl border border-border-low bg-surface-high p-2 shadow-lg"
                onLayout={(e) => setDateContentWidth(e.nativeEvent.layout.width)}>
                <DateTimePicker
                  {...(props as any)}
                  mode="date"
                  display="inline"
                  value={props.value as Date}
                  minimumDate={props.minimumDate}
                  maximumDate={props.maximumDate}
                />
              </Animated.View>
            </Pressable>
          </Modal>
        </View>
      )}

      {props.mode.includes('time') && (
        <View ref={timeAnchorRef} className={cn('flex-1', props.materialTimeClassName)}>
          <Pressable onPress={openTime}>
            <Input
              value={formatTime(props.value as Date)}
              readOnly
              rightView={<Calendar className="text-text-default opacity-50" size={20} />}
            />
          </Pressable>

          <Modal
            visible={timeOverlay.open}
            transparent
            animationType="none"
            onRequestClose={closeTime}>
            <Pressable style={{ flex: 1 }} onPress={closeTime}>
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: Math.min(timeOverlay.y + timeOverlay.height + 8, screen.height - 300),
                    left:
                      timeContentWidth > 0
                        ? Math.min(timeOverlay.x, screen.width - timeContentWidth - 8)
                        : timeOverlay.x,
                  },
                  animatedStyle,
                ]}
                className="rounded-2xl border border-border-low bg-surface-high p-2 shadow-lg"
                onLayout={(e) => setTimeContentWidth(e.nativeEvent.layout.width)}>
                <DateTimePicker
                  {...(props as any)}
                  mode="time"
                  display="inline"
                  value={props.value as Date}
                  minimumDate={props.minimumDate}
                  maximumDate={props.maximumDate}
                />
              </Animated.View>
            </Pressable>
          </Modal>
        </View>
      )}
    </View>
  );
}
