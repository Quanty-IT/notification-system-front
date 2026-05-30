import { Badge, Box, Button, Flex, HStack, IconButton, Stack, Text } from '@chakra-ui/react';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FormErrorInline } from '@/shared/components';
import { CommunicationEmptyState } from '../communication-empty-state';
import { CommunicationFormCard } from '../communication-form-card';
import { RecipientsCardProps } from './types';

export const RecipientsCard = ({ recipients, disabled, errorMessage, onAddClick, onRemove }: RecipientsCardProps) => (
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
    <Stack gap='2'>
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
              borderColor='border'
              borderRadius='xl'
              bg='surfaceMuted'
            >
              <Box minW='0' flex='1' mr='3'>
                <Text fontWeight='medium' color='text' truncate>
                  {recipient.email}
                </Text>
              </Box>

              <HStack gap='3'>
                <Badge bg='successBg' color='successText' borderRadius='full' px='3' py='1' textTransform='none'>
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

      <FormErrorInline message={errorMessage} />
    </Stack>
  </CommunicationFormCard>
);
