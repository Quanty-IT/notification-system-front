import {
  Badge,
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Spinner,
  Stack,
  Text,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, FileIcon, FloppyDiskIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { getCommunicationDetailPath } from '@/routes';
import {
  addCommunicationRecipient,
  getCommunicationById,
  removeCommunicationAttachment,
  removeCommunicationRecipient,
  updateCommunication,
  uploadCommunicationAttachment,
} from '@/services';
import { CommunicationDetail, UpdateCommunicationInput } from '@/services/communications/types';

const updateSchema = z.object({
  subject: z.string().max(255).optional(),
  body: z.string().optional(),
  scheduledAt: z.string().optional(),
  templateVariablesJson: z.record(z.string(), z.any()).optional(),
});

type UpdateFormData = z.infer<typeof updateSchema>;

const recipientSchema = z.object({
  email: z.email('Invalid email'),
  recipientType: z.enum(['to', 'cc', 'bcc']),
});

type RecipientFormData = z.infer<typeof recipientSchema>;

const editableStatuses = ['draft', 'scheduled'];

const inputStyle = {
  h: '2.75rem',
  bg: 'white',
  border: '1px solid',
  borderColor: 'inputBorder',
  borderRadius: 'md',
  color: 'gray.900',
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
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string | string[]; errors?: unknown } | undefined;

    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (typeof data?.message === 'string') return data.message;
    if (data?.errors) return typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);

    return error.message;
  }

  if (error instanceof Error) return error.message;

  return 'An unexpected error occurred';
};

export const EditCommunication: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { open: isRecipientModalOpen, onOpen: onRecipientModalOpen, onClose: onRecipientModalClose } = useDisclosure();

  const [communication, setCommunication] = useState<CommunicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      subject: '',
      body: '',
      scheduledAt: '',
      templateVariablesJson: {},
    },
  });

  const {
    register: registerRecipient,
    handleSubmit: handleSubmitRecipient,
    reset: resetRecipient,
    formState: { errors: recipientErrors },
  } = useForm<RecipientFormData>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      recipientType: 'to',
    },
  });

  const canEdit = communication ? editableStatuses.includes(communication.status) : false;

  const loadCommunication = React.useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      const data = await getCommunicationById({ id });

      setCommunication(data);

      reset({
        subject: data.subject ?? '',
        body: data.body ?? '',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString().slice(0, 16) : '',
        templateVariablesJson: data.templateVariablesJson ?? {},
      });
    } catch (error) {
      alert(`Failed to load communication: ${getErrorMessage(error)}`);
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, reset]);

  useEffect(() => {
    loadCommunication();
  }, [loadCommunication]);

  const onSave: SubmitHandler<UpdateFormData> = async (data) => {
    if (!id || !communication) return;

    try {
      setIsSaving(true);

      const payload: UpdateCommunicationInput = {};

      if (data.scheduledAt) {
        payload.scheduledAt = new Date(data.scheduledAt).toISOString();
      }

      if (communication.sourceType === 'manual') {
        payload.subject = data.subject?.trim();
        payload.body = data.body?.trim();
      }

      if (communication.sourceType === 'template') {
        payload.templateVariablesJson = data.templateVariablesJson ?? {};
      }

      await updateCommunication({
        id,
        data: payload,
      });

      navigate(getCommunicationDetailPath(id));
    } catch (error) {
      alert(`Failed to update communication: ${getErrorMessage(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRecipient = async (data: RecipientFormData) => {
    if (!id) return;

    const alreadyExists = communication?.recipients.some(
      (recipient) => recipient.email === data.email && recipient.recipientType === data.recipientType,
    );

    if (alreadyExists) {
      alert('Recipient already added with this type.');
      return;
    }

    try {
      setIsAddingRecipient(true);

      const newRecipient = await addCommunicationRecipient({
        communicationId: id,
        data,
      });

      setCommunication((prev) =>
        prev
          ? {
              ...prev,
              recipients: [...prev.recipients, newRecipient],
            }
          : null,
      );

      resetRecipient();
      onRecipientModalClose();
    } catch (error) {
      alert(`Failed to add recipient: ${getErrorMessage(error)}`);
    } finally {
      setIsAddingRecipient(false);
    }
  };

  const handleRemoveRecipient = async (recipientId: string) => {
    if (!id) return;

    try {
      await removeCommunicationRecipient({
        communicationId: id,
        recipientId,
      });

      setCommunication((prev) =>
        prev
          ? {
              ...prev,
              recipients: prev.recipients.filter((recipient) => recipient.id !== recipientId),
            }
          : null,
      );
    } catch (error) {
      alert(`Failed to remove recipient: ${getErrorMessage(error)}`);
    }
  };

  const handleUploadAttachment = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!id || files.length === 0) return;

    try {
      setIsUploadingAttachment(true);

      for (const file of files) {
        const newAttachment = await uploadCommunicationAttachment({
          communicationId: id,
          file,
        });

        setCommunication((prev) =>
          prev
            ? {
                ...prev,
                attachments: [...prev.attachments, newAttachment],
              }
            : null,
        );
      }
    } catch (error) {
      alert(`Failed to upload attachment: ${getErrorMessage(error)}`);
    } finally {
      setIsUploadingAttachment(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!id) return;

    try {
      await removeCommunicationAttachment({
        communicationId: id,
        attachmentId,
      });

      setCommunication((prev) =>
        prev
          ? {
              ...prev,
              attachments: prev.attachments.filter((attachment) => attachment.id !== attachmentId),
            }
          : null,
      );
    } catch (error) {
      alert(`Failed to remove attachment: ${getErrorMessage(error)}`);
    }
  };

  if (isLoading) {
    return (
      <Flex minH='60vh' align='center' justify='center' direction='column' gap='3'>
        <Spinner color='primary' />
        <Text color='textSecondary'>Loading communication...</Text>
      </Flex>
    );
  }

  if (!communication) {
    return (
      <Flex minH='60vh' align='center' justify='center'>
        <Text color='textSecondary'>Communication not found.</Text>
      </Flex>
    );
  }

  return (
    <Box w='full' minH='100vh' overflowX='hidden' py={{ base: '6', md: '8' }} px={{ base: '4', md: '8', lg: '10' }}>
      <Button
        variant='ghost'
        mb='8'
        px='0'
        color='textSecondary'
        _hover={{ bg: 'transparent', color: 'primary' }}
        onClick={() => navigate(-1)}
        disabled={isSaving}
      >
        <HStack gap='2'>
          <ArrowLeftIcon size={16} />
          <Text>Back</Text>
        </HStack>
      </Button>

      <Flex justify='space-between' align={{ base: 'flex-start', md: 'center' }} gap='4' wrap='wrap' mb='8'>
        <Box>
          <Heading size='xl' color='text' letterSpacing='tight'>
            Edit Communication
          </Heading>

          <Text mt='2' color='textSecondary' fontSize='sm'>
            {canEdit
              ? 'Update communication details, recipients and attachments.'
              : 'This communication can no longer be edited.'}
          </Text>
        </Box>

        <Button
          bg='primary'
          color='white'
          px='6'
          py='2.5'
          borderRadius='xl'
          fontWeight='bold'
          boxShadow='lg'
          loading={isSaving}
          loadingText='Saving...'
          onClick={handleSubmit(onSave)}
          disabled={!canEdit}
          _hover={{ bg: 'secondary' }}
        >
          <HStack gap='2'>
            <FloppyDiskIcon size={20} />
            <Text>Save Changes</Text>
          </HStack>
        </Button>
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap='6'>
        <Stack gap='6'>
          <Box bg='surface' p='6' borderRadius='2xl' borderWidth='1px' borderColor='gray.100' boxShadow='sm'>
            <Heading size='md' mb='6' color='text'>
              General Information
            </Heading>

            <Stack gap='5'>
              <Field.Root>
                <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                  Source Type
                </Field.Label>

                <Input
                  value={communication.sourceType === 'manual' ? 'Manual Content' : 'Template'}
                  readOnly
                  disabled
                  {...inputStyle}
                />
              </Field.Root>

              {communication.sourceType === 'manual' && (
                <>
                  <Field.Root invalid={!!errors.subject} position='relative' pb='22px'>
                    <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                      Subject
                    </Field.Label>

                    <Controller
                      name='subject'
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          placeholder='Email subject'
                          disabled={!canEdit}
                          {...inputStyle}
                        />
                      )}
                    />

                    {errors.subject && (
                      <Text position='absolute' bottom='0' color='error' fontSize='xs'>
                        {errors.subject.message}
                      </Text>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.body} position='relative' pb='22px'>
                    <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                      Body
                    </Field.Label>

                    <Controller
                      name='body'
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          value={field.value ?? ''}
                          placeholder='Email content'
                          minH='220px'
                          bg='white'
                          border='1px solid'
                          borderColor={errors.body ? 'error' : 'inputBorder'}
                          borderRadius='md'
                          color='gray.900'
                          fontWeight='medium'
                          resize='none'
                          px={4}
                          py={3}
                          lineHeight='1.6'
                          disabled={!canEdit}
                          _placeholder={{ color: 'placeholder' }}
                          _hover={{ borderColor: errors.body ? 'error' : 'primary' }}
                          _focus={{
                            borderColor: errors.body ? 'error' : 'primary',
                            outline: errors.body
                              ? '1px solid var(--chakra-colors-error)'
                              : '1px solid var(--chakra-colors-primary)',
                            outlineOffset: '0px',
                          }}
                        />
                      )}
                    />

                    {errors.body && (
                      <Text position='absolute' bottom='0' color='error' fontSize='xs'>
                        {errors.body.message}
                      </Text>
                    )}
                  </Field.Root>
                </>
              )}

              {communication.sourceType === 'template' && (
                <Stack gap='5'>
                  <Box p='4' bg='gray.50' borderRadius='xl' borderLeftWidth='4px' borderColor='primary'>
                    <Text color='primary' fontWeight='bold'>
                      Template based communication
                    </Text>

                    <Text color='textSecondary' fontSize='sm' mt='1'>
                      Template version: {communication.templateVersionId}
                    </Text>
                  </Box>

                  {communication.templateVariablesJson &&
                  Object.keys(communication.templateVariablesJson).length > 0 ? (
                    <Box p='4' bg='gray.50' borderRadius='xl'>
                      <Text fontWeight='bold' fontSize='sm' color='primary' mb='4'>
                        Template Variables
                      </Text>

                      <Stack gap='4'>
                        {Object.keys(communication.templateVariablesJson).map((variableName) => (
                          <Field.Root key={variableName}>
                            <Field.Label fontSize='xs' fontWeight='bold' color='textSecondary'>
                              {`{{${variableName}}}`}
                            </Field.Label>

                            <Controller
                              name={`templateVariablesJson.${variableName}`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  value={field.value ?? ''}
                                  placeholder={`Enter ${variableName}`}
                                  disabled={!canEdit}
                                  {...inputStyle}
                                />
                              )}
                            />
                          </Field.Root>
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Box p='4' bg='gray.50' borderRadius='xl'>
                      <Text color='textSecondary' fontSize='sm'>
                        This template has no variables.
                      </Text>
                    </Box>
                  )}
                </Stack>
              )}

              <Field.Root invalid={!!errors.scheduledAt}>
                <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                  Scheduled For
                </Field.Label>

                <Controller
                  name='scheduledAt'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      type='datetime-local'
                      disabled={!canEdit}
                      {...inputStyle}
                    />
                  )}
                />

                <Text fontSize='xs' color='textSecondary' mt='2'>
                  Leave blank to keep it as draft. Sending now should use the send action.
                </Text>
              </Field.Root>
            </Stack>
          </Box>

          <Box bg='surface' p='6' borderRadius='2xl' borderWidth='1px' borderColor='gray.100' boxShadow='sm'>
            <Flex justify='space-between' align='center' mb='6'>
              <Heading size='md' color='text'>
                Recipients
              </Heading>

              <Button
                size='sm'
                variant='ghost'
                color='primary'
                fontWeight='bold'
                onClick={onRecipientModalOpen}
                disabled={!canEdit || isAddingRecipient}
              >
                <HStack gap='1'>
                  <PlusIcon size={16} />
                  <Text>Add Recipient</Text>
                </HStack>
              </Button>
            </Flex>

            {communication.recipients.length === 0 ? (
              <Flex py='8' justify='center' align='center' bg='gray.50' borderRadius='xl'>
                <Text color='textSecondary' fontSize='sm'>
                  No recipients added yet.
                </Text>
              </Flex>
            ) : (
              <Stack gap='3'>
                {communication.recipients.map((recipient) => (
                  <Flex
                    key={recipient.id}
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
                      <Badge variant='subtle' colorScheme='blue'>
                        {recipient.recipientType}
                      </Badge>

                      <IconButton
                        aria-label='Remove recipient'
                        variant='ghost'
                        colorScheme='red'
                        size='xs'
                        onClick={() => handleRemoveRecipient(recipient.id)}
                        disabled={!canEdit}
                      >
                        <TrashIcon size={16} />
                      </IconButton>
                    </HStack>
                  </Flex>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>

        <Stack gap='6'>
          <Box bg='surface' p='6' borderRadius='2xl' borderWidth='1px' borderColor='gray.100' boxShadow='sm'>
            <Flex justify='space-between' align='center' mb='6'>
              <Heading size='md' color='text'>
                Attachments
              </Heading>

              <Button
                size='sm'
                variant='ghost'
                color='primary'
                fontWeight='bold'
                onClick={() => fileInputRef.current?.click()}
                loading={isUploadingAttachment}
                disabled={!canEdit}
              >
                <HStack gap='1'>
                  <PlusIcon size={16} />
                  <Text>Add File</Text>
                </HStack>
              </Button>

              <input ref={fileInputRef} type='file' multiple hidden onChange={handleUploadAttachment} />
            </Flex>

            {communication.attachments.length === 0 ? (
              <Flex py='8' justify='center' align='center' bg='gray.50' borderRadius='xl'>
                <Text color='textSecondary' fontSize='sm'>
                  No attachments added yet.
                </Text>
              </Flex>
            ) : (
              <Stack gap='3'>
                {communication.attachments.map((attachment) => (
                  <Flex
                    key={attachment.id}
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
                          {attachment.originalFileName}
                        </Text>

                        <Text fontSize='xs' color='textSecondary'>
                          {(attachment.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </Box>
                    </HStack>

                    <IconButton
                      aria-label='Remove attachment'
                      variant='ghost'
                      colorScheme='red'
                      size='xs'
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      disabled={!canEdit}
                    >
                      <TrashIcon size={16} />
                    </IconButton>
                  </Flex>
                ))}
              </Stack>
            )}
          </Box>

          <Box bg='surface' p='6' borderRadius='2xl' borderWidth='1px' borderColor='gray.100' boxShadow='sm'>
            <Heading size='md' mb='6' color='text'>
              Status
            </Heading>

            <Stack gap='3'>
              <Flex justify='space-between' align='center'>
                <Text fontSize='sm' color='textSecondary'>
                  Status
                </Text>

                <Badge variant='subtle' colorScheme={canEdit ? 'blue' : 'gray'}>
                  {communication.status}
                </Badge>
              </Flex>

              <Flex justify='space-between' align='center'>
                <Text fontSize='sm' color='textSecondary'>
                  Channel
                </Text>

                <Text fontSize='sm' fontWeight='bold' color='text'>
                  {communication.channel}
                </Text>
              </Flex>

              <Flex justify='space-between' align='center'>
                <Text fontSize='sm' color='textSecondary'>
                  Created
                </Text>

                <Text fontSize='sm' fontWeight='bold' color='text'>
                  {new Date(communication.createdAt).toLocaleString()}
                </Text>
              </Flex>
            </Stack>
          </Box>
        </Stack>
      </Grid>

      <Dialog.Root
        open={isRecipientModalOpen}
        onOpenChange={(details: { open: boolean }) => !details.open && onRecipientModalClose()}
      >
        <Dialog.Backdrop bg='blackAlpha.400' />

        <Dialog.Positioner>
          <Dialog.Content borderRadius='2xl' boxShadow='2xl' bg='surface' p='6'>
            <Dialog.Header px='0' pt='0' pb='4'>
              <Heading size='md' color='text'>
                Add Recipient
              </Heading>
            </Dialog.Header>

            <Dialog.CloseTrigger onClick={onRecipientModalClose} top='4' right='4' />

            <Dialog.Body px='0'>
              <Stack gap='4' py='4'>
                <Field.Root invalid={!!recipientErrors.email} position='relative' pb='22px'>
                  <Field.Label fontSize='sm' fontWeight='bold' color='primary'>
                    Email Address
                  </Field.Label>

                  <Input {...registerRecipient('email')} placeholder='recipient@example.com' {...inputStyle} />

                  {recipientErrors.email && (
                    <Text position='absolute' bottom='0' color='error' fontSize='xs'>
                      {recipientErrors.email.message}
                    </Text>
                  )}
                </Field.Root>

                <Field.Root>
                  <Field.Label fontSize='sm' fontWeight='bold' color='primary'>
                    Type
                  </Field.Label>

                  <select
                    {...registerRecipient('recipientType')}
                    style={{
                      width: '100%',
                      height: '44px',
                      borderRadius: '8px',
                      border: '1px solid var(--chakra-colors-inputBorder)',
                      padding: '0 16px',
                      background: 'white',
                      color: '#111827',
                      fontWeight: 500,
                    }}
                  >
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
                _hover={{ bg: 'gray.50', borderColor: 'primary' }}
                onClick={onRecipientModalClose}
                disabled={isAddingRecipient}
              >
                Cancel
              </Button>

              <Button
                bg='primary'
                color='white'
                fontWeight='bold'
                borderRadius='full'
                px={6}
                h='2.75rem'
                _hover={{ bg: 'secondary' }}
                loading={isAddingRecipient}
                loadingText='Adding...'
                onClick={handleSubmitRecipient(handleAddRecipient)}
              >
                Add Recipient
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
};
