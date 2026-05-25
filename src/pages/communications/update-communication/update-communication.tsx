import {
  Box,
  Button,
  Field,
  Flex,
  Grid,
  Heading,
  HStack,
  Input,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, FloppyDiskIcon } from '@phosphor-icons/react';
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
import { HtmlContentEditor, HtmlContentPreview, StatusBadge } from '@/shared';
import {
  AttachmentsCard,
  CommunicationFormCard,
  inputStyle,
  RecipientDialog,
  RecipientItem,
  RecipientsCard,
} from '../components';
import { DeliveryCard } from '../components/delivery-card';

const updateSchema = z.object({
  subject: z.string().max(255).optional(),
  body: z.string().optional(),
  templateVariablesJson: z.record(z.string(), z.any()).optional(),
  scheduledAt: z.date().nullable().optional(),
});

type UpdateFormData = z.infer<typeof updateSchema>;

const recipientSchema = z.object({
  email: z.email('Invalid email'),
  recipientType: z.enum(['to', 'cc', 'bcc']),
});

type RecipientFormData = z.infer<typeof recipientSchema>;

const editableStatuses = ['draft', 'scheduled'];

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

const parseScheduledAt = (scheduledAt: string | null | undefined) => {
  if (!scheduledAt) return null;

  return new Date(scheduledAt);
};

export const UpdateCommunication: React.FC = () => {
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
    watch,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      subject: '',
      body: '',
      templateVariablesJson: {},
      scheduledAt: null,
    },
  });

  const {
    register: registerRecipient,
    handleSubmit: handleSubmitRecipient,
    reset: resetRecipient,
    watch: watchRecipient,
    setValue: setRecipientValue,
    formState: { errors: recipientErrors },
  } = useForm<RecipientFormData>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      recipientType: 'to',
    },
  });

  const body = watch('body');
  const recipientTypeValue = watchRecipient('recipientType');

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
        templateVariablesJson: data.templateVariablesJson ?? {},
        scheduledAt: parseScheduledAt(data.scheduledAt),
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
    if (!id || !communication || !canEdit) return;

    try {
      setIsSaving(true);

      const payload: UpdateCommunicationInput = {
        scheduledAt: data.scheduledAt ? data.scheduledAt.toISOString() : undefined,
      };

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
    if (!id || !canEdit) return;

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

  const handleRemoveRecipient = async (recipient: RecipientItem) => {
    if (!id || !recipient.id || !canEdit) return;

    try {
      await removeCommunicationRecipient({
        communicationId: id,
        recipientId: recipient.id,
      });

      setCommunication((prev) =>
        prev
          ? {
              ...prev,
              recipients: prev.recipients.filter((item) => item.id !== recipient.id),
            }
          : null,
      );
    } catch (error) {
      alert(`Failed to remove recipient: ${getErrorMessage(error)}`);
    }
  };

  const handleUploadAttachment = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!id || files.length === 0 || !canEdit) return;

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

  const handleRemoveAttachment = async (attachment: { type: 'persisted'; id: string }) => {
    if (!id || !canEdit) return;

    try {
      await removeCommunicationAttachment({
        communicationId: id,
        attachmentId: attachment.id,
      });

      setCommunication((prev) =>
        prev
          ? {
              ...prev,
              attachments: prev.attachments.filter((item) => item.id !== attachment.id),
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
    <Box
      w='full'
      maxW='none'
      minH='100vh'
      overflowX='hidden'
      py={{ base: '5', md: '8', xl: '10' }}
      px={{ base: '4', md: '8', lg: '10', xl: '12', '2xl': '16' }}
      pb={{ base: '24', md: '10' }}
    >
      <Button
        variant='ghost'
        mb={{ base: '6', md: '8' }}
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

      <Flex
        justify='space-between'
        align={{ base: 'stretch', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: '4', md: '6' }}
        mb='8'
        w='full'
        minW='0'
      >
        <Box minW='0'>
          <Heading size={{ base: 'lg', md: 'xl' }} color='text' letterSpacing='tight' wordBreak='break-word'>
            Edit Communication
          </Heading>

          <Text mt='2' color='textSecondary' fontSize='sm' wordBreak='break-word'>
            {canEdit
              ? 'Update communication content, delivery, recipients and attachments.'
              : 'This communication can no longer be edited.'}
          </Text>
        </Box>

        {canEdit && (
          <Button
            w={{ base: 'full', sm: 'auto' }}
            minW={{ sm: '170px' }}
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
            _hover={{ bg: 'secondary' }}
            flexShrink={0}
          >
            <HStack gap='2'>
              <FloppyDiskIcon size={20} />
              <Text>Save Changes</Text>
            </HStack>
          </Button>
        )}
      </Flex>

      <Grid
        templateColumns={{
          base: '1fr',
          xl: 'minmax(0, 2fr) minmax(360px, 0.85fr)',
          '2xl': 'minmax(0, 2.2fr) minmax(420px, 0.8fr)',
        }}
        gap={{ base: '5', md: '6', xl: '8' }}
        w='full'
        minW='0'
        alignItems='start'
      >
        <Stack gap={{ base: '5', md: '6' }} minW='0'>
          <Box minW='0' w='full'>
            <CommunicationFormCard title='Content'>
              <Stack gap='5' minW='0'>
                <Field.Root minW='0'>
                  <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                    Source Type
                  </Field.Label>

                  <Input
                    value={communication.sourceType === 'manual' ? 'Manual Content' : 'Template'}
                    readOnly
                    disabled
                    w='full'
                    minW='0'
                    {...inputStyle}
                  />
                </Field.Root>

                {communication.sourceType === 'manual' && (
                  <>
                    <Field.Root invalid={!!errors.subject} position='relative' pb='22px' minW='0'>
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
                            w='full'
                            minW='0'
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

                    <Field.Root invalid={!!errors.body} position='relative' pb='22px' minW='0'>
                      <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                        Body
                      </Field.Label>

                      <Box
                        w='full'
                        maxW='full'
                        minW='0'
                        overflowX='auto'
                        css={{
                          '& *': {
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                          },
                        }}
                      >
                        <Controller
                          name='body'
                          control={control}
                          render={({ field }) => (
                            <HtmlContentEditor
                              value={field.value ?? ''}
                              onChange={field.onChange}
                              hasError={!!errors.body}
                            />
                          )}
                        />
                      </Box>

                      {errors.body && (
                        <Text position='absolute' bottom='0' color='error' fontSize='xs'>
                          {errors.body.message}
                        </Text>
                      )}
                    </Field.Root>

                    <Box pt='2' minW='0'>
                      <Text fontWeight='bold' color='primary' fontSize='sm' mb='2'>
                        Preview
                      </Text>

                      <Box
                        w='full'
                        maxW='full'
                        minW='0'
                        overflowX='auto'
                        borderRadius='md'
                        css={{
                          '& *': {
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                          },
                          '& img': {
                            maxWidth: '100%',
                            height: 'auto',
                          },
                          '& table': {
                            width: '100%',
                            maxWidth: '100%',
                          },
                        }}
                      >
                        <HtmlContentPreview value={body ?? ''} />
                      </Box>
                    </Box>
                  </>
                )}

                {communication.sourceType === 'template' && (
                  <Stack gap='5' minW='0'>
                    <Box
                      p={{ base: '4', md: '4' }}
                      bg='green.50'
                      borderRadius='xl'
                      borderWidth='1px'
                      borderStyle='solid'
                      borderColor='green.100'
                      minW='0'
                    >
                      <Text color='green.800' fontWeight='bold' wordBreak='break-word'>
                        Template based communication
                      </Text>

                      <Text color='textSecondary' fontSize='sm' mt='1' wordBreak='break-word'>
                        The subject and body come from the selected template version.
                      </Text>
                    </Box>

                    {communication.templateVariablesJson &&
                    Object.keys(communication.templateVariablesJson).length > 0 ? (
                      <Box p={{ base: '4', md: '4' }} bg='gray.50' borderRadius='xl' minW='0'>
                        <Text fontWeight='bold' fontSize='sm' color='primary' mb='4'>
                          Template Variables
                        </Text>

                        <Stack gap='4' minW='0'>
                          {Object.keys(communication.templateVariablesJson).map((variableName) => (
                            <Field.Root key={variableName} minW='0'>
                              <Field.Label fontSize='xs' fontWeight='bold' color='textSecondary' wordBreak='break-word'>
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
                                    w='full'
                                    minW='0'
                                    {...inputStyle}
                                  />
                                )}
                              />
                            </Field.Root>
                          ))}
                        </Stack>
                      </Box>
                    ) : (
                      <Box p='4' bg='gray.50' borderRadius='xl' minW='0'>
                        <Text color='textSecondary' fontSize='sm'>
                          This template has no variables.
                        </Text>
                      </Box>
                    )}
                  </Stack>
                )}
              </Stack>
            </CommunicationFormCard>
          </Box>

          <Box minW='0' w='full'>
            <RecipientsCard
              recipients={communication.recipients}
              disabled={!canEdit || isAddingRecipient}
              onAddClick={onRecipientModalOpen}
              onRemove={handleRemoveRecipient}
            />
          </Box>
        </Stack>

        <Stack gap={{ base: '5', md: '6' }} minW='0' position={{ base: 'static', xl: 'sticky' }} top={{ xl: '6' }}>
          <Box minW='0' w='full'>
            <DeliveryCard control={control} errors={errors} disabled={!canEdit} />
          </Box>

          <Box minW='0' w='full'>
            <AttachmentsCard
              attachments={communication.attachments.map((attachment) => ({
                type: 'persisted',
                id: attachment.id,
                originalFileName: attachment.originalFileName,
                fileSizeBytes: attachment.fileSizeBytes,
              }))}
              disabled={!canEdit}
              isLoading={isUploadingAttachment}
              fileInputRef={fileInputRef}
              onFileChange={handleUploadAttachment}
              onRemove={(attachment) => {
                if (attachment.type === 'persisted') handleRemoveAttachment(attachment);
              }}
            />
          </Box>

          <Box minW='0' w='full'>
            <CommunicationFormCard title='Status'>
              <Stack gap='3' minW='0'>
                <Flex justify='space-between' align='center' gap='3'>
                  <Text fontSize='sm' color='textSecondary'>
                    Status
                  </Text>

                  <Box flexShrink={0}>
                    <StatusBadge status={communication.status} />
                  </Box>
                </Flex>

                <Flex justify='space-between' align='center' gap='3'>
                  <Text fontSize='sm' color='textSecondary'>
                    Channel
                  </Text>

                  <Text fontSize='sm' fontWeight='bold' color='text' wordBreak='break-word' textAlign='right'>
                    {communication.channel}
                  </Text>
                </Flex>

                <Flex justify='space-between' align='center' gap='3'>
                  <Text fontSize='sm' color='textSecondary'>
                    Created
                  </Text>

                  <Text fontSize='sm' fontWeight='bold' color='text' wordBreak='break-word' textAlign='right'>
                    {new Date(communication.createdAt).toLocaleString()}
                  </Text>
                </Flex>
              </Stack>
            </CommunicationFormCard>
          </Box>
        </Stack>
      </Grid>

      <RecipientDialog
        open={isRecipientModalOpen}
        isLoading={isAddingRecipient}
        emailError={recipientErrors.email?.message}
        emailRegister={registerRecipient('email')}
        recipientTypeValue={recipientTypeValue}
        onRecipientTypeChange={(value) => {
          setRecipientValue('recipientType', value as 'to' | 'cc' | 'bcc', {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
        onClose={onRecipientModalClose}
        onSubmit={handleSubmitRecipient(handleAddRecipient)}
      />
    </Box>
  );
};
