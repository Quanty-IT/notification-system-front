import { ButtonProps, Button as ChakraButton } from '@chakra-ui/react';

type ButtonVisual = 'primary' | 'secondary';

type Props = ButtonProps & {
  visual?: ButtonVisual;
};

const visualStyles: Record<ButtonVisual, ButtonProps> = {
  primary: {
    bg: 'actionBg',
    color: 'white',
    _hover: { bg: 'actionHover' },
    _active: { bg: 'actionHover' },
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
  return <ChakraButton h='3rem' px={4} borderRadius='lg' fontWeight='bold' {...visualStyles[visual]} {...props} />;
};
