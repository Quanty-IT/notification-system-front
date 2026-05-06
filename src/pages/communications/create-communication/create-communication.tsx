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
  Table,
  Text,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, PaperPlaneTiltIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getCommunicationDetailPath } from '../../../routes/routes.constants';
import { CreateCommunicationInput, createCommunication, getTemplates, getTemplateVersions } from '../../../services';

const createSchema = z
  .object({
    channel: z.enum(['email']),
    sourceType: z.enum(['manual', 'template']),
    subject: z.string().max(255).optional(),
    body: z.string().optional().nullable(),
    bodyType: z.enum(['text', 'html']).optional(),
    templateId: z.string().optional().nullable(),
    templateVersionId: z.string().optional().nullable(),
    templateVariablesJson: z.record(z.string(), z.any()).optional().nullable(),
    scheduledAt: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.sourceType === 'manual' && !data.subject) return false;
      return true;
    },
    {
      message: 'Subject is required for manual content',
      path: ['subject'],
    },
  );

type CreateFormData = z.infer<typeof createSchema>;

const recipientSchema = z.object({
  email: z.string().email('Invalid email'),
  recipientType: z.enum(['to', 'cc', 'bcc']),
});

type RecipientFormData = z.infer<typeof recipientSchema>;

export const CreateCommunication: React.FC = () => {
  const navigate = useNavigate();
  const { open: isRecipientModalOpen, onOpen: onRecipientModalOpen, onClose: onRecipientModalClose } = useDisclosure();

  const [isCreating, setIsCreating] = useState(false);
  const [recipients, setRecipients] = useState<{ email: string; recipientType: 'to' | 'cc' | 'bcc' }[]>([]);

  // Main Form
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
      sourceType: 'manual',
      bodyType: 'text',
      subject: '',
      body: '',
      templateVariablesJson: {},
    },
  });

  // Recipient Form
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

  // Queries
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const { data: versionsData, isLoading: isLoadingVersions } = useQuery({
    queryKey: ['template-versions', selectedTemplateId],
    queryFn: () => getTemplateVersions({ templateId: selectedTemplateId ?? '' }),
    enabled: !!selectedTemplateId && sourceType === 'template',
  });

  const selectedVersion = versionsData?.templateVersions.find((version) => version.id === selectedVersionId);

  // Effects
  useEffect(() => {
    if (versionsData?.templateVersions && versionsData.templateVersions.length > 0) {
      const activeVersion =
        versionsData.templateVersions.find((version) => version.isActive) || versionsData.templateVersions[0];
      setValue('templateVersionId', activeVersion.id);

      if (activeVersion.variablesSchemaJson) {
        const initialVars = Object.keys(activeVersion.variablesSchemaJson).reduce(
          (acc, key) => {
            acc[key] = '';
            return acc;
          },
          {} as Record<string, string>,
        );
        setValue('templateVariablesJson', initialVars);
      }
    }
  }, [versionsData, setValue]);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as { message?: string | string[]; errors?: unknown } | undefined;

      if (Array.isArray(data?.message)) {
        return data.message.join(', ');
      }

      if (typeof data?.message === 'string') {
        return data.message;
      }

      if (data?.errors) {
        return typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
      }

      return error.message;
    }

    return 'An unexpected error occurred';
  };

  const onCreate: SubmitHandler<CreateFormData> = async (data) => {
    try {
      setIsCreating(true);

      const input: CreateCommunicationInput = {
        channel: data.channel,
        sourceType: data.sourceType,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        recipients: recipients,
      };

      input.subject = data.subject || '';

      if (data.sourceType === 'manual') {
        input.body = data.body;
        input.bodyType = data.bodyType;
      } else {
        input.templateVersionId = data.templateVersionId;
        input.templateVariablesJson = data.templateVariablesJson;
      }

      const result = await createCommunication(input);
      navigate(getCommunicationDetailPath(result.id));
    } catch (error) {
      const message = getErrorMessage(error);
      alert(`Failed to create communication: ${message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddRecipient = (data: RecipientFormData) => {
    setRecipients((prev) => [...prev, data]);
    onRecipientModalClose();
    resetRecipient();
  };

  const handleRemoveRecipient = (emailToRemove: string, typeToRemove: string) => {
    setRecipients((prev) => prev.filter((r) => !(r.email === emailToRemove && r.recipientType === typeToRemove)));
  };

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
          New Communication
        </Heading>

        <Button
          bg='primary'
          color='white'
          px='8'
          borderRadius='xl'
          loading={isCreating}
          onClick={handleSubmit(onCreate)}
          _hover={{ bg: 'secondary' }}
        >
          <HStack gap='2'>
            <PaperPlaneTiltIcon size={20} />
            <Text>Create & Send</Text>
          </HStack>
        </Button>
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap='8'>
        <Stack gap='8'>
          <Box bg='surface' p='6' borderRadius='2xl' borderWidth='1px' borderColor='gray.100' boxShadow='sm'>
            <Heading size='md' mb='6' color='text'>
              General Information
            </Heading>

            <Stack gap='5'>
              <Field.Root invalid={!!errors.subject}>
                <Field.Label fontWeight='bold' color='textSecondary'>
                  Subject *
                </Field.Label>
                <Controller
                  name='subject'
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ''} placeholder='Enter subject' borderRadius='xl' />
                  )}
                />
                {errors.subject && (
                  <Field.ErrorText color='red.500' fontSize='xs'>
                    {errors.subject.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root>
                <Field.Label fontWeight='bold' color='textSecondary'>
                  Source Type
                </Field.Label>
                <Controller
                  name='sourceType'
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        padding: '0 12px',
                      }}
                    >
                      <option value='manual'>Manual Content</option>
                      <option value='template'>Template</option>
                    </select>
                  )}
                />
              </Field.Root>

              {sourceType === 'template' && (
                <Stack gap='5'>
                  <Field.Root invalid={!!errors.templateId}>
                    <Field.Label fontWeight='bold' color='textSecondary'>
                      Select Template
                    </Field.Label>
                    <Controller
                      name='templateId'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          value={field.value ?? ''}
                          style={{
                            width: '100%',
                            height: '40px',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            padding: '0 12px',
                          }}
                          disabled={isLoadingTemplates}
                        >
                          <option value=''>Choose a template...</option>
                          {templatesData?.templates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Field.Root>

                  {selectedTemplateId && (
                    <Field.Root invalid={!!errors.templateVersionId}>
                      <Field.Label fontWeight='bold' color='textSecondary'>
                        Select Version
                      </Field.Label>
                      <Controller
                        name='templateVersionId'
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              field.onChange(e);
                              const v = versionsData?.templateVersions.find((tv) => tv.id === e.target.value);
                              if (v) {
                                setValue('subject', v.subject || '');
                                setValue('body', v.body || '');
                                setValue('bodyType', (v.bodyType as 'text' | 'html') || 'text');

                                if (v.variablesSchemaJson) {
                                  const initialVars = Object.keys(v.variablesSchemaJson).reduce(
                                    (acc, key) => {
                                      acc[key] = '';
                                      return acc;
                                    },
                                    {} as Record<string, string>,
                                  );
                                  setValue('templateVariablesJson', initialVars);
                                } else {
                                  setValue('templateVariablesJson', {});
                                }
                              }
                            }}
                            style={{
                              width: '100%',
                              height: '40px',
                              borderRadius: '12px',
                              border: '1px solid #E2E8F0',
                              padding: '0 12px',
                            }}
                            disabled={isLoadingVersions}
                          >
                            {isLoadingVersions && <option>Loading versions...</option>}
                            {versionsData?.templateVersions.map((v) => (
                              <option key={v.id} value={v.id}>
                                Version {v.version} {v.isActive ? '(Active)' : ''}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </Field.Root>
                  )}

                  {selectedVersion?.variablesSchemaJson &&
                    Object.keys(selectedVersion.variablesSchemaJson).length > 0 && (
                      <Box mt='2'>
                        <Text fontSize='xs' fontWeight='bold' color='textSecondary' textTransform='uppercase' mb='2'>
                          Variables detected
                        </Text>
                        <HStack gap='2' flexWrap='wrap'>
                          {Object.keys(selectedVersion.variablesSchemaJson).map((v) => (
                            <Badge key={v} colorScheme='blue' variant='subtle'>
                              {`{{${v}}}`}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                    )}

                  {selectedVersion?.variablesSchemaJson &&
                    Object.keys(selectedVersion.variablesSchemaJson).length > 0 && (
                      <Stack gap='4' mt='4' p='4' bg='gray.50' borderRadius='xl'>
                        <Text fontWeight='bold' fontSize='sm' color='textSecondary'>
                          Template Variables
                        </Text>
                        {Object.keys(selectedVersion.variablesSchemaJson).map((varName) => (
                          <Field.Root key={varName}>
                            <Field.Label fontSize='xs' fontWeight='bold' mb='1'>
                              {varName}
                            </Field.Label>
                            <Controller
                              name={`templateVariablesJson.${varName}`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  value={field.value ?? ''}
                                  placeholder={`Enter ${varName}`}
                                  size='sm'
                                  borderRadius='lg'
                                  bg='white'
                                />
                              )}
                            />
                          </Field.Root>
                        ))}
                      </Stack>
                    )}
                </Stack>
              )}

              {sourceType === 'manual' && (
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
                          minH='200px'
                        />
                      )}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontWeight='bold' color='textSecondary'>
                      Body Type
                    </Field.Label>
                    <Controller
                      name='bodyType'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
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
            </Stack>
          </Box>

          {/* Recipients */}
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
                {recipients.map((recipient) => (
                  <Table.Row key={`${recipient.email}-${recipient.recipientType}`}>
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
                        onClick={() => handleRemoveRecipient(recipient.email, recipient.recipientType)}
                      >
                        <TrashIcon size={16} />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                ))}
                {recipients.length === 0 && (
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
          <Box bg='surface' p='6' borderRadius='2xl' borderWidth='1px' borderColor='gray.100' boxShadow='sm'>
            <Heading size='md' mb='6' color='text'>
              Scheduling
            </Heading>
            <Field.Root invalid={!!errors.scheduledAt}>
              <Field.Label fontWeight='bold' color='textSecondary'>
                Scheduled For
              </Field.Label>
              <Controller
                name='scheduledAt'
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ''} type='datetime-local' borderRadius='xl' />
                )}
              />
              <Text fontSize='xs' color='textSecondary' mt='2'>
                Leave blank to send as soon as possible.
              </Text>
            </Field.Root>
          </Box>
        </Stack>
      </Grid>

      {/* Recipient Modal */}
      <Dialog.Root
        open={isRecipientModalOpen}
        onOpenChange={(details: { open: boolean }) => !details.open && onRecipientModalClose()}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius='2xl' boxShadow='2xl' zIndex='2000' bg='surface' p='6'>
            <Dialog.Header px='0' pt='0' pb='4'>
              <Heading size='md' color='text'>
                Add Recipient
              </Heading>
            </Dialog.Header>
            <Dialog.CloseTrigger onClick={onRecipientModalClose} top='4' right='4' />
            <Dialog.Body>
              <Stack gap='4' py='4'>
                <Field.Root invalid={!!recipientErrors.email}>
                  <Field.Label fontSize='sm' fontWeight='bold'>
                    Email Address
                  </Field.Label>
                  <Input {...registerRecipient('email')} placeholder='recipient@example.com' borderRadius='xl' />
                  {recipientErrors.email && (
                    <Field.ErrorText color='red.500' fontSize='xs'>
                      {recipientErrors.email.message}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root>
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
                bg='primary'
                color='white'
                borderRadius='xl'
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
