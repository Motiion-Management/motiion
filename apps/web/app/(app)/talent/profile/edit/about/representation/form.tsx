'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { api } from '@packages/backend/convex/_generated/api'
import { EditDrawer } from '@/components/features/edit-drawer'
import { representationObj } from '@packages/backend/convex/validators/users'
import { AgencyName } from '@/components/features/agencies/agency-name'
import { Card, CardContent } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import { AgencySearchField } from './agency-search-field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ManualAgencyInput } from './manual-agency-input'
import { useMutation, Preloaded, usePreloadedQuery } from 'convex/react'

const formSchema = z
  .object({
    agencyId: representationObj.agencyId.optional(),
    customRep: z.string().optional()
  })
  .refine((data) => {
    return !!data.agencyId || !!data.customRep
  }, 'Either select an agency or enter a custom representation')

type FormSchema = z.infer<typeof formSchema>

export const RepresentationForm: React.FC<{
  preloadedUser: Preloaded<typeof api.users.getMyUser>
}> = ({ preloadedUser }) => {
  const user = usePreloadedQuery(preloadedUser)

  const removeMyRepresentation = useMutation(
    api.users.representation.removeMyRepresentation
  )
  const addMyRepresentation = useMutation(
    api.users.representation.addMyRepresentation
  )
  const createAgency = useMutation(api.agencies.create)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    shouldUseNativeValidation: false
  })

  const resetForm = () => {
    form.reset()
  }

  async function onSubmit({ agencyId, customRep }: FormSchema) {
    if (customRep) {
      const newAgency = await createAgency({ name: customRep, listed: false })
      await addMyRepresentation({ agencyId: newAgency._id })
    }

    if (agencyId) {
      await addMyRepresentation({ agencyId })
    }
    resetForm()
  }

  async function removeRepresentation() {
    await removeMyRepresentation()
  }

  if (!user?.representation?.displayRep) return

  return (
    <Card className="h-fit">
      <CardContent className="divide-border flex flex-col divide-y py-2">
        <Form {...form}>
          <form
            className="divide-border flex flex-col divide-y"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <EditDrawer<FormSchema>
              actionSlot={
                user?.representation?.agencyId ? (
                  <XCircle
                    className="fill-primary stroke-card cursor-pointer"
                    onClick={removeRepresentation}
                  />
                ) : null
              }
              value={
                user?.representation.agencyId ? (
                  <AgencyName id={user.representation.agencyId} />
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
                    <AgencySearchField name="agencyId" className="" />
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
