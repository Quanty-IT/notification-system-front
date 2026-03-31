import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react';

type ButtonVisual = 'primary' | 'secondary';

type Props = ButtonProps & {
  visual?: ButtonVisual;
};

const visualStyles: Record<ButtonVisual, ButtonProps> = {
  primary: {
    bg: 'primary',
    color: 'white',
    _hover: { bg: 'secondary' },
    _active: { bg: 'secondary' },
  },
  secondary: {
    bg: 'transparent',
    color: 'primary',
    border: '1px solid',
    borderColor: 'primary',
    _hover: { bg: 'gray.100' },
  },
};

export const Button = ({ visual = 'primary', ...props }: Props) => {
  return (
    <ChakraButton
      h='3rem'
      px={4}
      borderRadius='lg'
      fontWeight='bold'
      {...visualStyles[visual]}
      {...props}
    />
  );
};