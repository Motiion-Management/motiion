'use client'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { FABAddDrawer } from '@/components/features/fab-add-drawer'
import { EXPERIENCE_TITLE_MAP } from '@packages/backend/convex/validators/experiences'
import { zExperiences } from '@packages/backend/convex/validators/experiences'
import { ExperienceType } from '@/lib/server/experiences'
import { useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { TrainingFormFields } from './training-form-fields'

const formSchema = zExperiences

type FormSchema = z.infer<typeof formSchema>

export const NewTrainingForm: FC<{
  type: ExperienceType
  userId: (typeof zExperiences)['_input']['userId']
}> = ({ type, userId }) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    shouldUseNativeValidation: false
  })

  const addMyExperience = useMutation(api.users.experiences.addMyExperience)

  async function onSubmit(experience: FormSchema) {
    await addMyExperience(experience)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FABAddDrawer label={`Add ${EXPERIENCE_TITLE_MAP[type]}`}>
          <input type="hidden" {...form.register('userId')} value={userId} />
          <input type="hidden" {...form.register('type')} value={type} />
          <TrainingFormFields />
        </FABAddDrawer>
      </form>
    </Form>
  )
}
