'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'Please enter your first name.'
  }),
  lastName: z.string().min(2, {
    message: 'Please enter your last name.'
  }),
  displayName: z.string().optional(),
  dateOfBirth: z.string().date(),
  gender: z.string(),
  phone: z.string(),
  location: z.string()
})

type FormSchema = z.infer<typeof formSchema>

export function PersonalDetailsFormProvider({
  children,
  defaultValues
}: {
  children: React.ReactNode
  defaultValues: Partial<FormSchema>
}) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues
  })
  const router = useRouter()
  function onSubmit(data: FormSchema) {
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      )
    })
    setTimeout(() => {
      router.push('/onboarding/2')
    }, 500)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-8 grid grid-cols-2 gap-4"
      >
        {children}
      </form>
    </Form>
  )
}
