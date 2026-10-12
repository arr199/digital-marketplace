import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Upload URLs are relative (/api/media/file/...), so no remotePatterns. With Vercel Blob storage Payload appends
    // ?prefix=<folder> to them, which Next's default localPatterns (no query strings) would reject.
    localPatterns: [
      { pathname: "/api/media/file/**" },
      { pathname: "/**", search: "" },
    ],
  },
};

export default withPayload(nextConfig);
