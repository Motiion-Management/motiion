'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { api } from '@packages/backend/convex/_generated/api'
import { CheckboxField } from '@/components/ui/form-fields/checkbox'
import { resume } from '@packages/backend/convex/validators/resume'
import { useMutation, Preloaded, usePreloadedQuery } from 'convex/react'

const formSchema = z.object({
  displayRepresentation: resume.displayRepresentation
})
type FormSchema = z.infer<typeof formSchema>

export const DisplayRepForm: React.FC<{
  preloadedResume: Preloaded<typeof api.resumes.getMyResume>
}> = ({ preloadedResume }) => {
  const resume = usePreloadedQuery(preloadedResume)

  const updateMyResume = useMutation(api.resumes.updateMyResume)

  const formValues = { displayRepresentation: resume?.displayRepresentation }
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUseNativeValidation: false,
    defaultValues: formValues,
    values: formValues
  })

  function onSubmit(data: FormSchema) {
    updateMyResume(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CheckboxField
          buttonProps={{ type: 'submit' }}
          name="displayRepresentation"
          label="Display representation on profile."
        />
      </form>
    </Form>
  )
}
