import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Any global JavaScript initialization can go here
    console.log('Next.js App initialized');
  }, []);

  return <Component {...pageProps} />;
}