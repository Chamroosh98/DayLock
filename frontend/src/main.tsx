import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AppProviders } from './context/AppProviders';
import './index.css';
import { loadWasm } from './utils/wasmLoader';

// Initialize Rust WASM module in the background
loadWasm().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);

