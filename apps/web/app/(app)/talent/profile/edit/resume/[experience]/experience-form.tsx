'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { FC, useEffect } from 'react'
import { zExperiences } from '@packages/backend/convex/validators/experiences'
import { ExperienceType } from '@/lib/server/experiences'

const formSchema = zExperiences

type FormSchema = z.infer<typeof formSchema>

export const ExperienceForm: FC<{
  children: React.ReactNode
  type: ExperienceType
}> = ({ children, type }) => {
  const realTimeValues = {
    type
  }
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    shouldUseNativeValidation: false,
    defaultValues: realTimeValues
    // values: skillsRT
  })

  console.log(form.getValues())
  console.log(form.formState.isValid)
  console.log(form.formState.errors)

  async function onSubmit({}: FormSchema) {
    // const skills = { ...skillsObj }
    // if (newSkill) {
    //   skills[newSkill.level] = [
    //     ...(skillsObj[newSkill.level] || []),
    //     newSkill.skill
    //   ]
    // }
    // await updateMyResume({ skills })
    //
    // form.reset(skillsRT)
  }

  return (
    <Form {...form}>
      <form
        className="divide-border flex flex-col divide-y"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {children}
      </form>
    </Form>
  )
}
