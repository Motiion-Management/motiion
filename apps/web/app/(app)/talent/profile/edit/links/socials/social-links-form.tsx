'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { UserDoc, users } from '@packages/backend/convex/validators/users'
import { SocialLinkFields } from './social-link-field'
import { SubmitButton } from '@/components/features/form-button'

const formSchema = users.links.unwrap()

type FormSchema = z.infer<typeof formSchema>

export function SocialLinksForm({
  preloadedUser
}: {
  preloadedUser: Preloaded<typeof api.users.getMyUser>
}) {
  const updateMyUser = useMutation(api.users.updateMyUser)

  const { links } = usePreloadedQuery(preloadedUser) || ({} as UserDoc)
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUseNativeValidation: false,
    mode: 'onChange',
    defaultValues: links,
    values: links
  })
  async function onSubmit(data: FormSchema) {
    const socials = Object.fromEntries(
      Object.entries(data.socials || {}).map(([platform, value]) => [
        platform,
        value === '' ? undefined : value
      ])
    )
    await updateMyUser({ links: { ...data, socials } })
    form.reset()
  }

  return (
    <Form {...form}>
      <form
        className="grid h-full gap-8 px-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <SocialLinkFields />
        <SubmitButton
          className="sticky bottom-0"
          disabled={!form.formState.isDirty}
        >
          Submit
        </SubmitButton>
      </form>
    </Form>
  )
}
