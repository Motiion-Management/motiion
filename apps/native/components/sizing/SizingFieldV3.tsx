import React from 'react';
import { View } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Picker, PickerItem } from '~/components/ui/select';
import { InputLabel } from '~/components/ui/label';
import { sizingMetrics } from '~/config/sizingMetrics';

interface SizingFieldV3Props {
  value?: any;
  onChange: (value: any) => void;
}

export function SizingFieldV3({ value, onChange }: SizingFieldV3Props) {
  const form = useFormContext();

  // Initialize with empty object if no value
  const sizingData = value || {
    general: {},
    male: {},
    female: {},
  };

  const updateField = (
    category: 'general' | 'male' | 'female',
    field: string,
    fieldValue: string
  ) => {
    const newValue = {
      ...sizingData,
      [category]: {
        ...sizingData[category],
        [field]: fieldValue,
      },
    };
    onChange(newValue);

    // Also update form values for auto-submit
    form.setValue('sizing', newValue, { shouldValidate: true, shouldDirty: true });
  };

  const renderSection = (
    title: string,
    category: 'general' | 'male' | 'female',
    metricKeys: string[]
  ) => {
    return (
      <View className="mb-6">
        <Text variant="labelXs" className="mb-3 uppercase text-text-low">
          {title}
        </Text>
        <View className="gap-3">
          {metricKeys.map((metricKey) => {
            const metric = sizingMetrics[metricKey];
            if (!metric) return null;

            const fieldValue = sizingData[category]?.[metric.field] || '';

            return (
              <View key={metricKey} className="gap-2">
                <InputLabel>{metric.label}</InputLabel>
                <Picker
                  selectedValue={fieldValue}
                  onValueChange={(val) => updateField(category, metric.field, val)}>
                  <PickerItem label={`Select ${metric.label.toLowerCase()}`} value="" />
                  {metric.values.map((option) => (
                    <PickerItem key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View className="gap-4">
      <Text className="text-sm text-muted-foreground">
        Optional - Not all sizing metrics may apply to you. Only input what is relevant to you.
      </Text>

      {renderSection('General', 'general', ['waist', 'inseam', 'glove', 'hat'])}
      {renderSection('Men', 'male', [
        'chest',
        'neck',
        'sleeve',
        'maleShirt',
        'maleShoes',
        'maleCoatLength',
      ])}
      {renderSection('Women', 'female', [
        'dress',
        'bust',
        'underbust',
        'cup',
        'hip',
        'femaleShirt',
        'pants',
        'femaleShoes',
        'femaleCoatLength',
      ])}
    </View>
  );
}
