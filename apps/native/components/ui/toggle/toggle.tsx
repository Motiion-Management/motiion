import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Pressable } from 'react-native';

import { TextClassContext } from '~/components/ui/text';
import { cn } from '~/lib/utils';

const toggleVariants = cva(
  'group flex items-center justify-center rounded-md text-sm font-medium web:ring-offset-background web:transition-colors web:hover:bg-muted web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 web:disabled:pointer-events-none web:disabled:opacity-50 web:data-[state=on]:bg-accent web:data-[state=on]:text-accent-foreground',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent web:hover:bg-accent web:hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const toggleTextVariants = cva('text-sm font-medium text-foreground web:transition-colors', {
  variants: {
    variant: {
      default: '',
      outline: '',
    },
    size: {
      default: '',
      sm: 'text-xs',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type ToggleProps = React.ComponentPropsWithoutRef & VariantProps;

const Toggle = React.forwardRef<React.ElementRef, ToggleProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <TextClassContext.Provider
        value={toggleTextVariants({ variant, size, className: 'web:pointer-events-none' })}>
        <Pressable
          className={cn(toggleVariants({ variant, size, className }))}
          ref={ref}
          role="button"
          {...props}
        />
      </TextClassContext.Provider>
    );
  }
);
Toggle.displayName = 'Toggle';

export { Toggle, toggleTextVariants, toggleVariants };
export type { ToggleProps };
