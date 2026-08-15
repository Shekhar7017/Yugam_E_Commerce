/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfkit (and its font-handling dependency, fontkit) ship code that
  // Turbopack/webpack can't safely bundle — this tells Next.js to load
  // them directly via Node's require() at runtime instead of 
  // bundling them.
  allowedDevOrigins: ["192.168.56.1"],
  serverExternalPackages: ["pdfkit", "fontkit"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

module.exports = nextConfig;