import { Input as ChakraInput, Field, InputProps } from '@chakra-ui/react';

type Props = InputProps & {
  label: string;
};

export const Input = ({ label, ...props }: Props) => {
  return (
    <Field.Root>
      <Field.Label mb={1.5} fontWeight='semibold' color='text'>
        {label}
      </Field.Label>

      <ChakraInput
        h='3rem'
        px={4}
        py={2}
        lineHeight='1.2'
        borderRadius='lg'
        border='1px solid'
        borderColor='inputBorder'
        bg='white'
        color='text'
        _placeholder={{
          color: 'placeholder',
          opacity: 1,
        }}
        _hover={{ borderColor: 'primary' }}
        _focusVisible={{
          borderColor: 'primary',
          boxShadow: '0 0 0 1px var(--chakra-colors-primary)',
        }}
        {...props}
      />
    </Field.Root>
  );
};
