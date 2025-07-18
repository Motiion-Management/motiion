import { FormField, FormItem, FormLabel } from '../form'
import { cn } from '../../lib/utils'
import { Checkbox } from '../checkbox'
import { ButtonProps } from 'react-html-props'

export interface CheckboxFieldProps {
  name: string
  label: string
  className?: string
  buttonProps?: ButtonProps
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  className,
  buttonProps,
  ...props
}) => {
  return (
    <FormField
      name={name}
      render={({ field }) => {
        const handleCheckboxChange = (checked: boolean) => {
          field.onChange(checked)
        }

        return (
          <FormItem className={cn('flex-row items-center', className)}>
            <Checkbox
              checked={field.value}
              onCheckedChange={handleCheckboxChange}
              {...props}
            />
            <button
              type="button"
              onClick={() => handleCheckboxChange(!field.value)}
            >
              <FormLabel className="text-body cursor-pointer">
                {label}
              </FormLabel>
            </button>
          </FormItem>
        )
      }}
    />
  )
}
