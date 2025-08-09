import { createFormHook } from '@tanstack/react-form';

import { BottomSheetComboboxField } from './BottomSheetComboboxField';
import { BottomSheetPickerField } from './BottomSheetPickerField';
import { CheckboxGroupField } from './CheckboxGroupField';
import { ChipsField } from './ChipsField';
import { BooleanField } from './BooleanField';
import { NumberInput } from './NumberInput';
import { DateInput } from './DateInput';
import { PhoneNumber } from './PhoneNumber';
import { PhoneOTP } from './PhoneOTP';
import { RadioGroupField } from './RadioGroupField';
import { SelectField } from './SelectField';
import { TextInput } from './TextInput';
import { RelationshipPickerField } from './RelationshipPickerField';
import { FileUploadField } from './FileUploadField';
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
    BooleanField,
    TextInput,
    NumberInput,
    DateInput,
    SelectField,
    ChipsField,
    BottomSheetPickerField,
    BottomSheetComboboxField,
    RelationshipPickerField,
    FileUploadField,
  },
  formComponents: {},
});

export { useAppForm };
