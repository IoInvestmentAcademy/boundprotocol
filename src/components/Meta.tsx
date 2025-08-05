import Head from 'next/head';

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}

export function Meta({ 
  title = 'MSO Manager', 
  description = 'Manage your MSO tokens and vaults efficiently',
  keywords = 'MSO, tokens, cryptocurrency, blockchain, vault management, DeFi',
  image = '/og-image.png'
}: MetaProps) {
  const fullTitle = `${title} | MSO Manager`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Head>
  );
} 