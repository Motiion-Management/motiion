import { Card, CardContent } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { myAttributes, preloadMyAttributes } from '@/lib/server/resumes'
import { Pencil } from 'lucide-react'

function inchesToFeetAndInches(inches: number) {
  // Convert inches to feet.
  const feet = Math.floor(inches / 12)

  // Get the remaining inches.
  const remainingInches = inches % 12

  // Return the result as a string.
  return `${feet} ft. ${remainingInches} in.`
}

export default async function ProfileEditAttributesPage() {
  const attributes = await myAttributes()
  const preloadedAttributes = await preloadMyAttributes()

  return (
    <Card className="h-fit">
      <CardContent className="divide-border flex flex-col divide-y py-2">
        <EditDrawer
          label="Height"
          value={inchesToFeetAndInches(attributes.height || 0)}
        >
          HEIGHT
        </EditDrawer>
        <EditDrawer label="Weight" value="150 lbs">
          WIDTH
        </EditDrawer>
      </CardContent>
    </Card>
  )
}

function EditDrawer({
  children,
  label,
  value
}: {
  children: React.ReactNode
  label: string
  value: string
}) {
  return (
    <Drawer>
      <DrawerTrigger className="flex w-full items-center justify-between gap-2 py-3">
        <div className="flex flex-col items-start gap-1">
          <div className="text-label-xs text-secondary uppercase">{label}</div>
          <div className="text-body-xs">{value}</div>
        </div>
        <Pencil size={16.5} className="fill-black stroke-white" />
      </DrawerTrigger>
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  )
}
