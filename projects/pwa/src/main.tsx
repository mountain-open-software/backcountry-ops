import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { webTheme } from './theme';
import '@open-mountain/design-system/styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { PwaUpdate } from './components/PwaUpdate';
import './style.css';
createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={webTheme}>
    <CssBaseline />
    <App />
    <PwaUpdate />
  </ThemeProvider>,
);
