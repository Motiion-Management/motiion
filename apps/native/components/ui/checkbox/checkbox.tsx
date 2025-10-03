import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import * as React from 'react';

import Check from '~/lib/icons/Check';
import { cn } from '~/lib/utils';

const Checkbox = React.forwardRef<CheckboxPrimitive.RootRef, CheckboxPrimitive.RootProps>(
  ({ className, ...props }, ref) => {
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          'web:peer native:rounded h-4 w-4 shrink-0 rounded-sm border-2 border-surface-dark disabled:cursor-not-allowed disabled:opacity-50 web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          props.checked && 'border-surface-dark bg-surface-dark',
          props.disabled && 'opacity-50',
          className
        )}
        {...props}>
        <CheckboxPrimitive.Indicator className={cn('h-full w-full items-center justify-center')}>
          <Check size={14} strokeWidth={5} className={cn('text-border-inverse')} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
