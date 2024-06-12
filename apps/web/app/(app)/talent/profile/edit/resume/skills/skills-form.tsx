'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { EditDrawer } from '@/components/features/edit-drawer'
import { FC } from 'react'
import { EditSkillList } from './edit-skill-list'
import { FABAddDrawer } from '@/components/features/fab-add-drawer'
import { AddSkill } from './add-skill'
import { zProficiency } from '@packages/backend/convex/validators/base'
import { zSkillsPlainObject } from '@packages/backend/convex/validators/users'

const formSchema = z
  .object({
    ...zSkillsPlainObject,
    newSkill: z.object({ skill: z.string(), level: zProficiency })
  })
  .partial()

type FormSchema = z.infer<typeof formSchema>

export const SkillsForm: FC<{
  preloadedResume: Preloaded<typeof api.users.resume.getMyResume>
}> = ({ preloadedResume }) => {
  const resume = usePreloadedQuery(preloadedResume)
  const updateMyResume = useMutation(api.users.resume.updateMyResume)

  const skillsRT = resume?.skills || { expert: [], proficient: [], novice: [] }
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUseNativeValidation: false,
    defaultValues: skillsRT,
    values: skillsRT
  })
  async function onSubmit({ newSkill, ...skillsObj }: FormSchema) {
    const skills = { ...skillsObj }
    if (newSkill) {
      skills[newSkill.level] = [
        ...(skillsObj[newSkill.level] || []),
        newSkill.skill
      ]
    }
    await updateMyResume({ skills })

    form.reset(skillsRT)
  }

  return (
    <Form {...form}>
      <form
        className="divide-border flex flex-col divide-y"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <EditDrawer<FormSchema>
          label="Edit Skills"
          value={skillsRT.expert?.join(', ')}
        >
          <EditSkillList name="expert" />
        </EditDrawer>
        <EditDrawer<FormSchema>
          label="Edit Skills"
          value={skillsRT.proficient?.join(', ')}
        >
          <EditSkillList name="proficient" />
        </EditDrawer>
        <EditDrawer<FormSchema>
          label="Proficient"
          value={skillsRT.novice?.join(', ')}
        >
          <EditSkillList name="novice" />
        </EditDrawer>
        <FABAddDrawer<FormSchema> onSubmit={onSubmit} label="Add Skill">
          <AddSkill name="newSkill" />
        </FABAddDrawer>
      </form>
    </Form>
  )
}
