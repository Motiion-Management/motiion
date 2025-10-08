import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Button } from '~/components/ui/button';
import X from '~/lib/icons/X';
import { ProjectEditForm } from '~/components/projects/ProjectEditForm';

export default function ExperienceEditModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id || id === 'new';

  return (
    <View className="flex-1 bg-surface-default pt-6">
      <View className="absolute right-2 top-2 z-10">
        <Button size="icon" variant="tertiary" onPress={() => router.back()}>
          <X size={24} className="text-icon-default" />
        </Button>
      </View>

      <ProjectEditForm
        onComplete={() => router.back()}
        projectId={isNew ? undefined : (id as any)}
      />
    </View>
  );
}
