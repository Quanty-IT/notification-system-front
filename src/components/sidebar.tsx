import { Box, Button, Flex, Icon, Image, Text, VStack } from '@chakra-ui/react';
import { HouseIcon, PlusSquareIcon, SignOutIcon, SquaresFourIcon } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/auth-context/auth-context';
import { ROUTES } from '../routes/routes.constants';

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD.BASE, label: 'Dashboard', icon: HouseIcon },
  { to: '/send-new', label: 'Send New', icon: PlusSquareIcon },
  { to: ROUTES.TEMPLATES.BASE, label: 'Templates', icon: SquaresFourIcon },
];

const SIDEBAR_COLLAPSED_WIDTH = '88px';
const SIDEBAR_EXPANDED_WIDTH = '220px';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      position='fixed'
      top='0'
      left='0'
      h='100vh'
      w={isExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH}
      bg='primary'
      boxShadow='2xl'
      zIndex='1000'
      overflow='hidden'
      transition='width 0.25s ease'
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <Flex h='88px' align='center' gap='3' px='4' borderBottom='1px solid' borderColor='whiteAlpha.200'>
        <Image src={logo} alt='John Deere' boxSize='40px' minW='40px' objectFit='contain' />

        <Text
          color='tertiary'
          fontSize='xl'
          fontWeight='extrabold'
          whiteSpace='nowrap'
          overflow='hidden'
          opacity={isExpanded ? 1 : 0}
          maxW={isExpanded ? '140px' : '0'}
          transition='all 0.2s ease'
        >
          JD Notify
        </Text>
      </Flex>

      <VStack align='stretch' gap='2' px='2' py='6'>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <Flex
                align='center'
                gap='4'
                h='56px'
                px='5'
                borderRadius='2xl'
                color={isActive ? 'white' : 'whiteAlpha.800'}
                bg={isActive ? 'secondary' : 'transparent'}
                boxShadow={isActive ? 'inset 0 4px 6px rgba(0,0,0,0.25)' : 'none'}
                transition='all 0.2s ease'
                _hover={{
                  bg: isActive ? 'secondary' : 'whiteAlpha.200',
                  color: 'white',
                }}
              >
                <Icon as={icon} boxSize='5' minW='20px' />

                <Text
                  whiteSpace='nowrap'
                  overflow='hidden'
                  textOverflow='ellipsis'
                  fontSize='sm'
                  fontWeight='bold'
                  opacity={isExpanded ? 1 : 0}
                  maxW={isExpanded ? '120px' : '0'}
                  transition='all 0.2s ease'
                >
                  {label}
                </Text>
              </Flex>
            )}
          </NavLink>
        ))}
      </VStack>

      <Box position='absolute' bottom='0' left='0' right='0' px='2' pb='8'>
        <Button
          onClick={handleLogout}
          variant='ghost'
          w='full'
          h='56px'
          justifyContent='flex-start'
          px='5'
          borderRadius='2xl'
          color='whiteAlpha.800'
          _hover={{
            bg: 'whiteAlpha.200',
            color: 'white',
          }}
        >
          <Flex align='center' gap='4'>
            <Icon as={SignOutIcon} boxSize='5' minW='20px' />

            <Text
              whiteSpace='nowrap'
              overflow='hidden'
              opacity={isExpanded ? 1 : 0}
              maxW={isExpanded ? '120px' : '0'}
              transition='all 0.2s ease'
            >
              Logout
            </Text>
          </Flex>
        </Button>
      </Box>
    </Box>
  );
};
