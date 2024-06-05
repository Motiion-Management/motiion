'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { CheckboxField } from '@/components/ui/form-fields/checkbox'
import { resume } from '@packages/backend/convex/validators/resume'

const formSchema = z.object({
  displayRepresentation: resume.displayRepresentation
})
type FormSchema = z.infer<typeof formSchema>

export const DisplayRepForm: React.FC = () => {
  const resume = useQuery(api.resumes.getMyResume)
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
