import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes — avoids refetching on every mount
      retry: (failureCount, error: unknown) => {
        // Don't retry auth errors; they won't self-heal without user action
        const status =
          typeof error === 'object' &&
          error !== null &&
          'response' in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error(
    'Root element #root not found. Ensure index.html contains <div id="root"></div>.',
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
