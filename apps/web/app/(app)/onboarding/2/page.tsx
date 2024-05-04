'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger
} from '@/components/ui/accordion'
import { InputField } from '@/components/ui/form-fields/input'
import { PlusCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { DatePickerField } from '@/components/ui/form-fields/date-picker'
import { SelectField } from '@/components/ui/form-fields/select'
import { LocationField } from '@/components/ui/form-fields/location'

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'Please enter your first name.'
  }),
  lastName: z.string().min(2, {
    message: 'Please enter your last name.'
  }),
  displayName: z.string(),
  dob: z.date(),
  gender: z.string(),
  phone: z.string(),
  location: z.string()
})

type FormSchema = z.infer<typeof formSchema>

export default function Onboarding1() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {}
  })

  function onSubmit(data: FormSchema) {
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      )
    })
  }

  return (
    <section>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          <InputField required name="firstName" placeholder="First Name" />
          <InputField required name="lastName" placeholder="Last Name" />
          <Accordion type="multiple" className="col-span-2 -mt-4 w-full">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger
                StartIcon={PlusCircle}
                startIconClassName="stroke-card fill-accent h-6 w-6"
              >
                Add Display Name
              </AccordionTrigger>
              <AccordionContent>
                <InputField
                  name="displayName"
                  placeholder="What should we call you?"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <DatePickerField name="dob" label="DOB" className="col-span-2" />
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
        </form>
      </Form>
    </section>
  )
}
