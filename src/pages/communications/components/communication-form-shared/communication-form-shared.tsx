import {
  Badge,
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FileIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

export const inputStyle = {
  h: '2.75rem',
  bg: 'inputBg',
  border: '1px solid',
  borderColor: 'inputBorder',
  borderRadius: 'md',
  color: 'text',
  fontWeight: 'medium',
  px: 4,
  _placeholder: { color: 'placeholder' },
  _hover: { borderColor: 'primary' },
  _focus: {
    borderColor: 'primary',
    outline: '1px solid var(--chakra-colors-primary)',
    outlineOffset: '0px',
  },
};

export const selectStyle: React.CSSProperties = {
  width: '100%',
  height: '52px',
  borderRadius: '12px',
  border: '1px solid var(--chakra-colors-inputBorder)',
  padding: '0 18px',
  background: 'var(--chakra-colors-inputBg)',
  color: 'var(--chakra-colors-text)',
  fontWeight: 600,
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
};

type CardProps = {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

export const CommunicationFormCard = ({ title, children, action }: CardProps) => (
  <Box bg='surface' p='6' borderRadius='2xl' borderWidth='1px' borderColor='border' boxShadow='sm'>
    <Flex justify='space-between' align='center' mb='6'>
      <Heading size='md' color='text'>
        {title}
      </Heading>

      {action}
    </Flex>

    {children}
  </Box>
);

export const CommunicationEmptyState = ({ message }: { message: string }) => (
  <Flex py='8' justify='center' align='center' bg='surfaceMuted' borderRadius='xl'>
    <Text color='textSecondary' fontSize='sm'>
      {message}
    </Text>
  </Flex>
);

export type RecipientItem = {
  id?: string;
  email: string;
  recipientType: 'to' | 'cc' | 'bcc';
};

type RecipientsCardProps = {
  recipients: RecipientItem[];
  disabled?: boolean;
  onAddClick: () => void;
  onRemove: (recipient: RecipientItem) => void;
};

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
  </CommunicationFormCard>
);

type LocalAttachment = {
  type: 'local';
  file: File;
  index: number;
};

type PersistedAttachment = {
  type: 'persisted';
  id: string;
  originalFileName: string;
  fileSizeBytes: number;
};

type AttachmentItem = LocalAttachment | PersistedAttachment;

const getAttachmentName = (attachment: AttachmentItem) =>
  attachment.type === 'local' ? attachment.file.name : attachment.originalFileName;

const getAttachmentSize = (attachment: AttachmentItem) =>
  attachment.type === 'local' ? attachment.file.size : attachment.fileSizeBytes;

type AttachmentsCardProps = {
  attachments: AttachmentItem[];
  disabled?: boolean;
  isLoading?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (attachment: AttachmentItem) => void;
};

export const AttachmentsCard = ({
  attachments,
  disabled,
  isLoading,
  fileInputRef,
  onFileChange,
  onRemove,
}: AttachmentsCardProps) => (
  <CommunicationFormCard
    title='Attachments'
    action={
      <>
        <Button
          size='sm'
          variant='ghost'
          color='primary'
          fontWeight='bold'
          loading={isLoading}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <HStack gap='1'>
            <PlusIcon size={16} />
            <Text>Add File</Text>
          </HStack>
        </Button>

        <input ref={fileInputRef} type='file' multiple hidden onChange={onFileChange} />
      </>
    }
  >
    {attachments.length === 0 ? (
      <CommunicationEmptyState message='No attachments added yet.' />
    ) : (
      <Stack gap='3'>
        {attachments.map((attachment) => (
          <Flex
            key={
              attachment.type === 'local'
                ? `${attachment.file.name}-${attachment.file.size}-${attachment.index}`
                : attachment.id
            }
            align='center'
            justify='space-between'
            p='3'
            borderWidth='1px'
            borderColor='border'
            borderRadius='xl'
            bg='surfaceMuted'
            gap='3'
          >
            <HStack minW='0' flex='1'>
              <FileIcon size={18} />

              <Box minW='0'>
                <Text fontWeight='medium' color='text' truncate>
                  {getAttachmentName(attachment)}
                </Text>

                <Text fontSize='xs' color='textSecondary'>
                  {(getAttachmentSize(attachment) / 1024 / 1024).toFixed(2)} MB
                </Text>
              </Box>
            </HStack>

            <IconButton
              aria-label='Remove attachment'
              variant='ghost'
              colorScheme='red'
              size='xs'
              onClick={() => onRemove(attachment)}
              disabled={disabled}
            >
              <TrashIcon size={16} />
            </IconButton>
          </Flex>
        ))}
      </Stack>
    )}
  </CommunicationFormCard>
);

type RecipientDialogProps = {
  open: boolean;
  isLoading?: boolean;
  emailError?: string;
  emailRegister: UseFormRegisterReturn;
  typeRegister: UseFormRegisterReturn;
  onClose: () => void;
  onSubmit: () => void;
};

export const RecipientDialog = ({
  open,
  isLoading,
  emailError,
  emailRegister,
  typeRegister,
  onClose,
  onSubmit,
}: RecipientDialogProps) => (
  <Dialog.Root open={open} onOpenChange={(details: { open: boolean }) => !details.open && onClose()}>
    <Dialog.Backdrop bg='blackAlpha.400' />

    <Dialog.Positioner>
      <Dialog.Content borderRadius='2xl' boxShadow='2xl' bg='surface' p='6'>
        <Dialog.Header px='0' pt='0' pb='4'>
          <Heading size='md' color='text'>
            Add Recipient
          </Heading>
        </Dialog.Header>

        <Dialog.CloseTrigger onClick={onClose} top='4' right='4' />

        <Dialog.Body px='0'>
          <Stack gap='4' py='4'>
            <Field.Root invalid={!!emailError} position='relative' pb='22px'>
              <Field.Label fontSize='sm' fontWeight='bold' color='primary'>
                Email Address
              </Field.Label>

              <Input {...emailRegister} placeholder='recipient@example.com' {...inputStyle} />

              {emailError && (
                <Text position='absolute' bottom='0' color='error' fontSize='xs'>
                  {emailError}
                </Text>
              )}
            </Field.Root>

            <Field.Root>
              <Field.Label fontSize='sm' fontWeight='bold' color='primary'>
                Type
              </Field.Label>

              <select {...typeRegister} style={selectStyle}>
                <option value='to'>To</option>
                <option value='cc'>Cc</option>
                <option value='bcc'>Bcc</option>
              </select>
            </Field.Root>
          </Stack>
        </Dialog.Body>

        <Dialog.Footer px='0' gap='3'>
          <Button
            variant='outline'
            borderColor='inputBorder'
            color='primary'
            fontWeight='bold'
            borderRadius='full'
            px={6}
            h='2.75rem'
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            bg='actionBg'
            color='white'
            fontWeight='bold'
            borderRadius='full'
            px={6}
            h='2.75rem'
            loading={isLoading}
            loadingText='Adding...'
            _hover={{ bg: 'actionHover' }}
            onClick={onSubmit}
          >
            Add Recipient
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Positioner>
  </Dialog.Root>
);
