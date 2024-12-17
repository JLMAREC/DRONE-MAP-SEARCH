import React from 'react';
import '../styles/globals.css';
import { SettingsProvider } from '../context/SettingsContext';

function MyApp({ Component, pageProps }) {
  return (
    <SettingsProvider>
      <Component {...pageProps} />
    </SettingsProvider>
  );
}

export default MyApp;