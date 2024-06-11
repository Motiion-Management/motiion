'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import {
  NECK,
  CHEST,
  SLEEVE,
  COATLENGTH,
  SHIRT,
  SHOESMEN,
  sizingPlainObject
} from '@packages/backend/convex/validators/sizing'
import { GENDER } from '@packages/backend/convex/validators/base'
import { SizingDrawer, SizingDrawerProps } from './sizing-drawer'

const formSchema = z.object(sizingPlainObject)

type FormSchema = z.infer<typeof formSchema>

function MaleSizingDrawer(
  props: Omit<SizingDrawerProps<FormSchema>, 'section'>
) {
  return <SizingDrawer<FormSchema> section="male" {...props} />
}

export function MaleSizingForm({
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
        <MaleSizingDrawer
          onSubmit={onSubmit}
          label="Neck"
          column="neck"
          values={NECK}
          unit="inches"
        />
        <MaleSizingDrawer
          onSubmit={onSubmit}
          label="Chest"
          column="chest"
          values={CHEST}
          unit="inches"
        />
        <MaleSizingDrawer
          onSubmit={onSubmit}
          label="Sleeve"
          column="sleeve"
          values={SLEEVE}
          unit="inches"
        />
        <MaleSizingDrawer
          onSubmit={onSubmit}
          label="Coat Length"
          column="coatLength"
          values={COATLENGTH}
          unit="inches"
        />
        <MaleSizingDrawer
          onSubmit={onSubmit}
          label="Shirt"
          column="shirt"
          values={SHIRT}
        />
        <MaleSizingDrawer
          onSubmit={onSubmit}
          label="Shoes"
          column="shoes"
          values={SHOESMEN}
        />
      </form>
    </Form>
  )
}
