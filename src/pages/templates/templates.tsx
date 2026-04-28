import { Box, Button, Flex, Grid, Heading, Skeleton, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { api } from '../../services/axios';
import { TemplateCard } from './components/template-card';
import type { Template } from './types';

const MOCK_DATA: Template[] = [
  {
    id: '1',
    title: 'Welcome!',
    description: 'Welcome message automatically sent to new employees when they join the company.',
    isActive: true,
    createdAt: '2024-05-01',
  },
  {
    id: '2',
    title: 'New Equipment',
    description: 'Notification sent to the responsible department whenever new equipment is added to inventory.',
    isActive: false,
    createdAt: '2024-05-02',
  },
];

const SKELETON_KEYS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);

export const Templates: React.FC = () => {
  const [data, setData] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    setData(MOCK_DATA);
    setLoading(false);
  }, []);

  const handleToggle = async (id: string, isActive: boolean) => {
    setData((prev) => prev.map((template) => (template.id === id ? { ...template, isActive } : template)));
    setTogglingId(id);

    try {
      await api.patch(`/templates/${id}`, { isActive });
    } catch (err) {
      console.error('Failed to update template.', err);
      setData((prev) => prev.map((template) => (template.id === id ? { ...template, isActive: !isActive } : template)));
    } finally {
      setTogglingId(null);
    }
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
      <Flex wrap='wrap' justify='space-between' align='center' gap='4' mb='12'>
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

      {loading ? (
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
          gap={{ base: '4', md: '6' }}
        >
          {SKELETON_KEYS.map((key) => (
            <Skeleton key={key} height='170px' borderRadius='2xl' />
          ))}
        </Grid>
      ) : data.length === 0 ? (
        <Flex justify='center' align='center' direction='column' gap='3' py='16' color='textSecondary'>
          <Text fontSize='lg'>No templates found.</Text>
          <Text fontSize='sm'>Click "Create Template" to create the first one.</Text>
        </Flex>
      ) : (
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
          gap={{ base: '4', md: '6' }}
        >
          {data.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onToggle={handleToggle}
              isToggling={togglingId === template.id}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
};
