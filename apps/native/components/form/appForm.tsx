import { createFormHook } from '@tanstack/react-form';

import { BottomSheetComboboxField } from './BottomSheetComboboxField';
import { BottomSheetPickerField } from './BottomSheetPickerField';
import { MultiselectField } from './MultiselectField';
import { ChipsField } from './ChipsField';
import { CheckboxField } from './CheckboxField';
import { NumberInputField } from './NumberInputField';
import { DatePickerField } from './DatePickerField';
import { PhoneNumberField } from './PhoneNumberField';
import { PhoneOtpField } from './PhoneOtpField';
import { RadioGroupField } from './RadioGroupField';
import { SelectField } from './SelectField';
import { InputField } from './InputField';
import { RelationshipPickerField } from './RelationshipPickerField';
import { FileUploadField } from './FileUploadField';
import { fieldContext, formContext } from './context';

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {
    PhoneNumberField,
    PhoneOtpField,
    RadioGroupField,
    MultiselectField,
    CheckboxField,
    InputField,
    NumberInputField,
    DatePickerField,
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
