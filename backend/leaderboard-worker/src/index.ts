type Env = {
  GRISU_LEADERBOARD?: KVNamespace;
};

type ScoreEntry = {
  id: string;
  name: string;
  score: number;
  correct: number;
  createdAt: string;
};

const KEY = 'global';
const MAX_SCORES = 50;
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function cleanName(value: unknown) {
  return String(value ?? '')
    .replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ ._-]/g, '')
    .trim()
    .slice(0, 18) || 'Oyuncu';
}

async function readScores(env: Env): Promise<ScoreEntry[]> {
  if (!env.GRISU_LEADERBOARD) {return [];} // local/config eksikse boş liste dön.
  const raw = await env.GRISU_LEADERBOARD.get(KEY);
  if (!raw) {return [];}
  try {
    const parsed = JSON.parse(raw) as ScoreEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeScores(env: Env, scores: ScoreEntry[]) {
  if (!env.GRISU_LEADERBOARD) {return;}
  await env.GRISU_LEADERBOARD.put(KEY, JSON.stringify(scores.slice(0, MAX_SCORES)));
}

function rankScores(scores: ScoreEntry[]) {
  return [...scores]
    .sort((a, b) => (b.score - a.score) || (b.correct - a.correct) || a.createdAt.localeCompare(b.createdAt))
    .slice(0, MAX_SCORES);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {return new Response(null, { headers: corsHeaders });}

    const url = new URL(request.url);
    if (url.pathname !== '/' && url.pathname !== '/scores') {
      return json({ error: 'not_found' }, 404);
    }

    if (request.method === 'GET') {
      const scores = rankScores(await readScores(env)).slice(0, 10);
      return json({ scores });
    }

    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405);
    }

    let body: { name?: unknown; score?: unknown; correct?: unknown } = {};
    try {
      body = await request.json();
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }

    const score = Math.max(0, Math.min(9999, Math.floor(Number(body.score))));
    const correct = Math.max(0, Math.min(12, Math.floor(Number(body.correct))));
    if (!Number.isFinite(score) || !Number.isFinite(correct)) {
      return json({ error: 'invalid_score' }, 400);
    }

    const entry: ScoreEntry = {
      id: crypto.randomUUID(),
      name: cleanName(body.name),
      score,
      correct,
      createdAt: new Date().toISOString(),
    };

    const scores = rankScores([...(await readScores(env)), entry]);
    await writeScores(env, scores);
    return json({ scores: scores.slice(0, 10), entry });
  },
};
