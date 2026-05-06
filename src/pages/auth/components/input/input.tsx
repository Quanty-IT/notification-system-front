import { Input as ChakraInput, Field, InputProps } from '@chakra-ui/react';

type Props = InputProps & {
  label?: string;
};

export const Input = ({ label, ...props }: Props) => {
  return (
    <>
      {label && (
        <Field.Label fontWeight='semibold' color='text'>
          {label}
        </Field.Label>
      )}

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
        outline='none'
        boxShadow='none'
        _placeholder={{
          color: 'placeholder',
          opacity: 1,
        }}
        _hover={{ borderColor: 'primary' }}
        _focusVisible={{
          borderColor: 'primary',
          boxShadow: '0 0 0 1px var(--chakra-colors-primary)',
          outline: 'none',
        }}
        _invalid={{
          borderColor: 'red.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-red-500)',
        }}
        {...props}
      />
    </>
  );
};
