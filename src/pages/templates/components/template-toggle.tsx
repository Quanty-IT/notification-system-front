import { Box, Text } from '@chakra-ui/react';
import { useState } from 'react';

interface TemplateToggleProps {
  isActive: boolean;
  onChange: (value: boolean) => void;
  isLoading?: boolean;
}

export const TemplateToggle = ({ isActive, onChange, isLoading }: TemplateToggleProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      display='flex'
      alignItems='center'
      gap='6px'
      cursor={isLoading ? 'not-allowed' : 'pointer'}
      onClick={() => !isLoading && onChange(!isActive)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      userSelect='none'
      opacity={isLoading ? 0.6 : 1}
      w='fit-content'
    >
      <Text
        fontSize='xs'
        fontWeight='700'
        color={isActive ? 'green.600' : 'red.500'}
        minW='42px'
        style={{ transition: 'color 0.3s' }}
      >
        {isActive ? 'Ativo' : 'Inativo'}
      </Text>

      <Box
        position='relative'
        width='44px'
        height='24px'
        borderRadius='full'
        border='2px solid'
        borderColor={isActive ? 'green.600' : 'red.500'}
        boxShadow={hovered ? (isActive ? '0 0 0 3px rgba(34,139,34,0.2)' : '0 0 0 3px rgba(220,38,38,0.2)') : 'none'}
        style={{
          background: isActive ? '#38a169' : '#fc8181',
          transition: 'background 0.3s ease, box-shadow 0.2s ease',
        }}
      >
        <Box
          position='absolute'
          top='2px'
          width='16px'
          height='16px'
          borderRadius='full'
          bg='white'
          boxShadow='0 1px 3px rgba(0,0,0,0.3)'
          style={{
            left: isActive ? '22px' : '2px',
            transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </Box>
    </Box>
  );
};
