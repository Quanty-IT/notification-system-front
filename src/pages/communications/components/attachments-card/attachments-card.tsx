import { Box, Button, Flex, HStack, IconButton, Stack, Text } from '@chakra-ui/react';
import { FileIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { CommunicationEmptyState } from '../communication-empty-state';
import { CommunicationFormCard } from '../communication-form-card';
import { AttachmentItem, AttachmentsCardProps } from './types';

const getAttachmentName = (attachment: AttachmentItem) =>
  attachment.type === 'local' ? attachment.file.name : attachment.originalFileName;

const getAttachmentSize = (attachment: AttachmentItem) =>
  attachment.type === 'local' ? attachment.file.size : attachment.fileSizeBytes;

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
            borderColor='gray.100'
            borderRadius='xl'
            bg='white'
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
