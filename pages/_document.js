import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/images/footlogo.png" type="image/gif" sizes="16x16" />
        
        {/* Font Awesome 6 */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
        
        {/* Additional Icon Fonts */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/icofont/1.0.1/icofont.min.css" />
        
        {/* CSS Files - Same paths as original */}
        <link href="/css/bootstrap.min.css" rel="stylesheet" type="text/css" id="bootstrap" />
        <link href="/css/plugins.css" rel="stylesheet" type="text/css" />
        <link href="/css/style.css" rel="stylesheet" type="text/css" />
        <link href="/css/services.css" rel="stylesheet" type="text/css" />
        <link href="/css/date-availability.css" rel="stylesheet" type="text/css" />
        
        {/* Color scheme */}
        <link id="colors" href="/css/colors/scheme-1.css" rel="stylesheet" type="text/css" />
      </Head>
      <body className="dark-scheme">
        <Main />
        <NextScript />
        
        {/* JavaScript Files - Load after React hydration */}
        <script src="/js/plugins.js" defer></script>
        <script src="/js/designesia.js" defer></script>
        <script src="/js/navigation.js" defer></script>
      </body>
    </Html>
  );
}