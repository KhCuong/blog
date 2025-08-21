
# Next-blog (Next.js)

This repository is a Next.js blog application with a dashboard and simple authentication flow. The project currently includes API routes under `src/app/api/*` and example local data files in `src/data/posts.json` and `src/data/users.json` (used for local/dev purposes).

The app was originally built to support simple file-based storage for rapid prototyping. For production deployments we strongly recommend migrating the data to a real database (MongoDB is the recommended option in the docs below).

Contents
 - About
 - Prerequisites
 - Local development
 - Environment variables
 - Migrating JSON data to MongoDB (recommended)
 - Deploying (Vercel vs Docker/VPS)
 - Troubleshooting
 - Next steps

## About

Key points about this project:
- Built with Next.js (app directory).
- Server-side API routes live in `src/app/api/`.
- UI components and dashboard are in `src/app/components`.
- For rapid prototyping the project ships with `src/data/posts.json` and `src/data/users.json` which the API routes read/write.

Important: writing to files under `src/data` is fine for local development, but file-system writes are ephemeral on serverless hosts (Vercel) and not safe for production or multi-user concurrency. See the migration section below.

## Prerequisites

- Node.js (recommended 18+)
- npm (or pnpm/yarn)
- MongoDB Atlas account (recommended) if you plan to use a DB in production

## Local development

1. Install dependencies

```powershell
cd 'c:\Users\MSII\Documents\Thư mục mới\next-blog'
npm install
```

2. Create a `.env.local` in the project root for development variables (example below).

3. Run the dev server

```powershell
npm run dev
```

4. Build for production locally

```powershell
npm run build
npm start
```

Open http://localhost:3000 in your browser.

## Environment variables

Create `.env.local` in the repository root and set values you need. Example minimal variables for a MongoDB-backed setup:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydb?retryWrites=true&w=majority
NEXT_PUBLIC_URL=http://localhost:3000
```

Notes:
- Keep your DB credentials secret. Do not commit `.env.local`.
- `NEXT_PUBLIC_URL` is used by some server-side fetches in the app and in `RecentPosts`.

## Migrating JSON data to MongoDB (recommended)

Why migrate?
- File-based storage (`src/data/*.json`) is not safe for production: writes can collide, files may corrupt with concurrent requests, and serverless platforms do not persist runtime writes.

High-level migration steps (manual or scripted):
1. Create a MongoDB Atlas cluster (free tier is fine for testing).
2. Add `MONGODB_URI` to your `.env.local` (and later to your deployment environment variables).
3. Add a DB connection helper (singleton) in `src/lib/` (e.g. `src/lib/mongoose.js`) and install `mongoose`:

```powershell
npm install mongoose
```

4. Create Mongoose models for `User` and `Post` in `src/models/`.
5. Replace API route read/write logic (`fs.readFileSync` / `fs.writeFileSync`) with DB queries (e.g. `Post.find`, `Post.create`, `Post.findByIdAndUpdate`).
6. Write a migration script (example: `scripts/migrate-to-mongo.js`) that reads `src/data/posts.json` and `src/data/users.json`, normalizes fields (ensure `id`/`createdAt` exist), and inserts documents with `insertMany`.
7. Run migration locally and test the app.

If you want, I can scaffold `src/lib/mongoose.js`, basic `Post`/`User` models, convert a sample route (`/api/post/get`) and add a migration script — ask me to create those files and I'll generate them.

## Deploying

Recommended: Vercel + MongoDB Atlas

- Vercel handles Next.js builds and is the simplest path for Next.js apps.
- Vercel uses serverless functions; because of ephemeral file storage, your app must use a database (MongoDB) for writes.

Steps overview for Vercel:
1. Push your repo to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. Under Project Settings → Environment Variables, add `MONGODB_URI` and `NEXT_PUBLIC_URL`.
4. Deploy — Vercel will run `npm run build` for you.

Alternative: Docker on VPS (if you want to keep file-based storage)

- You can build a Docker image and run it on a VPS and mount `src/data` as a host volume to persist files. This is fast to set up for demos but not recommended for production multi-user scenarios.

Example Docker run (Windows PowerShell):

```powershell
docker build -t next-blog .
docker run -d -p 3000:3000 -v 'C:\path\to\project\src\data:/app/src/data' --name next-blog next-blog
```

## Troubleshooting & tips

- If API calls return 500 or hang: check server logs and whether `src/data/*.json` exist and are valid JSON.
- If using MongoDB and connections are slow: implement a singleton connection pattern to avoid creating a connection per request (important for serverless).
- If users cannot create posts after deploying to Vercel: verify `MONGODB_URI` is set in the deployment environment and that the API routes have been updated to use the DB.

## Next steps I can help with

- Scaffold `src/lib/mongoose.js` and basic `User`/`Post` models.
- Convert API routes from file-based IO to Mongoose queries (I can convert one route as a template and the rest can follow the pattern).
- Write a migration script to import `src/data/*.json` into your MongoDB cluster.

If you want me to implement any of the above automatically, tell me A) scaffold the DB files + convert `/api/post/get`, or B) only scaffold the connection + migration script.

---

Credits: project starter and components built with Next.js, Flowbite, and simple custom auth logic.
