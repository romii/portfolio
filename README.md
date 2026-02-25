# Portfolio Site

## Stack

- **Next.js 15**
- **TypeScript**
- **Tailwind CSS**
- **React 19**

## Setup

Copy env example and add your GitHub token so the site can load **activity** and **latest commit**:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

- **`GITHUB_USERNAME`** – Your GitHub username (the one in `github.com/YourUsername`). Required; wrong value causes “404” on repos.
- **`GITHUB_TOKEN`** – [Create a token](https://github.com/settings/tokens) (no scopes needed for public repos). Without it, GitHub’s API allows only 60 requests/hour and the activity/commit widgets will fail or show nothing.

## Development
- **Install**: `npm install`
- **Build**: `npm run build`
- **Start**: `npm run dev`
- **Lint**:  `npm run lint`