/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development experience
    reactStrictMode: true,

    // Allow images from any domain for user-uploaded content
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    // Experimental features
    experimental: {
        // Enable server actions
        serverActions: {
            allowedOrigins: ['localhost:3000'],
        },
    },
};

module.exports = nextConfig;
