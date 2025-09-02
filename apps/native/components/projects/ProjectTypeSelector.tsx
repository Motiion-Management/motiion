import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/cn';
import { PROJECT_TYPE_OPTIONS } from '~/config/projectTypes';
import { type ProjectType } from '~/types/projects';

interface ProjectTypeSelectorProps {
  value?: ProjectType;
  onChange?: (value: ProjectType) => void;
  disabled?: boolean;
}

export function ProjectTypeSelector({ value, onChange, disabled }: ProjectTypeSelectorProps) {
  return (
    <View className="space-y-2">
      <Text variant="label" className="mb-2">
        PROJECT TYPE
      </Text>
      {PROJECT_TYPE_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          disabled={disabled}
          onPress={() => onChange?.(option.value)}
          className={cn(
            'rounded-lg border p-4',
            value === option.value
              ? 'border-border-accent bg-surface-accent'
              : 'border-border-default bg-surface-high'
          )}>
          <Text variant="body" className="font-medium">
            {option.label}
          </Text>
          {option.description && (
            <Text variant="footnote" className="text-text-low">
              {option.description}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Backward compatibility export
export { ProjectTypeSelector as ExperienceTypeSelector };