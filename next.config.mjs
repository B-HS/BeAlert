import nextPWA from 'next-pwa';

const withPWA = nextPWA({
    dest: 'public'
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(nextConfig);