import { Box, Button, Flex, Grid, Heading, Spinner, Text } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useParams } from 'react-router-dom';
import {
  activateTemplateVersion,
  deactivateTemplateVersion,
  deleteTemplateVersion,
  getTemplateByUuid,
  getTemplateVersions,
} from '../../services';
import { CreateTemplateVersionDrawer } from './components/create-template-version-drawer';
import { TemplateVersionCard } from './components/template-version-card';
import { UpdateTemplateVersionDrawer } from './components/update-template-version-drawer';

type ToggleTemplateVersionVariables = {
  uuid: string;
  isActive: boolean;
};

const gridStyle = {
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
};

export const TemplateVersions: React.FC = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [editUuid, setEditUuid] = React.useState<string | null>(null);
  const [selectedUuid, setSelectedUuid] = React.useState<string | null>(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = React.useState(false);

  const templateQuery = useQuery({
    queryKey: ['templates', 'detail', id],
    queryFn: () => getTemplateByUuid({ uuid: id ?? '' }),
    enabled: !!id,
  });

  const versionsQuery = useQuery({
    queryKey: ['template-versions', id],
    queryFn: () => getTemplateVersions({ templateId: id ?? '' }),
    enabled: !!id,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ uuid, isActive }: ToggleTemplateVersionVariables) => {
      if (isActive) {
        return activateTemplateVersion({ uuid });
      }

      return deactivateTemplateVersion({ uuid });
    },

    onMutate: async ({ uuid, isActive }) => {
      await queryClient.cancelQueries({
        queryKey: ['template-versions', id],
      });

      const previousTemplateVersions = queryClient.getQueryData<Awaited<ReturnType<typeof getTemplateVersions>>>([
        'template-versions',
        id,
      ]);

      queryClient.setQueryData<Awaited<ReturnType<typeof getTemplateVersions>>>(['template-versions', id], (old) => {
        if (!old) return old;

        return {
          ...old,
          templateVersions: old.templateVersions.map((version) =>
            version.id === uuid
              ? {
                  ...version,
                  isActive,
                }
              : version,
          ),
        };
      });

      return { previousTemplateVersions };
    },

    onSuccess: (response) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof getTemplateVersions>>>(['template-versions', id], (old) => {
        if (!old) return old;

        return {
          ...old,
          templateVersions: old.templateVersions.map((version) =>
            version.id === response.id
              ? {
                  ...version,
                  isActive: response.isActive,
                  updatedAt: response.updatedAt,
                }
              : version,
          ),
        };
      });
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTemplateVersions) {
        queryClient.setQueryData(['template-versions', id], context.previousTemplateVersions);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplateVersion,

    onMutate: async ({ uuid }) => {
      await queryClient.cancelQueries({
        queryKey: ['template-versions', id],
      });

      const previousTemplateVersions = queryClient.getQueryData<Awaited<ReturnType<typeof getTemplateVersions>>>([
        'template-versions',
        id,
      ]);

      queryClient.setQueryData<Awaited<ReturnType<typeof getTemplateVersions>>>(['template-versions', id], (old) => {
        if (!old) return old;

        return {
          ...old,
          templateVersions: old.templateVersions.filter((version) => version.id !== uuid),
        };
      });

      return { previousTemplateVersions };
    },

    onSuccess: () => {
      setSelectedUuid(null);
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTemplateVersions) {
        queryClient.setQueryData(['template-versions', id], context.previousTemplateVersions);
      }
    },
  });

  const isLoading = templateQuery.isLoading || versionsQuery.isLoading;
  const isError = templateQuery.isError || versionsQuery.isError;

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

  const handleToggle = (uuid: string, isActive: boolean) => {
    toggleMutation.mutate({ uuid, isActive });
  };

  const handleDelete = (uuid: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this template version?');

    if (!confirmed) return;

    setSelectedUuid(uuid);
    deleteMutation.mutate({ uuid });
  };

  if (isLoading) {
    return (
      <Flex minH='100vh' align='center' justify='center'>
        <Spinner size='lg' />
      </Flex>
    );
  }

  if (isError || !templateQuery.data) {
    return (
      <Flex justify='center' align='center' direction='column' gap='3' py='16' color='textSecondary'>
        <Text fontSize='lg'>Error loading template versions.</Text>
        <Text fontSize='sm'>Try again later.</Text>
      </Flex>
    );
  }

  const template = templateQuery.data;
  const versions = versionsQuery.data?.templateVersions ?? [];
  const selectedVersion = versions.find((version) => version.id === editUuid);

  return (
    <Box w='full' minH='100vh' overflowX='hidden' py={{ base: '6', md: '8' }} px={{ base: '4', md: '8', lg: '10' }}>
      <CreateTemplateVersionDrawer isOpen={isCreateDrawerOpen} onClose={closeCreateDrawer} templateId={id ?? ''} />

      <UpdateTemplateVersionDrawer
        isOpen={isUpdateDrawerOpen}
        onClose={closeUpdateDrawer}
        templateId={id ?? ''}
        version={selectedVersion}
      />

      <Flex w='full' justify='space-between' align='flex-start' gap='6' mb='8'>
        <Box minW={0}>
          <Heading size='xl' color='text' letterSpacing='tight' mb='2'>
            {template.name}
          </Heading>

          <Text color='textSecondary' lineHeight='1.7' maxW='900px' whiteSpace='pre-wrap'>
            {template.description}
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
          flexShrink={0}
          _hover={{ bg: 'secondary' }}
          onClick={openCreateDrawer}
        >
          Create Version
        </Button>
      </Flex>

      {versions.length === 0 ? (
        <Flex justify='center' align='center' direction='column' gap='3' py='16' color='textSecondary'>
          <Text fontSize='lg'>No versions found.</Text>
          <Text fontSize='sm'>Click "Create Version" to create the first one.</Text>
        </Flex>
      ) : (
        <Grid gap={{ base: '4', md: '6' }} style={gridStyle}>
          {versions.map((version) => (
            <TemplateVersionCard
              key={version.id}
              version={version}
              onToggle={handleToggle}
              onEdit={openUpdateDrawer}
              onDelete={handleDelete}
              isToggling={toggleMutation.isPending && toggleMutation.variables?.uuid === version.id}
              isDeleting={deleteMutation.isPending && selectedUuid === version.id}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
};
