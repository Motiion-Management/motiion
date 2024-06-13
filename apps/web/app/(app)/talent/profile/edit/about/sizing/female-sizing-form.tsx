'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import {
  BUST,
  HIPS,
  UNDERBUST,
  CUP,
  COATLENGTH,
  SHIRT,
  DRESSORPANT,
  SHOESWOMEN,
  sizingPlainObject
} from '@packages/backend/convex/validators/sizing'
import { GENDER } from '@packages/backend/convex/validators/base'
import { SizingDrawer, SizingDrawerProps } from './sizing-drawer'

const formSchema = z.object(sizingPlainObject)

type FormSchema = z.infer<typeof formSchema>

function FemaleSizingDrawer(props: Omit<SizingDrawerProps, 'section'>) {
  return <SizingDrawer<FormSchema> section="female" {...props} />
}

export function FemaleSizingForm({
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
    // mode: 'onBlur',
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
        <FemaleSizingDrawer
          label="Hips"
          column="hips"
          values={HIPS}
          unit="inches"
        />
        <FemaleSizingDrawer
          label="Bust"
          column="bust"
          values={BUST}
          unit="inches"
        />
        <FemaleSizingDrawer
          label="Underbust"
          column="underbust"
          values={UNDERBUST}
          unit="inches"
        />
        <FemaleSizingDrawer label="Cup" column="cup" values={CUP} />
        <FemaleSizingDrawer
          label="Coat Length"
          column="coatLength"
          values={COATLENGTH}
          unit="inches"
        />
        <FemaleSizingDrawer label="Shirt" column="shirt" values={SHIRT} />
        <FemaleSizingDrawer label="Dress" column="dress" values={DRESSORPANT} />
        <FemaleSizingDrawer label="Pants" column="pants" values={DRESSORPANT} />
        <FemaleSizingDrawer label="Shoes" column="shoes" values={SHOESWOMEN} />
      </form>
    </Form>
  )
}
