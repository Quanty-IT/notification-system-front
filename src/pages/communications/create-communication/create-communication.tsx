import { Box, Button, Field, Flex, Grid, Heading, HStack, Input, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
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
import { AppSelect, FormErrorInline, HtmlContentEditor, HtmlContentPreview } from '@/shared/components';
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
    message: 'Subject is required',
    path: ['subject'],
  })
  .refine((data) => data.sourceType !== 'manual' || Boolean(data.body?.trim()), {
    message: 'Body is required',
    path: ['body'],
  })
  .refine((data) => data.sourceType !== 'template' || Boolean(data.templateId), {
    message: 'Template is required',
    path: ['templateId'],
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
  const [recipientError, setRecipientError] = useState<string>();
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
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
  const selectedTemplateVariables = selectedVersion?.variablesSchemaJson
    ? Object.keys(selectedVersion.variablesSchemaJson)
    : [];

  const [variableErrors, setVariableErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setValue('templateVersionId', '');
    setValue('subject', '');
    setValue('body', '');
    setValue('templateVariablesJson', {});
  }, [setValue]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateFormData) => {
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

    setRecipients((prev) => {
      const nextRecipients = [...prev, data];

      if (nextRecipients.some((recipient) => recipient.recipientType === 'to')) {
        setRecipientError(undefined);
      }

      return nextRecipients;
    });
    resetRecipient();
    onRecipientModalClose();
  };

  const handleRemoveRecipient = (recipient: RecipientItem) => {
    setRecipients((prev) => {
      const nextRecipients = prev.filter(
        (item) => !(item.email === recipient.email && item.recipientType === recipient.recipientType),
      );

      if (nextRecipients.some((item) => item.recipientType === 'to')) {
        setRecipientError(undefined);
      }

      return nextRecipients;
    });
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

  const validateTemplateVariables = (data: CreateFormData) => {
    if (data.sourceType !== 'template' || selectedTemplateVariables.length === 0) {
      setVariableErrors({});
      return true;
    }

    const nextVariableErrors = selectedTemplateVariables.reduce<Record<string, string>>((acc, variableName) => {
      const value = data.templateVariablesJson?.[variableName];
      const isEmpty = value === undefined || value === null || String(value).trim() === '';

      if (isEmpty) {
        acc[variableName] = `${variableName} is required`;
      }

      return acc;
    }, {});

    setVariableErrors(nextVariableErrors);

    return Object.keys(nextVariableErrors).length === 0;
  };

  const onCreate: SubmitHandler<CreateFormData> = (data) => {
    const hasToRecipient = recipients.some((recipient) => recipient.recipientType === 'to');
    const hasValidTemplateVariables = validateTemplateVariables(data);

    if (!hasToRecipient) {
      setRecipientError('Add at least one "to" recipient');
    }

    if (hasToRecipient) setRecipientError(undefined);
    if (!hasToRecipient || !hasValidTemplateVariables) return;

    createMutation.mutate(data);
  };

  const handleInvalidSubmit = () => {
    const hasToRecipient = recipients.some((recipient) => recipient.recipientType === 'to');

    if (!hasToRecipient) {
      setRecipientError('Add at least one "to" recipient');
    }

    validateTemplateVariables(getValues());
  };

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
            New Communication
          </Heading>

          <Text mt='2' color='textSecondary' fontSize='sm' wordBreak='break-word'>
            {scheduledAt
              ? 'Schedule an email communication for later delivery.'
              : 'Create and send an email communication instantly.'}
          </Text>
        </Box>

        <Button
          w={{ base: 'full', sm: 'auto' }}
          minW={{ sm: '150px' }}
          alignSelf={{ base: 'stretch', md: 'center' }}
          bg='actionBg'
          color='white'
          px='6'
          py='2.5'
          borderRadius='xl'
          fontWeight='bold'
          boxShadow='lg'
          loading={createMutation.isPending}
          loadingText={scheduledAt ? 'Scheduling...' : 'Sending...'}
          onClick={handleSubmit(onCreate, handleInvalidSubmit)}
          _hover={{ bg: 'actionHover' }}
          flexShrink={0}
        >
          <HStack gap='2'>
            <PaperPlaneTiltIcon size={20} />
            <Text>{scheduledAt ? 'Schedule' : 'Send Now'}</Text>
          </HStack>
        </Button>
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
        <Stack gap='6' minW='0'>
          <Box minW='0' w='full'>
            <CommunicationFormCard title='Content'>
              <Stack gap='4' minW='0'>
                <Field.Root minW='0'>
                  <Field.Label mb={2} color='primary' fontWeight='bold' fontSize='sm'>
                    Source Type
                  </Field.Label>

                  <Controller
                    name='sourceType'
                    control={control}
                    render={({ field }) => (
                      <Box w='full' minW='0'>
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
                            setVariableErrors({});
                          }}
                        />
                      </Box>
                    )}
                  />

                  <FormErrorInline />
                </Field.Root>

                {sourceType === 'manual' && (
                  <>
                    <Field.Root invalid={!!errors.subject} minW='0'>
                      <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                        Subject *
                      </Field.Label>

                      <Controller
                        name='subject'
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            placeholder='Email subject'
                            w='full'
                            minW='0'
                            {...inputStyle}
                            borderColor={errors.subject ? 'error' : inputStyle.borderColor}
                            _hover={{ borderColor: errors.subject ? 'error' : 'primary' }}
                            _focus={{
                              borderColor: errors.subject ? 'error' : 'primary',
                              outline: errors.subject
                                ? '1px solid var(--chakra-colors-error)'
                                : '1px solid var(--chakra-colors-primary)',
                              outlineOffset: '0px',
                            }}
                          />
                        )}
                      />

                      <FormErrorInline message={errors.subject?.message} />
                    </Field.Root>

                    <Field.Root invalid={!!errors.body} minW='0'>
                      <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                        Body *
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

                      <FormErrorInline message={errors.body?.message} />
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

                {sourceType === 'template' && (
                  <Stack gap='4' minW='0'>
                    <Field.Root invalid={!!errors.templateId} minW='0'>
                      <Field.Label mb={2} color='primary' fontWeight='bold' fontSize='sm'>
                        Template *
                      </Field.Label>

                      <Controller
                        name='templateId'
                        control={control}
                        render={({ field }) => (
                          <Box w='full' minW='0'>
                            <AppSelect
                              width='100%'
                              value={field.value ?? ''}
                              hasError={!!errors.templateId}
                              isDisabled={isLoadingTemplates}
                              placeholder='Choose a template...'
                              onChange={(value) => {
                                field.onChange(value);
                                setValue('templateVersionId', '', { shouldValidate: true });
                                setValue('templateVariablesJson', {});
                                setVariableErrors({});
                              }}
                              options={
                                templatesData?.templates.map((template) => ({
                                  label: template.name,
                                  value: template.id,
                                })) ?? []
                              }
                            />
                          </Box>
                        )}
                      />

                      <FormErrorInline message={errors.templateId?.message} />
                    </Field.Root>

                    {selectedTemplateId && (
                      <Field.Root invalid={!!errors.templateVersionId} minW='0'>
                        <Field.Label mb={2} color='primary' fontWeight='bold' fontSize='sm'>
                          Version *
                        </Field.Label>

                        <Controller
                          name='templateVersionId'
                          control={control}
                          render={({ field }) => (
                            <Box w='full' minW='0'>
                              <AppSelect
                                width='100%'
                                value={field.value ?? ''}
                                hasError={!!errors.templateVersionId}
                                isDisabled={isLoadingVersions}
                                placeholder='Choose a version...'
                                onChange={(value) => {
                                  field.onChange(value);
                                  setValue('templateVariablesJson', {});
                                  setVariableErrors({});
                                }}
                                options={
                                  versionsData?.templateVersions.map((version) => ({
                                    label: `Version ${version.version}`,
                                    value: version.id,
                                  })) ?? []
                                }
                              />
                            </Box>
                          )}
                        />

                        <FormErrorInline message={errors.templateVersionId?.message} />
                      </Field.Root>
                    )}

                    {selectedVersion?.variablesSchemaJson &&
                      Object.keys(selectedVersion.variablesSchemaJson).length > 0 && (
                        <Box p={{ base: '3', md: '4' }} bg='surfaceMuted' borderRadius='xl' minW='0'>
                          <Text fontWeight='bold' fontSize='sm' color='primary' mb='3'>
                            Template Variables
                          </Text>

                          <Stack gap='3' minW='0'>
                            {selectedTemplateVariables.map((variableName) => (
                              <Field.Root key={variableName} invalid={!!variableErrors[variableName]} minW='0'>
                                <Field.Label
                                  fontSize='xs'
                                  fontWeight='bold'
                                  color={variableErrors[variableName] ? 'error' : 'textSecondary'}
                                  wordBreak='break-word'
                                >
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
                                      w='full'
                                      minW='0'
                                      {...inputStyle}
                                      borderColor={variableErrors[variableName] ? 'error' : inputStyle.borderColor}
                                      _hover={{ borderColor: variableErrors[variableName] ? 'error' : 'primary' }}
                                      _focus={{
                                        borderColor: variableErrors[variableName] ? 'error' : 'primary',
                                        outline: variableErrors[variableName]
                                          ? '1px solid var(--chakra-colors-error)'
                                          : '1px solid var(--chakra-colors-primary)',
                                        outlineOffset: '0px',
                                      }}
                                      onChange={(event) => {
                                        field.onChange(event);

                                        if (String(event.target.value).trim()) {
                                          setVariableErrors((prev) => {
                                            const { [variableName]: _removed, ...rest } = prev;

                                            return rest;
                                          });
                                        }
                                      }}
                                    />
                                  )}
                                />

                                <FormErrorInline message={variableErrors[variableName]} />
                              </Field.Root>
                            ))}
                          </Stack>
                        </Box>
                      )}
                  </Stack>
                )}
              </Stack>
            </CommunicationFormCard>
          </Box>

          <Box minW='0' w='full'>
            <RecipientsCard
              recipients={recipients}
              disabled={createMutation.isPending}
              errorMessage={recipientError}
              onAddClick={onRecipientModalOpen}
              onRemove={handleRemoveRecipient}
            />
          </Box>
        </Stack>

        <Stack gap='6' minW='0'>
          <Box minW='0' w='full'>
            <DeliveryCard control={control} errors={errors} disabled={createMutation.isPending} />
          </Box>

          <Box minW='0' w='full'>
            <AttachmentsCard
              attachments={attachments.map((file, index) => ({ type: 'local', file, index }))}
              disabled={createMutation.isPending}
              fileInputRef={fileInputRef}
              onFileChange={handleSelectFiles}
              onRemove={(attachment) => {
                if (attachment.type === 'local') handleRemoveAttachment(attachment);
              }}
            />
          </Box>
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
