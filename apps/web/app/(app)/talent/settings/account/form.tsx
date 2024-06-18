'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import parsePhoneNumber from 'libphonenumber-js'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/form-fields/input'
import {
  DatePickerField,
  zDateStringResolver
} from '@/components/ui/form-fields/date-picker'
import { SelectField } from '@/components/ui/form-fields/select'
import { LocationField } from '@/components/ui/form-fields/location'
import {
  ONBOARDING_STEPS,
  UserDoc
} from '@packages/backend/convex/validators/users'
import { AccordionPlus } from '@/components/ui/accordion-plus'

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'Please enter your first name.'
  }),
  lastName: z.string().min(2, {
    message: 'Please enter your last name.'
  }),
  displayName: z.string().optional(),
  dateOfBirth: zDateStringResolver,
  gender: z.union([
    z.literal('Male'),
    z.literal('Female'),
    z.literal('Non-Binary')
  ]),
  phone: z
    .string()
    .min(7, {
      message: 'Please enter your phone number.'
    })
    .transform((value, ctx) => {
      const phoneNumber = parsePhoneNumber(value, {
        defaultCountry: 'US'
      })

      if (!phoneNumber?.isValid()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid phone number'
        })
        return z.NEVER
      }

      return phoneNumber.formatInternational()
    }),
  location: z.object({
    country: z.string(),
    state: z.string(),
    city: z.string()
  })
})

type FormSchema = z.infer<typeof formSchema>

export function AccountDetailsFormProvider({ user }: { user: UserDoc }) {
  const updateMyUser = useMutation(api.users.update)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUseNativeValidation: false,
    defaultValues: user
  })
  async function onSubmit(data: FormSchema) {
    await updateMyUser({
      id: user._id,
      patch: { ...data, onboardingStep: ONBOARDING_STEPS.HEADSHOTS }
    })
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
          <AccordionPlus label="Add Display Name" className="col-span-2 pl-4">
            <InputField
              name="displayName"
              label=""
              placeholder="What should we call you?"
            />
          </AccordionPlus>
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
        <Button className="sticky bottom-0 z-10 mt-2 shadow-lg" type="submit">
          Save
        </Button>

        {/* {children} */}
      </form>
    </Form>
  )
}
