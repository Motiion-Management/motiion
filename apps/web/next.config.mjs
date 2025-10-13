/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: 'https://motiion.framer.website/'
      }
    ]
  }
  // Ensure workspace packages are transpiled and share React/Next
}

export default nextConfig
