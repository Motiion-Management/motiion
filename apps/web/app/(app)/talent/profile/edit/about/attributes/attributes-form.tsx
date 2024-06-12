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
  HAIRCOLOR
} from '@packages/backend/convex/validators/attributes'
import { MultiCheckboxField } from '@/components/ui/form-fields/multi-checkbox'
import { EditDrawer } from '@/components/features/edit-drawer'
import { HeightPickerField } from '@/components/ui/form-fields/height-picker'
import { RadioGroupField } from '@/components/ui/form-fields/radio-group'
import { formatHeight } from '@/lib/utils'
import { zUsers } from '@packages/backend/convex/validators/users'

const formSchema = zUsers.pick({ attributes: true })

type FormSchema = z.infer<typeof formSchema>

export function AttributesForm({
  preloadedUser
}: {
  preloadedUser: Preloaded<typeof api.users.getMyUser>
}) {
  const updateMyUser = useMutation(api.users.updateMyUser)

  const { attributes } = usePreloadedQuery(preloadedUser) || ({} as FormSchema)
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUseNativeValidation: false,
    defaultValues: { attributes },
    values: { attributes }
  })
  async function onSubmit(data: FormSchema) {
    await updateMyUser(data)
    form.reset({ attributes })
  }

  return (
    <Form {...form}>
      <form
        className="divide-border flex flex-col divide-y"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <EditDrawer<FormSchema>
          label="Ethnicity"
          value={
            <div className="flex flex-col items-start">
              {attributes?.ethnicity?.sort().map((e) => <div key={e}>{e}</div>)}
            </div>
          }
        >
          <MultiCheckboxField name="ethnicity" options={ETHNICITY} />
        </EditDrawer>
        <EditDrawer<FormSchema>
          label="Height"
          value={formatHeight(attributes?.height)}
        >
          <HeightPickerField name="height" label="Height" />
        </EditDrawer>
        <EditDrawer<FormSchema> label="Eyes" value={attributes?.eyeColor}>
          <RadioGroupField name="eyeColor" options={EYECOLOR} />
        </EditDrawer>
        <EditDrawer<FormSchema>
          label="Hair Color"
          value={attributes?.hairColor}
        >
          <RadioGroupField name="hairColor" options={HAIRCOLOR} />
        </EditDrawer>
      </form>
    </Form>
  )
}
