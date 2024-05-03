'use client'
import './splash.css'

import { PlaceKit } from '@placekit/autocomplete-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { InputField } from '@/components/ui/form-fields/input'
import { PlusCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'Please enter your first name.'
  }),
  lastName: z.string().min(2, {
    message: 'Please enter your last name.'
  }),
  displayName: z.string(),
  dob: z.string().date(),
  gender: z.string(),
  contact: z.string(),
  location: z.string()
})

export default function ProfileForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      displayName: '',
      dob: '',
      gender: '',
      contact: '',
      location: ''
    }
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <section className="p-4">
      <div>
        <div className="flex justify-between text-sm">
          <p>Account Setup</p>
          <p>Step 1 of 3</p>
        </div>

        <h2 className="my-4 text-xl">Personal Information</h2>
        <div className="flex justify-center">
          <Progress value={30} max={100} />
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 flex w-full flex-col items-center gap-6"
        >
          <div className="grid grid-cols-2 gap-x-4">
            <InputField required name="firstName" placeholder="First Name" />
            <InputField required name="lastName" placeholder="Last Name" />
            <Accordion type="multiple" className="col-span-2 w-full">
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger
                  StartIcon={PlusCircle}
                  startIconClassName="stroke-background fill-accent"
                >
                  Add Display Name
                </AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel></FormLabel>
                        <FormControl>
                          <Input placeholder="Display Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="flex items-center justify-between text-sm">
                  DOB <span className="text-xs">Required</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" placeholder="mm/dd/yyyy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between text-sm">
                    I identify as <span className="text-xs">Required</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-Binary">Non-Binary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <InputField
              required
              name="phone"
              placeholder="Phone Number"
              label="Contact"
            />
          </div>
          <Controller
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="flex items-center justify-between text-sm">
                  Location <span className="text-xs">Required</span>
                </FormLabel>
                <FormControl>
                  <PlaceKit
                    apiKey={`${process.env.NEXT_PUBLIC_PLACEKIT_KEY}`}
                    geolocation={false}
                    className="search-root"
                    onPick={(location) => {
                      console.log(location)
                      field.onChange(location)
                    }}
                    options={{
                      types: ['city', 'administrative'],
                      panel: {
                        className: '!bg-black'
                      },
                      format: {
                        sub: (item) => `${item.city}, ${item.administrative}`,
                        value: (item) => `${item.city}, ${item.administrative}`
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">
            Continue
          </Button>
        </form>
      </Form>
    </section>
  )
}
