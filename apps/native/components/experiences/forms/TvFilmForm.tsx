import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useStore } from '@tanstack/react-form';
import * as z from 'zod';

import { useAppForm } from '~/components/form/appForm';
import { debounce } from '~/lib/debounce';
import { DURATION_OPTIONS, COMMON_STUDIOS, COMMON_ROLES } from '~/config/experienceTypes';
import { Experience } from '~/types/experiences';

interface TvFilmFormProps {
  initialData?: Partial<Experience>;
  onChange: (data: Partial<Experience>) => void;
}

// Declarative schema for TV/Film experiences
const tvFilmSchema = z.object({
  type: z.literal('tv-film'),
  title: z.string().min(1, 'Title is required'),
  studio: z.string().min(1, 'Studio is required'),
  startDate: z.string(),
  duration: z.string(),
  link: z.string().optional(),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

type TvFilmFormValues = z.infer<typeof tvFilmSchema>;

export function TvFilmForm({ initialData = {}, onChange }: TvFilmFormProps) {
  const form = useAppForm({
    defaultValues: {
      type: 'tv-film' as const,
      title: (initialData as any).title || '',
      studio: (initialData as any).studio || '',
      startDate: initialData.startDate || '',
      duration: initialData.duration || '',
      link: initialData.link || '',
      roles: initialData.roles || [],
    } satisfies TvFilmFormValues,
    validators: {
      onChange: tvFilmSchema as any,
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

  const studioOptions = COMMON_STUDIOS.map((studio) => ({ value: studio, label: studio }));

  return (
    <View className="gap-4">
      <form.AppField
        name="title"
        children={(field) => (
          <field.TextInput label="Title" placeholder="Enter project title" />
        )}
      />

      <form.AppField
        name="studio"
        children={(field) => (
          <field.BottomSheetComboboxField
            label="Studio"
            placeholder="Select or enter studio"
            data={studioOptions}
          />
        )}
      />

      <View className="flex-row gap-4">
        <View className="flex-1">
          <form.AppField
            name="startDate"
            children={(field) => <field.DateInput label="Start Date" />}
          />
        </View>

        <View className="flex-1">
          <form.AppField
            name="duration"
            children={(field) => (
              <field.SelectField
                label="Duration"
                placeholder="Select duration"
                options={DURATION_OPTIONS}
              />
            )}
          />
        </View>
      </View>

      <form.AppField
        name="link"
        children={(field) => (
          <field.TextInput label="Link (Optional)" placeholder="Paste link for project visual" />
        )}
      />

      <form.AppField
        name="roles"
        children={(field) => (
          <field.ChipsField
            label="Your Role(s)"
            placeholder="Enter roles separated by commas"
            helpText={`Common roles: ${COMMON_ROLES.slice(0, 3).join(', ')}...`}
          />
        )}
      />
    </View>
  );
}
