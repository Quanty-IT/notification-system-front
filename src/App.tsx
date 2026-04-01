import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { colors } from './styles/colors.ts';
import { Router } from './routes';
import { BrowserRouter } from 'react-router-dom';

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
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </ChakraProvider>
  );
}
