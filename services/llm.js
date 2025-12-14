const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";
const API_KEY = process.env.OPENROUTER_API_KEY;

async function callAi(messages, { json = true } = {}) {
  const body = { model: MODEL, messages, temperature: 0 };
  if (json) body.response_format = { type: "json_object" };

  let data;
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  
  return { text: content };
}

module.exports = { callAi };
