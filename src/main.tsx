import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ROUTER_BASENAME } from './config/appConfig';
import { VKProvider } from './integrations/vk/VKProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={ROUTER_BASENAME === '/' ? undefined : ROUTER_BASENAME}>
      <ErrorBoundary>
        <VKProvider>
          <App />
        </VKProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
