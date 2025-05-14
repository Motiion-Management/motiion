import { Picker } from '@expo/ui/swift-ui';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { countryCodes } from '@packages/backend/constants/countryCodes';
import { Icon } from '@roninoss/icons';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { useFieldContext } from './context';
import { Button } from '../nativewindui/Button';
import { Sheet, useSheetRef } from '../nativewindui/Sheet';
import { Text } from '../nativewindui/Text';
import { TextField } from '../nativewindui/TextField';

const countryList = countryCodes.map(
  ({ dial_code, name, flag }) => `${flag} ${name['en']} ${dial_code}`
);

const getCountryPreview = (code: string) => {
  const country = countryCodes.find((country) => country.code === code);
  if (country) {
    return `${country.flag} ${country.dial_code}`;
  }
  return '';
};

const getCountryIndex = (code: string) => {
  const country = countryCodes.find((country) => country.code === code);
  if (country) {
    return countryCodes.indexOf(country);
  }
  return 0;
};

const getCountryCode = (index: number) => {
  const { code } = countryCodes[index];
  return code;
};

export const CountryCode = () => {
  const field = useFieldContext<string>();
  const [selectedIndex, setSelectedIndex] = useState(getCountryIndex(field.state.value));
  const bottomSheetModalRef = useSheetRef();
  const preview = getCountryPreview(field.state.value);

  const handleOpen = () => bottomSheetModalRef.current?.present();
  const handleConfirmSelection = useCallback(() => {
    const code = getCountryCode(selectedIndex);
    field.handleChange(code);
    bottomSheetModalRef.current?.close();
  }, [selectedIndex]);

  return (
    <View className=" max-w-[120px]">
      <Pressable onPress={handleOpen}>
        <TextField
          readOnly
          placeholder="+1"
          label="Country Code"
          value={preview}
          textContentType="telephoneNumber"
          onPress={handleOpen}
          rightView={
            <View className="justify-center">
              <Icon name="chevron-down" size={16} color="foreground" />
            </View>
          }
        />
      </Pressable>
      <Sheet
        ref={bottomSheetModalRef}
        snapPoints={['33%']}
        enablePanDownToClose
        onDismiss={handleConfirmSelection}>
        <BottomSheetView className="flex-1 items-center justify-center pb-8">
          <Button variant="plain" onPress={handleConfirmSelection}>
            <Text>Confirm</Text>
          </Button>
          <Picker
            options={countryList}
            selectedIndex={selectedIndex}
            onOptionSelected={({ nativeEvent: { index } }) => {
              setSelectedIndex(index);
            }}
            variant="wheel"
            style={{
              width: '100%',
              height: '100%',
              flex: 1,
            }}
          />
        </BottomSheetView>
      </Sheet>
    </View>
  );
};
