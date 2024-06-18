import { useFormState } from 'react-hook-form'
import { Button, ButtonProps } from '../ui/button'

export const FormButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  const formState = useFormState()

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Button
        type="submit"
        loading={formState.isSubmitting}
        disabled={!formState.isValid}
        className="w-full"
        {...props}
      >
        {children}
      </Button>
    </form>
  )
}
