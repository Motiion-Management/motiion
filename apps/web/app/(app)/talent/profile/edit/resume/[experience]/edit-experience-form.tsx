'use client'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { DrawerWithSlots } from '@/components/features/drawer-with-slot'
import { Button } from '@/components/ui/button'
import {
  ExperienceDoc,
  zExperiences
} from '@packages/backend/convex/validators/experiences'
import { useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { ExperienceFormFields } from './experience-form-fields'
import { DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import Image from 'next/image'

const formSchema = zExperiences

type FormSchema = z.infer<typeof formSchema>

export const EditExperienceForm: FC<{
  experience: ExperienceDoc
}> = ({ experience }) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    shouldUseNativeValidation: false,
    defaultValues: experience
  })

  const updateExperience = useMutation(api.experiences.update)
  const deleteMyExperience = useMutation(
    api.users.experiences.removeMyExperience
  )

  async function onSubmit(data: FormSchema) {
    await updateExperience({ id: experience._id, patch: data })
    form.reset()
  }

  async function deleteExperience(data: FormSchema) {
    data
    await deleteMyExperience({ experienceId: experience._id })
  }

  return (
    <Form {...form}>
      <form
        className="divide-border flex flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <DrawerWithSlots
          titleSlot={
            <DrawerTitle className="flex flex-1 justify-between">
              <span className="text-heading-2">Edit Experience</span>
              <Image
                src="/icons/trash.svg"
                alt="trash"
                width={24}
                height={24}
                onClick={form.handleSubmit(deleteExperience)}
              />
            </DrawerTitle>
          }
          triggerSlot={
            <DrawerTrigger asChild>
              <Button className="w-full" variant="outline">
                Edit
              </Button>
            </DrawerTrigger>
          }
        >
          <ExperienceFormFields />
        </DrawerWithSlots>
      </form>
    </Form>
  )
}
