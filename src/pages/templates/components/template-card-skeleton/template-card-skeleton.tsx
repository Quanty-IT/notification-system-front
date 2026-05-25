import { Box, Skeleton, Stack } from '@chakra-ui/react';

export const TemplateCardSkeleton = () => (
  <Box
    w='100%'
    minW={0}
    border='2px solid'
    borderColor='gray.200'
    borderRadius='2xl'
    p={5}
    bg='gray.50'
    h='220px'
    overflow='hidden'
  >
    <Stack gap={4}>
      <Skeleton h='24px' w='70%' />
      <Skeleton h='18px' w='100%' />
      <Skeleton h='18px' w='85%' />
      <Skeleton h='18px' w='60%' />
      <Box mt='8' display='flex' justifyContent='space-between'>
        <Skeleton h='28px' w='64px' />
        <Skeleton h='32px' w='80px' />
      </Box>
    </Stack>
  </Box>
);
