# Inngest Setup Instructions (Local Development)

## Why Local Development?

You cannot sync "localhost" with the Inngest Cloud dashboard because the cloud cannot access your computer. Instead, we use the **Inngest Dev Server** which runs locally on your machine.

## Setup Steps (2 minutes)

### 1. Start the Inngest Dev Server

Open a **new terminal window** (keep your `npm run dev` running in the other one) and run:

```bash
npm run inngest:dev
```

This will start the local Inngest dashboard at [http://127.0.0.1:8288](http://127.0.0.1:8288).

### 2. Verify Connection

1. Open your browser to [http://127.0.0.1:8288](http://127.0.0.1:8288)
2. It should automatically detect your Next.js app running at `http://127.0.0.1:3000`
3. You should see the `generate-story` function listed on the "Functions" page

### 3. Test Story Generation

1. Go to your app: [http://localhost:3000/dashboard/stories/new](http://localhost:3000/dashboard/stories/new)
2. Generate a story
3. Switch to the Inngest Dev Dashboard ([http://127.0.0.1:8288](http://127.0.0.1:8288))
4. Click on the `generate-story` function to see the active run and logs!

## Troubleshooting

### "Connecting to event stream..." stuck?
- Make sure your Next.js app is running on port 3000
- Check that you have `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` in your `.env.local` (even for local dev, it's good practice, though strictly local dev often works without them if configured right, but Inngest recommends them).

### Deploying to Production

When you are ready to deploy to Vercel:

1. Go to [https://app.inngest.com](https://app.inngest.com)
2. Create/Select your app
3. Get the **Production Keys**
4. Add them to Vercel Environment Variables
5. Deploy your app
6. Then (and only then) use the "Sync App" button in the Cloud Dashboard, pointing to your **production URL** (e.g., `https://herotales.vercel.app/api/inngest`).
