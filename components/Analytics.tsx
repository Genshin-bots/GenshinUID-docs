'use client';

import Script from 'next/script';

export function Analytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const endpoint = process.env.NEXT_PUBLIC_UMAMI_ENDPOINT;

  if (!websiteId || !endpoint) {
    return null;
  }

  return (
    <Script
      async
      defer
      data-website-id={websiteId}
      src={endpoint}
      strategy="afterInteractive"
    />
  );
}
