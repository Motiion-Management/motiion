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

interface CommercialFormProps {
  initialData?: Partial<Experience>;
  onChange: (data: Partial<Experience>) => void;
}

// Declarative schema for Commercial experiences
const commercialSchema = z.object({
  type: z.literal('commercial'),
  companyName: z.string().min(1, 'Company name is required'),
  campaignTitle: z.string().min(1, 'Campaign title is required'),
  productionCompany: z.string().optional(),
  startDate: z.string(),
  duration: z.string(),
  link: z.string().optional(),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

type CommercialFormValues = z.infer<typeof commercialSchema>;

export function CommercialForm({ initialData = {}, onChange }: CommercialFormProps) {
  const form = useAppForm({
    defaultValues: {
      type: 'commercial' as const,
      companyName: (initialData as any).companyName || '',
      campaignTitle: (initialData as any).campaignTitle || '',
      productionCompany: (initialData as any).productionCompany || '',
      startDate: initialData.startDate || '',
      duration: initialData.duration || '',
      link: initialData.link || '',
      roles: initialData.roles || [],
    } satisfies CommercialFormValues,
    validators: {
      onChange: commercialSchema as any,
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
        name="companyName"
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <TextInput label="Company/Brand" placeholder="Enter company or brand name" />
          </fieldContext.Provider>
        )}
      />

      <form.Field
        name="campaignTitle"
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <TextInput label="Campaign Title" placeholder="Enter campaign or project title" />
          </fieldContext.Provider>
        )}
      />

      <form.Field
        name="productionCompany"
        children={(fieldApi) => (
          <fieldContext.Provider value={fieldApi}>
            <TextInput
              label="Production Company (Optional)"
              placeholder="Enter production company"
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
            <TextInput label="Link (Optional)" placeholder="Paste link to commercial/campaign" />
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
