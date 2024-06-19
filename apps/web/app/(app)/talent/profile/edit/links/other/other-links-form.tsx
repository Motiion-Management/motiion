'use client'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { Preloaded, useMutation, usePreloadedQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { UserDoc, users } from '@packages/backend/convex/validators/users'
import { SubmitButton } from '@/components/features/form-button'
import { InputField } from '@/components/ui/form-fields/input-array'
import { Button } from '@/components/ui/button'
import { PlusCircle, XCircle } from 'lucide-react'

const formSchema = users.links.unwrap()

type FormSchema = z.infer<typeof formSchema>

export function OtherLinksForm({
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
    form.reset(links)
  }

  return (
    <Form {...form}>
      <form
        className="grid h-full grid-rows-[1fr_auto] gap-8 px-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <LinkFieldArray />
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

export const LinkFieldArray = () => {
  const { fields, append, remove } = useFieldArray({ name: 'other' })
  return (
    <div className="grid h-min gap-8">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-[2fr_3fr_auto] items-center gap-2"
        >
          <InputField
            name={`other.${index}.label`}
            label="Label for your link"
            placeholder="Portfolio"
            type="text"
          />
          <InputField
            name={`other.${index}.url`}
            label="URL"
            placeholder="https://example.com"
            type="url"
          />
          <Button
            size="icon"
            variant="destructive-link"
            className="mt-5"
            onClick={() => remove(index)}
          >
            <XCircle size={24} />
          </Button>
        </div>
      ))}
      <div className="grid grid-cols-[2fr_3fr_auto] items-center gap-2">
        <Button
          variant="input"
          className="mr-3 grid grid-cols-[auto_1fr]"
          size="input"
        >
          <PlusCircle
            size={24}
            className="stroke-card fill-accent cursor-pointer justify-self-start"
            onClick={() => append({ label: '', url: '' })}
          />
          Add another
        </Button>
      </div>
    </div>
  )
}
