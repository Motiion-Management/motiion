import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import React, { useState, useCallback, useRef } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { useUser } from '~/hooks/useUser';
import { cn } from '~/lib/cn';

const agencyValidator = z.object({
  agencyId: z.string().min(1, 'Please select an agency'),
});

interface AgencyResult {
  _id: string;
  name: string;
  shortName?: string;
  location?: {
    city: string;
    state: string;
  };
}

export default function AgencySelectionScreen() {
  const addMyRepresentation = useMutation(api.users.representation.addMyRepresentation);

  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState<AgencyResult[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<AgencyResult | null>(null);
  const [showNewAgencyTooltip, setShowNewAgencyTooltip] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  const { user } = useUser();

  const form = useAppForm({
    defaultValues: {
      agencyId: user?.representation?.agencyId || '',
    },
    validators: {
      onChange: agencyValidator,
    },
    onSubmit: async ({ value }) => {
      try {
        if (value.agencyId) {
          await addMyRepresentation({ agencyId: value.agencyId as any });
        }
        router.push('/app/onboarding/resume'); // Navigate to next step
      } catch (error) {
        console.error('Error saving agency:', error);
      }
    },
  });

  // Display value - either selected agency or input value
  const displayValue = selectedAgency ? selectedAgency.name : inputValue;

  // We need to use a query hook for the search
  const searchAgenciesQuery = useQuery(
    api.agencies.search,
    searchQuery ? { query: searchQuery } : 'skip'
  );

  // Update search results when query changes
  React.useEffect(() => {
    if (searchAgenciesQuery) {
      setSearchResults(searchAgenciesQuery);
      // Show tooltip if no results found and there's a search query
      if (searchAgenciesQuery.length === 0 && searchQuery) {
        setShowNewAgencyTooltip(true);
      } else {
        setShowNewAgencyTooltip(false);
      }
    }
  }, [searchAgenciesQuery, searchQuery]);

  const handleInputChange = useCallback(
    (text: string) => {
      setInputValue(text);
      setIsOpen(true);

      // Clear selection if user is typing a new search
      if (selectedAgency && text !== selectedAgency.name) {
        setSelectedAgency(null);
        form.setFieldValue('agencyId', '');
      }

      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        setSearchQuery(text);
      }, 300);
    },
    [selectedAgency, form]
  );

  const handleSelectAgency = useCallback(
    (agency: AgencyResult) => {
      setSelectedAgency(agency);
      setInputValue('');
      form.setFieldValue('agencyId', agency._id);
      setIsOpen(false);
      setSearchResults([]);
    },
    [form]
  );

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
    // If there's a selected value, show it as search query for editing
    if (selectedAgency) {
      setInputValue(selectedAgency.name);
      setSearchQuery(selectedAgency.name);
    }
  }, [selectedAgency]);

  const handleInputBlur = useCallback(() => {
    // Delay closing to allow for selection clicks
    setTimeout(() => {
      setIsOpen(false);
      setInputValue('');
    }, 200);
  }, []);

  return (
    <BaseOnboardingScreen
      title="Select Agency"
      description="Search and select your representation agency"
      canProgress={!!selectedAgency}
      primaryAction={{
        onPress: () => form.handleSubmit(),
        handlesNavigation: true,
      }}>
      <ValidationModeForm form={form}>
        <View className="gap-4">
          <View className="relative">
            <Input
              label="Agency"
              value={displayValue}
              onChangeText={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Search for your agency..."
              borderRadiusVariant={isOpen && searchResults.length > 0 ? 'dropdown-open' : 'full'}
              bottomSlot={
                isOpen && searchResults.length > 0 ? (
                  <View className="absolute left-0 right-0 top-full -mt-px max-h-60 rounded-b-[29px] border border-border-default border-t-border-low bg-surface-high">
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}>
                      {searchResults.map((agency, index) => (
                        <Pressable
                          key={agency._id}
                          onPress={() => handleSelectAgency(agency)}
                          className={cn(
                            'px-6 py-3',
                            index === searchResults.length - 1 && 'rounded-b-[29px]'
                          )}
                          style={({ pressed }) => ({
                            backgroundColor: pressed ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          })}>
                          <Text className="text-[16px] font-normal leading-[24px] text-text-default">
                            {agency.name}
                          </Text>
                          {agency.location && (
                            <Text className="text-[14px] font-normal leading-[20px] text-text-low">
                              {agency.location.city}, {agency.location.state}
                            </Text>
                          )}
                        </Pressable>
                      ))}
                      {inputValue && searchResults.length === 0 && (
                        <Pressable
                          onPress={() => {
                            // Handle adding new agency
                            setShowNewAgencyTooltip(true);
                          }}
                          className="rounded-b-[29px] px-6 py-3"
                          style={({ pressed }) => ({
                            backgroundColor: pressed ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          })}>
                          <Text className="text-[16px] font-normal leading-[24px] text-text-default">
                            Add "{inputValue}" as new agency
                          </Text>
                        </Pressable>
                      )}
                    </ScrollView>
                  </View>
                ) : null
              }
            />

            {showNewAgencyTooltip && inputValue && (
              <View className="mt-2 rounded-2xl border border-border-default bg-surface-high p-3">
                <Text className="mb-1 text-[14px] font-semibold text-text-default">
                  New agency requested
                </Text>
                <Text className="text-[12px] text-text-low">
                  We will confirm this agency's authenticity before adding and will reach out if
                  there are any issues.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ValidationModeForm>
    </BaseOnboardingScreen>
  );
}
