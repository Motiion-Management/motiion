import { createFormHook } from '@tanstack/react-form';

import { PhoneNumber } from './PhoneNumber';
import { fieldContext, formContext } from './context';

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {
    PhoneNumber,
  },
  formComponents: {},
});

export { useAppForm };
