import { Box, Heading, IconButton, Text } from '@chakra-ui/react';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { Toggle } from '@/shared';
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
      bg='surface'
      p='6'
      borderRadius='2xl'
      borderWidth='1px'
      borderColor='border'
      boxShadow='sm'
      display='flex'
      flexDirection='column'
      gap={3}
      h='220px'
      overflow='hidden'
      transition='all 0.2s ease'
      _hover={{
        boxShadow: 'md',
      }}
    >
      <Heading
        as='h3'
        size='md'
        color='text'
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
          color='primary'
          overflow='hidden'
          textOverflow='ellipsis'
          whiteSpace='nowrap'
        >
          {version.subject}
        </Text>
      </Box>

      <Box display='flex' flexDirection='column' gap={1} minW={0} overflow='hidden'>
        <Text
          fontSize='sm'
          color='textSecondary'
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
          <Toggle
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
            color='textSecondary'
            _hover={{
              color: 'primary',
              bg: 'surfaceMuted',
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
            color='textSecondary'
            loading={isDeleting}
            _hover={{
              color: 'dangerText',
              bg: 'dangerBg',
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
