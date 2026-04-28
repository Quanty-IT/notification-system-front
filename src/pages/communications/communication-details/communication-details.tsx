import { Badge, Box, Button, Flex, Grid, Heading, HStack, Link, Spinner, Stack, Text } from '@chakra-ui/react';
import { ArrowLeftIcon, CalendarBlankIcon, ClockIcon, DownloadSimpleIcon, EnvelopeIcon } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type CommunicationStatus = 'draft' | 'scheduled' | 'processing' | 'sent' | 'failed' | 'canceled';
type CommunicationChannel = 'email';
type CommunicationSourceType = 'manual' | 'template';
type CommunicationBodyType = 'text' | 'html' | null;

type CommunicationAttachment = {
  id: string;
  communicationId: string;
  originalFileName: string;
  storageProvider: 'r2';
  storageKey: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
};

type FindCommunicationByIdResponse = {
  id: string;
  channel: CommunicationChannel;
  sourceType: CommunicationSourceType;
  status: CommunicationStatus;
  subject: string | null;
  body: string | null;
  bodyType: CommunicationBodyType;
  templateVersionId: string | null;
  templateVariablesJson: Record<string, string | number | boolean> | null;
  scheduledAt: string | null;
  processingAt: string | null;
  sentAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: CommunicationAttachment[];
};

const MOCK_COMMUNICATION: FindCommunicationByIdResponse = {
  id: '39d6b7f5-6e0d-44e4-a58a-ba84827b7edf',
  channel: 'email',
  sourceType: 'template',
  status: 'draft',
  subject: 'Welcome to the system',
  body: null,
  bodyType: null,
  templateVersionId: '4dd02b5f-8408-42b1-b8bb-82bf729627ad',
  templateVariablesJson: {
    name: 'John Smith',
  },
  scheduledAt: null,
  processingAt: null,
  sentAt: null,
  createdByUserId: '049bbe25-c92a-4a3e-9b0b-6bed97a151da',
  createdAt: '2026-04-20T14:56:00.000Z',
  updatedAt: '2026-04-20T14:56:00.000Z',
  attachments: [
    {
      id: 'att-1',
      communicationId: '39d6b7f5-6e0d-44e4-a58a-ba84827b7edf',
      originalFileName: 'Employee onboarding guide.png',
      storageProvider: 'r2',
      storageKey: 'attachments/employee-onboarding-guide.png',
      fileUrl: '#',
      mimeType: 'image/png',
      fileSizeBytes: 442500,
      createdAt: '2026-04-20T20:57:00.000Z',
    },
  ],
};

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

  const [communication, setCommunication] = useState<FindCommunicationByIdResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCommunication({
      ...MOCK_COMMUNICATION,
      id: id ?? MOCK_COMMUNICATION.id,
    });
    setLoading(false);
  }, [id]);

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
              bg={statusStyles[communication.status].bg}
              color={statusStyles[communication.status].color}
            >
              {statusLabelMap[communication.status]}
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

        <Stack gap='2' fontSize='sm' color='textSecondary' ml='auto' textAlign='right' align='flex-end'>
          <HStack gap='2'>
            <CalendarBlankIcon size={16} />
            <Text>Created on {formatDateTime(communication.createdAt)}</Text>
          </HStack>

          <HStack gap='2'>
            <ClockIcon size={16} />
            <Text>Updated on {formatDateTime(communication.updatedAt)}</Text>
          </HStack>
        </Stack>
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
