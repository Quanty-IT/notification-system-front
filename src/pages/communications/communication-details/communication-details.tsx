import { Badge, Box, Button, Flex, Grid, Heading, HStack, Link, Spinner, Stack, Text } from '@chakra-ui/react';
import {
  ArrowLeftIcon,
  DownloadSimpleIcon,
  EnvelopeIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEditCommunicationPath } from '@/routes';
import { getCommunicationById, sendCommunicationNow } from '@/services';
import { CommunicationDetail, CommunicationStatus } from '@/services/communications/types';
import { HtmlContentPreview } from '@/shared/components';

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

const editableStatuses: CommunicationStatus[] = ['draft', 'scheduled'];

const formatDateTime = (value: string | null | undefined) => {
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

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string | string[]; errors?: unknown } | undefined;

    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (typeof data?.message === 'string') return data.message;
    if (data?.errors) return typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);

    return error.message;
  }

  if (error instanceof Error) return error.message;

  return 'An unexpected error occurred';
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

    <Text color='text' wordBreak='break-word' whiteSpace='pre-wrap'>
      {value}
    </Text>
  </Box>
);

const StatusBadge = ({ status }: { status: CommunicationStatus | string }) => {
  const styles = statusStyles[status as CommunicationStatus] ?? {
    bg: status === 'sent' ? 'green.100' : 'red.100',
    color: status === 'sent' ? 'green.800' : 'red.800',
  };

  return (
    <Badge
      px='3'
      py='1'
      borderRadius='full'
      fontSize='xs'
      fontWeight='bold'
      textTransform='none'
      bg={styles.bg}
      color={styles.color}
    >
      {statusLabelMap[status as CommunicationStatus] ?? status}
    </Badge>
  );
};

const KeyValueRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Grid templateColumns={{ base: '1fr', md: '92px 1fr' }} gap='2' alignItems='center'>
    <Flex
      align='center'
      justify='center'
      px='3'
      py='2'
      borderRadius='lg'
      bg='green.50'
      borderWidth='1px'
      borderColor='green.100'
      color='green.800'
      fontWeight='bold'
      fontSize='xs'
      minH='9'
    >
      <Text truncate>{label}</Text>
    </Flex>

    <Flex align='center' px='4' py='2' borderRadius='lg' bg='gray.50' borderWidth='1px' borderColor='gray.100' minH='9'>
      <Text fontSize='sm' fontWeight='semibold' color='text' wordBreak='break-word'>
        {value}
      </Text>
    </Flex>
  </Grid>
);

export const CommunicationDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [communication, setCommunication] = useState<CommunicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const canEdit = communication ? editableStatuses.includes(communication.status) : false;
  const canSendNow = communication?.status === 'draft' || communication?.status === 'scheduled';

  const loadCommunication = React.useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getCommunicationById({ id });

      setCommunication(data);
    } catch (error) {
      alert(`Failed to load communication: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCommunication();
  }, [loadCommunication]);

  const handleSendNow = async () => {
    if (!id) return;

    try {
      setIsSending(true);

      await sendCommunicationNow({ id });
      await loadCommunication();
    } catch (error) {
      alert(`Failed to send communication: ${getErrorMessage(error)}`);
    } finally {
      setIsSending(false);
    }
  };

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
    <Box w='full' minH='100vh' overflowX='hidden' py={{ base: '6', md: '8' }} px={{ base: '4', md: '8', lg: '10' }}>
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

      <Flex justify='space-between' align={{ base: 'flex-start', md: 'center' }} gap='6' mb='8' wrap='wrap'>
        <Box>
          <Heading size='xl' color='text' letterSpacing='tight' mb='4'>
            {communication.subject ?? 'No subject'}
          </Heading>

          <HStack gap='3' wrap='wrap'>
            <StatusBadge status={communication.status} />

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

        <Flex direction={{ base: 'column', sm: 'row' }} align={{ base: 'stretch', sm: 'center' }} gap='3'>
          {canSendNow && (
            <Button
              bg='primary'
              color='white'
              borderRadius='xl'
              fontWeight='bold'
              px='6'
              loading={isSending}
              loadingText='Sending...'
              _hover={{ bg: 'secondary' }}
              onClick={handleSendNow}
            >
              <HStack gap='2'>
                <PaperPlaneTiltIcon size={18} />
                <Text>Send Now</Text>
              </HStack>
            </Button>
          )}

          {canEdit && (
            <Button
              variant='outline'
              borderColor='inputBorder'
              color='primary'
              borderRadius='xl'
              fontWeight='bold'
              px='6'
              _hover={{ bg: 'gray.50', borderColor: 'primary' }}
              onClick={() => navigate(getEditCommunicationPath(communication.id))}
            >
              <HStack gap='2'>
                <PencilSimpleIcon size={18} />
                <Text>Edit</Text>
              </HStack>
            </Button>
          )}
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: '1fr', xl: '2fr 1fr' }} gap='6'>
        <Stack gap='6'>
          <InfoCard title='Content'>
            <Stack gap='6'>
              <Field label='Subject' value={communication.subject ?? 'Not informed'} />

              <Box>
                <Text
                  fontSize='xs'
                  fontWeight='bold'
                  color='textSecondary'
                  textTransform='uppercase'
                  letterSpacing='wider'
                  mb='2'
                >
                  Body
                </Text>

                {communication.body ? (
                  <HtmlContentPreview value={communication.body} />
                ) : (
                  <Text color='textSecondary'>Not informed</Text>
                )}
              </Box>
            </Stack>
          </InfoCard>

          <InfoCard title='Recipients'>
            {communication.recipients.length > 0 ? (
              <Stack gap='3'>
                {communication.recipients.map((recipient) => (
                  <KeyValueRow key={recipient.id} label={recipient.recipientType} value={recipient.email} />
                ))}
              </Stack>
            ) : (
              <Text color='textSecondary'>No recipients.</Text>
            )}
          </InfoCard>

          <InfoCard title='Template Variables'>
            {communication.templateVariablesJson && Object.keys(communication.templateVariablesJson).length > 0 ? (
              <Stack gap='3'>
                {Object.entries(communication.templateVariablesJson).map(([key, value]) => (
                  <KeyValueRow key={key} label={key} value={String(value)} />
                ))}
              </Stack>
            ) : (
              <Text color='textSecondary'>Not informed</Text>
            )}
          </InfoCard>

          <InfoCard title='Attachments'>
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

                      <Text fontSize='xs' color='textSecondary'>
                        {attachment.mimeType} • {formatFileSize(attachment.fileSizeBytes)}
                      </Text>
                    </Box>

                    <Link href={attachment.fileUrl} target='_blank' rel='noreferrer' color='primary'>
                      <HStack gap='1'>
                        <DownloadSimpleIcon size={16} />
                        <Text fontSize='sm' fontWeight='bold'>
                          Download
                        </Text>
                      </HStack>
                    </Link>
                  </Flex>
                ))}
              </Stack>
            ) : (
              <Text color='textSecondary'>No attachments.</Text>
            )}
          </InfoCard>
        </Stack>

        <Stack gap='6'>
          <InfoCard title='Dates'>
            <Stack gap='5'>
              <Field label='Created At' value={formatDateTime(communication.createdAt)} />
              <Field
                label='Scheduled At'
                value={communication.scheduledAt ? formatDateTime(communication.scheduledAt) : 'Sent immediately'}
              />
              <Field label='Sent At' value={formatDateTime(communication.sentAt)} />
            </Stack>
          </InfoCard>

          <InfoCard title='Dispatches'>
            {communication.dispatches.length > 0 ? (
              <Stack gap='3'>
                {communication.dispatches.map((dispatch) => (
                  <Box key={dispatch.id} p='4' borderWidth='1px' borderColor='gray.100' borderRadius='xl' bg='white'>
                    <Flex justify='space-between' align='center' mb='2'>
                      <Text color='text' fontWeight='bold'>
                        Attempt #{dispatch.attemptNumber}
                      </Text>

                      <StatusBadge status={dispatch.status} />
                    </Flex>

                    <Text fontSize='sm' color='textSecondary'>
                      Provider: {dispatch.provider}
                    </Text>

                    <Text fontSize='xs' color='textSecondary' mt='2'>
                      Started: {formatDateTime(dispatch.startedAt)}
                    </Text>

                    <Text fontSize='xs' color='textSecondary'>
                      Finished: {formatDateTime(dispatch.finishedAt)}
                    </Text>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text color='textSecondary'>No dispatches yet.</Text>
            )}
          </InfoCard>
        </Stack>
      </Grid>
    </Box>
  );
};
