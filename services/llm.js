const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";
const API_KEY = process.env.OPENROUTER_API_KEY;
const REFERRER = process.env.OPENROUTER_REFERRER; // e.g. https://yourdomain.com
const TITLE = process.env.OPENROUTER_TITLE || "Will Intake App";

async function callAi(messages, { json = true } = {}) {
  if (!API_KEY) {
    const err = new Error("Missing OPENROUTER_API_KEY");
    err.status = 401;
    throw err;
  }

  const body = { model: MODEL, messages, temperature: 0 };
  if (json) body.response_format = { type: "json_object" };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(REFERRER ? { "HTTP-Referer": REFERRER } : {}),
      ...(TITLE ? { "X-Title": TITLE } : {}),
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message || res.statusText || "OpenRouter request failed";
    const err = new Error(message);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  const content = data?.choices?.[0]?.message?.content;
  
  return { text: content };
}

module.exports = { callAi };
