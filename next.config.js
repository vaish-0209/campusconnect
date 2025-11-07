const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppresses all logs
  silent: true,

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Automatically annotate React components to show their name in breadcrumbs and session replay
  automaticVercelMonitors: false, // Disabled to debug MonthlyUpdates error
};

// Temporarily disable Sentry to debug deployment issues
module.exports = nextConfig;
// module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
//   ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
//   : nextConfig;
