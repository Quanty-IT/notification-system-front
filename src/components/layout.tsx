import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';

export const AppLayout = () => {
  return (
    <Flex minH='100vh' bg='background'>
      <Sidebar />
      <Box as='main' flex='1' minH='100vh' overflowX='hidden' ml='88px'>
        <Outlet />
      </Box>
    </Flex>
  );
};
