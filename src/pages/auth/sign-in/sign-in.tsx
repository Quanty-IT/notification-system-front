import {
  Box,
  Button,
  Field,
  Image,
  Input,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';

import Logo from '../../../assets/logo.png';

export const SignIn = () => {
  return (
    <Box
      minH='100vh'
      display='flex'
      alignItems='center'
      justifyContent='center'
      bg='background'
      px={4}
      py={8}
    >
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
              <Image
                src={Logo}
                alt='John Deere logo'
                w='7rem'
                h='7rem'
                objectFit='contain'
              />

              <VStack gap={1}>
                <Text
                  fontSize={{ base: '2xl', md: '3xl' }}
                  fontWeight='extrabold'
                  color='primary'
                  textAlign='center'
                >
                  Welcome back
                </Text>

                <Text
                  fontSize='sm'
                  color='textSecondary'
                  textAlign='center'
                >
                  Sign in to your account to continue
                </Text>
              </VStack>
            </VStack>

            <VStack gap={4} align='stretch'>
              <Field.Root>
                <Field.Label color='text' fontWeight='semibold' mb={1.5}>
                  Email
                </Field.Label>

                <Input
                  type='email'
                  placeholder='Enter your email'
                  h='3rem'
                  px={4}
                  py={2}
                  lineHeight='1.2'
                  bg='white'
                  border='1px solid'
                  borderColor='inputBorder'
                  borderRadius='lg'
                  color='text'
                  _placeholder={{ color: 'placeholder' }}
                  _hover={{ borderColor: 'primary' }}
                  _focusVisible={{
                    borderColor: 'primary',
                    boxShadow: '0 0 0 1px var(--chakra-colors-primary)',
                  }}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label color='text' fontWeight='semibold' mb={1.5}>
                  Password
                </Field.Label>

                <Input
                  type='password'
                  placeholder='Enter your password'
                  h='3rem'
                  px={4}
                  py={2}
                  lineHeight='1.2'
                  bg='white'
                  border='1px solid'
                  borderColor='inputBorder'
                  borderRadius='lg'
                  color='text'
                  _placeholder={{ color: 'placeholder' }}
                  _hover={{ borderColor: 'primary' }}
                  _focusVisible={{
                    borderColor: 'primary',
                    boxShadow: '0 0 0 1px var(--chakra-colors-primary)',
                  }}
                />
              </Field.Root>

              <Button
                mt={2}
                bg='primary'
                color='white'
                h='3rem'
                w='100%'
                fontWeight='bold'
                borderRadius='lg'
                _hover={{ bg: 'secondary' }}
                _active={{ bg: 'secondary' }}
              >
                Sign in
              </Button>
            </VStack>

            <Link
              alignSelf='center'
              color='primary'
              fontSize='sm'
              fontWeight='medium'
              _hover={{
                textDecoration: 'underline',
                color: 'secondary',
              }}
            >
              Forgot your password?
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