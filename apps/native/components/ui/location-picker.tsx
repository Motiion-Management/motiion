import React, { useState, useCallback, useMemo } from 'react'
import { View, Pressable, ScrollView, TextInput as RNTextInput } from 'react-native'

import { searchUSCities, formatLocationDisplay, type USCity } from '~/data/usCities'
import { cn } from '~/lib/cn'
import ChevronDown from '~/lib/icons/ChevronDown'

import { Text } from './text'

export interface LocationPickerProps {
  value?: USCity | null
  onValueChange: (location: USCity | null) => void
  placeholder?: string
  label?: string
  className?: string
  error?: string
}

export function LocationPicker({
  value,
  onValueChange,
  placeholder = 'Search for a city...',
  label = 'City & State',
  className,
  error
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Search results based on query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchUSCities(searchQuery, 8)
  }, [searchQuery])
  
  // Display value - either selected location or search query
  const displayValue = useMemo(() => {
    if (value) return formatLocationDisplay(value)
    return searchQuery
  }, [value, searchQuery])
  
  const handleInputChange = useCallback((text: string) => {
    setSearchQuery(text)
    setIsOpen(true)
    
    // Clear selection if user is typing a new search
    if (value && text !== formatLocationDisplay(value)) {
      onValueChange(null)
    }
  }, [value, onValueChange])
  
  const handleSelectLocation = useCallback((location: USCity) => {
    onValueChange(location)
    setSearchQuery('')
    setIsOpen(false)
  }, [onValueChange])
  
  const handleInputFocus = useCallback(() => {
    setIsOpen(true)
    // If there's a selected value, show it as search query for editing
    if (value) {
      setSearchQuery(formatLocationDisplay(value))
    }
  }, [value])
  
  const handleInputBlur = useCallback(() => {
    // Delay closing to allow for selection clicks
    setTimeout(() => {
      setIsOpen(false)
      setSearchQuery('')
    }, 200)
  }, [])
  
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
          )}
        >
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
            <View className="ml-4 size-6">
              <ChevronDown 
                className={cn(
                  'h-6 w-6 text-text-tertiary transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </View>
          </View>
        </View>
        
        {/* Dropdown Results */}
        {isOpen && searchResults.length > 0 && (
          <View className="absolute left-0 right-0 top-full z-50 max-h-60 rounded-b-[29px] border-x border-b border-border-default bg-surface-high">
            <ScrollView 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {searchResults.map((location, index) => (
                <Pressable
                  key={`${location.city}-${location.stateCode}`}
                  onPress={() => handleSelectLocation(location)}
                  className={cn(
                    'px-6 py-3',
                    index === searchResults.length - 1 && 'rounded-b-[29px]'
                  )}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                  })}
                >
                  <Text className="text-[16px] font-normal leading-[24px] text-text-default">
                    {formatLocationDisplay(location)}
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
          This is your primary city of residence. Local work locations can be provided on the next screen.
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