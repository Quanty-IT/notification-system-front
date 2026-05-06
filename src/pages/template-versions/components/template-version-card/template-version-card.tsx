import { Box, Heading, IconButton, Text } from '@chakra-ui/react';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { TemplateToggle } from '../../../templates/components/template-toggle';
import type { TemplateVersionCardProps } from './types';

export const TemplateVersionCard = ({
  version,
  onToggle,
  onEdit,
  onDelete,
  isToggling,
  isDeleting,
}: TemplateVersionCardProps) => {
  const variableNames = Object.keys(version.variablesSchemaJson ?? {});

  return (
    <Box
      w='100%'
      minW={0}
      border='2px solid'
      borderColor='gray.200'
      borderRadius='2xl'
      p={5}
      bg='gray.50'
      display='flex'
      flexDirection='column'
      gap={3}
      h='220px'
      overflow='hidden'
      transition='all 0.2s ease'
      _hover={{
        boxShadow: 'md',
        borderColor: 'gray.300',
        transform: 'translateY(-2px)',
      }}
    >
      <Heading
        as='h3'
        size='md'
        color='gray.800'
        lineHeight='1.3'
        overflow='hidden'
        textOverflow='ellipsis'
        whiteSpace='nowrap'
        flexShrink={0}
      >
        Version {version.version}
      </Heading>

      <Box overflow='hidden' flexShrink={0} minW={0}>
        <Text
          fontSize='sm'
          fontWeight='bold'
          color='green.700'
          overflow='hidden'
          textOverflow='ellipsis'
          whiteSpace='nowrap'
        >
          {version.subject}
        </Text>
      </Box>

      <Box display='flex' flexDirection='column' gap={1} minW={0} overflow='hidden'>
        <Text fontSize='sm' color='gray.600'>
          Type: {version.bodyType.toUpperCase()}
        </Text>

        <Text
          fontSize='sm'
          color='gray.600'
          lineHeight='1.6'
          overflow='hidden'
          display='-webkit-box'
          css={{
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          Variables: {variableNames.length > 0 ? variableNames.join(', ') : 'None'}
        </Text>
      </Box>

      <Box mt='auto' display='flex' alignItems='center' justifyContent='space-between' flexShrink={0}>
        <Box
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <TemplateToggle
            isActive={version.isActive}
            onChange={(value) => onToggle(version.id, value)}
            isLoading={isToggling}
          />
        </Box>

        <Box display='flex' alignItems='center' gap={1}>
          <IconButton
            aria-label='Edit template version'
            size='sm'
            variant='ghost'
            color='gray.500'
            _hover={{
              color: 'green.700',
              bg: 'green.50',
            }}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(version.id);
            }}
          >
            <PencilSimpleIcon size={18} weight='bold' />
          </IconButton>

          <IconButton
            aria-label='Delete template version'
            size='sm'
            variant='ghost'
            color='gray.500'
            loading={isDeleting}
            _hover={{
              color: 'red.600',
              bg: 'red.50',
            }}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(version.id);
            }}
          >
            <TrashIcon size={18} weight='bold' />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
