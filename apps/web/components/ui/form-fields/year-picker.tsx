import { FC } from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger
} from '@/components/ui/drawer'
import { X } from 'lucide-react'
import { FlatWheelPickerField } from '@/components/ui/form-fields/flat-wheel-picker'
import { differenceInYears } from 'date-fns'
import { useWatch } from 'react-hook-form'

const yearOptions = Array(
  differenceInYears(new Date(), new Date(1900, 0, 1)) + 1
)
  .fill(0)
  .map((_, i) => i + 1900)
  .reverse()

type YearPickerFieldProps = {
  name: string
  label: string
  required?: boolean
}

export const YearPickerField: FC<YearPickerFieldProps> = ({
  name,
  label,
  required
}) => {
  const values = useWatch({ [name]: true })
  return (
    <div>
      <div className="flex items-center justify-between gap-2 px-3">
        {label && <h6 className="text-h6">{label}</h6>}
        {required && <span className="text-xs">Required</span>}
      </div>
      <Drawer shouldScaleBackground handleOnly>
        <div className="relative">
          <DrawerTrigger
            className="flex w-full items-center justify-between gap-2 py-3"
            asChild
          >
            <Button variant="input" tabIndex={2}>
              <span className="w-full text-start">
                {values[name] || 'Set Year'}
              </span>
            </Button>
          </DrawerTrigger>
        </div>
        <DrawerContent forceMount className="h-fit">
          <DrawerHeader className="flex items-center justify-between gap-2 p-6 ">
            Select Year
            <DrawerClose>
              <X size={24} strokeWidth={1.5} className="" />
            </DrawerClose>
          </DrawerHeader>
          <div className="py-6">
            <FlatWheelPickerField name={name} options={yearOptions} />
          </div>
          <DrawerFooter>
            <DrawerClose>
              <Button className="w-full">Save</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
