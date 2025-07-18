'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '../components/ui/form'
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
  NECK,
  CHEST,
  SLEEVE,
  SHOESMEN,
  GLOVE,
  HAT,
  INSEAM,
  WAIST,
  sizingPlainObject
} from '@packages/backend/convex/validators/sizing'
import { GENDER } from '@packages/backend/convex/validators/base'
import { FieldValues, useFormContext } from 'react-hook-form'
import { EditDrawer, EditDrawerProps } from '../components/features/edit-drawer'
import {
  WheelPickerField,
  WheelPickerColumnValues
} from '../components/ui/form-fields/wheel-picker'
import { UNITS, formatSizeValue } from '../lib/utils'

const formSchema = z.object(sizingPlainObject)
type FormSchema = z.infer<typeof formSchema>

// Sizing Drawer Component
export interface SizingDrawerProps extends Omit<EditDrawerProps, 'children'> {
  section: string
  column: string
  values: WheelPickerColumnValues
  unit?: keyof typeof UNITS
}

export function SizingDrawer<T extends FieldValues>({
  section,
  column,
  unit,
  values,
  ...rest
}: SizingDrawerProps) {
  const form = useFormContext<T>()

  const value = formatSizeValue(form.getValues()?.[section]?.[column], unit)
  const options = { [column]: { values, unit } }

  return (
    <EditDrawer<T> value={value} {...rest}>
      <WheelPickerField name={section} options={options} />
    </EditDrawer>
  )
}

// Female Sizing Form
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

// Male Sizing Form
function MaleSizingDrawer(props: Omit<SizingDrawerProps, 'section'>) {
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
          label="Neck"
          column="neck"
          values={NECK}
          unit="inches"
        />
        <MaleSizingDrawer
          label="Chest"
          column="chest"
          values={CHEST}
          unit="inches"
        />
        <MaleSizingDrawer
          label="Sleeve"
          column="sleeve"
          values={SLEEVE}
          unit="inches"
        />
        <MaleSizingDrawer
          label="Coat Length"
          column="coatLength"
          values={COATLENGTH}
          unit="inches"
        />
        <MaleSizingDrawer label="Shirt" column="shirt" values={SHIRT} />
        <MaleSizingDrawer label="Shoes" column="shoes" values={SHOESMEN} />
      </form>
    </Form>
  )
}

// General Sizing Form
function GeneralSizingDrawer(props: Omit<SizingDrawerProps, 'section'>) {
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
          label="Waist"
          column="waist"
          values={WAIST}
          unit="inches"
        />
        <GeneralSizingDrawer
          label="Inseam"
          column="inseam"
          values={INSEAM}
          unit="inches"
        />
        <GeneralSizingDrawer label="Glove" column="glove" values={GLOVE} />
        <GeneralSizingDrawer label="Hat" column="hat" values={HAT} />
      </form>
    </Form>
  )
}

export { formSchema as sizingFormSchema }
export type { FormSchema as SizingFormSchema }