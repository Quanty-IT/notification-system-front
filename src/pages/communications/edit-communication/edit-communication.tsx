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
  Table,
  Text,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';

import { ArrowLeftIcon, FloppyDiskIcon, PaperclipIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { getCommunicationDetailPath } from '../../../routes/routes.constants';
import {
  addAttachment,
  addRecipient,
  Communication,
  getCommunicationById,
  removeAttachment,
  removeRecipient,
  updateCommunication,
} from '../../../services';

const updateSchema = z.object({
  subject: z.string().max(255).nullable().optional(),
  body: z.string().nullable().optional(),
  bodyType: z.enum(['text', 'html']).nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
});

type UpdateFormData = z.infer<typeof updateSchema>;

const recipientSchema = z.object({
  email: z.string().email('Invalid email'),
  recipientType: z.enum(['to', 'cc', 'bcc']),
});

type RecipientFormData = z.infer<typeof recipientSchema>;

export const EditCommunication: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { open: isRecipientModalOpen, onOpen: onRecipientModalOpen, onClose: onRecipientModalClose } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [communication, setCommunication] = useState<Communication | null>(null);
  const [loading, setLoading] = useState(true);
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

  const loadCommunication = React.useCallback(
    async (commId: string) => {
      try {
        setLoading(true);
        const data = await getCommunicationById(commId);
        setCommunication(data);
        reset({
          subject: data.subject,
          body: data.body,
          bodyType: data.bodyType ?? 'text',
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString().slice(0, 16) : null,
        });
      } catch (error) {
        console.error('Failed to load communication:', error);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    },
    [navigate, reset],
  );

  useEffect(() => {
    if (id) {
      loadCommunication(id);
    }
  }, [id, loadCommunication]);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as { message?: string | string[]; errors?: unknown };
      if (data?.message && Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      if (data?.errors) {
        return typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
      }
      return data?.message || error.message;
    }
    return 'An unexpected error occurred';
  };

  const onSave = async (data: UpdateFormData) => {
    if (!id || !communication) return;
    try {
      setIsSaving(true);

      const payload: Record<string, unknown> = {
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
      };

      if (communication.sourceType === 'manual') {
        payload.subject = data.subject;
        payload.body = data.body;
        payload.bodyType = data.bodyType;
      }

      await updateCommunication(id, payload);
      navigate(getCommunicationDetailPath(id));
    } catch (error) {
      const message = getErrorMessage(error);
      alert(`Failed to update communication: ${message}`);
      console.error('Failed to update communication:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRecipient = async (data: RecipientFormData) => {
    if (!id) return;
    try {
      setIsAddingRecipient(true);
      const newRecipient = await addRecipient(id, data);
      setCommunication((prev) => (prev ? { ...prev, recipients: [...prev.recipients, newRecipient] } : null));
      onRecipientModalClose();
      resetRecipient();
    } catch (error) {
      const message = getErrorMessage(error);
      alert(`Failed to add recipient: ${message}`);
      console.error('Failed to add recipient:', error);
    } finally {
      setIsAddingRecipient(false);
    }
  };

  const handleRemoveRecipient = async (recipientId: string) => {
    if (!id) return;
    try {
      await removeRecipient(id, recipientId);
      setCommunication((prev) =>
        prev ? { ...prev, recipients: prev.recipients.filter((r) => r.id !== recipientId) } : null,
      );
    } catch (error) {
      const message = getErrorMessage(error);
      alert(`Failed to remove recipient: ${message}`);
      console.error('Failed to remove recipient:', error);
    }
  };

  const handleUploadAttachment = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    try {
      setIsUploadingAttachment(true);
      const newAttachment = await addAttachment(id, file);
      setCommunication((prev) => (prev ? { ...prev, attachments: [...prev.attachments, newAttachment] } : null));
    } catch (error) {
      const message = getErrorMessage(error);
      alert(`Failed to upload attachment: ${message}`);
      console.error('Failed to upload attachment:', error);
    } finally {
      setIsUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!id) return;
    try {
      await removeAttachment(id, attachmentId);
      setCommunication((prev) =>
        prev ? { ...prev, attachments: prev.attachments.filter((a) => a.id !== attachmentId) } : null,
      );
    } catch (error) {
      const message = getErrorMessage(error);
      alert(`Failed to remove attachment: ${message}`);
      console.error('Failed to remove attachment:', error);
    }
  };

  if (loading) {
    return (
      <Flex minH='60vh' align='center' justify='center' direction='column' gap='3'>
        <Spinner color='primary' />
        <Text color='textSecondary'>Loading communication data...</Text>
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
    <Box
      w='full'
      overflowX='hidden'
      py={{ base: '10', md: '12' }}
      px={{ base: '4', md: '8', lg: '12' }}
      maxW='7xl'
      mx='auto'
    >
      <Button
        variant='ghost'
        mb='8'
        px='0'
        color='textSecondary'
        _hover={{ bg: 'transparent', color: 'primary' }}
        onClick={() => navigate(-1)}
      >
        <HStack gap='2'>
          <ArrowLeftIcon size={16} />
          <Text>Back</Text>
        </HStack>
      </Button>

      <Flex justify='space-between' align='center' mb='10'>
        <Heading size='xl' color='text' letterSpacing='tight'>
          Edit Communication
        </Heading>

        <Button
          bg='primary'
          color='white'
          px='8'
          borderRadius='xl'
          loading={isSaving}
          onClick={handleSubmit(onSave)}
          _hover={{ bg: 'secondary' }}
        >
          <HStack gap='2'>
            <FloppyDiskIcon size={20} />
            <Text>Save Changes</Text>
          </HStack>
        </Button>
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap='8'>
        <Stack gap='8'>
          {/* Basic Info */}
          <Box bg='surface' p='6' borderRadius='2xl' borderWidth='1px' borderColor='gray.100' boxShadow='sm'>
            <Heading size='md' mb='6' color='text'>
              General Information
            </Heading>

            <Stack gap='5'>
              <Field.Root invalid={!!errors.subject}>
                <Field.Label fontWeight='bold' color='textSecondary'>
                  Subject
                </Field.Label>
                <Controller
                  name='subject'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder='Enter subject'
                      borderRadius='xl'
                      borderColor='gray.200'
                    />
                  )}
                />
                {errors.subject && (
                  <Field.ErrorText color='red.500' fontSize='xs' mt='1'>
                    {errors.subject.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              {communication.sourceType === 'manual' && (
                <>
                  <Field.Root invalid={!!errors.body}>
                    <Field.Label fontWeight='bold' color='textSecondary'>
                      Body
                    </Field.Label>
                    <Controller
                      name='body'
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          value={field.value ?? ''}
                          placeholder='Enter communication content'
                          borderRadius='xl'
                          borderColor='gray.200'
                          minH='200px'
                        />
                      )}
                    />
                    {errors.body && (
                      <Field.ErrorText color='red.500' fontSize='xs' mt='1'>
                        {errors.body.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.bodyType}>
                    <Field.Label fontWeight='bold' color='textSecondary'>
                      Body Type
                    </Field.Label>
                    <Controller
                      name='bodyType'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          value={field.value ?? 'text'}
                          style={{
                            width: '100%',
                            height: '40px',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            padding: '0 12px',
                          }}
                        >
                          <option value='text'>Plain Text</option>
                          <option value='html'>HTML</option>
                        </select>
                      )}
                    />
                  </Field.Root>
                </>
              )}

              {communication.sourceType === 'template' && (
                <Box p='4' bg='blue.50' borderRadius='xl' borderLeftWidth='4px' borderColor='blue.400'>
                  <Text color='blue.800' fontWeight='semibold'>
                    Template based communication
                  </Text>
                  <Text color='blue.600' fontSize='sm'>
                    Created from template version: {communication.templateVersionId}
                  </Text>
                </Box>
              )}

              <Field.Root invalid={!!errors.scheduledAt}>
                <Field.Label fontWeight='bold' color='textSecondary'>
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
                      borderRadius='xl'
                      borderColor='gray.200'
                    />
                  )}
                />
              </Field.Root>
            </Stack>
          </Box>

          {/* Recipients Section */}
          <Box bg='surface' p='6' borderRadius='2xl' borderWidth='1px' borderColor='gray.100' boxShadow='sm'>
            <Flex justify='space-between' align='center' mb='6'>
              <Heading size='md' color='text'>
                Recipients
              </Heading>
              <Button size='sm' colorScheme='green' variant='ghost' onClick={onRecipientModalOpen}>
                <HStack gap='1'>
                  <PlusIcon size={16} />
                  <Text>Add Recipient</Text>
                </HStack>
              </Button>
            </Flex>

            <Table.Root variant='line' size='sm'>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Email</Table.ColumnHeader>
                  <Table.ColumnHeader>Type</Table.ColumnHeader>
                  <Table.ColumnHeader w='50px'></Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {communication.recipients.map((recipient) => (
                  <Table.Row key={recipient.id}>
                    <Table.Cell>{recipient.email}</Table.Cell>
                    <Table.Cell>
                      <Badge variant='subtle' colorScheme='blue'>
                        {recipient.recipientType}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <IconButton
                        aria-label='Remove recipient'
                        variant='ghost'
                        colorScheme='red'
                        size='xs'
                        onClick={() => handleRemoveRecipient(recipient.id)}
                      >
                        <TrashIcon size={16} />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))}
                {communication.recipients.length === 0 && (
                  <Table.Row>
                    <Table.Cell colSpan={3} textAlign='center' py='4'>
                      <Text color='textSecondary' fontSize='sm'>
                        No recipients added yet.
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </Box>
        </Stack>

        <Stack gap='8'>
          {/* Attachments Section */}
          <Box bg='surface' p='6' borderRadius='2xl' borderWidth='1px' borderColor='gray.100' boxShadow='sm'>
            <Flex justify='space-between' align='center' mb='6'>
              <Heading size='md' color='text'>
                Attachments
              </Heading>
              <Button
                size='sm'
                colorScheme='blue'
                variant='ghost'
                onClick={() => fileInputRef.current?.click()}
                loading={isUploadingAttachment}
              >
                <HStack gap='1'>
                  <PaperclipIcon size={16} />
                  <Text>Upload</Text>
                </HStack>
              </Button>
              <input type='file' ref={fileInputRef} style={{ display: 'none' }} onChange={handleUploadAttachment} />
            </Flex>

            <Stack gap='3'>
              {communication.attachments.map((attachment) => (
                <Flex
                  key={attachment.id}
                  align='center'
                  justify='space-between'
                  p='3'
                  bg='gray.50'
                  borderRadius='lg'
                  borderWidth='1px'
                  borderColor='gray.100'
                >
                  <Box minW='0' flex='1'>
                    <Text fontWeight='semibold' fontSize='sm' truncate>
                      {attachment.originalFileName}
                    </Text>
                    <Text fontSize='xs' color='textSecondary'>
                      {(attachment.fileSizeBytes / 1024).toFixed(1)} KB
                    </Text>
                  </Box>
                  <IconButton
                    aria-label='Remove attachment'
                    variant='ghost'
                    colorScheme='red'
                    size='sm'
                    onClick={() => handleRemoveAttachment(attachment.id)}
                  >
                    <TrashIcon size={16} />
                  </IconButton>
                </Flex>
              ))}
              {communication.attachments.length === 0 && (
                <Text color='textSecondary' fontSize='sm' textAlign='center' py='4'>
                  No attachments yet.
                </Text>
              )}
            </Stack>
          </Box>

          <Box bg='gray.50' p='6' borderRadius='2xl' borderWidth='1px' borderColor='gray.200' borderStyle='dashed'>
            <Heading size='xs' color='textSecondary' textTransform='uppercase' mb='4'>
              Status Info
            </Heading>
            <Stack gap='2'>
              <Flex justify='space-between'>
                <Text fontSize='sm' color='textSecondary'>
                  Status
                </Text>
                <Badge>{communication.status}</Badge>
              </Flex>
              <Flex justify='space-between'>
                <Text fontSize='sm' color='textSecondary'>
                  Channel
                </Text>
                <Text fontSize='sm' fontWeight='bold'>
                  {communication.channel}
                </Text>
              </Flex>
            </Stack>
          </Box>
        </Stack>
      </Grid>

      {/* Recipient Modal */}
      <Dialog.Root
        open={isRecipientModalOpen}
        onOpenChange={(details: { open: boolean }) => !details.open && onRecipientModalClose()}
      >
        <Dialog.Content borderRadius='2xl'>
          <Dialog.Header>Add Recipient</Dialog.Header>
          <Dialog.Body>
            <Stack gap='4'>
              <Field.Root invalid={!!recipientErrors.email}>
                <Field.Label fontSize='sm' fontWeight='bold'>
                  Email Address
                </Field.Label>
                <Input {...registerRecipient('email')} placeholder='recipient@example.com' borderRadius='xl' />
                {recipientErrors.email && (
                  <Field.ErrorText color='red.500' fontSize='xs' mt='1'>
                    {recipientErrors.email.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root invalid={!!recipientErrors.recipientType}>
                <Field.Label fontSize='sm' fontWeight='bold'>
                  Type
                </Field.Label>
                <select
                  {...registerRecipient('recipientType')}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '0 12px',
                  }}
                >
                  <option value='to'>To</option>
                  <option value='cc'>Cc</option>
                  <option value='bcc'>Bcc</option>
                </select>
              </Field.Root>
            </Stack>
          </Dialog.Body>
          <Dialog.Footer gap='3'>
            <Button variant='ghost' onClick={onRecipientModalClose} borderRadius='xl'>
              Cancel
            </Button>
            <Button
              colorScheme='green'
              borderRadius='xl'
              loading={isAddingRecipient}
              onClick={handleSubmitRecipient(handleAddRecipient)}
            >
              Add Recipient
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
};
