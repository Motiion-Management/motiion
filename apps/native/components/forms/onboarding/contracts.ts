// Unified form contracts for the new wrapper/registry architecture
// These do not replace existing OnboardingFormRef/Props yet; they will
// be adopted incrementally by refactored forms.

export interface FormHandle {
  submit(): void | Promise<void>;
  isDirty(): boolean;
  isValid(): boolean;
}

export interface FormProps<T> {
  initialValues: T;
  onSubmit(values: T): void | Promise<void>;
  onDirtyChange?(dirty: boolean): void;
  onValidChange?(valid: boolean): void;
  onCancel?(): void;
}
