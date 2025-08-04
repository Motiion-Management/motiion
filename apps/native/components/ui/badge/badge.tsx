import type { SlottableViewProps } from '@rn-primitives/types';
import { cva, type VariantProps } from 'class-variance-authority';
import { View } from 'react-native';

import { Slot } from '~/components/primitives/slot';
import { TextClassContext } from '~/components/ui/text';
import { cn } from '~/lib/utils';

const badgeVariants = cva(
  'web:inline-flex items-center rounded-full border border-border-default px-2.5 py-0.5 web:transition-colors web:focus:outline-none web:focus:ring-2 web:focus:ring-border-accent web:focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-500 web:hover:opacity-80 active:opacity-80',
        secondary: 'border-transparent bg-primary-900 web:hover:opacity-80 active:opacity-80',
        destructive: 'border-transparent bg-text-error web:hover:opacity-80 active:opacity-80',
        outline: 'text-text-default',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const badgeTextVariants = cva('text-xs font-semibold ', {
  variants: {
    variant: {
      default: 'text-text-high',
      secondary: 'text-text-high',
      destructive: 'text-text-high',
      outline: 'text-text-default',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type BadgeProps = SlottableViewProps & VariantProps;

function Badge({ className, variant, asChild, ...props }: BadgeProps) {
  const Component = asChild ? Slot : View;
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <Component className={cn(badgeVariants({ variant }), className)} {...props} />
    </TextClassContext.Provider>
  );
}

export { Badge, badgeTextVariants, badgeVariants };
export type { BadgeProps };
