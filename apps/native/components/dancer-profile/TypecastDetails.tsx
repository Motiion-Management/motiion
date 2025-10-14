import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { type Doc } from '@packages/backend/convex/_generated/dataModel';
import { formatHeight } from '~/lib/utils';

interface TypecastDetailsProps {
  dancer: Doc<'dancers'>;
  variant?: 'default' | 'share-card';
}

function truncateValue(value: string | undefined, maxLength: number = 3): string {
  if (!value) return '-';
  if (value.length <= maxLength) return value;
  return value.substring(0, maxLength);
}

function formatGender(gender: string | undefined): string {
  if (!gender) return '-';
  return gender.charAt(0).toUpperCase();
}

function formatEthnicity(ethnicity: string[] | undefined): string {
  if (!ethnicity || ethnicity.length === 0) return '-';
  // Join and truncate
  const combined = ethnicity.join('/');
  return truncateValue(combined, 3);
}

export function TypecastDetails({ dancer, variant = 'default' }: TypecastDetailsProps) {
  const { attributes } = dancer;

  if (!attributes) return null;

  const stats = [
    { label: 'Gen', value: formatGender(attributes.gender) },
    { label: 'Height', value: formatHeight(attributes.height) || '-' },
    { label: 'Race', value: formatEthnicity(attributes.ethnicity) },
    { label: 'Eyes', value: truncateValue(attributes.eyeColor) },
    { label: 'Hair', value: truncateValue(attributes.hairColor) },
  ];

  const isShareCard = variant === 'share-card';
  const itemGap = isShareCard ? 'gap-2' : 'gap-6';
  const valueLabelGap = isShareCard ? 'gap-0.5' : 'gap-1';
  const valueVariant = isShareCard ? 'caption2' : 'body';
  const labelVariant = isShareCard ? 'caption2' : 'labelXs';

  return (
    <View className="flex-col gap-2">
      {/* Values row */}
      <View className={`flex-row items-center justify-center ${itemGap}`}>
        {stats.map((stat, index) => (
          <View key={index} className={`items-center justify-center ${valueLabelGap}`}>
            <Text variant={valueVariant} className="text-center text-text-default">
              {stat.value}
            </Text>
            <Text variant={labelVariant} className="text-center uppercase text-text-low">
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
