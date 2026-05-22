import { Flex, Text } from '@chakra-ui/react';
import { CommunicationEmptyStateProps } from './types';

export const CommunicationEmptyState = ({ message }: CommunicationEmptyStateProps) => (
  <Flex py='8' justify='center' align='center' bg='gray.50' borderRadius='xl'>
    <Text color='textSecondary' fontSize='sm'>
      {message}
    </Text>
  </Flex>
);
