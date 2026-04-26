import { Badge, Box, Button, Flex, Grid, Heading, HStack, Spinner, Stack, Text } from '@chakra-ui/react';
import {
  ChatCircleTextIcon,
  ClockCounterClockwiseIcon,
  EnvelopeIcon,
  MonitorIcon,
  PaperPlaneTiltIcon,
} from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { api } from '../../services/axios';

interface Communication {
  id: string;
  title: string;
  type: 'Whatsapp' | 'Teams' | 'Email';
  recipients: string;
  status: 'Sent' | 'Scheduled' | 'Failed';
  timeline: string;
}

const MOCK_DATA: Communication[] = [
  {
    id: '1',
    title: 'Manutenção Programada',
    type: 'Email',
    recipients: 'Todos os funcionários',
    status: 'Sent',
    timeline: '2024-05-20 10:00',
  },
  {
    id: '2',
    title: 'Atualização de Segurança',
    type: 'Teams',
    recipients: 'Equipe de TI',
    status: 'Sent',
    timeline: '2024-05-20 09:30',
  },
  {
    id: '3',
    title: 'Lembrete de Reunião',
    type: 'Whatsapp',
    recipients: 'Gerentes',
    status: 'Scheduled',
    timeline: '2024-05-21 14:00',
  },
  {
    id: '4',
    title: 'Falha no Envio de Relatório',
    type: 'Email',
    recipients: 'financeiro@jd.com',
    status: 'Failed',
    timeline: '2024-05-19 18:00',
  },
];

const TypeIcon = ({ type }: { type: Communication['type'] }) => {
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

const StatusBadge = ({ status }: { status: Communication['status'] }) => {
  const statusStyles = {
    Sent: {
      bg: 'green.100',
      color: 'green.800',
    },
    Scheduled: {
      bg: 'blue.100',
      color: 'blue.800',
    },
    Failed: {
      bg: 'red.100',
      color: 'red.800',
    },
  };

  return (
    <Badge
      px='3'
      py='1'
      borderRadius='full'
      fontSize='xs'
      fontWeight='bold'
      textTransform='none'
      bg={statusStyles[status].bg}
      color={statusStyles[status].color}
    >
      {status}
    </Badge>
  );
};

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/communications');

        const dadosSeguros = Array.isArray(response.data)
          ? response.data
          : response.data.communications || response.data.data || [];

        setData(dadosSeguros);
      } catch (error) {
        console.error('Falha ao carregar dados da API. Usando dados mocados como fallback.', error);
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: 'Today', value: '128' },
    { label: 'Scheduled', value: '24' },
    { label: 'Templates', value: '12' },
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

        <Box w='full' overflowX='auto' maxW='full' pb='4'>
          <Grid templateColumns='repeat(5, 1fr)' gap='4' minW='800px' px='6' py='3' mb='4'>
            <Text fontSize='xs' fontWeight='bold' color='textSecondary' textTransform='uppercase' letterSpacing='wider'>
              Title
            </Text>
            <Text fontSize='xs' fontWeight='bold' color='textSecondary' textTransform='uppercase' letterSpacing='wider'>
              Channel
            </Text>
            <Text fontSize='xs' fontWeight='bold' color='textSecondary' textTransform='uppercase' letterSpacing='wider'>
              Recipients
            </Text>
            <Text fontSize='xs' fontWeight='bold' color='textSecondary' textTransform='uppercase' letterSpacing='wider'>
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
              Date
            </Text>
          </Grid>

          {loading ? (
            <Flex
              minW='800px'
              px='6'
              py='10'
              justify='center'
              align='center'
              direction='column'
              gap='3'
              color='textSecondary'
            >
              <Spinner color='primary' />
              <Text>Loading records...</Text>
            </Flex>
          ) : (
            <Stack gap='4' minW='800px'>
              {Array.isArray(data) && data.length > 0 ? (
                data.map((comm) => (
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
                  >
                    <Text truncate fontWeight='medium' color='text'>
                      {comm.title}
                    </Text>

                    <HStack gap='2' color='textSecondary'>
                      <TypeIcon type={comm.type} />
                      <Text>{comm.type}</Text>
                    </HStack>

                    <Text truncate color='textSecondary'>
                      {comm.recipients}
                    </Text>

                    <Box>
                      <StatusBadge status={comm.status} />
                    </Box>

                    <Text textAlign='right' color='textSecondary'>
                      {comm.timeline}
                    </Text>
                  </Grid>
                ))
              ) : (
                <Flex
                  minW='800px'
                  px='6'
                  py='10'
                  justify='center'
                  align='center'
                  direction='column'
                  gap='3'
                  color='textSecondary'
                >
                  <Text>No records found</Text>
                </Flex>
              )}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
};
