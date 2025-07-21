import placekit from '@placekit/client-js/lite';
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  TextInput as RNTextInput,
  ActivityIndicator,
} from 'react-native';

import { Text } from './text';

import { cn } from '~/lib/cn';
import ChevronDown from '~/lib/icons/ChevronDown';

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
  onValueChange: (location: PlaceKitLocation | null) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  error?: string;
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
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Display value - either selected location or search query
  const displayValue = value ? `${value.city}, ${value.stateCode || value.state}` : searchQuery;

  // Search PlaceKit API with debounce
  const searchPlaceKit = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
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

      setSearchResults(mappedResults);
    } catch (error) {
      console.error('PlaceKit search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      {/* Label */}
      <View className="mb-4 flex-row items-center justify-start px-6">
        <Text variant="labelXs" className="uppercase text-text-low">
          {label}
        </Text>
      </View>

      {/* Input Container */}
      <View className="relative">
        <View
          className={cn(
            'rounded-[29px] border bg-surface-high',
            error ? 'border-border-error' : 'border-border-default',
            isOpen && searchResults.length > 0 && 'rounded-b-none'
          )}>
          <View className="flex-row items-center px-6 py-3">
            <RNTextInput
              value={displayValue}
              onChangeText={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-[16px] font-normal leading-[24px] text-text-default"
              style={{ color: '#ffffff' }}
            />
            {isLoading ? (
              <ActivityIndicator size="small" color="#9CA3AF" className="ml-4" />
            ) : (
              <View className="ml-4 size-6">
                <ChevronDown
                  className={cn(
                    'text-text-tertiary h-6 w-6 transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </View>
            )}
          </View>
        </View>

        {/* Dropdown Results */}
        {isOpen && searchResults.length > 0 && (
          <View className="absolute left-0 right-0 top-full z-50 max-h-60 rounded-b-[29px] border-x border-b border-border-default bg-surface-high">
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
        )}
      </View>

      {/* Helper Text */}
      <View className="mt-4 px-6">
        <Text variant="bodySm" className="text-text-low">
          This is your primary city of residence. Local work locations can be provided on the next
          screen.
        </Text>
      </View>

      {/* Error Message */}
      {error && (
        <View className="mt-2 px-6">
          <Text variant="bodySm" className="text-text-error">
            {error}
          </Text>
        </View>
      )}
    </View>
  )
}
