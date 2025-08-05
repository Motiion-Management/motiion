import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useStore } from '@tanstack/react-form';
import * as z from 'zod';

import { useAppForm } from '~/components/form/appForm';
import { fieldContext } from '~/components/form/context';
import { TextInput } from '~/components/form/TextInput';
import { SelectField } from '~/components/form/SelectField';
import { ChipsField } from '~/components/form/ChipsField';
import { DateInput } from '~/components/form/DateInput';
import { debounce } from '~/lib/debounce';
import { DURATION_OPTIONS, COMMON_ROLES } from '~/config/experienceTypes';
import { Experience } from '~/types/experiences';

interface MusicVideoFormProps {
  initialData?: Partial<Experience>;
  onChange: (data: Partial<Experience>) => void;
}

// Declarative schema for Music Video experiences
const musicVideoSchema = z.object({
  type: z.literal('music-video'),
  songTitle: z.string().min(1, 'Song title is required'),
  artists: z.array(z.string()).min(1, 'At least one artist is required'),
  startDate: z.string(),
  duration: z.string(),
  link: z.string().optional(),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

type MusicVideoFormValues = z.infer<typeof musicVideoSchema>;

export function MusicVideoForm({ initialData = {}, onChange }: MusicVideoFormProps) {
  const form = useAppForm({
    defaultValues: {
      type: 'music-video' as const,
      songTitle: (initialData as any).songTitle || '',
      artists: (initialData as any).artists || [],
      startDate: initialData.startDate || '',
      duration: initialData.duration || '',
      link: initialData.link || '',
      roles: initialData.roles || [],
    } satisfies MusicVideoFormValues,
    validators: {
      onChange: musicVideoSchema as any,
    },
    onSubmit: async ({ value }) => {
      onChange(value);
    },
  });

  // Watch for form changes and notify parent
  const notifyChange = useMemo(
    () =>
      debounce(() => {
        onChange(form.state.values);
      }, 300),
    [onChange]
  );

  // Subscribe to form state changes
  const formValues = useStore(form.store, (state) => state.values);

  useEffect(() => {
    notifyChange();
  }, [formValues, notifyChange]);

  return (
    <View className="gap-4">
      <form.Field
        name="songTitle"
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <TextInput label="Song Title" placeholder="Enter song title" />
          </fieldContext.Provider>
        )}
      />

      <form.Field
        name="artists"
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <ChipsField
              label="Artist(s)"
              placeholder="Enter artist names separated by commas"
              helpText="Add all featured artists"
            />
          </fieldContext.Provider>
        )}
      />

      <form.Field
        name="startDate"
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <DateInput label="Start Date" />
          </fieldContext.Provider>
        )}
      />

      <form.Field
        name="duration"
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <SelectField
              label="Duration"
              placeholder="Select duration"
              options={DURATION_OPTIONS}
            />
          </fieldContext.Provider>
        )}
      />

      <form.Field
        name="link"
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <TextInput label="Link (Optional)" placeholder="Paste link to music video" />
          </fieldContext.Provider>
        )}
      />

      <form.Field
        name="roles"
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <ChipsField
              label="Your Role(s)"
              placeholder="Enter roles separated by commas"
              helpText={`Common roles: ${COMMON_ROLES.slice(0, 3).join(', ')}...`}
            />
          </fieldContext.Provider>
        )}
      />
    </View>
  );
}
