import { Badge, Box, Button, Flex, HStack, IconButton, Stack, Text } from '@chakra-ui/react';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { CommunicationEmptyState } from '../communication-empty-state';
import { CommunicationFormCard } from '../communication-form-card';
import { RecipientsCardProps } from './types';

export const RecipientsCard = ({ recipients, disabled, onAddClick, onRemove }: RecipientsCardProps) => (
  <CommunicationFormCard
    title='Recipients'
    action={
      <Button size='sm' variant='ghost' color='primary' fontWeight='bold' onClick={onAddClick} disabled={disabled}>
        <HStack gap='1'>
          <PlusIcon size={16} />
          <Text>Add Recipient</Text>
        </HStack>
      </Button>
    }
  >
    {recipients.length === 0 ? (
      <CommunicationEmptyState message='No recipients added yet.' />
    ) : (
      <Stack gap='3'>
        {recipients.map((recipient) => (
          <Flex
            key={recipient.id ?? `${recipient.email}-${recipient.recipientType}`}
            align='center'
            justify='space-between'
            p='3'
            borderWidth='1px'
            borderColor='gray.100'
            borderRadius='xl'
            bg='white'
          >
            <Box minW='0' flex='1' mr='3'>
              <Text fontWeight='medium' color='text' truncate>
                {recipient.email}
              </Text>
            </Box>

            <HStack gap='3'>
              <Badge bg='green.50' color='green.800' borderRadius='full' px='3' py='1' textTransform='none'>
                {recipient.recipientType}
              </Badge>

              <IconButton
                aria-label='Remove recipient'
                variant='ghost'
                colorScheme='red'
                size='xs'
                onClick={() => onRemove(recipient)}
                disabled={disabled}
              >
                <TrashIcon size={16} />
              </IconButton>
            </HStack>
          </Flex>
        ))}
      </Stack>
    )}
  </CommunicationFormCard>
);
