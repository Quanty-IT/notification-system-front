import { Box, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { Template } from '../types';
import { TemplateToggle } from './template-toggle';

interface TemplateCardProps {
  template: Template;
  onToggle: (id: string, isActive: boolean) => void;
  isToggling?: boolean;
}

export const TemplateCard = ({ template, onToggle, isToggling }: TemplateCardProps) => {
  const navigate = useNavigate();

  return (
    <Box
      border='2px solid'
      borderColor='green.200'
      borderRadius='2xl'
      p={5}
      bg={template.isActive ? 'green.50' : 'white'}
      display='flex'
      flexDirection='column'
      gap={3}
      minH='170px'
      transition='all 0.2s ease'
      _hover={{
        boxShadow: 'md',
        borderColor: 'green.400',
        transform: 'translateY(-2px)',
      }}
    >
      <Heading
        as='h3'
        size='md'
        color='green.800'
        cursor='pointer'
        lineHeight='1.3'
        _hover={{ textDecoration: 'underline', color: 'green.600' }}
        onClick={() => navigate(`/templates/${template.id}`)}
      >
        {template.title}
      </Heading>

      <Text fontSize='sm' color='gray.600' flex={1} lineHeight='1.7'>
        {template.description}
      </Text>

      <Box mt={1}>
        <TemplateToggle
          isActive={template.isActive}
          onChange={(val) => onToggle(template.id, val)}
          isLoading={isToggling}
        />
      </Box>
    </Box>
  );
};
