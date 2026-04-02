import { Box, Field, Image, Link, Text, VStack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Logo from '../../../assets/logo.png';
import { FormErrorInline } from '../../../components';
import { useAuth } from '../../../contexts';
import { ROUTES } from '../../../routes';
import { signIn } from '../../../services';
import { storage } from '../../../shared';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { SignInFormData, signInSchema } from './schema';

export const SignIn = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      const { accessToken, refreshToken } = data;
      storage.token.setTokens(accessToken, refreshToken);
      setIsAuthenticated(true);
      navigate(ROUTES.DASHBOARD.BASE);
    },
    onError: () => {
      clearErrors();
    },
  });

  const onSubmit = (data: SignInFormData) => {
    mutation.mutate(data);
  };

  return (
    <Box
      minH='100vh'
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      bg='background'
      px={4}
    >
      <VStack gap={8} w='100%' maxW='28rem'>
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
              <Image src={Logo} alt='Logo' w='7rem' h='7rem' objectFit='contain' />
              <VStack gap={1}>
                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight='extrabold' color='primary' textAlign='center'>
                  Welcome back
                </Text>
                <Text fontSize='sm' color='textSecondary' textAlign='center'>
                  Sign in to your account to continue
                </Text>
              </VStack>
            </VStack>

            <VStack gap={3} align='stretch'>
              <Field.Root invalid={!!errors.email}>
                <Input label='Email' type='email' placeholder='Enter your email' {...register('email')} />
                <FormErrorInline message={errors.email?.message} />
              </Field.Root>

              <Field.Root invalid={!!errors.password}>
                <Input label='Password' type='password' placeholder='Enter your password' {...register('password')} />
                <FormErrorInline message={errors.password?.message} />
              </Field.Root>

              <Button
                type='submit'
                loading={mutation.isPending}
                loadingText='Signing In...'
                visual='primary'
                onClick={handleSubmit(onSubmit)}
                w='100%'
              >
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
