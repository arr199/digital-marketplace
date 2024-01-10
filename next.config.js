/** @type {import('next').NextConfig} */
const nextConfig = {

    images : {
        remotePatterns : [
            {
                hostname : "digital-marketplace.up.railway.app",
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
            { 
                hostname : "digital-marketplace-ghencuyfzq-nw.a.run.app",
                pathname : "**" ,
                port : "" ,
                protocol : "https",
            },
        ]
    }
}

module.exports = nextConfig