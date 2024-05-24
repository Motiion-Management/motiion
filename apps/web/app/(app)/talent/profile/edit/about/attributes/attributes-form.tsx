'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/form-fields/input'
import { DatePickerField } from '@/components/ui/form-fields/date-picker'
import { SelectField } from '@/components/ui/form-fields/select'
import { LocationField } from '@/components/ui/form-fields/location'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { ONBOARDING_STEPS } from '@packages/backend/convex/users'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ethnicity } from '@packages/backend/convex/zod-validators'

const formSchema = z.object({
  ethnicity: ethnicity,
  height,
  eyeColor: z.string().optional(),
  hairColor: z.string().optional()
})

type FormSchema = z.infer<typeof formSchema>

export function PersonalDetailsFormProvider({
  defaultValues
}: {
  defaultValues: Partial<FormSchema>
}) {
  const updateMyUser = useMutation(api.resumes.updateMyAttributes)

  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUseNativeValidation: false,
    defaultValues
  })
  async function onSubmit(data: FormSchema) {
    router.prefetch('/onboarding/2')
    setLoading(true)
    await updateMyUser(data)
    router.push('/onboarding/2')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-4 grid h-full w-full grid-cols-1 grid-rows-[1fr_min-content] gap-4"
      >
        <div className="grid h-fit w-full grid-cols-2 gap-6 ">
          <InputField required name="firstName" placeholder="First Name" />
          <InputField required name="lastName" placeholder="Last Name" />
          <DatePickerField
            name="dateOfBirth"
            label="DOB"
            className="col-span-2"
          />
          <SelectField
            name="gender"
            label="I identify as"
            options={['Male', 'Female', 'Non-Binary']}
          />

          <InputField
            required
            name="phone"
            placeholder="Phone Number"
            label="Contact"
            inputMode="tel"
          />
          <LocationField name="location" required className="col-span-2" />
        </div>
        <Button
          className="sticky bottom-0 z-10 mt-2 shadow-lg"
          type="submit"
          loading={loading}
        >
          Continue
        </Button>

        {/* {children} */}
      </form>
    </Form>
  )
}
