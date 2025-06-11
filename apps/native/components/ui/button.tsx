import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Pressable } from 'react-native';

import { TextClassContext } from './text';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'group flex items-center justify-center rounded-md web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 web:hover:opacity-90 active:opacity-90',
        destructive: 'bg-text-error web:hover:opacity-90 active:opacity-90',
        outline:
          'border border-border-default bg-background-default web:hover:bg-primary-500-500 web:hover:text-text-high active:bg-primary-500-500',
        secondary: 'bg-primary-900 web:hover:opacity-80 active:opacity-80',
        ghost: 'web:hover:bg-primary-500-500 web:hover:text-text-high active:bg-primary-500-500',
        link: 'web:underline-offset-4 web:hover:underline web:focus:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 native:h-12 native:px-5 native:py-3',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8 native:h-14',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  'web:whitespace-nowrap text-sm native:text-base font-medium text-text-default web:transition-colors',
  {
    variants: {
      variant: {
        default: 'text-text-high',
        destructive: 'text-text-high',
        outline: 'group-active:text-text-high',
        secondary: 'text-text-high group-active:text-text-high',
        ghost: 'group-active:text-text-high',
        link: 'text-text-default group-active:underline',
      },
      size: {
        default: '',
        sm: '',
        lg: 'native:text-lg',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <TextClassContext.Provider
        value={buttonTextVariants({ variant, size, className: 'web:pointer-events-none' })}>
        <Pressable
          className={cn(
            props.disabled && 'opacity-50 web:pointer-events-none',
            buttonVariants({ variant, size, className })
          )}
          ref={ref}
          role="button"
          {...props}
        />
      </TextClassContext.Provider>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
