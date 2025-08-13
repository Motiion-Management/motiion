import * as ToggleGroupPrimitive from '@rn-primitives/toggle-group';
import type { VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';

import { TextClassContext } from '~/components/ui/text';
import { toggleTextVariants, toggleVariants } from '~/components/ui/toggle';
import { cn } from '~/lib/utils';

type ToggleVariantProps = VariantProps<typeof toggleVariants>;
const ToggleGroupContext = React.createContext<ToggleVariantProps | null>(null);

const ToggleGroup = React.forwardRef<
  ToggleGroupPrimitive.RootRef,
  ToggleGroupPrimitive.RootProps & ToggleVariantProps
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn('flex flex-row items-center justify-center gap-1', className)}
    {...props}>
    <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

function useToggleGroupContext() {
  const context = React.useContext(ToggleGroupContext);
  if (context === null) {
    throw new Error(
      'ToggleGroup compound components cannot be rendered outside the ToggleGroup component'
    );
  }
  return context;
}

const ToggleGroupItem = React.forwardRef<
  ToggleGroupPrimitive.ItemRef,
  ToggleGroupPrimitive.ItemProps & ToggleVariantProps
>(({ className, children, variant, size, ...props }, ref) => {
  const context = useToggleGroupContext();
  const { value } = ToggleGroupPrimitive.useRootContext();

  return (
    <TextClassContext.Provider
      value={cn(
        toggleTextVariants({ variant, size }),
        ToggleGroupPrimitive.utils.getIsSelected(value, props.value)
          ? 'text-text-high'
          : 'web:group-hover:text-text-disabled'
      )}>
      <ToggleGroupPrimitive.Item
        ref={ref}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          props.disabled && 'opacity-50 web:pointer-events-none',
          ToggleGroupPrimitive.utils.getIsSelected(value, props.value) && 'bg-primary-500',
          className
        )}
        {...props}>
        {children}
      </ToggleGroupPrimitive.Item>
    </TextClassContext.Provider>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

type LucideIconProps = LucideIcon extends (props: infer P) => any ? P : never;

function ToggleGroupIcon({
  className,
  icon: Icon,
  ...props
}: LucideIconProps & { icon: LucideIcon }) {
  const textClass = React.useContext(TextClassContext);
  return <Icon className={cn(textClass, className)} {...props} />;
}

export { ToggleGroup, ToggleGroupIcon, ToggleGroupItem };
