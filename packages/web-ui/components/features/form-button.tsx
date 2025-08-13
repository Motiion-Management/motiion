import { useFormState } from 'react-hook-form'
import { Button, ButtonProps } from '../ui/button'

export const SubmitButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  const formState = useFormState()
  return (
    <Button
      type="submit"
      loading={formState.isSubmitting}
      disabled={!formState.isValid}
      className="w-full"
      {...props}
    >
      {children}
    </Button>
  )
}

export const FormButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <SubmitButton {...props}>{children}</SubmitButton>
    </form>
  )
}
