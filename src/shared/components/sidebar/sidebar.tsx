import { Box, Button, Flex, Icon, Image, Text, VStack } from '@chakra-ui/react';
import { HouseIcon, PlusSquareIcon, SignOutIcon, SquaresFourIcon } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { ROUTES } from '@/routes';
import logo from '../../../assets/logo.png';

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD.BASE, label: 'Dashboard', icon: HouseIcon },
  { to: ROUTES.COMMUNICATIONS.CREATE, label: 'Send New', icon: PlusSquareIcon },
  { to: ROUTES.TEMPLATES.BASE, label: 'Templates', icon: SquaresFourIcon },
];

const SIDEBAR_COLLAPSED_WIDTH = '88px';
const SIDEBAR_EXPANDED_WIDTH = '220px';
const ICON_COLUMN_WIDTH = '72px';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.SIGN_IN);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', md: 'block' }}
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
        <Flex h='88px' align='center' px='2' borderBottom='1px solid' borderColor='whiteAlpha.200'>
          <Flex w={ICON_COLUMN_WIDTH} h='88px' align='center' justify='center' flexShrink={0}>
            <Image src={logo} alt='John Deere' boxSize='40px' objectFit='contain' />
          </Flex>

          <Text
            color='tertiary'
            fontSize='xl'
            fontWeight='extrabold'
            whiteSpace='nowrap'
            overflow='hidden'
            opacity={isExpanded ? 1 : 0}
            maxW={isExpanded ? '140px' : '0'}
            transition='opacity 0.2s ease, max-width 0.25s ease'
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
                  h='56px'
                  borderRadius='2xl'
                  color={isActive ? 'white' : 'whiteAlpha.800'}
                  bg={isActive ? 'secondary' : 'transparent'}
                  boxShadow={isActive ? 'inset 0 4px 6px rgba(0,0,0,0.25)' : 'none'}
                  transition='background 0.2s ease, color 0.2s ease'
                  _hover={{
                    bg: isActive ? 'secondary' : 'whiteAlpha.200',
                    color: 'white',
                  }}
                >
                  <Flex w={ICON_COLUMN_WIDTH} h='56px' align='center' justify='center' flexShrink={0}>
                    <Icon as={icon} boxSize='5' />
                  </Flex>

                  <Text
                    whiteSpace='nowrap'
                    overflow='hidden'
                    textOverflow='ellipsis'
                    fontSize='sm'
                    fontWeight='bold'
                    opacity={isExpanded ? 1 : 0}
                    maxW={isExpanded ? '120px' : '0'}
                    transition='opacity 0.2s ease, max-width 0.25s ease'
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
            p='0'
            borderRadius='2xl'
            color='whiteAlpha.800'
            _hover={{
              bg: 'whiteAlpha.200',
              color: 'white',
            }}
          >
            <Flex align='center' w='full' h='full'>
              <Flex w={ICON_COLUMN_WIDTH} h='56px' align='center' justify='center' flexShrink={0}>
                <Icon as={SignOutIcon} boxSize='5' />
              </Flex>

              <Text
                whiteSpace='nowrap'
                overflow='hidden'
                opacity={isExpanded ? 1 : 0}
                maxW={isExpanded ? '120px' : '0'}
                transition='opacity 0.2s ease, max-width 0.25s ease'
              >
                Logout
              </Text>
            </Flex>
          </Button>
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      <Flex
        display={{ base: 'flex', md: 'none' }}
        position='fixed'
        bottom='0'
        left='0'
        w='full'
        h='70px'
        bg='primary'
        zIndex='1000'
        boxShadow='0px -4px 10px rgba(0, 0, 0, 0.1)'
        align='center'
        justify='space-around'
        px='2'
      >
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} style={{ flex: 1 }}>
            {({ isActive }) => (
              <Flex
                direction='column'
                align='center'
                justify='center'
                h='60px'
                borderRadius='xl'
                color={isActive ? 'white' : 'whiteAlpha.700'}
                bg={isActive ? 'whiteAlpha.200' : 'transparent'}
                transition='all 0.2s ease'
                _hover={{ color: 'white' }}
                mx='1'
              >
                <Icon as={icon} boxSize='6' mb='1' />
                <Text
                  fontSize='10px'
                  fontWeight='bold'
                  textOverflow='ellipsis'
                  overflow='hidden'
                  whiteSpace='nowrap'
                  maxW='100%'
                >
                  {label}
                </Text>
              </Flex>
            )}
          </NavLink>
        ))}
        <Flex
          direction='column'
          align='center'
          justify='center'
          h='60px'
          borderRadius='xl'
          color='whiteAlpha.700'
          transition='all 0.2s ease'
          _hover={{ color: 'white', bg: 'whiteAlpha.200' }}
          mx='1'
          flex={1}
          onClick={handleLogout}
          cursor='pointer'
        >
          <Icon as={SignOutIcon} boxSize='6' mb='1' />
          <Text
            fontSize='10px'
            fontWeight='bold'
            textOverflow='ellipsis'
            overflow='hidden'
            whiteSpace='nowrap'
            maxW='100%'
          >
            Logout
          </Text>
        </Flex>
      </Flex>
    </>
  );
};
