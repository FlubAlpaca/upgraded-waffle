const MODEL = process.env.OPENROUTER_MODEL;
const API_KEY = process.env.OPENROUTER_API_KEY;

async function callAi(messages) {
  const body = {
    model: MODEL,
    messages,
    temperature: 0
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    console.error("OpenRouter raw response:", JSON.stringify(data, null, 2));
    return { text: null };
  }

  return { text: content };
}

module.exports = { callAi };
