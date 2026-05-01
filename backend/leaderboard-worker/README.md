# GriSu Arena Leaderboard Worker

Cloudflare Worker + KV tabanlı online sıralama API'si.

## Endpoint

- `GET /scores` → ilk 10 skoru döner.
- `POST /scores` → `{ "name": "Ege", "score": 120, "correct": 9 }` gönderir, güncel ilk 10'u döner.

Canlı URL:

```text
https://grisu-arena-leaderboard.egela7863.workers.dev/scores
```

## Deploy

```bash
npm install
npm run typecheck
npx wrangler deploy
```

Uygulama build ederken:

```bash
EXPO_PUBLIC_LEADERBOARD_URL="https://grisu-arena-leaderboard.egela7863.workers.dev/scores" npx expo export --platform web
```

Android release build içinde de aynı env verilmelidir.
