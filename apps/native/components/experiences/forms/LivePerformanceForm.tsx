import React, { useEffect, useMemo } from 'react'
import { View } from 'react-native'
import { useStore } from '@tanstack/react-form'
import * as z from 'zod'

import { useAppForm } from '~/components/form/appForm'
import { fieldContext } from '~/components/form/context'
import { TextInput } from '~/components/form/TextInput'
import { SelectField } from '~/components/form/SelectField'
import { ChipsField } from '~/components/form/ChipsField'
import { DateInput } from '~/components/form/DateInput'
import { debounce } from '~/lib/debounce'
import { LIVE_EVENT_TYPES, DURATION_OPTIONS, COMMON_ROLES } from '~/config/experienceTypes'
import { Experience, LivePerformanceEventType } from '~/types/experiences'

interface LivePerformanceFormProps {
  initialData?: Partial<Experience>
  onChange: (data: Partial<Experience>) => void
}

// Declarative schema for Live Performance experiences
const livePerformanceSchema = z.object({
  type: z.literal('live-performance'),
  eventType: z.enum([
    'festival',
    'tour',
    'concert',
    'corporate',
    'award-show',
    'theater',
    'other',
  ] as const),
  festivalTitle: z.string().optional(),
  tourName: z.string().optional(),
  tourArtist: z.string().optional(),
  companyName: z.string().optional(),
  eventName: z.string().optional(),
  awardShowName: z.string().optional(),
  productionTitle: z.string().optional(),
  venue: z.string().optional(),
  startDate: z.string(),
  duration: z.string(),
  link: z.string().optional(),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
})

type LivePerformanceFormValues = z.infer<typeof livePerformanceSchema>

export function LivePerformanceForm({ initialData = {}, onChange }: LivePerformanceFormProps) {
  const form = useAppForm({
    defaultValues: {
      type: 'live-performance' as const,
      eventType: ((initialData as any).eventType as LivePerformanceEventType) || 'festival',
      festivalTitle: (initialData as any).festivalTitle || '',
      tourName: (initialData as any).tourName || '',
      tourArtist: (initialData as any).tourArtist || '',
      companyName: (initialData as any).companyName || '',
      eventName: (initialData as any).eventName || '',
      awardShowName: (initialData as any).awardShowName || '',
      productionTitle: (initialData as any).productionTitle || '',
      venue: (initialData as any).venue || '',
      startDate: initialData.startDate || '',
      duration: initialData.duration || '',
      link: initialData.link || '',
      roles: initialData.roles || [],
    } satisfies LivePerformanceFormValues,
    validators: {
      onChange: livePerformanceSchema as any,
    },
    onSubmit: async ({ value }) => {
      onChange(value)
    },
  })

  // Watch for form changes and notify parent
  const notifyChange = useMemo(
    () =>
      debounce(() => {
        onChange(form.state.values)
      }, 300),
    [onChange]
  )

  // Subscribe to form state changes
  const formValues = useStore(form.store, (state) => state.values)
  const eventType = formValues.eventType

  useEffect(() => {
    notifyChange()
  }, [formValues, notifyChange])

  return (
    <View className="gap-4">
        <form.Field
          name="eventType"
          children={(fieldApi) => (
            <fieldContext.Provider value={fieldApi}>
              <SelectField
                label="Event Type"
                placeholder="Select event type"
                options={LIVE_EVENT_TYPES}
              />
            </fieldContext.Provider>
          )}
        />

        {eventType === 'festival' && (
          <form.Field
            name="festivalTitle"
            children={(fieldApi) => (
              <fieldContext.Provider value={fieldApi}>
                <TextInput label="Festival Name" placeholder="Enter festival name" />
              </fieldContext.Provider>
            )}
          />
        )}

        {eventType === 'tour' && (
          <form.Field
            name="tourName"
            children={(fieldApi) => (
              <fieldContext.Provider value={fieldApi}>
                <TextInput label="Tour Name" placeholder="Enter tour name" />
              </fieldContext.Provider>
            )}
          />
        )}

        {eventType === 'concert' && (
          <form.Field
            name="eventName"
            children={(fieldApi) => (
              <fieldContext.Provider value={fieldApi}>
                <TextInput label="Concert Name" placeholder="Enter concert name" />
              </fieldContext.Provider>
            )}
          />
        )}

        {eventType === 'award-show' && (
          <form.Field
            name="awardShowName"
            children={(fieldApi) => (
              <fieldContext.Provider value={fieldApi}>
                <TextInput label="Award Show Name" placeholder="Enter award show name" />
              </fieldContext.Provider>
            )}
          />
        )}

        {eventType === 'theater' && (
          <form.Field
            name="productionTitle"
            children={(fieldApi) => (
              <fieldContext.Provider value={fieldApi}>
                <TextInput label="Production Name" placeholder="Enter production name" />
              </fieldContext.Provider>
            )}
          />
        )}

        {eventType === 'corporate' && (
          <form.Field
            name="companyName"
            children={(fieldApi) => (
              <fieldContext.Provider value={fieldApi}>
                <TextInput label="Corporate Client" placeholder="Enter client name" />
              </fieldContext.Provider>
            )}
          />
        )}

        {eventType === 'other' && (
          <form.Field
            name="eventName"
            children={(fieldApi) => (
              <fieldContext.Provider value={fieldApi}>
                <TextInput label="Event Name" placeholder="Enter event name" />
              </fieldContext.Provider>
            )}
          />
        )}

        <form.Field
          name="venue"
          children={(fieldApi) => (
            <fieldContext.Provider value={fieldApi}>
              <TextInput label="Venue (Optional)" placeholder="Enter venue name" />
            </fieldContext.Provider>
          )}
        />

        {eventType === 'tour' && (
          <form.Field
            name="tourArtist"
            children={(fieldApi) => (
              <fieldContext.Provider value={fieldApi}>
                <TextInput label="Tour Artist" placeholder="Enter artist name" />
              </fieldContext.Provider>
            )}
          />
        )}

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
              <TextInput label="Link (Optional)" placeholder="Paste link to performance" />
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
  )
}