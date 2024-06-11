'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { api } from '@packages/backend/convex/_generated/api'
import { CheckboxField } from '@/components/ui/form-fields/checkbox'
import { useMutation, Preloaded, usePreloadedQuery } from 'convex/react'
import { zUsers } from '@packages/backend/convex/validators/users'

const formSchema = zUsers.pick({ representation: true })

type FormSchema = z.infer<typeof formSchema>

export const DisplayRepForm: React.FC<{
  preloadedUser: Preloaded<typeof api.users.getMyUser>
}> = ({ preloadedUser }) => {
  const user = usePreloadedQuery(preloadedUser)

  const updateMyUser = useMutation(api.users.updateMyUser)

  const formValues = { representation: user?.representation }
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUseNativeValidation: false,
    defaultValues: formValues,
    values: formValues
  })

  function onSubmit(data: FormSchema) {
    updateMyUser(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CheckboxField
          buttonProps={{ type: 'submit' }}
          name="representation.displayRep"
          label="Display representation on profile."
        />
      </form>
    </Form>
  )
}
