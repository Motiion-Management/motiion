'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { EditDrawer } from '@/components/features/edit-drawer'
import { resume } from '@packages/backend/convex/validators/resume'
import { AgencyName } from '@/components/features/agencies/agency-name'
import { Card, CardContent } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import { AgencySearchField } from './agency-search-field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ManualAgencyInput } from './manual-agency-input'

const formSchema = z
  .object({
    representation: resume.representation,
    customRep: z.string().optional()
  })
  .refine((data) => {
    return !!data.representation || !!data.customRep
  }, 'Either select an agency or enter a custom representation')

type FormSchema = z.infer<typeof formSchema>

export function RepresentationForm() {
  const resume = useQuery(api.resumes.getMyResume) || undefined
  const removeMyRepresentation = useMutation(api.resumes.removeMyRepresentation)
  const addMyRepresentation = useMutation(api.resumes.addMyRepresentation)
  const createAgency = useMutation(api.agencies.create)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    shouldUseNativeValidation: false
  })

  const resetForm = () => {
    form.reset()
  }

  async function onSubmit({ representation, customRep }: FormSchema) {
    if (customRep) {
      const newAgency = await createAgency({ name: customRep, listed: false })
      await addMyRepresentation({ representation: newAgency._id })
    }

    if (representation) {
      await addMyRepresentation({ representation })
    }
    resetForm()
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
              actionSlot={
                resume?.representation ? (
                  <XCircle
                    className="fill-primary stroke-card cursor-pointer"
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
                    <TabsTrigger
                      className="rounded-full"
                      value="search"
                      onClick={resetForm}
                    >
                      Search
                    </TabsTrigger>
                    <TabsTrigger
                      className="rounded-full"
                      value="manual"
                      onClick={resetForm}
                    >
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
                    <ManualAgencyInput name="customRep" />
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
