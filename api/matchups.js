export const config = { runtime: “edge” };

export default async function handler(req) {
if (req.method !== “POST”) {
return new Response(JSON.stringify({ error: “Method not allowed” }), { status: 405 });
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
return new Response(JSON.stringify({ error: “ANTHROPIC_API_KEY not configured” }), { status: 500 });
}

let body;
try {
body = await req.json();
} catch {
return new Response(JSON.stringify({ error: “Invalid request body” }), { status: 400 });
}

const { prompt } = body;
if (!prompt) {
return new Response(JSON.stringify({ error: “Missing prompt” }), { status: 400 });
}

try {
const anthropicRes = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: {
“Content-Type”: “application/json”,
“x-api-key”: apiKey,
“anthropic-version”: “2023-06-01”,
},
body: JSON.stringify({
model: “claude-sonnet-4-20250514”,
max_tokens: 1200,
messages: [{ role: “user”, content: prompt }],
}),
});

```
if (!anthropicRes.ok) {
  const err = await anthropicRes.text();
  return new Response(JSON.stringify({ error: `Anthropic API error: ${err}` }), { status: 502 });
}

const data = await anthropicRes.json();
const text = data.content.map(b => b.text || "").join("");
const clean = text.replace(/```json|```/g, "").trim();

let parsed;
try {
  parsed = JSON.parse(clean);
} catch {
  return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: text }), { status: 502 });
}

return new Response(JSON.stringify(parsed), {
  status: 200,
  headers: { "Content-Type": "application/json" },
});
```

} catch (e) {
return new Response(JSON.stringify({ error: e.message || “Unknown error” }), { status: 500 });
}
}
