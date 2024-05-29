'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import {
  ETHNICITY,
  EYECOLOR,
  HAIRCOLOR,
  attributesPlainObject
} from '@packages/backend/convex/validators/resume'
import { MultiCheckboxField } from '@/components/ui/form-fields/multi-checkbox'
import { EditDrawer } from '@/components/features/edit-drawer'
import { HeightPickerField } from '@/components/ui/form-fields/height-picker'
import { RadioGroupField } from '@/components/ui/form-fields/radio-group'

const formSchema = z.object(attributesPlainObject)

type FormSchema = z.infer<typeof formSchema>

export function AttributesForm({
  preloadedValues
  // defaultValues
}: {
  preloadedValues: Preloaded<typeof api.resumes.getMyAttributes>
  // defaultValues: Partial<FormSchema>
}) {
  const updateMyAttributes = useMutation(api.resumes.updateMyAttributes)

  const attributes = usePreloadedQuery(preloadedValues) || ({} as FormSchema)
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    // mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: attributes,
    values: attributes
  })
  async function onSubmit(data: FormSchema) {
    await updateMyAttributes(data)
    form.reset(attributes)
  }

  return (
    <Form {...form}>
      <form
        className="divide-border flex flex-col divide-y"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <EditDrawer<FormSchema>
          onSubmit={onSubmit}
          label="Ethnicity"
          value={
            <div className="flex flex-col items-start">
              {attributes.ethnicity?.sort().map((e) => <div key={e}>{e}</div>)}
            </div>
          }
        >
          <MultiCheckboxField
            name="ethnicity"
            options={ETHNICITY as unknown as string[]}
          />
        </EditDrawer>
        <EditDrawer<FormSchema>
          onSubmit={onSubmit}
          label="Height"
          value={attributes.height && formatHeight(attributes.height)}
        >
          <HeightPickerField name="height" label="Height" />
        </EditDrawer>
        <EditDrawer<FormSchema>
          onSubmit={onSubmit}
          label="Eyes"
          value={attributes.eyeColor}
        >
          <RadioGroupField
            name="eyeColor"
            options={EYECOLOR as unknown as string[]}
          />
        </EditDrawer>
        <EditDrawer<FormSchema>
          onSubmit={onSubmit}
          label="Hair Color"
          value={attributes.hairColor}
        >
          <RadioGroupField
            name="hairColor"
            options={HAIRCOLOR as unknown as string[]}
          />
        </EditDrawer>
      </form>
    </Form>
  )
}

function formatHeight(height?: { feet: number; inches: number }) {
  if (!height) return ''
  return `${height.feet}' ${height.inches}"`
}
