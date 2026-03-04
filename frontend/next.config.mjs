/** @type {import('next').NextConfig} */
const backendURL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://evote-backend:8080";

const nextConfig = {
    output: "standalone",
    async rewrites() {
        return [
            {
                source: "/api/v1/:path*",
                destination: `${backendURL}/api/v1/:path*`,
            },
        ];
    },
};
export default nextConfig;
