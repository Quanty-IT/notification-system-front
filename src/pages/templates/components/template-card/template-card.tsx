import { Box, Heading, IconButton, Text } from '@chakra-ui/react';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { TemplateToggle } from '../template-toggle';
import type { TemplateCardProps } from './types';

export const TemplateCard = ({ template, onToggle, onEdit, onDelete, isToggling, isDeleting }: TemplateCardProps) => {
  const navigate = useNavigate();

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
      h='200px'
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
        cursor='pointer'
        lineHeight='1.3'
        overflow='hidden'
        textOverflow='ellipsis'
        whiteSpace='nowrap'
        flexShrink={0}
        _hover={{
          textDecoration: 'underline',
          color: 'green.700',
        }}
        onClick={() => navigate(`/templates/${template.id}`)}
      >
        {template.name}
      </Heading>

      <Box h='72px' overflow='hidden' flexShrink={0} minW={0}>
        <Text
          fontSize='sm'
          color='gray.600'
          lineHeight='1.6'
          textAlign='justify'
          overflow='hidden'
          display='-webkit-box'
          css={{
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {template.description}
        </Text>
      </Box>

      <Box mt='auto' display='flex' alignItems='center' justifyContent='space-between' flexShrink={0}>
        <TemplateToggle
          isActive={template.isActive}
          onChange={(val) => onToggle(template.id, val)}
          isLoading={isToggling}
        />

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
