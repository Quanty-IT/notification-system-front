import { Box, Flex, Skeleton } from '@chakra-ui/react';

export const TemplateCardSkeleton = () => {
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
    >
      <Skeleton height='18px' width='45%' borderRadius='md' />

      <Box display='flex' flexDirection='column' gap={2} mt={1}>
        <Skeleton height='14px' width='100%' borderRadius='md' />
        <Skeleton height='14px' width='92%' borderRadius='md' />
        <Skeleton height='14px' width='70%' borderRadius='md' />
      </Box>

      <Flex mt='auto' justify='space-between' align='center'>
        <Skeleton height='24px' width='44px' borderRadius='full' />

        <Flex gap={3}>
          <Skeleton height='20px' width='20px' borderRadius='md' />
          <Skeleton height='20px' width='20px' borderRadius='md' />
        </Flex>
      </Flex>
    </Box>
  );
};
