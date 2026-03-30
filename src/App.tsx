import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { colors } from './styles/colors.ts';
import { Auth } from './pages/Auth.tsx'

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
         <Auth />
      </ChakraProvider>
  );
}
