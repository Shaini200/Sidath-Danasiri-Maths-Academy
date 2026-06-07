# Sidath Danasiri Maths Academy

Next.js student and payment management app for Vercel deployment.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and add your MySQL and JWT values.

3. Initialize the database:

```bash
npm run db:init
```

4. Start development:

```bash
npm run dev
```

## Deployment

Deploy the repository root to Vercel. Add the same `.env` values in the Vercel project environment variables.

Uploaded slips are served from `public/uploads` for local development. For production, use durable storage such as Vercel Blob or S3 before relying on payment slip uploads long-term.
