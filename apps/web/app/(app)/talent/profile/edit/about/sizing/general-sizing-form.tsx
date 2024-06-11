'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import {
  GLOVE,
  HAT,
  INSEAM,
  WAIST,
  sizingPlainObject
} from '@packages/backend/convex/validators/sizing'
import { GENDER } from '@packages/backend/convex/validators/base'
import { SizingDrawer, SizingDrawerProps } from './sizing-drawer'

const formSchema = z.object(sizingPlainObject)

type FormSchema = z.infer<typeof formSchema>

function GeneralSizingDrawer(
  props: Omit<SizingDrawerProps<FormSchema>, 'section'>
) {
  return <SizingDrawer<FormSchema> section="general" {...props} />
}

export function GeneralSizingForm({
  preloadedValues
}: {
  preloadedValues: Preloaded<typeof api.users.getMyUser>
}) {
  const updateMyUser = useMutation(api.users.updateMyUser)

  const { sizing } = usePreloadedQuery(preloadedValues) || {
    sizing: {} as FormSchema,
    gender: 'Non-Binary' as (typeof GENDER)[2]
  }
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUseNativeValidation: false,
    defaultValues: sizing,
    values: sizing
  })
  async function onSubmit(data: FormSchema) {
    await updateMyUser({ sizing: data })
    form.reset(sizing)
  }

  return (
    <Form {...form}>
      <form
        className="divide-border flex flex-col divide-y"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <GeneralSizingDrawer
          onSubmit={onSubmit}
          label="Waist"
          column="waist"
          values={WAIST}
          unit="inches"
        />
        <GeneralSizingDrawer
          onSubmit={onSubmit}
          label="Inseam"
          column="inseam"
          values={INSEAM}
          unit="inches"
        />
        <GeneralSizingDrawer
          onSubmit={onSubmit}
          label="Glove"
          column="glove"
          values={GLOVE}
        />
        <GeneralSizingDrawer
          onSubmit={onSubmit}
          label="Hat"
          column="hat"
          values={HAT}
        />
      </form>
    </Form>
  )
}
