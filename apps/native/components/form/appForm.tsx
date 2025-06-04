import { createFormHook } from '@tanstack/react-form';

import { PhoneNumber } from './PhoneNumber';
import { PhoneOTP } from './PhoneOTP';
import { TextInput } from './TextInput';
import { DateInput } from './DateInput';
import { fieldContext, formContext } from './context';

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {
    PhoneNumber,
    PhoneOTP,
    TextInput,
    DateInput,
  },
  formComponents: {},
});

export { useAppForm };
