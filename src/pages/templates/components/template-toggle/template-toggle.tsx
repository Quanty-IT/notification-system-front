import { Box, Text } from '@chakra-ui/react';
import { TemplateToggleProps } from './types';

export const TemplateToggle = ({ isActive, onChange, isLoading }: TemplateToggleProps) => {
  return (
    <Box
      display='flex'
      alignItems='center'
      gap='6px'
      cursor={isLoading ? 'not-allowed' : 'pointer'}
      onClick={() => !isLoading && onChange(!isActive)}
      userSelect='none'
      opacity={isLoading ? 0.6 : 1}
      w='fit-content'
    >
      <Text
        fontSize='xs'
        fontWeight='700'
        color={isActive ? 'var(--chakra-colors-active)' : 'var(--chakra-colors-inactive)'}
        w='52px'
        textAlign='left'
        style={{ transition: 'color 0.3s' }}
      >
        {isActive ? 'Active' : 'Inactive'}
      </Text>

      <Box
        position='relative'
        width='44px'
        height='24px'
        borderRadius='full'
        border='none'
        outline='none'
        boxShadow='none'
        style={{
          background: isActive ? 'var(--chakra-colors-active)' : 'var(--chakra-colors-inactive)',
          transition: 'background 0.3s ease',
        }}
      >
        <Box
          position='absolute'
          top='4px'
          width='16px'
          height='16px'
          borderRadius='full'
          bg='white'
          border='none'
          outline='none'
          boxShadow='none'
          style={{
            left: isActive ? '24px' : '4px',
            transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </Box>
    </Box>
  );
};
