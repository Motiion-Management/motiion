// use the WheelPickerField component to render a wheel picker with two columns, height and inches

import { WheelPickerField } from './wheel-picker'

// Path: apps/web/components/ui/form-fields/height-picker.tsx

export type HeightPickerFieldProps = {
  name: string
  label: string
  className?: string
  required?: boolean
}

export const HeightPickerField = ({
  name,
  label,
  className,
  required
}: HeightPickerFieldProps) => {
  const options = {
    feet: { values: Array.from({ length: 12 }, (_, i) => i) },
    inches: { values: Array.from({ length: 12 }, (_, i) => i) }
  }

  return (
    <WheelPickerField
      name={name}
      label={label}
      className={className}
      required={required}
      options={options}
    />
  )
}
