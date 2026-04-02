import { HStack, Text } from '@chakra-ui/react';
import { XCircle } from 'phosphor-react';
import { FormErrorInlineProps } from './types';

export const FormErrorInline = ({ message }: FormErrorInlineProps) => {
  return (
    <HStack align='center' gap={1} mt={1} h='1rem'>
      {' '}
      {message && (
        <>
          <XCircle size={14} weight='duotone' color='var(--chakra-colors-error)' />
          <Text color='error' fontSize='xs'>
            {message}
          </Text>
        </>
      )}
    </HStack>
  );
};
