'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import {
  ETHNICITY,
  attributesPlainObject
} from '@packages/backend/convex/validators/resume'
import { MultiCheckboxField } from '@/components/ui/form-fields/multi-checkbox'
import { EditDrawer } from '@/components/features/edit-drawer'

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
    defaultValues: attributes
  })
  async function onSubmit(data: FormSchema) {
    await updateMyAttributes(data)
    form.reset()
  }

  return (
    <Form {...form}>
      <form
        className="divide-border flex flex-col divide-y"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <EditDrawer
          onSubmit={form.handleSubmit(onSubmit)}
          label="Ethnicity"
          value={
            <div className="flex flex-col items-start">
              {attributes.ethnicity?.sort().map((e) => <div>{e}</div>)}
            </div>
          }
        >
          <MultiCheckboxField
            name="ethnicity"
            options={ETHNICITY as unknown as string[]}
          />
        </EditDrawer>
        <EditDrawer
          onSubmit={form.handleSubmit(onSubmit)}
          label="Height"
          value={inchesToFeetAndInches(attributes.height || 0)}
        >
          ''
        </EditDrawer>
      </form>
    </Form>
  )
}

function inchesToFeetAndInches(inches: number) {
  // Convert inches to feet.
  const feet = Math.floor(inches / 12)

  // Get the remaining inches.
  const remainingInches = inches % 12

  // Return the result as a string.
  return `${feet} ft. ${remainingInches} in.`
}
