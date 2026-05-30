import { Button, Drawer, Field, HStack, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { createTemplate } from '@/services';
import { FormErrorInline } from '@/shared/components';
import { CreateTemplateFormData, createTemplateSchema } from './schema';

type CreateTemplateDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const CreateTemplateDrawer = ({ isOpen, onClose }: CreateTemplateDrawerProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm<CreateTemplateFormData>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['templates'] });

      reset();
      onClose();
    },
    onError: () => {
      clearErrors();
    },
  });

  const getErrorMessage = (): string | undefined => {
    if (!createMutation.error) return undefined;

    const axiosError = createMutation.error as AxiosError;

    if (axiosError.response?.status === 409) {
      return 'Template with this name already exists';
    }

    return 'Error creating template. Try again later.';
  };

  const backendError = getErrorMessage();
  const hasNameError = !!errors.name || !!backendError;

  const handleClose = () => {
    if (createMutation.isPending) return;

    createMutation.reset();
    reset();
    onClose();
  };

  const handleInputChange = () => {
    if (createMutation.error) createMutation.reset();
  };

  const onSubmit = (data: CreateTemplateFormData) => {
    createMutation.mutate({
      name: data.name,
      description: data.description,
    });
  };

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
                Create Template
              </Text>

              <Drawer.CloseTrigger asChild>
                <Button
                  variant='ghost'
                  color='primary'
                  borderRadius='full'
                  size='sm'
                  disabled={createMutation.isPending}
                >
                  ✕
                </Button>
              </Drawer.CloseTrigger>
            </HStack>
          </Drawer.Header>

          <Drawer.Body px={8} bg='background' overflowY='auto' overflowX='hidden'>
            <VStack as='form' id='create-template-form' gap={5} align='stretch' onSubmit={handleSubmit(onSubmit)}>
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
                  Description *
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
          </Drawer.Body>

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
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>

              <Button
                type='submit'
                form='create-template-form'
                bg='actionBg'
                color='white'
                fontWeight='bold'
                borderRadius='full'
                px={6}
                h='2.75rem'
                _hover={{ bg: 'actionHover' }}
                loading={createMutation.isPending}
                loadingText='Creating...'
              >
                Create
              </Button>
            </HStack>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};
