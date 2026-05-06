import { Badge, Box, Button, Flex, Grid, Heading, Spinner, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useParams } from 'react-router-dom';
import { getTemplateByUuid, getTemplateVersions } from '../../services';

const gridStyle = {
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
};

export const TemplateVersions: React.FC = () => {
  const { id } = useParams();

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

  const isLoading = templateQuery.isLoading || versionsQuery.isLoading;
  const isError = templateQuery.isError || versionsQuery.isError;

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

  return (
    <Box w='full' minH='100vh' overflowX='hidden' py={{ base: '6', md: '8' }} px={{ base: '4', md: '8', lg: '10' }}>
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
          {versions.map((version) => {
            const variableNames = Object.keys(version.variablesSchemaJson ?? {});

            return (
              <Box
                key={version.id}
                bg='surface'
                border='1px solid'
                borderColor='inputBorder'
                borderRadius='2xl'
                p='5'
                boxShadow='sm'
                cursor='pointer'
                transition='all 0.2s ease'
                _hover={{
                  borderColor: 'primary',
                  boxShadow: 'md',
                  transform: 'translateY(-2px)',
                }}
              >
                <Flex justify='space-between' align='center' mb='3' gap='3'>
                  <Heading size='md' color='text'>
                    Version {version.version}
                  </Heading>

                  <Badge
                    bg={version.isActive ? 'active' : 'inactive'}
                    color='white'
                    borderRadius='full'
                    px='3'
                    py='1'
                    fontSize='xs'
                    flexShrink={0}
                  >
                    {version.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Flex>

                <Text fontWeight='bold' color='primary' mb='2' lineClamp={1}>
                  {version.subject}
                </Text>

                <Text fontSize='sm' color='textSecondary' mb='1'>
                  Type: {version.bodyType.toUpperCase()}
                </Text>

                <Text fontSize='sm' color='textSecondary' lineClamp={2}>
                  Variables: {variableNames.length > 0 ? variableNames.join(', ') : 'None'}
                </Text>
              </Box>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
