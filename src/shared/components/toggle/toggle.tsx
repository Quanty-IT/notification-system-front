import { Box } from '@chakra-ui/react';
import type { ToggleProps } from './types';

export const Toggle = ({ isActive, onChange, isLoading = false }: ToggleProps) => {
  return (
    <Box
      display='flex'
      alignItems='center'
      cursor={isLoading ? 'not-allowed' : 'pointer'}
      onClick={() => !isLoading && onChange(!isActive)}
      userSelect='none'
      opacity={isLoading ? 0.6 : 1}
      w='fit-content'
    >
      <Box
        position='relative'
        width='44px'
        height='24px'
        borderRadius='full'
        border='none'
        outline='none'
        boxShadow='none'
        bg={isActive ? 'var(--chakra-colors-active)' : 'var(--chakra-colors-inactive)'}
        transition='background 0.3s ease'
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
          left={isActive ? '24px' : '4px'}
          transition='left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        />
      </Box>
    </Box>
  );
};
