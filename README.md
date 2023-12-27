This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

<!-- 
"scripts": {
    "dev": "cross-env PAYLOAD_CONFIG_PATH=src/server/payload.config.ts nodemon",
    "generate:types": "cross-env PAYLOAD_CONFIG_PATH=src/server/payload.config.ts payload generate:types",
    "build:payload": "cross-env PAYLOAD_CONFIG_PATH=src/server/payload.config.ts payload build",
    "build:server": "tsc --project tsconfig.server.json",
    "build:next": "cross-env NODE_ENV=production PAYLOAD_CONFIG_PATH=dist/server/payload.config.js NEXT_BUILD=true",
    "build": "cross-env NODE_ENV=production yarn build:payload && yarn build:server && yarn copyfiles && yarn build:next",
    "start": "cross-env  PAYLOAD_CONFIG_PATH=dist/server/payload.config.js node dist/server/server.js ",
    "copyfiles": "copyfiles -u 1 \"src/**/*.{html,css,scss,ttf,woff,woff2,eot,svg,jpg,png}\" dist/",
    "lint": "next lint"
  }, -->