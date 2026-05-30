import { Button, Drawer, Field, HStack, Input, Spinner, Text, Textarea, VStack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import { getTemplateByUuid, updateTemplate } from '@/services';
import { FormErrorInline } from '@/shared/components';
import { UpdateTemplateFormData, updateTemplateSchema } from './schema';

type UpdateTemplateDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  uuid?: string;
};

export const UpdateTemplateDrawer = ({ isOpen, onClose, uuid }: UpdateTemplateDrawerProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    clearErrors,
  } = useForm<UpdateTemplateFormData>({
    resolver: zodResolver(updateTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const templateQuery = useQuery({
    queryKey: ['templates', 'detail', uuid],
    queryFn: () => getTemplateByUuid({ uuid: uuid ?? '' }),
    enabled: isOpen && !!uuid,
  });

  React.useEffect(() => {
    if (!templateQuery.data) return;

    reset(
      {
        name: templateQuery.data.name ?? '',
        description: templateQuery.data.description ?? '',
      },
      { keepDefaultValues: true },
    );
  }, [templateQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: updateTemplate,
    onSuccess: async (updatedTemplate) => {
      queryClient.setQueryData(['templates', 'detail', uuid], updatedTemplate);

      await queryClient.invalidateQueries({ queryKey: ['templates'] });

      reset();
      onClose();
    },
    onError: () => {
      clearErrors();
    },
  });

  const getErrorMessage = (): string | undefined => {
    if (!updateMutation.error) return undefined;

    const axiosError = updateMutation.error as AxiosError;

    if (axiosError.response?.status === 409) {
      return 'Template with this name already exists';
    }

    return 'Error updating template. Try again later.';
  };

  const backendError = getErrorMessage();
  const hasNameError = !!errors.name || !!backendError;

  const handleInputChange = () => {
    if (updateMutation.error) updateMutation.reset();
  };

  const onSubmit = (data: UpdateTemplateFormData) => {
    if (!uuid) return;

    if (!isDirty) {
      onClose();
      return;
    }

    updateMutation.mutate({
      uuid,
      data: {
        name: data.name,
        description: data.description,
      },
    });
  };

  const handleClose = () => {
    if (updateMutation.isPending) return;

    updateMutation.reset();
    reset();
    onClose();
  };

  const isLoadingTemplate = templateQuery.isLoading || (templateQuery.isFetching && !templateQuery.data);
  const isErrorTemplate = templateQuery.isError;

  return (
    <Drawer.Root open={isOpen} onOpenChange={(details) => !details.open && handleClose()} placement='end' size='md'>
      <Drawer.Backdrop bg='blackAlpha.400' />

      <Drawer.Positioner>
        <Drawer.Content
          bg='background'
          overflow='hidden'
          borderTopLeftRadius='2xl'
          borderBottomLeftRadius='2xl'
          borderTopRightRadius={0}
          borderBottomRightRadius={0}
          boxShadow='xl'
        >
          <Drawer.Header bg='background' py={6} px={8}>
            <HStack justify='space-between' align='center' w='100%'>
              <Text fontSize='xl' fontWeight='bold' color='primary'>
                Edit Template
              </Text>

              <Drawer.CloseTrigger asChild>
                <Button
                  variant='ghost'
                  color='primary'
                  borderRadius='full'
                  size='sm'
                  disabled={updateMutation.isPending}
                >
                  ✕
                </Button>
              </Drawer.CloseTrigger>
            </HStack>
          </Drawer.Header>

          <Drawer.Body px={8} bg='background' overflowY='auto' overflowX='hidden'>
            {isLoadingTemplate && (
              <VStack mt={8} gap={4}>
                <Spinner size='lg' />
                <Text color='textSecondary'>Loading template...</Text>
              </VStack>
            )}

            {isErrorTemplate && (
              <VStack mt={8} gap={2}>
                <Text color='error'>Error loading template.</Text>
              </VStack>
            )}

            {!isLoadingTemplate && !isErrorTemplate && templateQuery.data && (
              <VStack as='form' id='update-template-form' gap={5} align='stretch' onSubmit={handleSubmit(onSubmit)}>
                <Field.Root invalid={hasNameError} position='relative' pb='22px'>
                  <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                    Name *
                  </Field.Label>

                  <Input
                    placeholder='Template name'
                    h='2.75rem'
                    bg='inputBg'
                    border='1px solid'
                    borderColor={hasNameError ? 'error' : 'inputBorder'}
                    borderRadius='md'
                    color='text'
                    fontWeight='medium'
                    px={4}
                    _placeholder={{ color: 'placeholder' }}
                    _hover={{ borderColor: hasNameError ? 'error' : 'primary' }}
                    _focus={{
                      borderColor: hasNameError ? 'error' : 'primary',
                      outline: hasNameError
                        ? '1px solid var(--chakra-colors-error)'
                        : '1px solid var(--chakra-colors-primary)',
                      outlineOffset: '0px',
                    }}
                    _autofill={{
                      boxShadow: hasNameError
                        ? '0 0 0px 1000px var(--chakra-colors-inputBg) inset, 0 0 0 1px var(--chakra-colors-error) !important'
                        : '0 0 0px 1000px var(--chakra-colors-inputBg) inset',
                    }}
                    {...register('name', { onChange: handleInputChange })}
                  />

                  <FormErrorInline message={errors.name?.message || backendError} />
                </Field.Root>

                <Field.Root invalid={!!errors.description} position='relative' pb='22px'>
                  <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
                    Description
                  </Field.Label>

                  <Textarea
                    placeholder='Template description'
                    minH='8rem'
                    bg='inputBg'
                    border='1px solid'
                    borderColor={errors.description ? 'error' : 'inputBorder'}
                    borderRadius='md'
                    color='text'
                    fontWeight='medium'
                    resize='none'
                    px={4}
                    py={3}
                    lineHeight='1.6'
                    _placeholder={{ color: 'placeholder' }}
                    _hover={{ borderColor: errors.description ? 'error' : 'primary' }}
                    _focus={{
                      borderColor: errors.description ? 'error' : 'primary',
                      outline: errors.description
                        ? '1px solid var(--chakra-colors-error)'
                        : '1px solid var(--chakra-colors-primary)',
                      outlineOffset: '0px',
                    }}
                    _autofill={{
                      boxShadow: errors.description
                        ? '0 0 0px 1000px var(--chakra-colors-inputBg) inset, 0 0 0 1px var(--chakra-colors-error) !important'
                        : '0 0 0px 1000px var(--chakra-colors-inputBg) inset',
                    }}
                    {...register('description', { onChange: handleInputChange })}
                  />

                  <FormErrorInline message={errors.description?.message} />
                </Field.Root>
              </VStack>
            )}
          </Drawer.Body>

          {!isLoadingTemplate && !isErrorTemplate && templateQuery.data && (
            <Drawer.Footer bg='background' px={8} py={4}>
              <HStack gap={3} w='100%' justify='flex-end'>
                <Button
                  variant='outline'
                  onClick={handleClose}
                  borderColor='inputBorder'
                  color='primary'
                  fontWeight='bold'
                  borderRadius='full'
                  px={6}
                  h='2.75rem'
                  _hover={{ bg: 'gray.50', borderColor: 'primary' }}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>

                <Button
                  type='submit'
                  form='update-template-form'
                  bg='actionBg'
                  color='white'
                  fontWeight='bold'
                  borderRadius='full'
                  px={6}
                  h='2.75rem'
                  _hover={{ bg: 'actionHover' }}
                  loading={updateMutation.isPending}
                  loadingText='Updating...'
                  disabled={isLoadingTemplate || isErrorTemplate}
                >
                  Update
                </Button>
              </HStack>
            </Drawer.Footer>
          )}
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};
