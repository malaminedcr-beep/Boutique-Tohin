const nextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer est aussi rendu côté serveur (route /api/orders/[id]/slip
  // → renderToBuffer) : on le laisse externe pour éviter les soucis de bundling.
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    }
    return config;
  },
};

export default nextConfig;
