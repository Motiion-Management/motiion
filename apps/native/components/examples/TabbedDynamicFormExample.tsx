import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { ConvexDynamicForm } from '~/components/form/ConvexDynamicForm';
import { Text } from '~/components/ui/text';
import { tvFilmMetadata } from '~/utils/convexFormMetadata';
import { Button } from '~/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

// Import the form schemas from backend
import {
  zBasicTvFilmForm,
  zDetailedTvFilmForm,
} from '@packages/backend/convex/experiences/tvfilmForms';

interface Tab {
  id: string;
  label: string;
  groups: string[];
}

const tabs: Tab[] = [
  { id: 'quick', label: 'Quick Add', groups: ['quick'] },
  { id: 'basic', label: 'Basic Info', groups: ['basic'] },
  { id: 'details', label: 'Details', groups: ['details'] },
];

/**
 * Example of a tabbed form that shows different field subsets per tab
 * Uses the same schema but filters fields based on groups
 */
export function TabbedDynamicFormExample() {
  const [activeTab, setActiveTab] = useState('quick');
  const [formData, setFormData] = useState<any>({});

  // Use the form-specific mutations
  const createBasic = useMutation(api.experiences.tvfilmForms.createBasicExperience);
  const updateDetails = useMutation(api.experiences.tvfilmForms.updateDetailedExperience);

  const handleQuickSubmit = async () => {
    try {
      // Extract only the fields needed for basic creation
      const basicData = {
        title: formData.title,
        studio: formData.studio,
        startDate: formData.startDate,
        duration: formData.duration,
        roles: formData.roles || [],
      };

      const experienceId = await createBasic(basicData);
      console.log('Created experience:', experienceId);

      // If we have additional details, update them
      if (formData.mainTalent || formData.choreographers) {
        await updateDetails({
          id: experienceId,
          mainTalent: formData.mainTalent,
          choreographers: formData.choreographers,
          associateChoreographers: formData.associateChoreographers,
        });
      }
    } catch (error) {
      console.error('Error creating experience:', error);
    }
  };

  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text variant="heading" className="mb-4 text-2xl">
          Tabbed Form Example
        </Text>

        <Text className="mb-6 text-text-disabled">
          This example demonstrates how to show different subsets of fields based on the selected
          tab, all from the same schema.
        </Text>

        {/* Tab Navigation */}
        <View className="mb-6 flex-row gap-2">
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-lg px-4 py-2 ${
                activeTab === tab.id ? 'bg-primary' : 'bg-surface-high'
              }`}>
              <Text
                className={`text-center ${
                  activeTab === tab.id ? 'text-primary-foreground' : 'text-text-default'
                }`}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Dynamic Form with Groups */}
        <ConvexDynamicForm
          schema={zBasicTvFilmForm} // Use the form-specific schema
          metadata={tvFilmMetadata}
          groups={currentTab?.groups}
          initialData={formData}
          onChange={setFormData}
          exclude={['userId', 'private']}
          debounceMs={300}
        />

        {/* Submit Button for Quick Add */}
        {activeTab === 'quick' && (
          <View className="mt-6">
            <Button onPress={handleQuickSubmit}>
              <Text>Create Experience</Text>
            </Button>
          </View>
        )}

        {/* Debug Info */}
        <View className="mt-8 rounded-lg bg-surface-high p-4">
          <Text variant="footnote" className="mb-2 text-text-disabled">
            Current Tab: {activeTab}
          </Text>
          <Text variant="footnote" className="mb-2 text-text-disabled">
            Groups: {currentTab?.groups.join(', ')}
          </Text>
          <Text variant="footnote" className="text-text-disabled">
            Form Data: {JSON.stringify(formData, null, 2)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Example of using form-specific mutations directly
 */
export function MutationBasedFormExample() {
  const createBasic = useMutation(api.experiences.tvfilmForms.createBasicExperience);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsCreating(true);
    try {
      const experienceId = await createBasic(data);
      console.log('Created experience:', experienceId);
      // Navigate or show success
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View className="p-4">
      <Text variant="heading" className="mb-4 text-xl">
        Mutation-Based Form
      </Text>

      <Text className="mb-6 text-text-disabled">
        This form is generated from the Convex mutation's args validator, ensuring perfect type
        safety between backend and frontend.
      </Text>

      <ConvexDynamicForm
        schema={zBasicTvFilmForm}
        metadata={tvFilmMetadata}
        onSubmit={handleSubmit}
        debounceMs={300}
      />

      <View className="mt-4">
        <Button onPress={() => console.log('Submit form')} disabled={isCreating}>
          <Text>{isCreating ? 'Creating...' : 'Create Experience'}</Text>
        </Button>
      </View>
    </View>
  );
}

/**
 * Example showing half-width fields in action
 */
export function LayoutExampleForm() {
  const [formData, setFormData] = useState<any>({});

  return (
    <View className="p-4">
      <Text variant="heading" className="mb-4 text-xl">
        Layout Example
      </Text>

      <Text className="mb-6 text-text-disabled">
        Notice how Start Date and Duration appear side-by-side because they have width: 'half' in
        their metadata.
      </Text>

      <ConvexDynamicForm
        schema={zBasicTvFilmForm}
        metadata={tvFilmMetadata}
        groups={['basic', 'dates']} // Show fields with dates group
        onChange={setFormData}
        debounceMs={300}
      />

      <View className="mt-6 rounded-lg bg-surface-high p-4">
        <Text variant="footnote" className="text-text-disabled">
          The form automatically groups half-width fields into rows, creating a more compact and
          organized layout.
        </Text>
      </View>
    </View>
  );
}
