'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '../components/ui/form'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { EditDrawer } from '../components/features/edit-drawer'
import { FC } from 'react'
import { FABAddDrawer } from '../components/features/fab-add-drawer'
import { zProficiency } from '@packages/backend/convex/schemas/base'
import { zSkillsPlainObject } from '@packages/backend/convex/schemas/users'

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
          label="Expert Skills"
          value={skillsRT.expert?.join(', ')}
        >
          {/* EditSkillList component would need to be created */}
          <div>Expert skills editing functionality needs to be implemented</div>
        </EditDrawer>
        <EditDrawer<FormSchema>
          label="Proficient Skills"
          value={skillsRT.proficient?.join(', ')}
        >
          {/* EditSkillList component would need to be created */}
          <div>
            Proficient skills editing functionality needs to be implemented
          </div>
        </EditDrawer>
        <EditDrawer<FormSchema>
          label="Novice Skills"
          value={skillsRT.novice?.join(', ')}
        >
          {/* EditSkillList component would need to be created */}
          <div>Novice skills editing functionality needs to be implemented</div>
        </EditDrawer>
        <FABAddDrawer<FormSchema> label="Add Skill">
          {/* AddSkill component would need to be created */}
          <div>Add skill functionality needs to be implemented</div>
        </FABAddDrawer>
      </form>
    </Form>
  )
}

export { formSchema as skillsFormSchema }
export type { FormSchema as SkillsFormSchema }
