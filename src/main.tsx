import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import App from './App';
import './i18n'; // Initialize i18n
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipPrimitive.Provider>
      <App />
    </TooltipPrimitive.Provider>
  </StrictMode>
);
