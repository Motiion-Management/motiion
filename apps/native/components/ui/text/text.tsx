import { VariantProps, cva } from 'class-variance-authority';
import { cssInterop } from 'nativewind';
import * as React from 'react';
import { UITextView } from 'react-native-uitextview';

import { cn } from '~/lib/cn';

cssInterop(UITextView, { className: 'style' });

const textVariants = cva('text-text-default font-sans', {
  variants: {
    variant: {
      header1: 'text-h1',
      header2: 'text-h2',
      header3: 'text-h3',
      header4: 'text-h4',
      header5: 'text-h5',
      header6: 'text-h6',
      largeTitle: 'text-h1 ',
      title1: 'text-h2 ',
      title2: 'text-h3 ',
      title3: 'text-h4 ',
      heading: 'text-h5 ',
      subhead: 'text-h6 ',
      bodyLg: 'text-body-lg',
      body: 'text-body ',
      bodySm: 'text-body-sm ',
      bodyXs: 'text-body-xs ',
      labelLg: 'text-label-lg uppercase',
      label: 'text-label uppercase',
      labelSm: 'text-label-sm uppercase',
      labelXs: 'text-label-xs uppercase',
      callout: 'text-body-lg',
      footnote: 'text-[13px] leading-5',
      caption1: 'text-xs',
      caption2: 'text-[11px] leading-4',
    },
    color: {
      primary: 'text-text-default',
      primaryInverted: 'text-background',
      secondary: 'text-text-high/90',
      tertiary: 'text-text-disabled/90',
      quarternary: 'text-text-disabled/50',
      utilityLight: 'text-text-utility-light',
      utilityDark: 'text-text-utility-dark',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'primary',
  },
});

const TextClassContext = React.createContext<string | undefined>(undefined);

export type TextProps = React.ComponentPropsWithoutRef & VariantProps;

function Text({ className, variant, color, ...props }: TextProps) {
  const textClassName = React.useContext(TextClassContext);
  return (
    <UITextView
      className={cn(textVariants({ variant, color }), textClassName, className)}
      {...props}
    />
  );
}

export { Text, TextClassContext, textVariants };
