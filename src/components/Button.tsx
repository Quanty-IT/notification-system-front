import { Button as ChakraButton } from '@chakra-ui/react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface ButtonProps {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary' }: ButtonProps) {
  return (
    <ChakraButton
      type="button"
      w="100px"
      h="40px"
      rounded="md"
      border="none"
      m="2"
      fontWeight="semibold"
      color={variant}
    >
      Login
    </ChakraButton>
  );
}