'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { EditDrawer } from '@/components/features/edit-drawer'
import { zResume } from '@packages/backend/convex/validators/resume'
import { AgencyName } from '@/components/features/agencies/agency-name'
import { Card, CardContent } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import { AgencySearchField } from './agency-search-field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

const formSchema = zResume

type FormSchema = z.infer<typeof formSchema>

export function RepresentationForm() {
  const resume = useQuery(api.resumes.getMyResume) || undefined
  const removeMyRepresentation = useMutation(api.resumes.removeMyRepresentation)
  const updateMyResume = useMutation(api.resumes.updateMyResume)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    // mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: resume,
    values: resume
  })
  async function onSubmit(data: FormSchema) {
    await updateMyResume(data)
    form.reset(resume)
  }

  async function removeRepresentation() {
    await removeMyRepresentation()
  }

  if (!resume?.displayRepresentation) return

  return (
    <Card className="h-fit">
      <CardContent className="divide-border flex flex-col divide-y py-2">
        <Form {...form}>
          <form
            className="divide-border flex flex-col divide-y"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <EditDrawer<FormSchema>
              onSubmit={onSubmit}
              iconSlot={
                resume?.representation ? (
                  <XCircle
                    className="fill-primary stroke-card"
                    onClick={removeRepresentation}
                  />
                ) : null
              }
              value={
                resume?.representation ? (
                  <AgencyName id={resume.representation} />
                ) : (
                  'None'
                )
              }
            >
              <Tabs defaultValue="search">
                <div className="mx-4">
                  <TabsList className="sticky top-16 z-10 mb-4 grid w-full grid-cols-2 rounded-full">
                    <TabsTrigger className="rounded-full" value="search">
                      Search
                    </TabsTrigger>
                    <TabsTrigger className="rounded-full" value="manual">
                      Manual
                    </TabsTrigger>
                  </TabsList>
                </div>
                <Separator />
                <div className="m-4 flex min-h-[65dvh] flex-col">
                  <TabsContent value="search" className="grid gap-3">
                    <AgencySearchField name="representation" className="" />
                  </TabsContent>
                  <TabsContent value="manual" className="grid gap-3">
                    manual input
                  </TabsContent>
                </div>
              </Tabs>
            </EditDrawer>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
