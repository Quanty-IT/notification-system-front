import { Box, Flex, Heading } from '@chakra-ui/react';
import { CommunicationFormCardProps } from './types';

export const CommunicationFormCard = ({ title, children, action }: CommunicationFormCardProps) => (
  <Box bg='surface' p='6' borderRadius='2xl' borderWidth='1px' borderColor='gray.100' boxShadow='sm'>
    <Flex justify='space-between' align='center' mb='6'>
      <Heading size='md' color='text'>
        {title}
      </Heading>

      {action}
    </Flex>

    {children}
  </Box>
);
