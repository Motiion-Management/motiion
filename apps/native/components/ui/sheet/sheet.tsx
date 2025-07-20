import React, { useRef, useImperativeHandle, forwardRef, useCallback, useEffect } from 'react'
import { View } from 'react-native'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Text } from '../text'
import { Button } from '../button'

import { cn } from '~/lib/cn'

interface SheetProps {
  isOpened: boolean
  onIsOpenedChange: (isOpen: boolean) => void
  children: React.ReactNode
  className?: string
  actions?: { onPress: () => void; slot: React.ReactNode }[]
}

interface SheetRef {
  open: () => void
  close: () => void
}

const SheetContent = forwardRef<SheetRef, SheetProps>(
  ({ isOpened, onIsOpenedChange, children, className, actions }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null)

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetModalRef.current?.present(),
      close: () => bottomSheetModalRef.current?.dismiss(),
    }))

    useEffect(() => {
      if (isOpened) {
        bottomSheetModalRef.current?.present()
      } else {
        bottomSheetModalRef.current?.dismiss()
      }
    }, [isOpened])

    const handleSheetChanges = useCallback(
      (index: number) => {
        onIsOpenedChange(index >= 0)
      },
      [onIsOpenedChange]
    )

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    )

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        enableDynamicSizing
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
      >
        <BottomSheetView>
          <SafeAreaView
            edges={['left', 'right', 'bottom']}
            className={cn('bg-surface-default', className)}
          >
            {children}
            {actions?.map(({ onPress, slot }, index) => (
              <View key={index} className="mb-8 flex-1 items-center justify-center py-2">
                <View className="flex-1 items-center justify-center bg-white p-2">
                  <Button variant="default" onPress={onPress}>
                    <Text variant="header5" className="text-text-high">
                      {slot}
                    </Text>
                  </Button>
                </View>
              </View>
            ))}
          </SafeAreaView>
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)

SheetContent.displayName = 'SheetContent'

const Sheet = (props: SheetProps) => {
  const sheetRef = useRef<SheetRef>(null)
  
  return <SheetContent ref={sheetRef} {...props} />
}

function useSheetState() {
  const [isOpen, setIsOpen] = React.useState(false)

  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle }
}

export { Sheet, useSheetState, SheetProps }