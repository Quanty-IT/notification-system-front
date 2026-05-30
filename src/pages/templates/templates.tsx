import { Box, Button, Flex, Grid, Heading, Text } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { activateTemplate, deactivateTemplate, deleteTemplate, getTemplates } from '@/services';
import { GetTemplatesResponse } from '@/services/templates/types';
import { CreateTemplateDrawer, TemplateCard, TemplateCardSkeleton, UpdateTemplateDrawer } from './components';

type ToggleTemplateVariables = {
  id: string;
  isActive: boolean;
};

const SKELETON_KEYS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);

const gridStyle = {
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
};

export const Templates: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editUuid, setEditUuid] = React.useState<string | null>(null);
  const [selectedUuid, setSelectedUuid] = React.useState<string | null>(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = React.useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['templates'],
    queryFn: () => getTemplates(),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: ToggleTemplateVariables) => {
      if (isActive) {
        return activateTemplate({ uuid: id });
      }

      return deactivateTemplate({ uuid: id });
    },

    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['templates'] });

      const previousTemplates = queryClient.getQueryData<GetTemplatesResponse>(['templates']);

      queryClient.setQueryData<GetTemplatesResponse>(['templates'], (old) => {
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
      queryClient.setQueryData<GetTemplatesResponse>(['templates'], (old) => {
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

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,

    onMutate: async ({ uuid }) => {
      await queryClient.cancelQueries({ queryKey: ['templates'] });

      const previousTemplates = queryClient.getQueryData<GetTemplatesResponse>(['templates']);

      queryClient.setQueryData<GetTemplatesResponse>(['templates'], (old) => {
        if (!old) return old;

        return {
          ...old,
          templates: old.templates.filter((template) => template.id !== uuid),
        };
      });

      return { previousTemplates };
    },

    onSuccess: () => {
      setSelectedUuid(null);
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(['templates'], context.previousTemplates);
      }
    },
  });

  const templates = data?.templates ?? [];

  const openVersions = (uuid: string) => {
    navigate(`/templates/${uuid}/versions`);
  };

  const handleToggle = (id: string, isActive: boolean) => {
    toggleMutation.mutate({ id, isActive });
  };

  const openCreateDrawer = () => {
    setIsCreateDrawerOpen(true);
  };

  const closeCreateDrawer = () => {
    setIsCreateDrawerOpen(false);
  };

  const openUpdateDrawer = (uuid: string) => {
    setEditUuid(uuid);
    setIsUpdateDrawerOpen(true);
  };

  const closeUpdateDrawer = () => {
    setIsUpdateDrawerOpen(false);
    setEditUuid(null);
  };

  const handleDelete = (uuid: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this template?');

    if (!confirmed) return;

    setSelectedUuid(uuid);
    deleteMutation.mutate({ uuid });
  };

  return (
    <Box
      w='full'
      maxW='none'
      minH='100vh'
      overflowX='hidden'
      bg='background'
      py={{ base: '5', md: '8', xl: '10' }}
      px={{ base: '4', md: '8', lg: '10', xl: '12', '2xl': '16' }}
      pb={{ base: '24', md: '10' }}
    >
      <CreateTemplateDrawer isOpen={isCreateDrawerOpen} onClose={closeCreateDrawer} />

      <UpdateTemplateDrawer isOpen={isUpdateDrawerOpen} onClose={closeUpdateDrawer} uuid={editUuid ?? undefined} />

      <Flex
        w='full'
        justify='space-between'
        align={{ base: 'stretch', sm: 'flex-start' }}
        direction={{ base: 'column', sm: 'row' }}
        gap={{ base: '4', md: '6' }}
        mb='8'
      >
        <Box minW={0}>
          <Heading size={{ base: 'lg', md: 'xl' }} color='text' letterSpacing='tight' mb='2'>
            Templates
          </Heading>

          <Text color='textSecondary' fontSize={{ base: 'sm', md: 'md' }}>
            Manage reusable communication templates.
          </Text>
        </Box>

        <Button
          w={{ base: 'full', sm: 'auto' }}
          minW={{ sm: '170px' }}
          bg='actionBg'
          color='white'
          px='6'
          py='2.5'
          borderRadius='xl'
          fontWeight='bold'
          boxShadow='lg'
          flexShrink={0}
          _hover={{ bg: 'actionHover' }}
          onClick={openCreateDrawer}
        >
          Create Template
        </Button>
      </Flex>

      {isLoading ? (
        <Grid gap={{ base: '4', md: '6' }} style={gridStyle}>
          {SKELETON_KEYS.map((key) => (
            <TemplateCardSkeleton key={key} />
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
              onClick={() => openVersions(template.id)}
              onToggle={handleToggle}
              onEdit={openUpdateDrawer}
              onDelete={handleDelete}
              isToggling={toggleMutation.isPending && toggleMutation.variables?.id === template.id}
              isDeleting={deleteMutation.isPending && selectedUuid === template.id}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
};
