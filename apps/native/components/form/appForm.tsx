import { createFormHook } from '@tanstack/react-form';

import { CheckboxGroupField } from './CheckboxGroupField';
import { DateInput } from './DateInput';
import { PhoneNumber } from './PhoneNumber';
import { PhoneOTP } from './PhoneOTP';
import { RadioGroupField } from './RadioGroupField';
import { SizingFormField } from './SizingFormField';
import { TextInput } from './TextInput';
import { fieldContext, formContext } from './context';

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {
    PhoneNumber,
    PhoneOTP,
    RadioGroupField,
    CheckboxGroupField,
    SizingFormField,
    TextInput,
    DateInput,
  },
  formComponents: {},
});

export { useAppForm };
