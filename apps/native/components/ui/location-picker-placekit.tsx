import placekit from '@placekit/client-js/lite';
import React, { useState, useCallback, useRef } from 'react';
import { View, Pressable, ScrollView } from 'react-native';

import { Input, InputProps } from './input';
import { Text } from './text';

import { cn } from '~/lib/cn';

// Initialize PlaceKit client
const pk = placekit(process.env.EXPO_PUBLIC_PLACEKIT_KEY!);

export interface PlaceKitLocation {
  city: string;
  state: string;
  stateCode: string;
  country: string;
}

export interface LocationPickerProps {
  value?: PlaceKitLocation | null;
  // eslint-disable-next-line no-unused-vars
  onValueChange: (value: PlaceKitLocation | null) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  error?: string;
  excludeLocations?: PlaceKitLocation[];
  showHelperText?: boolean;
  rightView?: React.ReactNode;
  onClear?: InputProps['onClear'];
  clearButtonMode?: InputProps['clearButtonMode'];
}

// PlaceKit result types we need for location
interface LocationResult {
  city: string;
  administrative: string;
  countrycode: string;
  country: string;
}

export function LocationPicker({
  value,
  onValueChange,
  placeholder = 'Search for a city...',
  label = 'City & State',
  className,
  error,
  excludeLocations = [],
  showHelperText = true,
  rightView,
  onClear,
  clearButtonMode,
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Display value - either selected location or search query
  const displayValue = value ? `${value.city}, ${value.stateCode || value.state}` : searchQuery;

  // Search PlaceKit API with debounce
  const searchPlaceKit = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await pk.search(query, {
          types: ['city'],
          countries: ['us'],
          maxResults: 8,
        });

        // Map PlaceKit results to our LocationResult format
        const mappedResults: LocationResult[] = response.results.map((result) => ({
          city: result.city,
          administrative: result.administrative,
          countrycode: result.countrycode,
          country: result.country,
        }));

        // Filter out excluded locations
        const filteredResults = mappedResults.filter((result) => {
          const resultLocationString = `${result.city}, ${result.administrative}`;
          return !excludeLocations.some(
            (excluded) => `${excluded.city}, ${excluded.state}` === resultLocationString
          );
        });

        setSearchResults(filteredResults);
      } catch (error) {
        console.error('PlaceKit search error:', error);
        setSearchResults([]);
      }
    },
    [excludeLocations]
  );

  const handleInputChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      setIsOpen(true);

      // Clear selection if user is typing a new search
      if (value && text !== `${value.city}, ${value.stateCode || value.state}`) {
        onValueChange(null);
      }

      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        searchPlaceKit(text);
      }, 300);
    },
    [value, onValueChange, searchPlaceKit]
  );

  const handleSelectLocation = useCallback(
    (result: LocationResult) => {
      const location: PlaceKitLocation = {
        city: result.city,
        state: result.administrative,
        stateCode: result.administrative, // Use full state name for now
        country: result.country,
      };
      onValueChange(location);
      setSearchQuery('');
      setIsOpen(false);
    },
    [onValueChange]
  );

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
    // If there's a selected value, show it as search query for editing
    if (value) {
      setSearchQuery(`${value.city}, ${value.stateCode || value.state}`);
      searchPlaceKit(`${value.city}, ${value.state}`);
    }
  }, [value, searchPlaceKit]);

  const handleInputBlur = useCallback(() => {
    // Delay closing to allow for selection clicks
    setTimeout(() => {
      setIsOpen(false);
      setSearchQuery('');
    }, 200);
  }, []);

  // Format display for search results
  const formatResultDisplay = (result: LocationResult) => {
    return `${result.city}, ${result.administrative}`;
  };

  return (
    <View className={className}>
      <Input
        label={label}
        value={displayValue}
        onChangeText={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        borderRadiusVariant={isOpen && searchResults.length > 0 ? 'dropdown-open' : 'full'}
        errorMessage={error}
        rightView={rightView}
        onClear={onClear}
        clearButtonMode={clearButtonMode}
        helperTextProps={
          showHelperText
            ? {
                message:
                  'This is your primary city of residence. Local work locations can be provided on the next screen.',
              }
            : undefined
        }
        bottomSlot={
          /* Dropdown Results */
          isOpen && searchResults.length > 0 ? (
            <View
              className="absolute left-0 right-0 top-full -mt-px max-h-60 rounded-b-[29px] border border-border-default border-t-border-low bg-surface-high"
              style={{ zIndex: 99999, elevation: 10 }}>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {searchResults.map((result, index) => (
                  <Pressable
                    key={`${result.city}-${result.administrative}-${index}`}
                    onPress={() => handleSelectLocation(result)}
                    className={cn(
                      'px-6 py-3',
                      index === searchResults.length - 1 && 'rounded-b-[29px]'
                    )}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    })}>
                    <Text className="text-[16px] font-normal leading-[24px] text-text-default">
                      {formatResultDisplay(result)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null
        }
      />
    </View>
  );
}
