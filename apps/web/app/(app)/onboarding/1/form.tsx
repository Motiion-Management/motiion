'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import parsePhoneNumber from 'libphonenumber-js'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/form-fields/input'
import { DatePickerField } from '@/components/ui/form-fields/date-picker'
import { SelectField } from '@/components/ui/form-fields/select'
import { LocationField } from '@/components/ui/form-fields/location'
import { AccordionPlus } from './accordion'

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'Please enter your first name.'
  }),
  lastName: z.string().min(2, {
    message: 'Please enter your last name.'
  }),
  displayName: z.string().optional(),
  dateOfBirth: z.string().transform((dateString, ctx) => {
    const date = new Date(dateString)
    if (!z.date().safeParse(date).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date
      })
    }
    return date
  }),
  gender: z.string().min(2, {
    message: 'Please select a gender.'
  }),
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

export function PersonalDetailsFormProvider({
  // children,
  defaultValues
}: {
  // children: React.ReactNode
  defaultValues: Partial<FormSchema>
}) {
  const updateMyUser = useMutation(api.users.updateMyUser)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUseNativeValidation: false,
    defaultValues
  })
  const router = useRouter()
  function onSubmit(data: FormSchema) {
    // updateMyUser(data)
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      )
    })
    setTimeout(() => {
      router.push('/onboarding/2')
    }, 500)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-8 grid grid-cols-2 gap-4"
      >
        <InputField required name="firstName" placeholder="First Name" />
        <InputField required name="lastName" placeholder="Last Name" />
        <AccordionPlus label="Add Display Name">
          <InputField
            name="displayName"
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
        />
        <LocationField name="location" required className="col-span-2" />
        <Button className="col-span-2 w-full" type="submit">
          Continue
        </Button>

        {/* {children} */}
      </form>
    </Form>
  )
}
