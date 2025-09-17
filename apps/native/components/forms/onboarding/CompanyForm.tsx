import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { View } from 'react-native';
import { z } from 'zod';
import { Input } from '~/components/ui/input';
import type { FormHandle, FormProps } from './contracts';

export const companySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export const CompanyForm = forwardRef<FormHandle, FormProps<CompanyFormValues>>(
  ({ initialValues, onSubmit, onValidChange }, ref) => {
    const [companyName, setCompanyName] = useState<string>(initialValues?.companyName || '');

    useEffect(() => {
      const isValid = companyName.length > 0;
      onValidChange?.(isValid);
    }, [companyName, onValidChange]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const values = { companyName };
        await onSubmit(values);
      },
      isDirty: () => companyName !== (initialValues?.companyName || ''),
      isValid: () => companyName.length > 0,
    }));

    return (
      <View className="flex-1">
        <Input
          placeholder="Enter company name"
          value={companyName}
          onChangeText={setCompanyName}
          autoCapitalize="words"
        />
      </View>
    );
  }
);

CompanyForm.displayName = 'CompanyForm';
