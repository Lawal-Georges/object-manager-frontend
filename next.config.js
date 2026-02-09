/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'faoqoakoiatxpymudknr.supabase.co',
                pathname: '/storage/v1/object/public/objects/**',
            },
            {
                protocol: 'https',
                hostname: '*.vercel.app',
                pathname: '/**',
            },
        ],
        unoptimized: true, // Important pour Vercel
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
};

module.exports = nextConfig;