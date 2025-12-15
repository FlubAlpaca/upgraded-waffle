const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";
const API_KEY = process.env.OPENROUTER_API_KEY;
const REFERRER = process.env.OPENROUTER_REFERRER; // e.g. https://yourdomain.com
const TITLE = process.env.OPENROUTER_TITLE || "Will Intake App";

const parseSchema = {
  type: "object",
  required: ["updates"],
  properties: {
    updates: {
      type: "object",
      properties: {
        variables: {
          type: "object",
          additionalProperties: {
            anyOf: [
              { type: "string" },
              { type: "number" },
              { type: "boolean" },
              { type: "null" }
            ]
          }
        },
        flags: {
          type: "object",
          additionalProperties: { type: "boolean" }
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};


const questionSchema = {
  type: "object",
  required: ["Question", "Options", "DataType", "Done"],
  properties: {
    Question: { type: ["string", "null"] },
    Options: {
      anyOf: [
        { type: "null" },
        { type: "string" },
        {
          type: "array",
          items: { type: "string" },
        },
      ],
    },
    DataType: { type: ["string", "null"] },
    Done: { type: "boolean" },
  },
  additionalProperties: true,
};

async function callOpenRouter(messages, schemaInsert) {
  if (!API_KEY) {
    const err = new Error("Missing OPENROUTER_API_KEY");
    err.status = 401;
    throw err;
  }

  const body = {
    model: MODEL,
    messages,
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "structured_response",
        strict: true,
        schema: schemaInsert,
      },
    },
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      // ...(REFERRER ? { "HTTP-Referer": REFERRER } : {}),
      // ...(TITLE ? { "X-Title": TITLE } : {}),
    },
    body: JSON.stringify(body),
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
  if (!content) {
    const err = new Error("OpenRouter returned no content");
    err.status = 502;
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    const err = new Error("OpenRouter returned invalid JSON");
    err.status = 502;
    err.details = { raw: content };
    throw err;
  }
  return parsed;
}

async function aiParse(messages) {
  const parsed = await callOpenRouter(messages, parseSchema);
  const updates = parsed.updates || {};
  return {
    updates: {
      variables: updates.variables || {},
      flags: updates.flags || {},
    },
  };
}

async function aiQuestion(messages) {
  const parsed = await callOpenRouter(messages, questionSchema);
  const done = parsed.Done;
  return {
    Question: parsed.Question || null,
    Options: parsed.Options ?? null,
    DataType: parsed.DataType || null,
    Done: done === true ? "true" : done === false ? "false" : (done || "false"),
  };
}

module.exports = { aiParse, aiQuestion };
