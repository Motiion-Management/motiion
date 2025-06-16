import { Text, TextProps } from './Text';

type ErrorTextProps = {
  children?: TextProps['children'];
};
export const ErrorText = ({ children }: ErrorTextProps) => {
  if (!children) return null;
  return (
    <Text variant="bodyXs" className="ml-6 text-text-error">
      {children}
    </Text>
  );
};
