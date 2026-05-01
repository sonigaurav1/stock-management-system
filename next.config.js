/** @type {import('next').NextConfig} */

// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: false, //  process.env.NODE_ENV === 'development'
//   // Additional PWA configurations
//   // https://github.com/shadowwalker/next-pwa#available-options
// });

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'files.edgestore.dev',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  allowedDevOrigins: ['192.168.1.69'],
  transpilePackages: ['geist']

  // // Enable PWA
  // reactStrictMode: true,

  // experimental: {
  //   turbo: {
  //     // Optional Turbo-specific configurations
  //   }
  // }
};

// module.exports = withPWA(nextConfig);
module.exports = nextConfig;
