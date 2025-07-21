import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import React, { useRef, useImperativeHandle, forwardRef, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../button';
import { Text } from '../text';

import { cn } from '~/lib/cn';

interface SheetProps {
  isOpened: boolean;
  onIsOpenedChange: (isOpen: boolean) => void;
  children: React.ReactNode;
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
      className={cn('bg-surface-default rounded-t-xl', className)}
    />
  );
};

interface BottomSheetHandleProps {
  animatedIndex?: any;
  animatedPosition?: any;
  className?: string;
}

const BottomSheetHandle = ({ className }: BottomSheetHandleProps) => {
  return (
    <View className={cn('self-center pt-3 pb-2', className)}>
      <View className="w-10 h-1.5 bg-gray-300 rounded-full" />
    </View>
  );
};

const SheetContent = forwardRef<SheetRef, SheetProps>(
  ({ 
    isOpened, 
    onIsOpenedChange, 
    children, 
    className,
    backgroundClassName,
    handleClassName,
    handleIndicatorStyle,
    enableCustomHandle = true,
    borderRadius = 'xl'
  }, ref) => {
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
      (props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
          opacity={0.5}
        />
      ),
      []
    );

    const renderBackground = useCallback(
      (props) => (
        <BottomSheetBackground
          {...props}
          className={cn(
            `rounded-t-${borderRadius}`,
            backgroundClassName
          )}
        />
      ),
      [backgroundClassName, borderRadius]
    );

    const renderHandle = useCallback(
      (props) => (
        <BottomSheetHandle
          {...props}
          className={handleClassName}
        />
      ),
      [handleClassName]
    );

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        enableDynamicSizing
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        backgroundComponent={renderBackground}
        handleComponent={enableCustomHandle ? renderHandle : undefined}
        handleIndicatorStyle={!enableCustomHandle ? handleIndicatorStyle : undefined}
        enablePanDownToClose>
        <BottomSheetView>
          <SafeAreaView
            edges={['left', 'right', 'bottom']}
            className={className}>
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
  <View className="flex-1 items-center justify-center">
    <View className="flex-1 items-center justify-center">
      <Button variant="primary" onPress={onPress}>
        <Text>{children}</Text>
      </Button>
    </View>
  </View>
);

export { Sheet, SheetAction, useSheetState, SheetProps };

