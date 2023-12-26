/** @type {import('next').NextConfig} */
const nextConfig = {
    images : {
        remotePatterns : [
            {
                hostname : "localhost",
                pathname : "**" ,
                port : "3400" ,
                protocol : "http",
            }
        ]
    }
}

module.exports = nextConfig
