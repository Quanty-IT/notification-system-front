import { Box, Button, Flex, Grid, Heading, Skeleton, Text } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { activateTemplate, deactivateTemplate, getTemplates } from '../../services';
import { TemplateCard } from './components/template-card';

const SKELETON_KEYS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);

type ToggleTemplateVariables = {
  id: string;
  isActive: boolean;
};

const gridStyle = {
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
};

export const Templates: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, isActive }: ToggleTemplateVariables) => {
      if (isActive) {
        return activateTemplate({ uuid: id });
      }

      return deactivateTemplate({ uuid: id });
    },

    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['templates'] });

      const previousTemplates = queryClient.getQueryData<Awaited<ReturnType<typeof getTemplates>>>(['templates']);

      queryClient.setQueryData<Awaited<ReturnType<typeof getTemplates>>>(['templates'], (old) => {
        if (!old) return old;

        return {
          ...old,
          templates: old.templates.map((template) =>
            template.id === id
              ? {
                  ...template,
                  isActive,
                }
              : template,
          ),
        };
      });

      return { previousTemplates };
    },

    onSuccess: (response) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof getTemplates>>>(['templates'], (old) => {
        if (!old) return old;

        return {
          ...old,
          templates: old.templates.map((template) =>
            template.id === response.id
              ? {
                  ...template,
                  isActive: response.isActive,
                  updatedAt: response.updatedAt,
                }
              : template,
          ),
        };
      });
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(['templates'], context.previousTemplates);
      }
    },
  });

  const templates = data?.templates ?? [];

  const handleToggle = (id: string, isActive: boolean) => {
    mutation.mutate({ id, isActive });
  };

  return (
    <Box w='full' minH='100vh' overflowX='hidden' py={{ base: '6', md: '8' }} px={{ base: '4', md: '8', lg: '10' }}>
      <Flex w='full' justify='space-between' align='center' gap='4' mb='8'>
        <Heading size='xl' color='text' letterSpacing='tight'>
          Templates
        </Heading>

        <Button
          bg='primary'
          color='white'
          px='6'
          py='2.5'
          borderRadius='xl'
          fontWeight='bold'
          boxShadow='lg'
          _hover={{ bg: 'secondary' }}
          onClick={() => {}}
        >
          Create Template
        </Button>
      </Flex>

      {isLoading ? (
        <Grid gap={{ base: '4', md: '6' }} style={gridStyle}>
          {SKELETON_KEYS.map((key) => (
            <Skeleton key={key} height='200px' borderRadius='2xl' w='100%' />
          ))}
        </Grid>
      ) : isError ? (
        <Flex justify='center' align='center' direction='column' gap='3' py='16' color='textSecondary'>
          <Text fontSize='lg'>Error loading templates.</Text>
          <Text fontSize='sm'>Try again later.</Text>
        </Flex>
      ) : templates.length === 0 ? (
        <Flex justify='center' align='center' direction='column' gap='3' py='16' color='textSecondary'>
          <Text fontSize='lg'>No templates found.</Text>
          <Text fontSize='sm'>Click "Create Template" to create the first one.</Text>
        </Flex>
      ) : (
        <Grid gap={{ base: '4', md: '6' }} style={gridStyle}>
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onToggle={handleToggle}
              isToggling={mutation.isPending && mutation.variables?.id === template.id}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
};
