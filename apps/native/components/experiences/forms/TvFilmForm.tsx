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
import { DURATION_OPTIONS, COMMON_STUDIOS, COMMON_ROLES } from '~/config/experienceTypes';
import { Experience } from '~/types/experiences';
import { BottomSheetCombobox } from '~/components/ui/bottom-sheet-combobox';

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
      <form.Field
        name="title"
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <TextInput label="Title" placeholder="Enter project title" />
          </fieldContext.Provider>
        )}
      />

      <BottomSheetCombobox
        label="Studio"
        placeholder="Select or enter studio"
        data={studioOptions}
        onChange={(value) => form.setFieldValue('studio', value)}
      />
      <form.Field
        name="studio"
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <SelectField
              label="Studio"
              placeholder="Select or enter studio"
              options={studioOptions}
            />
          </fieldContext.Provider>
        )}
      />

      <View className="flex-row gap-4">
        <View className="flex-1">
          <form.Field
            name="startDate"
            children={(fieldApi) => (
              <fieldContext.Provider value={fieldApi}>
                <DateInput label="Start Date" />
              </fieldContext.Provider>
            )}
          />
        </View>

        <View className="flex-1">
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
        </View>
      </View>

      <form.Field
        name="link"
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <TextInput label="Link (Optional)" placeholder="Paste link for project visual" />
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
