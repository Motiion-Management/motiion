import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Image, Upload } from 'lucide-react-native';

interface HeadshotsFieldV3Props {
  value?: any[];
  onChange: (value: any[]) => void;
  minItems?: number;
  maxItems?: number;
}

export function HeadshotsFieldV3({
  value = [],
  onChange,
  minItems = 1,
  maxItems = 5,
}: HeadshotsFieldV3Props) {
  const handleAddPhoto = () => {
    // TODO: Implement actual photo upload
    console.log('Add photo clicked');
    // For now, just add a placeholder
    if (value.length < maxItems) {
      onChange([...value, { id: Date.now(), placeholder: true }]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap gap-3">
        {value.map((photo, index) => (
          <View key={photo.id || index} className="relative">
            <View className="h-24 w-24 items-center justify-center rounded-lg bg-muted">
              {photo.placeholder ? (
                <Image size={40} className="text-muted-foreground" />
              ) : (
                <Text>Photo {index + 1}</Text>
              )}
            </View>
            <Button
              variant="plain"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive"
              onPress={() => handleRemovePhoto(index)}>
              <Text className="text-xs text-white">×</Text>
            </Button>
          </View>
        ))}

        {value.length < maxItems && (
          <Button variant="outline" className="h-24 w-24" onPress={handleAddPhoto}>
            <View className="items-center gap-1">
              <Upload size={24} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">Add Photo</Text>
            </View>
          </Button>
        )}
      </View>

      <Text className="text-sm text-muted-foreground">
        {value.length} of {maxItems} photos • Minimum {minItems} required
      </Text>
    </View>
  );
}
