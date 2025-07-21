import React from 'react';
import { View } from 'react-native';

import { type SizingFormData } from '~/components/form/SizingValidator';
import { Text } from '~/components/ui/text';
import { sizingMetrics } from '~/config/sizingMetrics';

interface FormFieldProps {
  SizingFormField: React.ComponentType<{
    metric: (typeof sizingMetrics)[keyof typeof sizingMetrics];
  }>;
}

interface AppFieldProps {
  name: string;
  children: (field: FormFieldProps) => React.ReactNode;
}

interface SizingForm {
  AppField: any; // TanStack Form's FieldComponent type
}

interface SizingSectionProps {
  title: string;
  metrics: string[];
  form: SizingForm;
}

export function SizingSection({ title, metrics, form }: SizingSectionProps) {
  return (
    <View className="mb-6">
      <Text variant="labelXs" className="mb-3 uppercase text-text-low">
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {metrics.map((metricKey) => {
          const metric = sizingMetrics[metricKey];
          if (!metric) return null;

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
