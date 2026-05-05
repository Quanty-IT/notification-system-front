import { Badge, Box, Button, Flex, Grid, Heading, HStack, IconButton, Spinner, Stack, Text } from '@chakra-ui/react';
import {
  ChatCircleTextIcon,
  ClockCounterClockwiseIcon,
  EnvelopeIcon,
  MonitorIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCommunicationDetailPath,
  getCreateCommunicationPath,
  getEditCommunicationPath,
} from '../../routes/routes.constants';
import { getCommunications } from '../../services';

type TypeIconProps = {
  type: 'Whatsapp' | 'Teams' | 'Email';
};

const TypeIcon = ({ type }: TypeIconProps) => {
  const iconProps = { size: 16 };

  switch (type) {
    case 'Email':
      return <EnvelopeIcon {...iconProps} />;
    case 'Whatsapp':
      return <ChatCircleTextIcon {...iconProps} />;
    case 'Teams':
      return <MonitorIcon {...iconProps} />;
    default:
      return null;
  }
};

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: 'gray.100', color: 'gray.700', label: 'Draft' },
  scheduled: { bg: 'blue.100', color: 'blue.800', label: 'Scheduled' },
  processing: { bg: 'purple.100', color: 'purple.800', label: 'Processing' },
  sent: { bg: 'green.100', color: 'green.800', label: 'Sent' },
  failed: { bg: 'red.100', color: 'red.800', label: 'Failed' },
  canceled: { bg: 'orange.100', color: 'orange.800', label: 'Canceled' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const style = statusStyles[status] || { bg: 'gray.100', color: 'gray.700', label: status };

  return (
    <Badge
      px='3'
      py='1'
      borderRadius='full'
      fontSize='xs'
      fontWeight='bold'
      textTransform='none'
      bg={style.bg}
      color={style.color}
    >
      {style.label}
    </Badge>
  );
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

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['communications'],
    queryFn: getCommunications,
  });

  const communications = data?.communications || [];

  const stats = [
    { label: 'Total', value: communications.length.toString() },
    { label: 'Scheduled', value: communications.filter((c) => c.status === 'scheduled').length.toString() },
    { label: 'Drafts', value: communications.filter((c) => c.status === 'draft').length.toString() },
  ];

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
          Dashboard
        </Heading>

        <HStack gap='4' wrap='wrap'>
          <Button
            bg='primary'
            color='white'
            px='6'
            py='2.5'
            borderRadius='xl'
            fontWeight='bold'
            boxShadow='lg'
            _hover={{ bg: 'secondary' }}
            onClick={() => navigate(getCreateCommunicationPath())}
          >
            <HStack gap='2'>
              <PaperPlaneTiltIcon size={18} />
              <Text>Send New</Text>
            </HStack>
          </Button>

          <Button
            bg='surface'
            color='text'
            borderWidth='1px'
            borderColor='inputBorder'
            px='6'
            py='2.5'
            borderRadius='xl'
            fontWeight='bold'
            _hover={{ bg: 'gray.50' }}
          >
            <HStack gap='2'>
              <ClockCounterClockwiseIcon size={18} />
              <Text>History</Text>
            </HStack>
          </Button>
        </HStack>
      </Flex>

      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={{ base: '4', md: '6' }}
        mb='12'
      >
        {stats.map((stat) => (
          <Flex
            key={stat.label}
            direction='column'
            align='center'
            justify='center'
            textAlign='center'
            bg='background'
            p='6'
            borderRadius='3xl'
            boxShadow='sm'
            borderWidth='1px'
            borderColor='gray.100'
          >
            <Text fontSize='xs' fontWeight='bold' color='textSecondary' textTransform='uppercase' letterSpacing='wider'>
              {stat.label}
            </Text>

            <Text mt='2' fontSize='4xl' fontWeight='black' color='text'>
              {stat.value}
            </Text>
          </Flex>
        ))}
      </Grid>

      <Stack gap='4'>
        <Heading size='md' color='text'>
          Recent Timeline
        </Heading>

        {isLoading ? (
          <Flex py='20' justify='center' align='center' direction='column' gap='4'>
            <Spinner color='primary' size='xl' />
            <Text color='textSecondary'>Loading communications...</Text>
          </Flex>
        ) : isError ? (
          <Flex py='20' justify='center' align='center' direction='column' gap='4' bg='red.50' borderRadius='2xl'>
            <Text color='red.600' fontWeight='bold'>
              Error loading communications
            </Text>
            <Button size='sm' onClick={() => window.location.reload()}>
              Try again
            </Button>
          </Flex>
        ) : communications.length === 0 ? (
          <Flex py='20' justify='center' align='center' direction='column' gap='4' bg='gray.50' borderRadius='2xl'>
            <Text color='textSecondary'>No communications found</Text>
            <Text fontSize='sm' color='textSecondary'>
              Click "Send New" to create one
            </Text>
          </Flex>
        ) : (
          <Box w='full' overflowX='auto' maxW='full' pb='4'>
            <Grid templateColumns='repeat(5, 1fr)' gap='4' minW='800px' px='6' py='3' mb='4'>
              <Text
                fontSize='xs'
                fontWeight='bold'
                color='textSecondary'
                textTransform='uppercase'
                letterSpacing='wider'
              >
                Subject
              </Text>
              <Text
                fontSize='xs'
                fontWeight='bold'
                color='textSecondary'
                textTransform='uppercase'
                letterSpacing='wider'
              >
                Channel
              </Text>
              <Text
                fontSize='xs'
                fontWeight='bold'
                color='textSecondary'
                textTransform='uppercase'
                letterSpacing='wider'
              >
                Source
              </Text>
              <Text
                fontSize='xs'
                fontWeight='bold'
                color='textSecondary'
                textTransform='uppercase'
                letterSpacing='wider'
              >
                Status
              </Text>
              <Text
                fontSize='xs'
                fontWeight='bold'
                color='textSecondary'
                textTransform='uppercase'
                letterSpacing='wider'
                textAlign='right'
              >
                Actions
              </Text>
            </Grid>

            <Stack gap='4' minW='800px'>
              {communications.map((comm) => (
                <Grid
                  key={comm.id}
                  templateColumns='repeat(5, 1fr)'
                  gap='4'
                  alignItems='center'
                  bg='surface'
                  p='5'
                  borderRadius='2xl'
                  boxShadow='sm'
                  borderWidth='1px'
                  borderColor='gray.100'
                  fontSize='sm'
                  cursor='pointer'
                  role='button'
                  tabIndex={0}
                  transition='all 0.2s ease'
                  _hover={{
                    borderColor: 'primary',
                    transform: 'translateY(-1px)',
                  }}
                  onClick={() => navigate(getCommunicationDetailPath(comm.id))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(getCommunicationDetailPath(comm.id));
                    }
                  }}
                >
                  <Text truncate fontWeight='medium' color='text'>
                    {comm.subject || 'No subject'}
                  </Text>

                  <HStack gap='2' color='textSecondary'>
                    <TypeIcon type='Email' />
                    <Text>Email</Text>
                  </HStack>

                  <Text truncate color='textSecondary'>
                    {comm.sourceType}
                  </Text>

                  <Box>
                    <StatusBadge status={comm.status} />
                  </Box>

                  <HStack justify='flex-end' gap='2'>
                    <Text color='textSecondary' fontSize='xs'>
                      {formatDateTime(comm.createdAt)}
                    </Text>
                    <IconButton
                      aria-label='Edit communication'
                      variant='ghost'
                      colorScheme='blue'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(getEditCommunicationPath(comm.id));
                      }}
                    >
                      <PencilSimpleIcon size={18} />
                    </IconButton>
                  </HStack>
                </Grid>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
