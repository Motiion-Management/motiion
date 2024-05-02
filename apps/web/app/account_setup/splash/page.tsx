'use client'
import './splash.css'
import { useEffect, useRef } from 'react'
import { PlaceKit } from '@placekit/autocomplete-react'
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Ghost } from 'lucide-react'

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
  const inputRef = useRef(null)
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
          <p >Account Setup</p>
          <p>Step 1 of 3</p>
        </div>

        <h2 className="my-4 text-xl">Personal Information</h2>
      <div className='flex justify-center'>
        <progress className="w-screen rounded-full" value="30" max="100"></progress>
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center space-y-8 mt-8 w-full"
        >
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between items-center text-sm">First Name <span className='text-xs'>Required</span></FormLabel>
                  <FormControl>
                    <Input style={{backgroundColor: '#007064'}} placeholder="First Name" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex justify-between items-center text-sm'>Last Name <span  className='text-xs'>Required</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <Accordion type="multiple">
              <AccordionItem value="item-1">
                <AccordionTrigger>+ Add Display Name</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
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
          <div>
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between items-center text-sm">DOB <span className='text-xs'>Required</span></FormLabel>
                  <FormControl>
                    <Input type="date" placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between items-center text-sm">I Identify As <span className='text-xs'>Required</span></FormLabel>
                  <FormControl>
                    <select className="flex flex-col items-start" {...field}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="">Non-binary</option>
                    </select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between items-center text-sm">Contact <span className='text-xs'>Required</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Phone Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <Controller
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between items-center text-sm">Location <span className='text-xs'>Required</span></FormLabel>
                  <FormControl>
                    <PlaceKit
                      apiKey={`${process.env.NEXT_PUBLIC_PLACEKIT_KEY}`}
                      geolocation={false}
                      onPick={(location) => {
                        console.log(location)
                        field.onChange(location)
                      }}
                      options={{
                        types: ['city', 'administrative'],
                        format: {
                          sub: (item) => `${item.city}, ${item.administrative}`,
                          value: (item) =>
                            `${item.city}, ${item.administrative}`
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button variant="default" type="submit">Continue</Button>
        </form>
      </Form>
    </section>
  )
}
