import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './routes';
import { colors } from './styles/colors.ts';

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: colors,
    },
  },
});

export function App() {
  return (
    <ChakraProvider value={system}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </ChakraProvider>
  );
}
