import { FieldValues, useFormContext } from 'react-hook-form'
import { EditDrawer, EditDrawerProps } from '@/components/features/edit-drawer'
import {
  WheelPickerField,
  WheelPickerColumnValues
} from '@/components/ui/form-fields/wheel-picker'
import { UNITS, formatSizeValue } from '@/lib/utils'

export interface SizingDrawerProps<T extends FieldValues>
  extends Omit<EditDrawerProps<T>, 'children'> {
  section: string
  column: string
  values: WheelPickerColumnValues
  unit?: keyof typeof UNITS
}

export function SizingDrawer<T extends FieldValues>({
  section,
  column,
  unit,
  values,
  ...rest
}: SizingDrawerProps<T>) {
  const form = useFormContext<T>()

  const value = formatSizeValue(form.getValues()?.[section]?.[column], unit)
  const options = { [column]: { values, unit } }

  return (
    <EditDrawer<T> value={value} {...rest}>
      <WheelPickerField name={section} options={options} />
    </EditDrawer>
  )
}
