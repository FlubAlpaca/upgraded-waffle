// services/sessionStore.js
const { REQUIRED_VARIABLES, VARIABLES, REQUIRED_FLAGS, FLAGS } = require("./manifest");

const sessions = new Map();

const newId = () => Math.random().toString(36).slice(2, 10);
const clone = (x) => JSON.parse(JSON.stringify(x));

async function create() {
  let id = newId();
  while (sessions.has(id)) id = newId();

  const session = {
    id,
    variables: clone(VARIABLES),
    requiredVariables: clone(REQUIRED_VARIABLES),
    requiredFlags: clone(REQUIRED_FLAGS),
    flags: clone(FLAGS),
    lastQuestion: null,
    messageHistory: [],
    createdAt: Date.now(),
  };

  sessions.set(id, session);
  return clone(session);
}

async function get(id) {
  const session = sessions.get(id);
  return session ? clone(session) : null;
}

async function set(id, update) {
  const current = sessions.get(id);
  if (!current) return null;

  const merged = { ...current, ...update };
  sessions.set(id, merged);

  return clone(merged);
}

module.exports = { create, get, set };
