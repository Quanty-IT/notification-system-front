import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts';
import { Router } from './routes';
import { colors } from './styles/colors.ts';

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: colors
    }
  }
});

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <BrowserRouter>
          <AuthProvider>
            {/* Sidebar removida daqui para não aparecer no Login */}
            <Router />
          </AuthProvider>
        </BrowserRouter>
      </ChakraProvider>
    </QueryClientProvider>
  );
}