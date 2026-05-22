import { Box, Button, Field, Flex, Grid, Heading, HStack, Input, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getCommunicationDetailPath } from '@/routes';
import {
  createCommunication,
  getTemplates,
  getTemplateVersions,
  sendCommunicationNow,
  uploadCommunicationAttachment,
} from '@/services';
import { CreateCommunicationInput } from '@/services/communications/types';
import { AppSelect, HtmlContentEditor, HtmlContentPreview } from '@/shared/components';
import {
  AttachmentsCard,
  CommunicationFormCard,
  DeliveryCard,
  inputStyle,
  RecipientDialog,
  RecipientItem,
  RecipientsCard,
} from '../components';

const createSchema = z
  .object({
    channel: z.enum(['email']),
    sourceType: z.enum(['manual', 'template']),
    subject: z.string().max(255).optional(),
    body: z.string().optional(),
    templateId: z.string().optional(),
    templateVersionId: z.string().optional(),
    templateVariablesJson: z.record(z.string(), z.any()).optional(),
    scheduledAt: z.date().nullable().optional(),
  })
  .refine((data) => data.sourceType !== 'manual' || Boolean(data.subject?.trim()), {
    message: 'Subject is required for manual content',
    path: ['subject'],
  })
  .refine((data) => data.sourceType !== 'manual' || Boolean(data.body?.trim()), {
    message: 'Body is required for manual content',
    path: ['body'],
  })
  .refine((data) => data.sourceType !== 'template' || Boolean(data.templateVersionId), {
    message: 'Template version is required',
    path: ['templateVersionId'],
  });

type CreateFormData = z.infer<typeof createSchema>;

const recipientSchema = z.object({
  email: z.email('Invalid email'),
  recipientType: z.enum(['to', 'cc', 'bcc']),
});

type RecipientFormData = z.infer<typeof recipientSchema>;

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

export const CreateCommunication: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { open: isRecipientModalOpen, onOpen: onRecipientModalOpen, onClose: onRecipientModalClose } = useDisclosure();

  const [recipients, setRecipients] = useState<RecipientItem[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      channel: 'email',
      sourceType: 'template',
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

  const sourceType = watch('sourceType');
  const selectedTemplateId = watch('templateId');
  const selectedVersionId = watch('templateVersionId');
  const scheduledAt = watch('scheduledAt');
  const body = watch('body');
  const recipientTypeValue = watchRecipient('recipientType');

  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates', 'active'],
    queryFn: () => getTemplates({ isActive: true }),
  });

  const { data: versionsData, isLoading: isLoadingVersions } = useQuery({
    queryKey: ['template-versions', selectedTemplateId, 'active'],
    queryFn: () =>
      getTemplateVersions({
        templateId: selectedTemplateId ?? '',
        isActive: true,
      }),
    enabled: !!selectedTemplateId && sourceType === 'template',
  });

  const selectedVersion = versionsData?.templateVersions.find((version) => version.id === selectedVersionId);

  useEffect(() => {
    setValue('templateVersionId', '');
    setValue('subject', '');
    setValue('body', '');
    setValue('templateVariablesJson', {});
  }, [setValue]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateFormData) => {
      const hasToRecipient = recipients.some((recipient) => recipient.recipientType === 'to');

      if (!hasToRecipient) {
        throw new Error('Add at least one "to" recipient');
      }

      const payload: CreateCommunicationInput = {
        channel: 'email',
        sourceType: data.sourceType,
        recipients,
      };

      if (data.scheduledAt) {
        payload.scheduledAt = data.scheduledAt.toISOString();
      }

      if (data.sourceType === 'manual') {
        payload.subject = data.subject?.trim();
        payload.body = data.body?.trim();
      }

      if (data.sourceType === 'template') {
        payload.templateVersionId = data.templateVersionId;
        payload.templateVariablesJson = data.templateVariablesJson ?? {};
      }

      const communication = await createCommunication(payload);

      for (const file of attachments) {
        await uploadCommunicationAttachment({
          communicationId: communication.id,
          file,
        });
      }

      if (!data.scheduledAt) {
        await sendCommunicationNow({ id: communication.id });
      }

      return communication;
    },
    onSuccess: (communication) => {
      navigate(getCommunicationDetailPath(communication.id));
    },
    onError: (error) => {
      alert(`Failed to create communication: ${getErrorMessage(error)}`);
    },
  });

  const handleAddRecipient = (data: RecipientFormData) => {
    const alreadyExists = recipients.some(
      (recipient) => recipient.email === data.email && recipient.recipientType === data.recipientType,
    );

    if (alreadyExists) {
      alert('Recipient already added with this type.');
      return;
    }

    setRecipients((prev) => [...prev, data]);
    resetRecipient();
    onRecipientModalClose();
  };

  const handleRemoveRecipient = (recipient: RecipientItem) => {
    setRecipients((prev) =>
      prev.filter((item) => !(item.email === recipient.email && item.recipientType === recipient.recipientType)),
    );
  };

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    setAttachments((prev) => {
      const existingKeys = new Set(prev.map((file) => `${file.name}-${file.size}`));
      const newFiles = selectedFiles.filter((file) => !existingKeys.has(`${file.name}-${file.size}`));

      return [...prev, ...newFiles];
    });

    event.target.value = '';
  };

  const handleRemoveAttachment = (attachment: { type: 'local'; index: number }) => {
    setAttachments((prev) => prev.filter((_, index) => index !== attachment.index));
  };

  const onCreate: SubmitHandler<CreateFormData> = (data) => {
    createMutation.mutate(data);
  };

  return (
    <Box w='full' minH='100vh' overflowX='hidden' py={{ base: '6', md: '8' }} px={{ base: '4', md: '8', lg: '10' }}>
      <Button
        variant='ghost'
        mb='8'
        px='0'
        color='textSecondary'
        _hover={{ bg: 'transparent', color: 'primary' }}
        onClick={() => navigate(-1)}
        disabled={createMutation.isPending}
      >
        <HStack gap='2'>
          <ArrowLeftIcon size={16} />
          <Text>Back</Text>
        </HStack>
      </Button>

      <Flex justify='space-between' align={{ base: 'flex-start', md: 'center' }} gap='4' wrap='wrap' mb='8'>
        <Box>
          <Heading size='xl' color='text' letterSpacing='tight'>
            New Communication
          </Heading>

          <Text mt='2' color='textSecondary' fontSize='sm'>
            {scheduledAt
              ? 'Schedule an email communication for later delivery.'
              : 'Create and send an email communication instantly.'}
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
          loading={createMutation.isPending}
          loadingText={scheduledAt ? 'Scheduling...' : 'Sending...'}
          onClick={handleSubmit(onCreate)}
          _hover={{ bg: 'secondary' }}
        >
          <HStack gap='2'>
            <PaperPlaneTiltIcon size={20} />
            <Text>{scheduledAt ? 'Schedule Email' : 'Send Now'}</Text>
          </HStack>
        </Button>
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap='6'>
        <Stack gap='6'>
          <CommunicationFormCard title='Content'>
            <Stack gap='5'>
              <Field.Root>
                <Field.Label mb={2} color='primary' fontWeight='bold' fontSize='sm'>
                  Source Type
                </Field.Label>

                <Controller
                  name='sourceType'
                  control={control}
                  render={({ field }) => (
                    <AppSelect
                      width='100%'
                      value={field.value}
                      options={[
                        { label: 'Template', value: 'template' },
                        { label: 'Manual Content', value: 'manual' },
                      ]}
                      onChange={(value) => {
                        const nextSourceType = value as 'manual' | 'template';

                        field.onChange(nextSourceType);
                        setValue('subject', '');
                        setValue('body', '');
                        setValue('templateId', '');
                        setValue('templateVersionId', '');
                        setValue('templateVariablesJson', {});
                      }}
                    />
                  )}
                />
              </Field.Root>

              {sourceType === 'manual' && (
                <>
                  <Field.Root invalid={!!errors.subject} position='relative' pb='22px'>
                    <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                      Subject *
                    </Field.Label>

                    <Controller
                      name='subject'
                      control={control}
                      render={({ field }) => (
                        <Input {...field} value={field.value ?? ''} placeholder='Email subject' {...inputStyle} />
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
                      Body *
                    </Field.Label>

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

                    {errors.body && (
                      <Text position='absolute' bottom='0' color='error' fontSize='xs'>
                        {errors.body.message}
                      </Text>
                    )}
                  </Field.Root>

                  <Box pt='2'>
                    <Text fontWeight='bold' color='primary' fontSize='sm' mb='2'>
                      Preview
                    </Text>

                    <HtmlContentPreview value={body ?? ''} />
                  </Box>
                </>
              )}

              {sourceType === 'template' && (
                <Stack gap='5'>
                  <Field.Root>
                    <Field.Label mb={2} color='primary' fontWeight='bold' fontSize='sm'>
                      Template *
                    </Field.Label>

                    <Controller
                      name='templateId'
                      control={control}
                      render={({ field }) => (
                        <AppSelect
                          width='100%'
                          value={field.value ?? ''}
                          isDisabled={isLoadingTemplates}
                          placeholder='Choose a template...'
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          options={
                            templatesData?.templates.map((template) => ({
                              label: template.name,
                              value: template.id,
                            })) ?? []
                          }
                        />
                      )}
                    />
                  </Field.Root>

                  {selectedTemplateId && (
                    <Field.Root invalid={!!errors.templateVersionId} position='relative' pb='22px'>
                      <Field.Label mb={2} color='primary' fontWeight='bold' fontSize='sm'>
                        Version *
                      </Field.Label>

                      <Controller
                        name='templateVersionId'
                        control={control}
                        render={({ field }) => (
                          <AppSelect
                            width='100%'
                            value={field.value ?? ''}
                            isDisabled={isLoadingVersions}
                            placeholder='Choose a version...'
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            options={
                              versionsData?.templateVersions.map((version) => ({
                                label: `Version ${version.version}`,
                                value: version.id,
                              })) ?? []
                            }
                          />
                        )}
                      />

                      {errors.templateVersionId && (
                        <Text position='absolute' bottom='0' color='error' fontSize='xs'>
                          {errors.templateVersionId.message}
                        </Text>
                      )}
                    </Field.Root>
                  )}

                  {selectedVersion?.variablesSchemaJson &&
                    Object.keys(selectedVersion.variablesSchemaJson).length > 0 && (
                      <Box p='4' bg='gray.50' borderRadius='xl'>
                        <Text fontWeight='bold' fontSize='sm' color='primary' mb='4'>
                          Template Variables
                        </Text>

                        <Stack gap='4'>
                          {Object.keys(selectedVersion.variablesSchemaJson).map((variableName) => (
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
                                    {...inputStyle}
                                  />
                                )}
                              />
                            </Field.Root>
                          ))}
                        </Stack>
                      </Box>
                    )}
                </Stack>
              )}
            </Stack>
          </CommunicationFormCard>

          <RecipientsCard
            recipients={recipients}
            disabled={createMutation.isPending}
            onAddClick={onRecipientModalOpen}
            onRemove={handleRemoveRecipient}
          />
        </Stack>

        <Stack gap='6'>
          <DeliveryCard control={control} errors={errors} disabled={createMutation.isPending} />

          <AttachmentsCard
            attachments={attachments.map((file, index) => ({ type: 'local', file, index }))}
            disabled={createMutation.isPending}
            fileInputRef={fileInputRef}
            onFileChange={handleSelectFiles}
            onRemove={(attachment) => {
              if (attachment.type === 'local') handleRemoveAttachment(attachment);
            }}
          />
        </Stack>
      </Grid>

      <RecipientDialog
        open={isRecipientModalOpen}
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
