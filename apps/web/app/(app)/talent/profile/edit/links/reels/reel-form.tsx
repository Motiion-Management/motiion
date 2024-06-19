'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { UserDoc, users } from '@packages/backend/convex/validators/users'
import { InputField } from '@/components/ui/form-fields/input'
import { EditDrawer } from '@/components/features/edit-drawer'
import { Video } from '@/components/ui/video'

const formSchema = users.links.unwrap()

type FormSchema = z.infer<typeof formSchema>

export function ReelForm({
  preloadedUser
}: {
  preloadedUser: Preloaded<typeof api.users.getMyUser>
}) {
  const updateMyUser = useMutation(api.users.updateMyUser)

  const { links } = usePreloadedQuery(preloadedUser) || ({} as UserDoc)
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUseNativeValidation: false,
    defaultValues: links,
    values: links
  })
  async function onSubmit(data: FormSchema) {
    await updateMyUser({ links: data })
    form.reset()
  }

  return (
    <Form {...form}>
      <form
        className="divide-border flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <EditDrawer<FormSchema> label="Reel Embed" value={'Edit Video URL'}>
          <div className="grid px-4">
            <InputField name="reel" label="Video URL" />
          </div>
        </EditDrawer>
        <div className="grid gap-2">
          <h3 className="text-label-xs text-ring uppercase">Preview</h3>
          <Video url={links?.reel || ''} />
        </div>
      </form>
    </Form>
  )
}
