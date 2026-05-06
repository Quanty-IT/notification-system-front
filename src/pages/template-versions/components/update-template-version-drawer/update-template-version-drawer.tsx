import {
  Badge,
  Box,
  Button,
  Drawer,
  Field,
  HStack,
  Input,
  NativeSelect,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { updateTemplateVersion } from '@/services';
import { FormErrorInline } from '@/shared/components';
import {
  TemplateVariableType,
  templateVariableTypes,
  UpdateTemplateVersionFormData,
  updateTemplateVersionSchema,
} from './schema';

type TemplateVersion = {
  id: string;
  subject: string;
  body: string;
  bodyType: 'html' | 'text';
  variablesSchemaJson?: Record<string, TemplateVariableType>;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  version?: TemplateVersion;
};

type TemplateBodyType = UpdateTemplateVersionFormData['bodyType'];

const hasHtmlTag = (body: string) => {
  return /<\/?[a-zA-Z][a-zA-Z0-9-]*(\s[^>]*)?>/i.test(body);
};

const inferBodyType = (body: string): TemplateBodyType => {
  if (!body.trim()) {
    return 'text';
  }

  return hasHtmlTag(body) ? 'html' : 'text';
};

const extractVariables = (body: string): string[] => {
  const variables: string[] = [];
  const seen = new Set<string>();
  let index = 0;

  while (index < body.length) {
    const start = body.indexOf('{{', index);

    if (start === -1) break;

    const end = body.indexOf('}}', start + 2);

    if (end === -1) break;

    const variableName = body.slice(start + 2, end).trim();

    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variableName) && !seen.has(variableName)) {
      seen.add(variableName);
      variables.push(variableName);
    }

    index = end + 2;
  }

  return variables;
};

const areVariablesEqual = (
  current: Record<string, TemplateVariableType>,
  next: Record<string, TemplateVariableType>,
) => {
  const currentKeys = Object.keys(current);
  const nextKeys = Object.keys(next);

  if (currentKeys.length !== nextKeys.length) return false;

  return currentKeys.every((key) => current[key] === next[key]);
};

export const UpdateTemplateVersionDrawer = ({ isOpen, onClose, templateId, version }: Props) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateTemplateVersionFormData>({
    resolver: zodResolver(updateTemplateVersionSchema),
    defaultValues: {
      subject: '',
      body: '',
      bodyType: 'text',
      variablesSchemaJson: {},
    },
  });

  const body = watch('body');
  const bodyType = watch('bodyType');
  const variables = watch('variablesSchemaJson');

  React.useEffect(() => {
    if (!isOpen || !version) return;

    reset({
      subject: version.subject,
      body: version.body,
      bodyType: inferBodyType(version.body),
      variablesSchemaJson: version.variablesSchemaJson ?? {},
    });
  }, [isOpen, version, reset]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      const detectedVariables = extractVariables(body || '');
      const currentVariables = getValues('variablesSchemaJson') ?? {};
      const inferredBodyType = inferBodyType(body || '');

      const nextVariables = detectedVariables.reduce<Record<string, TemplateVariableType>>((acc, name) => {
        acc[name] = currentVariables[name] ?? 'string';
        return acc;
      }, {});

      if (getValues('bodyType') !== inferredBodyType) {
        setValue('bodyType', inferredBodyType, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }

      if (!areVariablesEqual(currentVariables, nextVariables)) {
        setValue('variablesSchemaJson', nextVariables, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [body, getValues, setValue]);

  const mutation = useMutation({
    mutationFn: updateTemplateVersion,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['template-versions', templateId],
      });

      reset();
      onClose();
    },
  });

  const handleClose = () => {
    if (mutation.isPending) return;

    mutation.reset();
    reset();
    onClose();
  };

  const onSubmit = (data: UpdateTemplateVersionFormData) => {
    if (!version) return;

    mutation.mutate({
      uuid: version.id,
      data: {
        subject: data.subject,
        body: data.body,
        bodyType: inferBodyType(data.body),
        variablesSchemaJson: data.variablesSchemaJson,
      },
    });
  };

  const variableNames = Object.keys(variables ?? {});
  const detectedBodyTypeLabel = bodyType === 'html' ? 'HTML' : 'TEXT';

  return (
    <Drawer.Root open={isOpen} onOpenChange={(d) => !d.open && handleClose()} placement='end' size='xl'>
      <Drawer.Backdrop bg='blackAlpha.400' />

      <Drawer.Positioner>
        <Drawer.Content bg='background' borderTopLeftRadius='2xl' borderBottomLeftRadius='2xl' boxShadow='xl'>
          <Drawer.Header py={6} px={8}>
            <HStack justify='space-between' align='center' w='full'>
              <Text fontSize='xl' fontWeight='bold' color='primary'>
                Edit Version
              </Text>

              <Drawer.CloseTrigger asChild>
                <Button variant='ghost' size='sm' disabled={mutation.isPending}>
                  ✕
                </Button>
              </Drawer.CloseTrigger>
            </HStack>
          </Drawer.Header>

          <Drawer.Body px={8} py={4} overflowY='auto' w='full'>
            <VStack
              as='form'
              id='update-template-version-form'
              w='full'
              gap={6}
              align='stretch'
              onSubmit={handleSubmit(onSubmit)}
            >
              <Field.Root invalid={!!errors.subject} w='full'>
                <VStack align='stretch' gap='2' w='full'>
                  <Field.Label color='primary' fontWeight='bold' fontSize='sm'>
                    Subject *
                  </Field.Label>

                  <Input
                    w='full'
                    h='11'
                    px='4'
                    placeholder='Confirme seu cadastro'
                    bg='white'
                    borderColor={errors.subject ? 'error' : 'inputBorder'}
                    {...register('subject')}
                  />

                  <FormErrorInline message={errors.subject?.message} />
                </VStack>
              </Field.Root>

              <Field.Root invalid={!!errors.body} w='full'>
                <VStack align='stretch' gap='2' w='full'>
                  <HStack justify='space-between' align='center' w='full'>
                    <Field.Label color='primary' fontWeight='bold' fontSize='sm' mb='0'>
                      Body *
                    </Field.Label>

                    <HStack gap='2'>
                      <Text fontSize='xs' color='textSecondary'>
                        Detected as
                      </Text>

                      <Badge
                        bg={bodyType === 'html' ? 'primary' : 'inactive'}
                        color='white'
                        borderRadius='full'
                        px='3'
                        py='1'
                        fontSize='xs'
                      >
                        {detectedBodyTypeLabel}
                      </Badge>
                    </HStack>
                  </HStack>

                  <Textarea
                    w='full'
                    minH='20rem'
                    p='4'
                    fontFamily='mono'
                    placeholder='Digite um texto simples ou cole um HTML completo'
                    borderColor={errors.body ? 'error' : 'inputBorder'}
                    {...register('body')}
                  />

                  <FormErrorInline message={errors.body?.message} />
                </VStack>
              </Field.Root>

              <Box w='full' bg='surface' border='1px solid' borderColor='inputBorder' borderRadius='xl' p={5}>
                <VStack align='stretch' gap='4' w='full'>
                  <Text fontWeight='bold' color='primary'>
                    Variables
                  </Text>

                  {variableNames.length === 0 ? (
                    <Text fontSize='sm' color='textSecondary'>
                      This template version has no variables.
                    </Text>
                  ) : (
                    <VStack align='stretch' gap={4} w='full'>
                      {variableNames.map((name) => (
                        <Field.Root key={name} w='full'>
                          <VStack align='stretch' gap='2' w='full'>
                            <Field.Label color='text' fontWeight='medium' fontSize='sm'>
                              {name}
                            </Field.Label>

                            <Controller
                              name={`variablesSchemaJson.${name}`}
                              control={control}
                              render={({ field }) => (
                                <NativeSelect.Root w='full'>
                                  <NativeSelect.Field
                                    w='full'
                                    h='11'
                                    px='4'
                                    value={field.value}
                                    onChange={field.onChange}
                                  >
                                    {templateVariableTypes.map((type) => (
                                      <option key={type} value={type}>
                                        {type}
                                      </option>
                                    ))}
                                  </NativeSelect.Field>

                                  <NativeSelect.Indicator />
                                </NativeSelect.Root>
                              )}
                            />
                          </VStack>
                        </Field.Root>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </Box>
            </VStack>
          </Drawer.Body>

          <Drawer.Footer px={8} py={6} borderTop='1px solid' borderColor='inputBorder'>
            <HStack w='full' justify='flex-end' gap='3'>
              <Button
                variant='outline'
                h='11'
                px='6'
                borderRadius='xl'
                fontWeight='medium'
                onClick={handleClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>

              <Button
                type='submit'
                form='update-template-version-form'
                h='11'
                px='6'
                borderRadius='xl'
                bg='primary'
                color='white'
                fontWeight='bold'
                loading={mutation.isPending}
                _hover={{
                  opacity: 0.9,
                }}
              >
                Save Changes
              </Button>
            </HStack>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};
