import { Box, Field, Image, Link, Text, VStack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Logo from '../../../assets/logo.png';
import { FormErrorInline } from '../../../components';
import { useAuth } from '../../../contexts';
import { ROUTES } from '../../../routes/routes.constants';
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

  const getErrorMessage = (): string | undefined => {
    if (!mutation.error) return undefined;

    const axiosError = mutation.error as AxiosError;
    if (axiosError.response?.status === 401) return 'Invalid credentials';

    return 'Error logging in. Try again later.';
  };

  const backendError = getErrorMessage();
  const hasEmailError = !!errors.email || !!backendError;
  const hasPasswordError = !!errors.password || !!backendError;

  const handleInputChange = () => {
    if (mutation.error) mutation.reset();
  };

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

            <VStack align='stretch'>
              <Field.Root invalid={hasEmailError} position='relative' pb='5px'>
                <Field.Label mb={1} color='primary' fontWeight='bold'>
                  Email
                </Field.Label>
                <Input
                  type='text'
                  placeholder='Type your email'
                  bg='white'
                  border='1px solid'
                  borderColor={hasEmailError ? 'error' : 'inputBorder'}
                  borderRadius='md'
                  _placeholder={{ color: 'placeholder' }}
                  _hover={{ borderColor: hasEmailError ? 'error' : 'primary' }}
                  _focus={{
                    borderColor: hasEmailError ? 'error' : 'primary',
                    outline: hasEmailError
                      ? '1px solid var(--chakra-colors-error)'
                      : '1px solid var(--chakra-colors-primary)',
                  }}
                  _autofill={{
                    boxShadow: hasEmailError
                      ? '0 0 0px 1000px white inset, 0 0 0 1px var(--chakra-colors-error) !important'
                      : '0 0 0px 1000px white inset',
                  }}
                  {...register('email', { onChange: handleInputChange })}
                />
                <FormErrorInline message={errors.email?.message} />
              </Field.Root>

              <Field.Root invalid={hasPasswordError} position='relative' pb='5px'>
                <Field.Label mb={1} color='primary' fontWeight='bold'>
                  Senha
                </Field.Label>
                <Input
                  type='password'
                  placeholder='Type your password'
                  bg='white'
                  border='1px solid'
                  borderColor={hasPasswordError ? 'error' : 'inputBorder'}
                  borderRadius='md'
                  _placeholder={{ color: 'placeholder' }}
                  _hover={{ borderColor: hasPasswordError ? 'error' : 'primary' }}
                  _focus={{
                    borderColor: hasPasswordError ? 'error' : 'primary',
                    outline: hasPasswordError
                      ? '1px solid var(--chakra-colors-error)'
                      : '1px solid var(--chakra-colors-primary)',
                    outlineOffset: '0px',
                  }}
                  _autofill={{
                    boxShadow: hasPasswordError
                      ? '0 0 0px 1000px white inset, 0 0 0 1px var(--chakra-colors-error) !important'
                      : '0 0 0px 1000px white inset',
                  }}
                  {...register('password', { onChange: handleInputChange })}
                />
                <FormErrorInline message={errors.password?.message || backendError} />
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
