import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import React, { useRef, useImperativeHandle, forwardRef, useCallback, useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../button';
import { Text } from '../text';

import { cn } from '~/lib/cn';
import X from '~/lib/icons/X';
import { BlurView } from 'expo-blur';

interface SheetProps extends Omit<BottomSheetModalProps, 'children'> {
  children?: React.ReactNode;
  label?: string;
  isOpened: boolean;
  onIsOpenedChange: (isOpen: boolean) => void;
  className?: string;
  backgroundClassName?: string;
  handleClassName?: string;
  handleIndicatorStyle?: any;
  enableCustomHandle?: boolean;
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl';
}

interface SheetRef {
  open: () => void;
  close: () => void;
}

interface BottomSheetBackgroundProps {
  style?: any;
  className?: string;
}

const BottomSheetBackground = ({ style, className }: BottomSheetBackgroundProps) => {
  return (
    <View
      style={style}
      className={cn('overflow-hidden rounded-t-xl bg-surface-overlay', className)}>
      <BlurView intensity={35} className="flex-1" />
    </View>
  );
};

interface BottomSheetHandleProps {
  animatedIndex?: any;
  animatedPosition?: any;
  className?: string;
}

const BottomSheetHandle = ({ className }: BottomSheetHandleProps) => {
  return (
    <View className={cn('self-center pt-3', className)}>
      <View className="h-1.5 w-10 rounded-full bg-surface-tint" />
    </View>
  );
};

const SheetContent = forwardRef<SheetRef, SheetProps>(
  (
    {
      label,
      isOpened,
      onIsOpenedChange,
      children,
      className,
      backgroundClassName,
      handleClassName,
      handleIndicatorStyle,
      enableCustomHandle = true,
      borderRadius = 'xl',
      enableDynamicSizing = true,
      ...rest
    },
    ref
  ) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetModalRef.current?.present(),
      close: () => bottomSheetModalRef.current?.dismiss(),
    }));

    useEffect(() => {
      if (isOpened) {
        bottomSheetModalRef.current?.present();
      } else {
        bottomSheetModalRef.current?.dismiss();
      }
    }, [isOpened]);

    const handleSheetChanges = useCallback(
      (index: number) => {
        onIsOpenedChange(index >= 0);
      },
      [onIsOpenedChange]
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
          opacity={0.6}
        />
      ),
      []
    );

    const renderBackground = useCallback(
      (props: any) => (
        <BottomSheetBackground
          {...props}
          className={cn(`rounded-t-${borderRadius}`, backgroundClassName)}
        />
      ),
      [backgroundClassName, borderRadius]
    );

    const renderHandle = useCallback(
      (props: any) => <BottomSheetHandle {...props} className={handleClassName} />,
      [handleClassName]
    );

    const handleClose = useCallback(() => {
      bottomSheetModalRef.current?.dismiss();
    }, []);

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        enableDynamicSizing={enableDynamicSizing}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        backgroundComponent={renderBackground}
        handleComponent={enableCustomHandle ? renderHandle : undefined}
        handleIndicatorStyle={!enableCustomHandle ? handleIndicatorStyle : undefined}
        enablePanDownToClose
        {...rest}>
        <BottomSheetView className={enableDynamicSizing ? '' : 'h-full'}>
          <SafeAreaView
            edges={['bottom']}
            className={cn(!enableDynamicSizing && 'flex-1', className)}>
            <View className="flex-row items-center justify-between px-4 pb-4">
              <Text variant="header4" className="text-text-default">
                {label}
              </Text>
              <Pressable onPress={handleClose} className="p-2 pr-0">
                <X className="h-6 w-6 text-icon-default" />
              </Pressable>
            </View>
            {children}
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

SheetContent.displayName = 'SheetContent';

const Sheet = (props: SheetProps) => {
  const sheetRef = useRef<SheetRef>(null);

  return <SheetContent ref={sheetRef} {...props} />;
};

function useSheetState() {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}

interface SheetActionProps {
  onPress: () => void;
  children: React.ReactNode;
}

const SheetAction = ({ onPress, children }: SheetActionProps) => (
  <Button variant="primary" onPress={onPress} className="w-full">
    <Text>{children}</Text>
  </Button>
);

export { Sheet, SheetAction, useSheetState, SheetProps };
