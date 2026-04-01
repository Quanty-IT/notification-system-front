import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { colors } from './styles/colors.ts';
import { ForgotPassword } from './pages/index.ts';

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
        <ForgotPassword />
      </ChakraProvider>
  );
}
