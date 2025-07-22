import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import React, { useState, useCallback, useRef } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import * as z from 'zod';

import { ValidationModeForm } from '~/components/form/ValidationModeForm';
import { useAppForm } from '~/components/form/appForm';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';
import { OnboardingStepGuard } from '~/components/onboarding/OnboardingGuard';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useOnboardingCursor } from '~/hooks/useOnboardingCursor';
import { cn } from '~/lib/cn';

const agencyValidator = z.object({
  agencies: z.array(z.string()).min(1, 'Please select at least one agency'),
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
  const user = useQuery(api.users.getMyUser);
  const cursor = useOnboardingCursor();

  // If user doesn't have representation, auto-advance to next step
  React.useEffect(() => {
    if (user && user.representationStatus !== 'represented') {
      cursor.goToNextStep();
    }
  }, [user, cursor]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AgencyResult[]>([]);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [agencyInputs, setAgencyInputs] = useState<string[]>(['']);
  const [showNewAgencyTooltip, setShowNewAgencyTooltip] = useState<number | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useAppForm({
    defaultValues: {
      agencies: [] as string[],
    },
    validators: {
      onChange: agencyValidator,
    },
    onSubmit: async ({ value }) => {
      try {
        // Save selected agencies to user profile
        if (value.agencies.length > 0) {
          // For now, just save the first agency ID
          const firstAgencyId = value.agencies[0];
          await addMyRepresentation({ agencyId: firstAgencyId as any });
        }
      } catch (error) {
        console.error('Error saving agencies:', error);
      }
    },
  });

  // We need to use a query hook for the search
  const searchAgenciesQuery = useQuery(
    api.agencies.search, 
    searchQuery ? { query: searchQuery } : 'skip'
  );

  // Search agencies with debounce
  const searchAgencies = useCallback((query: string, inputIndex: number) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowNewAgencyTooltip(null);
      setSearchQuery('');
      return;
    }

    setSearchQuery(query);
    
    // Show tooltip if no results found
    if (searchAgenciesQuery && searchAgenciesQuery.length === 0) {
      setShowNewAgencyTooltip(inputIndex);
    } else {
      setShowNewAgencyTooltip(null);
    }
  }, [searchAgenciesQuery]);

  // Update search results when query changes
  React.useEffect(() => {
    if (searchAgenciesQuery) {
      setSearchResults(searchAgenciesQuery);
    }
  }, [searchAgenciesQuery]);

  const handleInputChange = useCallback((text: string, inputIndex: number) => {
    const newInputs = [...agencyInputs];
    newInputs[inputIndex] = text;
    setAgencyInputs(newInputs);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchAgencies(text, inputIndex);
    }, 300);
  }, [agencyInputs, searchAgencies]);

  const handleSelectAgency = useCallback((agency: AgencyResult, inputIndex: number) => {
    const newInputs = [...agencyInputs];
    newInputs[inputIndex] = agency.name;
    setAgencyInputs(newInputs);
    
    const newSelected = [...selectedAgencies];
    newSelected[inputIndex] = agency._id;
    setSelectedAgencies(newSelected);
    
    form.setFieldValue('agencies', newSelected.filter(Boolean));
    setSearchResults([]);
    setShowNewAgencyTooltip(null);
  }, [agencyInputs, selectedAgencies, form]);

  const addAnotherAgency = useCallback(() => {
    if (agencyInputs.length < 2) {
      setAgencyInputs([...agencyInputs, '']);
    }
  }, [agencyInputs]);

  const removeAgency = useCallback((indexToRemove: number) => {
    const newInputs = agencyInputs.filter((_, index) => index !== indexToRemove);
    const newSelected = selectedAgencies.filter((_, index) => index !== indexToRemove);
    
    setAgencyInputs(newInputs.length === 0 ? [''] : newInputs);
    setSelectedAgencies(newSelected);
    form.setFieldValue('agencies', newSelected.filter(Boolean));
  }, [agencyInputs, selectedAgencies, form]);

  const getInputLabel = (index: number) => {
    if (agencyInputs.length === 1) return 'Agency';
    return `Agency ${index + 1}`;
  };

  const getButtonText = () => {
    if (agencyInputs.length === 1 && !agencyInputs[0]) return 'Go back';
    if (agencyInputs.length < 2) return 'Add another agency';
    return '';
  };

  return (
    <OnboardingStepGuard requiredStep="agency">
      <BaseOnboardingScreen
        title="Select Agency"
        description="Search and select your representation agency"
        canProgress={selectedAgencies.filter(Boolean).length > 0}
        primaryAction={{
          onPress: () => form.handleSubmit(),
        }}
        secondaryAction={
          getButtonText() ? {
            text: getButtonText(),
            onPress: () => {
              if (getButtonText() === 'Go back') {
                cursor.goToPreviousStep();
              } else {
                addAnotherAgency();
              }
            }
          } : undefined
        }>
        <ValidationModeForm form={form}>
          <View className="gap-4">
            {agencyInputs.map((inputValue, index) => (
              <View key={index} className="relative">
                <Input
                  label={getInputLabel(index)}
                  value={inputValue}
                  onChangeText={(text) => handleInputChange(text, index)}
                  placeholder="Search for your agency..."
                  borderRadiusVariant={searchResults.length > 0 ? 'dropdown-open' : 'full'}
                  rightView={
                    index > 0 ? (
                      <Button
                        variant="plain"
                        size="sm"
                        onPress={() => removeAgency(index)}>
                        <Text className="text-text-low">Remove</Text>
                      </Button>
                    ) : undefined
                  }
                  bottomSlot={
                    searchResults.length > 0 ? (
                      <View
                        className="absolute left-0 right-0 top-full -mt-px max-h-60 rounded-b-[29px] border border-border-default border-t-border-low bg-surface-high"
                        style={{ zIndex: 99999, elevation: 10 }}>
                        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                          {searchResults.map((agency, resultIndex) => (
                            <Pressable
                              key={agency._id}
                              onPress={() => handleSelectAgency(agency, index)}
                              className={cn(
                                'px-6 py-3',
                                resultIndex === searchResults.length - 1 && 'rounded-b-[29px]'
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
                                const newInputs = [...agencyInputs];
                                newInputs[index] = inputValue;
                                setAgencyInputs(newInputs);
                                setShowNewAgencyTooltip(index);
                              }}
                              className="px-6 py-3 rounded-b-[29px]"
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
                
                {showNewAgencyTooltip === index && inputValue && (
                  <View className="mt-2 p-3 bg-surface-high border border-border-default rounded-2xl">
                    <Text className="text-[14px] font-semibold text-text-default mb-1">
                      New agency requested
                    </Text>
                    <Text className="text-[12px] text-text-low">
                      We will confirm this agency's authenticity before adding and will reach out if there are any issues.
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ValidationModeForm>
      </BaseOnboardingScreen>
    </OnboardingStepGuard>
  );
}