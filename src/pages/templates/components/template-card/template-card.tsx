import { Box, Heading, IconButton, Text } from '@chakra-ui/react';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { Toggle } from '@/shared';
import type { TemplateCardProps } from './types';

export const TemplateCard = ({
  template,
  onClick,
  onToggle,
  onEdit,
  onDelete,
  isToggling,
  isDeleting,
}: TemplateCardProps) => {
  return (
    <Box
      w='100%'
      minW={0}
      bg='surface'
      p='6'
      borderRadius='2xl'
      borderWidth='1px'
      borderColor='gray.100'
      boxShadow='sm'
      display='flex'
      flexDirection='column'
      gap={3}
      h='220px'
      overflow='hidden'
      cursor='pointer'
      role='button'
      tabIndex={0}
      transition='all 0.2s ease'
      _hover={{
        boxShadow: 'md',
      }}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
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
        {template.name}
      </Heading>

      <Box display='flex' flexDirection='column' gap={1} minW={0} overflow='hidden'>
        <Text
          fontSize='sm'
          color='gray.600'
          lineHeight='1.6'
          overflow='hidden'
          display='-webkit-box'
          css={{
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {template.description || 'No description'}
        </Text>
      </Box>

      <Box mt='auto' display='flex' alignItems='center' justifyContent='space-between' flexShrink={0}>
        <Box
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <Toggle
            isActive={template.isActive}
            onChange={(value) => onToggle(template.id, value)}
            isLoading={isToggling}
          />
        </Box>

        <Box display='flex' alignItems='center' gap={1}>
          <IconButton
            aria-label='Edit template'
            size='sm'
            variant='ghost'
            color='gray.500'
            _hover={{
              color: 'green.700',
              bg: 'green.50',
            }}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(template.id);
            }}
          >
            <PencilSimpleIcon size={18} weight='bold' />
          </IconButton>

          <IconButton
            aria-label='Delete template'
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
              onDelete(template.id);
            }}
          >
            <TrashIcon size={18} weight='bold' />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
