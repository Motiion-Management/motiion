import { Root } from '@radix-ui/react-slot';

// Relax typing to avoid cross-React type incompatibilities in web build
const Slot: any = Root as any;

const Text = Slot;

const Pressable = Slot;

const View = Slot;

const Image = Slot;

export { Slot };

export { Text, Pressable, View, Image };
