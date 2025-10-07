import React from 'react';
import { createRoot } from 'react-dom/client';
import { HealthCheck } from './components/HealthCheck';
import App from './App';



createRoot(document.getElementById('root') as HTMLElement).render(<App />);
