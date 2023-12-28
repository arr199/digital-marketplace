/** @type {import('next').NextConfig} */
const nextConfig = {

    images : {
        remotePatterns : [
            {
                hostname : "digital-marketplace-production-ae5b.up.railway.app",
                pathname : "/**" ,
                port : "" ,
                protocol : "https",
            },
            {
                hostname : "localhost",
                pathname : "**" ,
                port : "3400" ,
                protocol : "http",
            },
        ]
    }
}

module.exports = nextConfig
