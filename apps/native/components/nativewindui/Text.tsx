import { VariantProps, cva } from 'class-variance-authority';
import { cssInterop } from 'nativewind';
import * as React from 'react';
import { UITextView } from 'react-native-uitextview';

import { cn } from '~/lib/cn';

cssInterop(UITextView, { className: 'style' });

const textVariants = cva('text-foreground font-sans', {
  variants: {
    variant: {
      largeTitle: 'text-h1 font-bold',
      title1: 'text-h2 font-bold',
      title2: 'text-h3 font-bold',
      title3: 'text-h4 font-bold',
      heading: 'text-h5 font-bold',
      subhead: 'text-h6 font-bold',
      body: 'text-body font-normal',
      bodySm: 'text-body-sm font-normal',
      bodyXs: 'text-body-sm font-normal',
      callout: 'text-body-lg',
      footnote: 'text-[13px] leading-5',
      caption1: 'text-xs',
      caption2: 'text-[11px] leading-4',
    },
    color: {
      primary: 'text-foreground',
      secondary: 'text-secondary-foreground/90',
      tertiary: 'text-muted-foreground/90',
      quarternary: 'text-muted-foreground/50',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'primary',
  },
});

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  variant,
  color,
  ...props
}: React.ComponentPropsWithoutRef<typeof UITextView> & VariantProps<typeof textVariants>) {
  const textClassName = React.useContext(TextClassContext);
  return (
    <UITextView
      className={cn(textVariants({ variant, color }), textClassName, className)}
      {...props}
    />
  );
}

export { Text, TextClassContext, textVariants };
