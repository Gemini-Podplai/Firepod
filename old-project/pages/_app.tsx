import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SharedStateProvider } from '../components/SharedStateProvider';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SharedStateProvider>
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </>
    </SharedStateProvider>
  );
}

export default MyApp;
