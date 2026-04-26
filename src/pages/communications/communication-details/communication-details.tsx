import { Badge, Box, Button, Flex, Grid, Heading, HStack, Link, Spinner, Stack, Text } from '@chakra-ui/react';
import { ArrowLeftIcon, CalendarDotsIcon, ClockIcon, FileArrowDownIcon } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../../routes/routes.constants';
import { type CommunicationStatus, type FindCommunicationByIdResponse, findCommunicationById } from '../../../services';

const statusLabelMap: Record<CommunicationStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  processing: 'Processando',
  sent: 'Enviada',
  failed: 'Falhou',
  canceled: 'Cancelada',
};

const statusColorMap: Record<CommunicationStatus, string> = {
  draft: 'gray',
  scheduled: 'blue',
  processing: 'purple',
  sent: 'green',
  failed: 'red',
  canceled: 'orange',
};

const formatDateTime = (value: string | null) => {
  if (!value) return 'Nao informado';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
};

const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

const htmlToPlainText = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent ?? '';
};

export function CommunicationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [communication, setCommunication] = useState<FindCommunicationByIdResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID da comunicacao nao encontrado.');
      setLoading(false);
      return;
    }

    const fetchCommunication = async () => {
      try {
        setLoading(true);
        const data = await findCommunicationById(id);
        setCommunication(data);
      } catch {
        setError('Nao foi possivel carregar os detalhes da comunicacao.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunication();
  }, [id]);

  const templateVariables = useMemo(() => {
    if (!communication?.templateVariablesJson) return [];
    return Object.entries(communication.templateVariablesJson);
  }, [communication?.templateVariablesJson]);

  if (loading) {
    return (
      <Flex minH='70vh' align='center' justify='center' direction='column' gap='3' color='textSecondary'>
        <Spinner color='primary' />
        <Text>Carregando detalhes...</Text>
      </Flex>
    );
  }

  if (error || !communication) {
    return (
      <Box py='12' px={{ base: '4', md: '8', lg: '12' }} maxW='6xl' mx='auto'>
        <Stack gap='4'>
          <Heading size='lg' color='text'>
            Detalhes da Comunicacao
          </Heading>
          <Text color='error'>{error ?? 'Comunicacao nao encontrada.'}</Text>
          <Button w='fit-content' onClick={() => navigate(ROUTES.DASHBOARD.BASE)}>
            Voltar para Dashboard
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box py={{ base: '8', md: '10' }} px={{ base: '4', md: '8', lg: '12' }} maxW='7xl' mx='auto'>
      <Stack gap='8'>
        <Flex justify='space-between' align={{ base: 'flex-start', md: 'center' }} gap='4' wrap='wrap'>
          <Stack gap='3'>
            <Button
              variant='ghost'
              w='fit-content'
              px='0'
              color='textSecondary'
              onClick={() => navigate(ROUTES.DASHBOARD.BASE)}
            >
              <HStack gap='2'>
                <ArrowLeftIcon size={16} />
                <Text>Voltar</Text>
              </HStack>
            </Button>

            <Heading size='xl' color='text'>
              {communication.subject ?? 'Comunicacao sem assunto'}
            </Heading>

            <HStack gap='3' wrap='wrap'>
              <Badge colorPalette={statusColorMap[communication.status]}>{statusLabelMap[communication.status]}</Badge>
              <Badge colorPalette='green'>{communication.channel.toUpperCase()}</Badge>
              <Badge colorPalette='yellow'>Origem: {communication.sourceType}</Badge>
            </HStack>
          </Stack>

          <Stack gap='1' color='textSecondary' fontSize='sm'>
            <HStack>
              <CalendarDotsIcon size={16} />
              <Text>Criada em {formatDateTime(communication.createdAt)}</Text>
            </HStack>
            <HStack>
              <ClockIcon size={16} />
              <Text>Atualizada em {formatDateTime(communication.updatedAt)}</Text>
            </HStack>
          </Stack>
        </Flex>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap='6'>
          <Stack gap='6'>
            <Box bg='surface' borderWidth='1px' borderColor='gray.100' borderRadius='2xl' p='6'>
              <Heading size='sm' color='text' mb='4'>
                Conteudo
              </Heading>

              <Stack gap='4'>
                <Box>
                  <Text fontSize='xs' color='textSecondary' textTransform='uppercase' letterSpacing='wider'>
                    Corpo
                  </Text>
                  {communication.body ? (
                    communication.bodyType === 'html' ? (
                      <Box mt='2' p='3' borderWidth='1px' borderColor='gray.100' borderRadius='md' bg='gray.50'>
                        <Text color='text' whiteSpace='pre-wrap'>
                          {htmlToPlainText(communication.body)}
                        </Text>
                      </Box>
                    ) : (
                      <Text mt='2' color='text'>
                        {communication.body}
                      </Text>
                    )
                  ) : (
                    <Text mt='2' color='textSecondary'>
                      Nao informado
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text fontSize='xs' color='textSecondary' textTransform='uppercase' letterSpacing='wider'>
                    Tipo do corpo
                  </Text>
                  <Text mt='2' color='text'>
                    {communication.bodyType ?? 'Nao informado'}
                  </Text>
                </Box>
              </Stack>
            </Box>

            <Box bg='surface' borderWidth='1px' borderColor='gray.100' borderRadius='2xl' p='6'>
              <Heading size='sm' color='text' mb='4'>
                Variaveis do Template
              </Heading>

              {templateVariables.length > 0 ? (
                <Stack gap='3'>
                  {templateVariables.map(([key, value]) => (
                    <Flex
                      key={key}
                      justify='space-between'
                      gap='4'
                      borderBottomWidth='1px'
                      borderColor='gray.100'
                      py='2'
                    >
                      <Text color='textSecondary'>{key}</Text>
                      <Text color='text' fontWeight='medium'>
                        {String(value)}
                      </Text>
                    </Flex>
                  ))}
                </Stack>
              ) : (
                <Text color='textSecondary'>Essa comunicacao nao possui variaveis de template.</Text>
              )}
            </Box>

            <Box bg='surface' borderWidth='1px' borderColor='gray.100' borderRadius='2xl' p='6'>
              <Heading size='sm' color='text' mb='4'>
                Anexos
              </Heading>

              {communication.attachments.length === 0 ? (
                <Text color='textSecondary'>Nenhum anexo encontrado.</Text>
              ) : (
                <Stack gap='3'>
                  {communication.attachments.map((attachment) => (
                    <Flex
                      key={attachment.id}
                      justify='space-between'
                      align={{ base: 'flex-start', md: 'center' }}
                      direction={{ base: 'column', md: 'row' }}
                      gap='3'
                      borderWidth='1px'
                      borderColor='gray.100'
                      borderRadius='lg'
                      p='3'
                    >
                      <Stack gap='0.5'>
                        <Text fontWeight='semibold' color='text'>
                          {attachment.originalFileName}
                        </Text>
                        <Text fontSize='sm' color='textSecondary'>
                          {attachment.mimeType} • {formatBytes(attachment.fileSizeBytes)}
                        </Text>
                        <Text fontSize='sm' color='textSecondary'>
                          Adicionado em {formatDateTime(attachment.createdAt)}
                        </Text>
                      </Stack>

                      <Link href={attachment.fileUrl} target='_blank' rel='noopener noreferrer'>
                        <Button size='sm' variant='outline'>
                          <HStack>
                            <FileArrowDownIcon size={16} />
                            <Text>Baixar</Text>
                          </HStack>
                        </Button>
                      </Link>
                    </Flex>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>

          <Stack gap='4'>
            <Box bg='surface' borderWidth='1px' borderColor='gray.100' borderRadius='2xl' p='6'>
              <Heading size='sm' color='text' mb='4'>
                Metadados
              </Heading>

              <Stack gap='3' fontSize='sm'>
                <Text color='textSecondary'>ID</Text>
                <Text color='text' wordBreak='break-all'>
                  {communication.id}
                </Text>

                <Text color='textSecondary'>Criada por</Text>
                <Text color='text' wordBreak='break-all'>
                  {communication.createdByUserId ?? 'Nao informado'}
                </Text>

                <Text color='textSecondary'>Template Version ID</Text>
                <Text color='text' wordBreak='break-all'>
                  {communication.templateVersionId ?? 'Nao informado'}
                </Text>
              </Stack>
            </Box>

            <Box bg='surface' borderWidth='1px' borderColor='gray.100' borderRadius='2xl' p='6'>
              <Heading size='sm' color='text' mb='4'>
                Linha do Tempo
              </Heading>

              <Stack gap='2' fontSize='sm'>
                <Text color='textSecondary'>Agendada</Text>
                <Text color='text'>{formatDateTime(communication.scheduledAt)}</Text>

                <Text color='textSecondary'>Em processamento</Text>
                <Text color='text'>{formatDateTime(communication.processingAt)}</Text>

                <Text color='textSecondary'>Enviada em</Text>
                <Text color='text'>{formatDateTime(communication.sentAt)}</Text>
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Stack>
    </Box>
  );
}
