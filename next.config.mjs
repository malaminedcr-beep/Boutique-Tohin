const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // @react-pdf/renderer ne tourne que côté client
      config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    }
    return config;
  },
};

export default nextConfig;
