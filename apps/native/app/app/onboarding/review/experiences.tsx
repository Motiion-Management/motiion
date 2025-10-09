import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';

import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Tabs } from '~/components/ui/tabs/tabs';
import ChevronRight from '~/lib/icons/ChevronRight';
import { BaseOnboardingScreen } from '~/components/layouts/BaseOnboardingScreen';

interface ProjectItemProps {
  title: string;
  type: string;
  onEdit?: () => void;
}

function ProjectItem({ title, type, onEdit }: ProjectItemProps) {
  return (
    <Pressable
      onPress={onEdit}
      className="flex-row items-center justify-between border-b border-border-tint py-4">
      <View className="flex-1 gap-1">
        <Text variant="body" className="text-text-default">
          {title || 'Untitled Project'}
        </Text>
        <Text variant="labelXs" className="text-text-low">
          {type}
        </Text>
      </View>
      {onEdit && <ChevronRight size={20} className="text-icon-default" />}
    </Pressable>
  );
}

export default function ExperiencesReviewScreen() {
  const experiences = useQuery(api.projects.getMyProjects) || [];
  const training = useQuery(api.training.getMyTraining) || [];
  const [activeTab, setActiveTab] = useState<'projects' | 'training'>('projects');

  const handleEditExperiences = useCallback(() => {
    router.push('/app/onboarding/review/experience/new');
  }, []);

  const handleEditTraining = useCallback(() => {
    router.push('/app/onboarding/review/training/new');
  }, []);

  const handleComplete = useCallback(() => {
    router.push('/app/onboarding/complete');
  }, []);

  // Preload modal module
  useEffect(() => {
    import('../../(modals)/onboarding/review/[step]').catch(() => {});
  }, []);

  return (
    <BaseOnboardingScreen
      title="Review your projects"
      description="Your performance history and training"
      canProgress={true}
      bottomActionSlot={
        <Button size="lg" className="w-full" onPress={handleComplete}>
          <Text>Complete Profile</Text>
        </Button>
      }>
      <View className="flex-1">
        <Tabs
          tabs={[
            { key: 'projects', label: 'Projects' },
            { key: 'training', label: 'Training' },
          ]}
          activeTab={activeTab}
          onTabChange={(k) => setActiveTab(k as 'projects' | 'training')}
          className="mb-4"
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {activeTab === 'projects' && (
            <View>
              <View className="mb-4 flex-row items-center justify-between">
                <Text variant="title3">Projects</Text>
                <Button variant="tertiary" onPress={handleEditExperiences}>
                  <Text className="text-accent-primary">Edit</Text>
                </Button>
              </View>

              {experiences.length === 0 ? (
                <View className="bg-surface-secondary rounded-lg p-4">
                  <Text variant="footnote" className="text-text-secondary text-center">
                    No projects added yet.
                  </Text>
                </View>
              ) : (
                <View>
                  {experiences.slice(0, 5).map((exp: any) => (
                    <ProjectItem
                      key={exp._id}
                      title={exp.title}
                      type={exp.type}
                      onEdit={() => router.push(`/app/onboarding/review/experience/${exp._id}`)}
                    />
                  ))}
                  {experiences.length > 5 && (
                    <Pressable onPress={handleEditExperiences} className="py-4">
                      <Text className="text-accent-primary text-center">
                        +{experiences.length - 5} more projects
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          )}

          {activeTab === 'training' && (
            <View>
              <View className="mb-4 flex-row items-center justify-between">
                <Text variant="title3">Training</Text>
                <Button variant="tertiary" onPress={handleEditTraining}>
                  <Text className="text-accent-primary">Edit</Text>
                </Button>
              </View>

              {training.length === 0 ? (
                <View className="bg-surface-secondary rounded-lg p-4">
                  <Text variant="footnote" className="text-text-secondary text-center">
                    No training added yet.
                  </Text>
                </View>
              ) : (
                <View>
                  {training.slice(0, 5).map((train: any) => (
                    <ProjectItem
                      key={train._id}
                      title={train.institution}
                      type={train.type}
                      onEdit={() => router.push(`/app/onboarding/review/training/${train._id}`)}
                    />
                  ))}
                  {training.length > 5 && (
                    <Pressable onPress={handleEditTraining} className="py-4">
                      <Text className="text-accent-primary text-center">
                        +{training.length - 5} more training
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Edits navigate to /app/onboarding/review/[step] */}
    </BaseOnboardingScreen>
  );
}
