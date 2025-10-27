import * as React from 'react';
import { View, Pressable } from 'react-native';

import { SelectionCard } from '~/components/ui/selection-card';
import { cn } from '~/lib/utils';

interface MultiselectContextValue {
  values: string[];
  onValueChange: (values: string[]) => void;
  disabled?: boolean;
}

const MultiselectContext = React.createContext<MultiselectContextValue | null>(null);

export const useMultiselectContext = () => {
  const context = React.useContext(MultiselectContext);
  if (!context) {
    throw new Error('useMultiselectContext must be used within a Multiselect');
  }
  return context;
};

export interface MultiselectProps {
  values: string[];
  onValueChange: (values: string[]) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Multiselect = React.forwardRef<React.ElementRef<typeof View>, MultiselectProps>(
  ({ values, onValueChange, disabled, className, children, ...props }, ref) => {
    const contextValue = React.useMemo(
      () => ({ values, onValueChange, disabled }),
      [values, onValueChange, disabled]
    );

    return (
      <MultiselectContext.Provider value={contextValue}>
        <View ref={ref} className={cn('gap-4', className)} {...props}>
          {children}
        </View>
      </MultiselectContext.Provider>
    );
  }
);
Multiselect.displayName = 'Multiselect';

export interface MultiselectItemProps {
  value: string;
  label: string;
  description?: string;
}

const MultiselectItem = React.forwardRef<React.ElementRef<typeof Pressable>, MultiselectItemProps>(
  ({ value, label, description }, ref) => {
    const { values, onValueChange, disabled } = useMultiselectContext();

    const handleSelect = React.useCallback(
      (itemValue: string, selected: boolean) => {
        const currentValues = values || [];

        let newValues: string[];
        if (selected) {
          newValues = currentValues.includes(itemValue)
            ? currentValues
            : [...currentValues, itemValue];
        } else {
          newValues = currentValues.filter((v) => v !== itemValue);
        }

        onValueChange(newValues);
      },
      [values, onValueChange]
    );

    const isSelected = values?.includes(value) || false;

    return (
      <SelectionCard
        ref={ref}
        variant="checkbox"
        value={value}
        label={label}
        description={description}
        selected={isSelected}
        onSelect={handleSelect}
        disabled={disabled}
      />
    );
  }
);
MultiselectItem.displayName = 'MultiselectItem';

export { Multiselect, MultiselectItem };
