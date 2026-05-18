import { Badge, Box, Button, Flex, Grid, Heading, HStack, Link, Spinner, Stack, Text } from '@chakra-ui/react';
import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  ClockIcon,
  DownloadSimpleIcon,
  EnvelopeIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEditCommunicationPath } from '@/routes';
import { Communication, CommunicationStatus, getCommunicationById } from '@/services';

const statusLabelMap: Record<CommunicationStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  processing: 'Processing',
  sent: 'Sent',
  failed: 'Failed',
  canceled: 'Canceled',
};

const statusStyles: Record<CommunicationStatus, { bg: string; color: string }> = {
  draft: { bg: 'gray.100', color: 'gray.700' },
  scheduled: { bg: 'blue.100', color: 'blue.800' },
  processing: { bg: 'purple.100', color: 'purple.800' },
  sent: { bg: 'green.100', color: 'green.800' },
  failed: { bg: 'red.100', color: 'red.800' },
  canceled: { bg: 'orange.100', color: 'orange.800' },
};

const formatDateTime = (value: string | null) => {
  if (!value) return 'Not informed';

  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box bg='surface' borderRadius='2xl' borderWidth='1px' borderColor='gray.100' boxShadow='sm' p='6'>
    <Heading size='sm' color='text' mb='5'>
      {title}
    </Heading>

    {children}
  </Box>
);

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Text fontSize='xs' fontWeight='bold' color='textSecondary' textTransform='uppercase' letterSpacing='wider' mb='2'>
      {label}
    </Text>

    <Text color='text' wordBreak='break-word'>
      {value}
    </Text>
  </Box>
);

export const CommunicationDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [communication, setCommunication] = useState<Communication | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCommunication = React.useCallback(async (commId: string) => {
    try {
      setLoading(true);
      const data = await getCommunicationById(commId);
      setCommunication(data);
    } catch (error) {
      console.error('Failed to load communication:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadCommunication(id);
    }
  }, [id, loadCommunication]);

  if (loading) {
    return (
      <Flex minH='60vh' align='center' justify='center' direction='column' gap='3'>
        <Spinner color='primary' />
        <Text color='textSecondary'>Loading communication...</Text>
      </Flex>
    );
  }

  if (!communication) {
    return (
      <Flex minH='60vh' align='center' justify='center'>
        <Text color='textSecondary'>Communication not found.</Text>
      </Flex>
    );
  }

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

      <Flex justify='space-between' align={{ base: 'flex-start', md: 'center' }} gap='6' mb='10' wrap='wrap'>
        <Box>
          <Heading size='xl' color='text' letterSpacing='tight' mb='4'>
            {communication.subject ?? 'No subject'}
          </Heading>

          <HStack gap='3' wrap='wrap'>
            <Badge
              px='3'
              py='1'
              borderRadius='full'
              fontSize='xs'
              fontWeight='bold'
              textTransform='none'
              bg={statusStyles[communication.status as CommunicationStatus]?.bg || 'gray.100'}
              color={statusStyles[communication.status as CommunicationStatus]?.color || 'gray.700'}
            >
              {statusLabelMap[communication.status as CommunicationStatus] || communication.status}
            </Badge>

            <Badge px='3' py='1' borderRadius='full' bg='green.50' color='green.800' textTransform='none'>
              <HStack gap='1'>
                <EnvelopeIcon size={14} />
                <Text>{communication.channel}</Text>
              </HStack>
            </Badge>

            <Badge px='3' py='1' borderRadius='full' bg='yellow.100' color='yellow.800' textTransform='none'>
              Source: {communication.sourceType}
            </Badge>
          </HStack>
        </Box>

        <Flex
          direction={{ base: 'column', sm: 'row' }}
          align={{ base: 'stretch', sm: 'center' }}
          gap='4'
          w={{ base: 'full', md: 'auto' }}
        >
          <Button
            bg='primary'
            color='white'
            px='6'
            py='2.5'
            borderRadius='xl'
            fontWeight='bold'
            boxShadow='lg'
            w={{ base: 'full', sm: 'auto' }}
            _hover={{ bg: 'secondary' }}
            onClick={() => navigate(getEditCommunicationPath(communication.id))}
          >
            <HStack gap='2'>
              <PencilSimpleIcon size={18} />
              <Text>Edit</Text>
            </HStack>
          </Button>

          <Stack gap='1' fontSize='xs' color='textSecondary' align={{ base: 'flex-start', sm: 'flex-end' }}>
            <HStack gap='2'>
              <CalendarBlankIcon size={14} />
              <Text>Created on {formatDateTime(communication.createdAt)}</Text>
            </HStack>
            <HStack gap='2'>
              <ClockIcon size={14} />
              <Text>Updated on {formatDateTime(communication.updatedAt)}</Text>
            </HStack>
          </Stack>
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap='6'>
        <Stack gap='6'>
          <InfoCard title='Content'>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap='6'>
              <Field label='Body' value={communication.body ?? 'Not informed'} />
              <Field label='Body type' value={communication.bodyType ?? 'Not informed'} />
            </Grid>
          </InfoCard>

          <InfoCard title='Template Variables'>
            {communication.templateVariablesJson ? (
              <Stack gap='3'>
                {Object.entries(communication.templateVariablesJson).map(([key, value]) => (
                  <Flex
                    key={key}
                    justify='space-between'
                    align='center'
                    gap='4'
                    borderBottomWidth='1px'
                    borderColor='gray.100'
                    pb='3'
                  >
                    <Text color='textSecondary'>{key}</Text>
                    <Text color='text' fontWeight='semibold'>
                      {String(value)}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            ) : (
              <Text color='textSecondary'>Not informed</Text>
            )}
          </InfoCard>

          <InfoCard title='Anexos'>
            {communication.attachments.length > 0 ? (
              <Stack gap='0' borderWidth='1px' borderColor='gray.100' borderRadius='2xl' overflow='hidden'>
                {communication.attachments.map((attachment) => (
                  <Flex
                    key={attachment.id}
                    align='center'
                    justify='space-between'
                    gap='4'
                    px='5'
                    py='4'
                    bg='white'
                    borderBottomWidth='1px'
                    borderColor='gray.100'
                    _last={{ borderBottomWidth: 0 }}
                    _hover={{ bg: 'gray.50' }}
                  >
                    <Box minW='0'>
                      <Text fontWeight='semibold' color='text' truncate>
                        {attachment.originalFileName}
                      </Text>

                      <HStack gap='2' fontSize='sm' color='textSecondary' wrap='wrap'>
                        <Text>{attachment.mimeType}</Text>
                        <Text>•</Text>
                        <Text>{formatFileSize(attachment.fileSizeBytes)}</Text>
                        <Text>•</Text>
                        <Text>{formatDateTime(attachment.createdAt)}</Text>
                      </HStack>
                    </Box>

                    <Link
                      href={attachment.fileUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      display='flex'
                      alignItems='center'
                      justifyContent='center'
                      w='9'
                      h='9'
                      borderRadius='lg'
                      bg='green.50'
                      color='primary'
                      flexShrink={0}
                      _hover={{
                        bg: 'green.100',
                        textDecoration: 'none',
                      }}
                    >
                      <DownloadSimpleIcon size={18} />
                    </Link>
                  </Flex>
                ))}
              </Stack>
            ) : (
              <Text color='textSecondary'>No attachments found.</Text>
            )}
          </InfoCard>
        </Stack>

        <Stack gap='6'>
          <InfoCard title='Metadata'>
            <Stack gap='5' fontSize='sm'>
              <Field label='ID' value={communication.id} />
              <Field label='Created by' value={communication.createdByUserId ?? 'Not informed'} />
              <Field label='Template Version ID' value={communication.templateVersionId ?? 'Not informed'} />
            </Stack>
          </InfoCard>

          <InfoCard title='Timeline'>
            <Stack gap='5' fontSize='sm'>
              <Field label='Scheduled' value={formatDateTime(communication.scheduledAt)} />
              <Field label='Processing' value={formatDateTime(communication.processingAt)} />
              <Field label='Sent at' value={formatDateTime(communication.sentAt)} />
            </Stack>
          </InfoCard>
        </Stack>
      </Grid>
    </Box>
  );
};
