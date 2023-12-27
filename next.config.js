/** @type {import('next').NextConfig} */
const nextConfig = {
    images : {
        remotePatterns : [
            {
                hostname : "digital-marketplace-production-ae5b.up.railway.app",
                pathname : "**" ,
                port : "3400" ,
                protocol : "http",
            },
            {
            hostname : "digital-marketplace-production-ae5b.up.railway.app",
            pathname : "**" ,
            port : "3400" ,
            protocol : "https",
        }

        ]
    }
}

module.exports = nextConfig
