import { Box, Button, Flex, Grid, Heading, HStack, IconButton, Spinner, Stack, Text } from '@chakra-ui/react';
import {
  CalendarCheckIcon,
  ChatCircleTextIcon,
  EnvelopeIcon,
  MonitorIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCommunicationDetailPath, getCreateCommunicationPath, getUpdateCommunicationPath } from '@/routes';
import { getCommunications } from '@/services';
import { StatusBadge } from '@/shared';

type TypeIconProps = {
  type: 'Whatsapp' | 'Teams' | 'Email';
};

const editableStatuses = ['draft', 'scheduled'];

const canEditCommunication = (status: string) => editableStatuses.includes(status);

const TypeIcon = ({ type }: TypeIconProps) => {
  const iconProps = { size: 15 };

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

  const sentCommunications = communications.filter((communication) => communication.status === 'sent');

  const scheduledCommunications = communications.filter((communication) => communication.status === 'scheduled');

  const stats = [
    {
      label: 'Sent',
      value: sentCommunications.length.toString(),
      icon: <PaperPlaneTiltIcon size={22} />,
      description: 'Delivered communications',
    },
    {
      label: 'Scheduled',
      value: scheduledCommunications.length.toString(),
      icon: <CalendarCheckIcon size={22} />,
      description: 'Waiting to be sent',
    },
  ];

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
      <Flex
        justify='space-between'
        align={{ base: 'stretch', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        gap={{ base: '4', md: '6' }}
        mb={{ base: '6', md: '8', xl: '10' }}
        w='full'
        minW='0'
      >
        <Box minW='0'>
          <Heading size={{ base: 'lg', md: 'xl' }} color='text' letterSpacing='tight' wordBreak='break-word'>
            Dashboard
          </Heading>

          <Text mt='2' color='textSecondary' fontSize='sm' wordBreak='break-word'>
            Track sent and scheduled communications.
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
          onClick={() => navigate(getCreateCommunicationPath())}
        >
          <HStack gap='2'>
            <PaperPlaneTiltIcon size={18} />
            <Text>Send New</Text>
          </HStack>
        </Button>
      </Flex>

      <Grid
        templateColumns={{
          base: 'repeat(2, minmax(0, 1fr))',
          xl: 'repeat(2, minmax(0, 420px))',
          '2xl': 'repeat(2, minmax(0, 520px))',
        }}
        gap={{ base: '3', md: '5', xl: '6' }}
        mb={{ base: '8', md: '10', xl: '12' }}
        w='full'
        minW='0'
      >
        {stats.map((stat) => (
          <Flex
            key={stat.label}
            direction='column'
            justify='space-between'
            bg='surface'
            p={{ base: '4', md: '6' }}
            minH={{ base: '142px', md: '160px' }}
            borderRadius='2xl'
            boxShadow='sm'
            borderWidth='1px'
            borderStyle='solid'
            borderColor='border'
            minW='0'
            overflow='hidden'
          >
            <Flex align='center' justify='space-between' gap='2'>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight='bold'
                color='textSecondary'
                textTransform='uppercase'
                letterSpacing='wide'
                lineHeight='1.2'
              >
                {stat.label}
              </Text>

              <Flex
                align='center'
                justify='center'
                w={{ base: '9', md: '10' }}
                h={{ base: '9', md: '10' }}
                borderRadius='full'
                bg='iconSurface'
                color='primary'
                flexShrink={0}
              >
                {stat.icon}
              </Flex>
            </Flex>

            <Box mt='4' minW='0'>
              <Text fontSize={{ base: '3xl', md: '5xl' }} lineHeight='1' fontWeight='black' color='text'>
                {stat.value}
              </Text>

              <Text
                mt='2'
                fontSize={{ base: 'xs', md: 'sm' }}
                color='textSecondary'
                lineClamp={{ base: 1, md: 2 }}
                wordBreak='break-word'
              >
                {stat.description}
              </Text>
            </Box>
          </Flex>
        ))}
      </Grid>

      <Stack gap='4' w='full' minW='0'>
        <Flex justify='space-between' align='center' gap='3'>
          <Box minW='0'>
            <Heading size={{ base: 'sm', md: 'lg' }} color='text'>
              Recent Communications
            </Heading>

            <Text mt='1' fontSize={{ base: 'xs', md: 'sm' }} color='textSecondary' wordBreak='break-word'>
              Latest sent or scheduled messages.
            </Text>
          </Box>
        </Flex>

        {isLoading ? (
          <Flex py='16' justify='center' align='center' direction='column' gap='4'>
            <Spinner color='primary' size='lg' />

            <Text color='textSecondary' fontSize='sm'>
              Loading communications...
            </Text>
          </Flex>
        ) : isError ? (
          <Flex py='14' justify='center' align='center' direction='column' gap='4' bg='red.50' borderRadius='2xl'>
            <Text color='red.600' fontWeight='bold'>
              Error loading communications
            </Text>

            <Button size='sm' onClick={() => window.location.reload()}>
              Try again
            </Button>
          </Flex>
        ) : communications.length === 0 ? (
          <Flex py='14' justify='center' align='center' direction='column' gap='3' bg='surfaceMuted' borderRadius='2xl'>
            <Text color='text' fontWeight='bold'>
              No communications yet
            </Text>

            <Text fontSize='sm' color='textSecondary' textAlign='center'>
              Click "Send New" to create your first communication.
            </Text>
          </Flex>
        ) : (
          <>
            <Box
              display={{ base: 'none', md: 'block' }}
              w='full'
              maxW='full'
              overflowX={{ md: 'auto', xl: 'visible' }}
              pb='2'
            >
              <Box minW={{ md: '980px', xl: '0' }} w='full'>
                <Grid
                  templateColumns='minmax(260px, 2.2fr) minmax(120px, 0.8fr) minmax(120px, 0.8fr) minmax(120px, 0.8fr) 96px'
                  gap='5'
                  px='6'
                  py='3'
                  alignItems='center'
                >
                  <Text fontSize='xs' fontWeight='bold' color='textSecondary' textTransform='uppercase'>
                    Subject
                  </Text>

                  <Text fontSize='xs' fontWeight='bold' color='textSecondary' textTransform='uppercase'>
                    Channel
                  </Text>

                  <Text fontSize='xs' fontWeight='bold' color='textSecondary' textTransform='uppercase'>
                    Source
                  </Text>

                  <Text fontSize='xs' fontWeight='bold' color='textSecondary' textTransform='uppercase'>
                    Status
                  </Text>

                  <Text
                    fontSize='xs'
                    fontWeight='bold'
                    color='textSecondary'
                    textTransform='uppercase'
                    textAlign='right'
                  >
                    Actions
                  </Text>
                </Grid>

                <Stack gap='3' w='full' minW='0'>
                  {communications.map((comm) => (
                    <Grid
                      key={comm.id}
                      templateColumns='minmax(260px, 2.2fr) minmax(120px, 0.8fr) minmax(120px, 0.8fr) minmax(120px, 0.8fr) 96px'
                      gap='5'
                      alignItems='center'
                      bg='surface'
                      px='6'
                      py='5'
                      minH='78px'
                      borderRadius='2xl'
                      boxShadow='sm'
                      borderWidth='1px'
                      borderStyle='solid'
                      borderColor='border'
                      outline='1px solid transparent'
                      fontSize='sm'
                      cursor='pointer'
                      role='button'
                      tabIndex={0}
                      transition='border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease'
                      _hover={{
                        borderColor: 'primary',
                        boxShadow: 'md',
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
                      <Box minW='0'>
                        <Text truncate fontWeight='bold' color='text' fontSize='md'>
                          {comm.subject || 'No subject'}
                        </Text>

                        <Text mt='1' color='textSecondary' fontSize='xs'>
                          {formatDateTime(comm.createdAt)}
                        </Text>
                      </Box>

                      <HStack gap='2' color='textSecondary' minW='0'>
                        <TypeIcon type='Email' />
                        <Text truncate>Email</Text>
                      </HStack>

                      <Text truncate color='textSecondary' textTransform='capitalize'>
                        {comm.sourceType}
                      </Text>

                      <Box minW='0'>
                        <StatusBadge status={comm.status} />
                      </Box>

                      <HStack justify='flex-end' gap='2'>
                        {canEditCommunication(comm.status) && (
                          <IconButton
                            aria-label='Edit communication'
                            variant='ghost'
                            colorScheme='blue'
                            size='sm'
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(getUpdateCommunicationPath(comm.id));
                            }}
                          >
                            <PencilSimpleIcon size={18} />
                          </IconButton>
                        )}
                      </HStack>
                    </Grid>
                  ))}
                </Stack>
              </Box>
            </Box>

            <Stack gap='3' display={{ base: 'flex', md: 'none' }} w='full' minW='0'>
              {communications.map((comm) => (
                <Box
                  key={comm.id}
                  bg='surface'
                  p='4'
                  borderRadius='2xl'
                  boxShadow='sm'
                  borderWidth='1px'
                  borderStyle='solid'
                  borderColor='border'
                  outline='1px solid transparent'
                  cursor='pointer'
                  role='button'
                  tabIndex={0}
                  transition='border-color 0.2s ease, box-shadow 0.2s ease'
                  _hover={{
                    borderColor: 'primary',
                    boxShadow: 'md',
                  }}
                  onClick={() => navigate(getCommunicationDetailPath(comm.id))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(getCommunicationDetailPath(comm.id));
                    }
                  }}
                >
                  <Flex justify='space-between' align='flex-start' gap='3' mb='3'>
                    <Box minW='0' flex='1'>
                      <Text fontWeight='bold' color='text' lineClamp={2} fontSize='sm' lineHeight='1.35'>
                        {comm.subject || 'No subject'}
                      </Text>

                      <HStack mt='2' gap='2' color='textSecondary' fontSize='xs' flexWrap='wrap' lineHeight='1'>
                        <HStack gap='1'>
                          <TypeIcon type='Email' />
                          <Text>Email</Text>
                        </HStack>

                        <Text>•</Text>

                        <Text textTransform='capitalize'>{comm.sourceType}</Text>
                      </HStack>
                    </Box>

                    <Box flexShrink={0}>
                      <StatusBadge status={comm.status} />
                    </Box>
                  </Flex>

                  <Flex
                    justify='space-between'
                    align='center'
                    borderTopWidth='1px'
                    borderColor='border'
                    pt='3'
                    gap='3'
                  >
                    <Text color='textSecondary' fontSize='xs' minW='0'>
                      {formatDateTime(comm.createdAt)}
                    </Text>

                    {canEditCommunication(comm.status) && (
                      <IconButton
                        aria-label='Edit communication'
                        variant='ghost'
                        colorScheme='blue'
                        size='sm'
                        flexShrink={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(getUpdateCommunicationPath(comm.id));
                        }}
                      >
                        <PencilSimpleIcon size={17} />
                      </IconButton>
                    )}
                  </Flex>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  );
};
