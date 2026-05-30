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
import { getUpdateCommunicationPath } from '@/routes';
import { getCommunicationById, sendCommunicationNow } from '@/services';
import { CommunicationDetail, CommunicationStatus } from '@/services/communications/types';
import { HtmlContentPreview, StatusBadge } from '@/shared/components';

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
  <Box
    bg='surface'
    borderRadius='2xl'
    borderWidth='1px'
    borderStyle='solid'
    borderColor='border'
    boxShadow='sm'
    p={{ base: '5', md: '6' }}
    w='full'
    minW='0'
  >
    <Heading size='sm' color='text' mb='5'>
      {title}
    </Heading>

    {children}
  </Box>
);

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box minW='0'>
    <Text
      fontSize='xs'
      fontWeight='bold'
      color='textSecondary'
      textTransform='uppercase'
      letterSpacing='wider'
      mb='2'
      wordBreak='break-word'
    >
      {label}
    </Text>

    <Text color='text' wordBreak='break-word' whiteSpace='pre-wrap'>
      {value}
    </Text>
  </Box>
);

const KeyValueRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Grid
    templateColumns={{ base: '1fr', sm: '120px 1fr' }}
    gap={{ base: '2', sm: '3' }}
    alignItems='stretch'
    w='full'
    minW='0'
  >
    <Flex
      align='center'
      justify='center'
      px='3'
      py='2'
      borderRadius='lg'
      bg='successBg'
      borderWidth='1px'
      borderStyle='solid'
      borderColor='border'
      color='successText'
      fontWeight='bold'
      fontSize='xs'
      minH='9'
      minW='0'
    >
      <Text truncate>{label}</Text>
    </Flex>

    <Flex
      align='center'
      px='4'
      py='2'
      borderRadius='lg'
      bg='surfaceMuted'
      borderWidth='1px'
      borderStyle='solid'
      borderColor='border'
      minH='9'
      minW='0'
    >
      <Text fontSize='sm' fontWeight='semibold' color='text' wordBreak='break-word' minW='0'>
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
    <Box
      w='full'
      maxW='none'
      minH='100vh'
      overflowX='hidden'
      py={{ base: '5', md: '8', xl: '10' }}
      px={{ base: '4', md: '8', lg: '10', xl: '12', '2xl': '16' }}
      pb={{ base: '24', md: '10' }}
    >
      <Button
        variant='ghost'
        mb={{ base: '6', md: '8' }}
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

      <Flex
        justify='space-between'
        align={{ base: 'stretch', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: '4', md: '6' }}
        mb={{ base: '6', md: '8' }}
        w='full'
        minW='0'
      >
        <Box minW='0'>
          <Heading size={{ base: 'lg', md: 'xl' }} color='text' letterSpacing='tight' mb='4' wordBreak='break-word'>
            {communication.subject ?? 'No subject'}
          </Heading>

          <HStack gap='2' wrap='wrap'>
            <StatusBadge status={communication.status} />

            <Badge px='3' py='1' borderRadius='full' bg='successBg' color='successText' textTransform='none'>
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
          gap='3'
          w={{ base: 'full', md: 'auto' }}
          flexShrink={0}
        >
          {canSendNow && (
            <Button
              w={{ base: 'full', sm: 'auto' }}
              bg='actionBg'
              color='white'
              borderRadius='xl'
              fontWeight='bold'
              px='6'
              h='11'
              loading={isSending}
              loadingText='Sending...'
              _hover={{ bg: 'actionHover' }}
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
              w={{ base: 'full', sm: 'auto' }}
              variant='outline'
              borderColor='inputBorder'
              color='primary'
              borderRadius='xl'
              fontWeight='bold'
              px='6'
              h='11'
              _hover={{ bg: 'gray.50', borderColor: 'primary' }}
              onClick={() => navigate(getUpdateCommunicationPath(communication.id))}
            >
              <HStack gap='2'>
                <PencilSimpleIcon size={18} />
                <Text>Edit</Text>
              </HStack>
            </Button>
          )}
        </Flex>
      </Flex>

      <Grid
        templateColumns={{
          base: '1fr',
          xl: 'minmax(0, 2fr) minmax(360px, 0.85fr)',
          '2xl': 'minmax(0, 2.2fr) minmax(420px, 0.8fr)',
        }}
        gap={{ base: '5', md: '6', xl: '8' }}
        w='full'
        minW='0'
        alignItems='start'
      >
        <Stack gap={{ base: '5', md: '6' }} minW='0'>
          <InfoCard title='Content'>
            <Stack gap='6' minW='0'>
              <Field label='Subject' value={communication.subject ?? 'Not informed'} />

              <Box minW='0'>
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
                  <Box
                    w='full'
                    maxW='full'
                    overflowX='auto'
                    borderRadius='md'
                    css={{
                      '& *': {
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                      },
                      '& img': {
                        maxWidth: '100%',
                        height: 'auto',
                      },
                      '& table': {
                        width: '100%',
                        maxWidth: '100%',
                      },
                    }}
                  >
                    <HtmlContentPreview value={communication.body} />
                  </Box>
                ) : (
                  <Text color='textSecondary'>Not informed</Text>
                )}
              </Box>
            </Stack>
          </InfoCard>

          <InfoCard title='Recipients'>
            {communication.recipients.length > 0 ? (
              <Stack gap='3' minW='0'>
                {communication.recipients.map((recipient) => (
                  <KeyValueRow key={recipient.id} label={recipient.recipientType} value={recipient.email} />
                ))}
              </Stack>
            ) : (
              <Text color='textSecondary'>No recipients.</Text>
            )}
          </InfoCard>

          {communication.templateVariablesJson && Object.keys(communication.templateVariablesJson).length > 0 && (
            <InfoCard title='Template Variables'>
              <Stack gap='3' minW='0'>
                {Object.entries(communication.templateVariablesJson).map(([key, value]) => (
                  <KeyValueRow key={key} label={key} value={String(value)} />
                ))}
              </Stack>
            </InfoCard>
          )}

          {communication.attachments.length > 0 && (
            <InfoCard title='Attachments'>
              <Stack
                gap='0'
                borderWidth='1px'
                borderStyle='solid'
                borderColor='border'
                borderRadius='2xl'
                overflow='hidden'
                minW='0'
              >
                {communication.attachments.map((attachment) => (
                  <Flex
                    key={attachment.id}
                    align={{ base: 'flex-start', sm: 'center' }}
                    justify='space-between'
                    direction={{ base: 'column', sm: 'row' }}
                    gap='3'
                    px={{ base: '4', md: '5' }}
                    py='4'
                    bg='surfaceMuted'
                    borderBottomWidth='1px'
                    borderStyle='solid'
                    borderColor='border'
                    _last={{ borderBottomWidth: 0 }}
                    _hover={{ bg: 'surface' }}
                    minW='0'
                  >
                    <Box minW='0' w='full'>
                      <Text fontWeight='semibold' color='text' wordBreak='break-word'>
                        {attachment.originalFileName}
                      </Text>

                      <Text fontSize='xs' color='textSecondary' wordBreak='break-word'>
                        {attachment.mimeType} • {formatFileSize(attachment.fileSizeBytes)}
                      </Text>
                    </Box>

                    <Link href={attachment.fileUrl} target='_blank' rel='noreferrer' color='primary' flexShrink={0}>
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
            </InfoCard>
          )}
        </Stack>

        <Stack gap={{ base: '5', md: '6' }} minW='0' position={{ base: 'static', xl: 'sticky' }} top={{ xl: '6' }}>
          <Grid
            templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: '1fr' }}
            gap={{ base: '5', md: '6' }}
          >
            <InfoCard title='Dates'>
              <Stack gap='5' minW='0'>
                <Field label='Created At' value={formatDateTime(communication.createdAt)} />

                <Field
                  label='Scheduled At'
                  value={communication.scheduledAt ? formatDateTime(communication.scheduledAt) : 'Sent immediately'}
                />

                <Field
                  label='Sent At'
                  value={communication.sentAt ? formatDateTime(communication.sentAt) : 'Not sent yet'}
                />
              </Stack>
            </InfoCard>

            <InfoCard title='Dispatches'>
              {communication.dispatches.length > 0 ? (
                <Stack gap='3' minW='0'>
                  {communication.dispatches.map((dispatch) => (
                    <Box
                      key={dispatch.id}
                      p='4'
                      borderWidth='1px'
                      borderStyle='solid'
                      borderColor='border'
                      borderRadius='xl'
                      bg='surfaceMuted'
                      minW='0'
                    >
                      <Flex justify='space-between' align='flex-start' gap='3' mb='2'>
                        <Text color='text' fontWeight='bold' wordBreak='break-word'>
                          Attempt #{dispatch.attemptNumber}
                        </Text>

                        <Box flexShrink={0}>
                          <StatusBadge status={dispatch.status} />
                        </Box>
                      </Flex>

                      <Text fontSize='sm' color='textSecondary' wordBreak='break-word'>
                        Provider: {dispatch.provider}
                      </Text>

                      <Text fontSize='xs' color='textSecondary' mt='2' wordBreak='break-word'>
                        Started: {formatDateTime(dispatch.startedAt)}
                      </Text>

                      <Text fontSize='xs' color='textSecondary' wordBreak='break-word'>
                        Finished: {formatDateTime(dispatch.finishedAt)}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Text color='textSecondary'>No dispatches yet.</Text>
              )}
            </InfoCard>
          </Grid>
        </Stack>
      </Grid>
    </Box>
  );
};
