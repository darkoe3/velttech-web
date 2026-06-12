if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL must be configured for production builds.");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
};

module.exports = nextConfig;
