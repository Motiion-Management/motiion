export interface OnboardingFormProps<T = any> {
  /** Initial form data */
  initialData?: T;
  /** Called when form is successfully completed */
  onComplete: (data: T) => void | Promise<void>;
  /** Called when form is cancelled (for modal mode) */
  onCancel?: () => void;
  /** Form display mode */
  mode?: 'fullscreen' | 'sheet';
  /** Whether form should auto-focus first field */
  autoFocus?: boolean;
  /** Called when validation state changes */
  onValidationChange?: (isValid: boolean) => void;
}

export interface OnboardingFormRef {
  /** Submit the form programmatically */
  submit: () => void | Promise<void>;
  /** Reset the form to initial values */
  reset: () => void;
  /** Check if form is valid */
  isValid: () => boolean;
}
