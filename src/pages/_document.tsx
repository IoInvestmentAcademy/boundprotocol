import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>BOUND - The DeFi Yield Stablecoin</title>
        {/* Primary Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Diversified exposure to professional yield strategies across blue-chip protocols"
        />
        <meta
          name="keywords"
          content="BOUND, DeFi, yield farming, stablecoin, cryptocurrency, blockchain, automated returns, yield strategies"
        />
        <meta name="author" content="BOUND" />
        <link rel="icon" type="image/png" href="/favicon.png"></link>

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://boundprotocol.com" />
        <meta
          property="og:title"
          content="BOUND - Decentralized Stablecoin Protocol"
        />
        <meta
          property="og:description"
          content="Diversified exposure to professional yield strategies across blue-chip protocols"
        />
        <meta property="og:image" content="https://boundprotocol.com/BND.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://boundprotocol.com" />
        <meta
          property="twitter:title"
          content="BOUND - Decentralized Stablecoin Protocol"
        />
        <meta
          property="twitter:description"
          content="Diversified exposure to professional yield strategies across blue-chip protocols"
        />
        <meta
          property="twitter:image"
          content="https://boundprotocol.com/BND.png"
        />

        {/* Favicon and App Icons */}
        {/* <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#8B5CF6" /> */}

        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BOUND" />

        {/* Preconnect to important third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
