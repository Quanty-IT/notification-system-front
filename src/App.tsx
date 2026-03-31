import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { colors } from './styles/colors.ts';
import { SignIn } from './pages/auth/sign-in/sign-in.tsx'

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: colors,
    },
  },
});

export function App() {
  return (
      <ChakraProvider  value={system}>
         <SignIn />
      </ChakraProvider>
  );
}
