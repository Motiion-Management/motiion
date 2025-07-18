import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { cn } from '../../../lib/cn';

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, TextInputProps>(
  ({ className, placeholderClassName, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          'native:h-12 native:text-lg native:leading-[1.25] h-10  border-b border-b-foreground bg-transparent text-base text-text-default file:border-0 file:bg-transparent file:font-medium placeholder:text-text-disabled web:flex web:w-full web:py-2 web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 lg:text-sm',
          props.editable === false && 'opacity-50 web:cursor-not-allowed',
          className
        )}
        placeholderClassName={cn('text-text-disabled', placeholderClassName)}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
