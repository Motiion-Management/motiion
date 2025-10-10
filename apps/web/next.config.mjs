/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: 'https://lime-environment-912569.framer.app/'
        // destination: 'https://motiion.framer.website/'
      }
    ]
  }
  // Ensure workspace packages are transpiled and share React/Next
}

export default nextConfig
