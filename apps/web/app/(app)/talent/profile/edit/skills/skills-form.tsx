'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { EditDrawer } from '@/components/features/edit-drawer'
import { FC } from 'react'
import { zSkills } from '@packages/backend/convex/validators/resume'
import { EditSkillList } from './edit-skill-list'

const formSchema = zSkills

type FormSchema = z.infer<typeof formSchema>

export const SkillsForm: FC<{
  preloadedResume: Preloaded<typeof api.resumes.getMyResume>
}> = ({ preloadedResume }) => {
  const resume = usePreloadedQuery(preloadedResume)
  const updateMyResume = useMutation(api.resumes.updateMyResume)

  const skills = resume?.skills || { expert: [], proficient: [], novice: [] }
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUseNativeValidation: false,
    defaultValues: skills,
    values: skills
  })
  async function onSubmit(data: FormSchema) {
    await updateMyResume({ skills: data })
    form.reset(skills)
  }

  return (
    <Form {...form}>
      <form
        className="divide-border flex flex-col divide-y"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <EditDrawer<FormSchema>
          onSubmit={onSubmit}
          label="Edit Skills"
          value={skills.expert?.join(', ')}
        >
          <EditSkillList name="expert" />
        </EditDrawer>
        <EditDrawer<FormSchema>
          onSubmit={onSubmit}
          label="Edit Skills"
          value={skills.proficient?.join(', ')}
        >
          <EditSkillList name="proficient" />
        </EditDrawer>
        <EditDrawer<FormSchema>
          onSubmit={onSubmit}
          label="Proficient"
          value={skills.novice?.join(', ')}
        >
          <EditSkillList name="novice" />
        </EditDrawer>
      </form>
    </Form>
  )
}
