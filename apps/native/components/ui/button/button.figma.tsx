/**
 * Figma Code Connect specification for Button component
 *
 * This file defines the mapping between Figma design tokens and the React Native Button component.
 * It will be used by Figma Code Connect when available.
 *
 * Note: Requires Figma Organization or Enterprise plan to use Code Connect.
 */

import { figma } from '@figma/code-connect';

import { Button } from './button';

// Main Button component mapping
figma.connect(Button, 'https://www.figma.com/design/[FILE_ID]/[FILE_NAME]?node-id=[NODE_ID]', {
  props: {
    // Map Figma variant properties to component props
    variant: figma.enum('Variant', {
      Primary: 'primary',
      Secondary: 'secondary',
      Outline: 'outline',
      Accent: 'accent',
      Tonal: 'tonal',
      Plain: 'plain',
    }),

    size: figma.enum('Size', {
      Small: 'sm',
      Medium: 'md',
      Large: 'lg',
      Icon: 'icon',
    }),

    disabled: figma.boolean('Disabled'),

    // Map button text content
    children: figma.string('Label'),
  },

  // Define the component structure
  example: (props) => (
    <Button variant={props.variant} size={props.size} disabled={props.disabled}>
      {props.children}
    </Button>
  ),
});

// Additional variant-specific mappings if needed
figma.connect(
  Button,
  'https://www.figma.com/design/[FILE_ID]/[FILE_NAME]?node-id=[ICON_BUTTON_NODE_ID]',
  {
    variant: { Size: 'Icon' },
    props: {
      variant: figma.enum('Variant', {
        Primary: 'primary',
        Secondary: 'secondary',
        Outline: 'outline',
        Accent: 'accent',
      }),

      disabled: figma.boolean('Disabled'),

      // For icon buttons, we might have an icon child instead of text
      children: figma.instance('Icon'),
    },

    example: (props) => (
      <Button variant={props.variant} size="icon" disabled={props.disabled}>
        {props.children}
      </Button>
    ),
  }
);

export default Button;
