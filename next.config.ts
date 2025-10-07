import type { NextConfig } from 'next';

const isWebContainer = Boolean(process.versions?.webcontainer);

const experimental: NextConfig['experimental'] = {
  useLightningcss: false,
  ...(isWebContainer ? { useWasmBinary: true } : {}),
};

const nextConfig: NextConfig = {
  experimental,
  images: { 
    unoptimized: true 
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
