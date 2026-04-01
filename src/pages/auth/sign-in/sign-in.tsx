import { Box, Image, Link, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import Logo from '../../../assets/logo.png';
import { ROUTES } from '../../../routes';
import { Button } from '../components/button';
import { Input } from '../components/input';

export const SignIn = () => {
  return (
    <Box minH='100vh' display='flex' alignItems='center' justifyContent='center' bg='background' px={4} py={8}>
      <VStack gap={6} w='100%' maxW='28rem'>
        <Box
          bg='surface'
          w='100%'
          borderRadius='2xl'
          boxShadow='0 10px 30px rgba(0, 0, 0, 0.08)'
          px={{ base: 6, md: 8 }}
          py={{ base: 8, md: 10 }}
        >
          <VStack gap={6} align='stretch'>
            <VStack gap={3}>
              <Image src={Logo} alt='John Deere logo' w='7rem' h='7rem' objectFit='contain' />

              <VStack gap={1}>
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight='extrabold' color='primary' textAlign='center'>
                  Welcome back
                </Text>

                <Text fontSize='sm' color='textSecondary' textAlign='center'>
                  Sign in to your account to continue
                </Text>
              </VStack>
            </VStack>

            <VStack gap={4} align='stretch'>
              <Input label='Email' type='email' placeholder='Enter your email' />

              <Input label='Password' type='password' placeholder='Enter your password' />

              <Button mt={2} w='100%'>
                Sign in
              </Button>
            </VStack>

            <Link
              asChild
              alignSelf='center'
              color='primary'
              fontSize='sm'
              fontWeight='medium'
              _hover={{
                textDecoration: 'underline',
                color: 'secondary',
              }}
            >
              <RouterLink to={ROUTES.AUTH.FORGOT_PASSWORD}>Forgot your password?</RouterLink>
            </Link>
          </VStack>
        </Box>

        <Text fontSize='xs' color='textSecondary' textAlign='center'>
          John Deere © {new Date().getFullYear()}. All rights reserved.
        </Text>
      </VStack>
    </Box>
  );
};
