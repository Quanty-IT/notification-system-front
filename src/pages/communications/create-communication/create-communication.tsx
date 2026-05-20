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
  Stack,
  Text,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, FileIcon, PaperPlaneTiltIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
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

const createSchema = z
  .object({
    channel: z.enum(['email']),
    sourceType: z.enum(['manual', 'template']),
    subject: z.string().max(255).optional(),
    body: z.string().optional(),
    templateId: z.string().optional(),
    templateVersionId: z.string().optional(),
    templateVariablesJson: z.record(z.string(), z.any()).optional(),
    scheduledAt: z.string().optional(),
  })
  .refine((data) => data.sourceType !== 'manual' || !!data.subject?.trim(), {
    message: 'Subject is required for manual content',
    path: ['subject'],
  })
  .refine((data) => data.sourceType !== 'manual' || !!data.body?.trim(), {
    message: 'Body is required for manual content',
    path: ['body'],
  })
  .refine((data) => data.sourceType !== 'template' || !!data.templateVersionId, {
    message: 'Template version is required',
    path: ['templateVersionId'],
  });

type CreateFormData = z.infer<typeof createSchema>;

const recipientSchema = z.object({
  email: z.string().email('Invalid email'),
  recipientType: z.enum(['to', 'cc', 'bcc']),
});

type RecipientFormData = z.infer<typeof recipientSchema>;

type Recipient = {
  email: string;
  recipientType: 'to' | 'cc' | 'bcc';
};

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

export const CreateCommunication: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { open: isRecipientModalOpen, onOpen: onRecipientModalOpen, onClose: onRecipientModalClose } = useDisclosure();

  const [recipients, setRecipients] = useState<Recipient[]>([]);
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
      scheduledAt: '',
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

  const sourceType = watch('sourceType');
  const selectedTemplateId = watch('templateId');
  const selectedVersionId = watch('templateVersionId');
  const scheduledAt = watch('scheduledAt');

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
        payload.scheduledAt = new Date(data.scheduledAt).toISOString();
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

  const handleRemoveRecipient = (email: string, recipientType: string) => {
    setRecipients((prev) =>
      prev.filter((recipient) => !(recipient.email === email && recipient.recipientType === recipientType)),
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

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
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
            {scheduledAt ? 'Create a scheduled email communication.' : 'Create, attach files, and send immediately.'}
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
            <Text>{scheduledAt ? 'Create Scheduled' : 'Create & Send'}</Text>
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

                <Controller
                  name='sourceType'
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      onChange={(event) => {
                        const nextSourceType = event.target.value as 'manual' | 'template';

                        field.onChange(nextSourceType);

                        setValue('subject', '');
                        setValue('body', '');
                        setValue('templateId', '');
                        setValue('templateVersionId', '');
                        setValue('templateVariablesJson', {});
                      }}
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
                      <option value='template'>Template</option>
                      <option value='manual'>Manual Content</option>
                    </select>
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

              {sourceType === 'template' && (
                <Stack gap='5'>
                  <Field.Root>
                    <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                      Template *
                    </Field.Label>

                    <Controller
                      name='templateId'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          value={field.value ?? ''}
                          disabled={isLoadingTemplates}
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
                          <option value=''>Choose a template...</option>

                          {templatesData?.templates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Field.Root>

                  {selectedTemplateId && (
                    <Field.Root invalid={!!errors.templateVersionId} position='relative' pb='22px'>
                      <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                        Version *
                      </Field.Label>

                      <Controller
                        name='templateVersionId'
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            value={field.value ?? ''}
                            disabled={isLoadingVersions}
                            onChange={(event) => {
                              field.onChange(event);

                              const version = versionsData?.templateVersions.find(
                                (templateVersion) => templateVersion.id === event.target.value,
                              );

                              if (!version) return;

                              setValue('subject', version.subject ?? '');
                              setValue('body', version.body ?? '');

                              if (version.variablesSchemaJson) {
                                const variables = Object.keys(version.variablesSchemaJson).reduce<
                                  Record<string, string>
                                >((acc, key) => {
                                  acc[key] = '';
                                  return acc;
                                }, {});

                                setValue('templateVariablesJson', variables);
                              } else {
                                setValue('templateVariablesJson', {});
                              }
                            }}
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
                            {isLoadingVersions && <option>Loading versions...</option>}

                            {versionsData?.templateVersions.map((version) => (
                              <option key={version.id} value={version.id}>
                                Version {version.version}
                              </option>
                            ))}
                          </select>
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
                disabled={createMutation.isPending}
              >
                <HStack gap='1'>
                  <PlusIcon size={16} />
                  <Text>Add Recipient</Text>
                </HStack>
              </Button>
            </Flex>

            {recipients.length === 0 ? (
              <Flex py='8' justify='center' align='center' bg='gray.50' borderRadius='xl'>
                <Text color='textSecondary' fontSize='sm'>
                  No recipients added yet.
                </Text>
              </Flex>
            ) : (
              <Stack gap='3'>
                {recipients.map((recipient) => (
                  <Flex
                    key={`${recipient.email}-${recipient.recipientType}`}
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
                        onClick={() => handleRemoveRecipient(recipient.email, recipient.recipientType)}
                        disabled={createMutation.isPending}
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
            <Heading size='md' mb='6' color='text'>
              Scheduling
            </Heading>

            <Field.Root invalid={!!errors.scheduledAt}>
              <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                Scheduled For
              </Field.Label>

              <Controller
                name='scheduledAt'
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ''} type='datetime-local' {...inputStyle} />
                )}
              />

              <Text fontSize='xs' color='textSecondary' mt='2'>
                Leave blank to create, upload attachments, and send now.
              </Text>
            </Field.Root>
          </Box>

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
                disabled={createMutation.isPending}
              >
                <HStack gap='1'>
                  <PlusIcon size={16} />
                  <Text>Add File</Text>
                </HStack>
              </Button>

              <input ref={fileInputRef} type='file' multiple hidden onChange={handleSelectFiles} />
            </Flex>

            {attachments.length === 0 ? (
              <Flex py='8' justify='center' align='center' bg='gray.50' borderRadius='xl'>
                <Text color='textSecondary' fontSize='sm'>
                  No attachments added yet.
                </Text>
              </Flex>
            ) : (
              <Stack gap='3'>
                {attachments.map((file, index) => (
                  <Flex
                    key={`${file.name}-${file.size}-${index}`}
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
                          {file.name}
                        </Text>

                        <Text fontSize='xs' color='textSecondary'>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </Box>
                    </HStack>

                    <IconButton
                      aria-label='Remove attachment'
                      variant='ghost'
                      colorScheme='red'
                      size='xs'
                      onClick={() => handleRemoveAttachment(index)}
                      disabled={createMutation.isPending}
                    >
                      <TrashIcon size={16} />
                    </IconButton>
                  </Flex>
                ))}
              </Stack>
            )}
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
