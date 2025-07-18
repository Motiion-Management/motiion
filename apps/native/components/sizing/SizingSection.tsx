import React from 'react';
import { View } from 'react-native';

import { SizingFormData } from '~/components/form/SizingValidator';
import { Text } from '~/components/ui/text';
import { sizingMetrics } from '~/config/sizingMetrics';

interface SizingSectionProps {
  title: string;
  metrics: string[];
  form: any; // Will be typed properly when we refactor the form
}

export function SizingSection({ title, metrics, form }: SizingSectionProps) {
  return (
    <View className="mb-6">
      <Text variant="body" className="text-text-secondary mb-3 uppercase">
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {metrics.map((metricKey) => {
          const metric = sizingMetrics[metricKey];
          if (!metric) return null;

          // Build field path for nested form structure
          const fieldPath = `${metric.section}.${metric.field}` as keyof SizingFormData;

          return (
            <form.AppField
              key={metricKey}
              name={fieldPath}
              children={(field: any) => <field.SizingFormField metric={metric} />}
            />
          );
        })}
      </View>
    </View>
  );
}
