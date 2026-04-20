import { HStack, Text } from '@chakra-ui/react';
import { XCircleIcon } from '@phosphor-icons/react';
import { FormErrorInlineProps } from './types';

export const FormErrorInline = ({ message }: FormErrorInlineProps) => {
  return (
    <HStack align='center' gap={1} mt={1} h='1rem'>
      {' '}
      {message && (
        <>
          <XCircleIcon size={14} weight='duotone' color='var(--chakra-colors-error)' />
          <Text color='error' fontSize='xs'>
            {message}
          </Text>
        </>
      )}
    </HStack>
  );
};
