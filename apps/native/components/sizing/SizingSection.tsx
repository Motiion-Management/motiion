import React from 'react';
import { View } from 'react-native';

import { SizingMetric } from './SizingMetric';
import { Text } from '~/components/ui/text';
import { sizingMetrics } from '~/config/sizingMetrics';

interface SizingSectionProps {
  title: string;
  metrics: string[];
}

export function SizingSection({ title, metrics }: SizingSectionProps) {
  return (
    <View className="mb-6">
      <Text variant="labelXs" className="mb-3 uppercase text-text-low">
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {metrics.map((metricKey) => {
          const metric = sizingMetrics[metricKey];
          if (!metric) return null;

          return <SizingMetric key={metricKey} metric={metric} />;
        })}
      </View>
    </View>
  );
}
