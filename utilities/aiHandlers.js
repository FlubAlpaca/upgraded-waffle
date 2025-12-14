// // utils/aiHandlers.js
// const fetch = require("node-fetch");
// const APIKEY = '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';

// utils/aiHandlers.js
// Conversational intake engine with plain-language questions, multi-field packs, and server-side validation.
// CommonJS (node-fetch@2). Exposes startIntake() and continueIntake().

const fetch = require("node-fetch");

// ========= Config =========
const APIKEY = "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";
const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";
const TEMPERATURE = 0;
const TIME_ZONE = "America/Toronto";

if (!APIKEY) throw new Error("Missing OPENROUTER_API_KEY in environment");

// ========= Static data / helpers =========
const PROVINCES = {
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
  NL: "Newfoundland and Labrador", NS: "Nova Scotia", NT: "Northwest Territories",
  NU: "Nunavut", ON: "Ontario", PE: "Prince Edward Island", QC: "Quebec",
  SK: "Saskatchewan", YT: "Yukon"
};
const PROVINCE_NAMES = new Set(Object.values(PROVINCES));
const PROVINCE_CODES = new Set(Object.keys(PROVINCES));

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const isAlphaSpaceDash = (s) => /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(String(s).trim());
const titleCase = (s) => String(s).replace(/\S+/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
const normalizePronoun = (s) => String(s).trim().toLowerCase();

const normalizeMonth = (v) => {
  const t = String(v).trim();
  if (/^\d{1,2}$/.test(t)) {
    const n = parseInt(t,10);
    if (n>=1 && n<=12) return MONTHS[n-1];
  }
  const lower = t.toLowerCase();
  for (const m of MONTHS) if (m.toLowerCase().startsWith(lower)) return m;
  return null;
};
const normalizeProvince = (v) => {
  const t = String(v).trim();
  const upper = t.toUpperCase();
  if (PROVINCE_CODES.has(upper)) return PROVINCES[upper];
  const norm = titleCase(t);
  if (PROVINCE_NAMES.has(norm)) return norm;
  if (norm === "Nfld" || norm === "Newfoundland") return "Newfoundland and Labrador";
  return null;
};
const looksLikeProvince = (v) => {
  const t = String(v).trim();
  return PROVINCE_CODES.has(t.toUpperCase()) || PROVINCE_NAMES.has(titleCase(t));
};

// Toronto "now" & relative dates
function nowInTZParts(tz = TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  const y = parseInt(map.year, 10);
  const m = parseInt(map.month, 10);
  const d = parseInt(map.day, 10);
  return { y, m, d, iso: `${map.year}-${map.month}-${map.day}` };
}
function addDaysUTC({ y, m, d }, delta) {
  const dt = new Date(Date.UTC(y, m-1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  const yy = dt.getUTCFullYear();
  const mm = dt.getUTCMonth()+1;
  const dd = dt.getUTCDate();
  return { y: yy, m: mm, d: dd, iso: `${yy}-${String(mm).padStart(2,"0")}-${String(dd).padStart(2,"0")}` };
}
function expandRelativeDateInText(answer) {
  const a = String(answer || "").toLowerCase();
  const now = nowInTZParts();
  if (/\btomorrow\b/.test(a)) return addDaysUTC(now, 1);
  if (/\btoday\b/.test(a) || /\btonight\b/.test(a)) return addDaysUTC(now, 0);
  return null; // extend if needed
}

// ========= OpenRouter / LLM =========
async function askClaude(messages, { model = MODEL, temperature = TEMPERATURE } = {}) {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${APIKEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, temperature, messages })
  });
  const data = await r.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  if (!content) { console.error("OpenRouter raw response:", JSON.stringify(data)); throw new Error("Empty LLM response"); }
  return content;
}
function ensureJson(text) {
  try { return JSON.parse(text); } catch(_) {}
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s >= 0 && e > s) { try { return JSON.parse(text.slice(s, e+1)); } catch(_) {} }
  const sa = text.indexOf("["), ea = text.lastIndexOf("]");
  if (sa >= 0 && ea > sa) { try { return JSON.parse(text.slice(sa, ea+1)); } catch(_) {} }
  throw new Error("Failed to parse JSON from model response");
}

// ========= Handlebars fields (allowlist) =========
// All fields the template references — booleans, strings, arrays.
const ALLOWED_PATHS = new Set([
  // Core identity / signing
  "testator","testatorCity","testatorProvince","pronoun",
  "signingCity","signingMonth","signingDay","signingYear",

  // Executor structure + people
  "executor.structure",        // (choice → we derive executorOne/Two/Three & alternates flags)
  "executor","executorCity","executorProvince",
  "altExecutor","altExecutorCity","altExecutorProvince",
  "alt2Executor","alt2ExecutorCity","alt2ExecutorProvince",

  // Booleans used directly by template (set/derived)
  "foreignWills","marriage","divorce",
  "executorOne","executorTwo","executorThree",
  "altExecutorOne","altExecutorTwo","altExecutorThree","altAltExecutor",

  // Spouse/intended-spouse names
  "intendedSpouse","spouseName",

  // Gifts
  "gifts[].gift","gifts[].recipient",

  // Pet care
  "petCare","petCareAmount",

  // Henson/disability
  "hensonTrust","hensonBenificiary","pronounOfBeneficiary","hensonAmount",
  "altHensonTrustee","altHensonTrusteeCity","altHensonTrusteeProvince",

  // Life interest
  "lifeTenant","lifeTenantPronoun","residentialAddress",
  "lifeTenant.strategy", // distribute | transfer | residue
  "lifeTenantDistribute","lifeTenantDistributeList",
  "lifeTenantTransfer","lifeTenantTransferRecipiant",
  "lifeTenantRest",

  // Residue/fallback/catastrophe strategies & recipients
  "residue.strategy","residueList","residueRecipients[].name","residueRecipients[].shares",
  "fallback.strategy","fallbackList","fallbackRecipients[].name","fallbackRecipients[].shares",
  "catastrophe.strategy","catastropheList","catastropheRecipients[].name","catastropheRecipients[].shares",

  // Booleans derived for template from strategies:
  "residueToExecutor","residueToChildren","residueToSiblings","residueToList","residueShares",
  "fallbackToNamedPerson","fallbackToChildren","fallbackToSiblings","fallbackToList","fallbackShares",
  "catastropheToNamedPerson","catastropheToChildren","catastropheToSiblings","catastropheToList","catastropheShares",

  // Named persons for certain options:
  "fallbackPerson","catastrophePerson",

  // Per stirpes preferences
  "myChild","anyPerson",

  // Omitted-person rationales
  "independentSelfSufficient","substantialLifetimeSupport","prolongedEstrangement","prioritizing","strongFinancialPosition",
  "omittedName","omittedNamePronoun","supportDescription","priorityNames",

  // Witnesses
  "witness1","witness1Address","witness2","witness2Address"
]);

const HARD_BANNED_FIELDS = new Set(["dateOfBirth","dob","birthday"]);

// ========= Packs (fewer turns) =========
const PACKS = [
  {
    key: "testatorPack",
    paths: ["testator","testatorCity","testatorProvince"],
    question: "Please provide your full legal name; your city; and your province (or 2-letter code). Example: Alex Jordan; Halifax; NS"
  },
  {
    key: "signingPack",
    paths: ["signingCity","signingMonth","signingDay","signingYear"],
    question: "Where and when will you sign your will? City; Month (name or number); Day; Year. Example: Halifax; June; 14; 2025"
  },
  {
    key: "executorPack",
    paths: ["executor","executorCity","executorProvince"],
    question: "Who will be your executor, and where do they live? Full name; City; Province (or 2-letter code). Example: Jamie Smith; Halifax; NS"
  },
  {
    key: "altExecutorPack",
    paths: ["altExecutor","altExecutorCity","altExecutorProvince"],
    question: "Do you have an alternate executor? If yes, provide Full name; City; Province. If not, reply 'no alternate'."
  },
  {
    key: "alt2ExecutorPack",
    paths: ["alt2Executor","alt2ExecutorCity","alt2ExecutorProvince"],
    question: "Would you like to add a second alternate executor? If yes, provide Full name; City; Province. If not, reply 'no second alternate'."
  },
  {
    key: "witnessesPack",
    paths: ["witness1","witness1Address","witness2","witness2Address"],
    question: "Witnesses: please provide Witness 1 full name; Witness 1 address; Witness 2 full name; Witness 2 address."
  },
  {
    key: "spousalFlagsPack",
    paths: ["foreignWills","marriage","intendedSpouse","divorce","spouseName"],
    question: "A few yes/no items. Do you have wills in another jurisdiction you want to keep in force (yes/no)? Are you making this in contemplation of marriage (yes/no; if yes, spouse’s name)? Should gifts to your spouse remain valid even if you later divorce (yes/no; if yes, spouse’s name)?"
  },
  {
    key: "executorStructurePack",
    paths: ["executor.structure"],
    question: "How should executors serve? Choose one: (1) Single executor + 1 alternate; (2) Two co-executors act together; (3) Two co-executors act independently; (4) Single executor + 2 alternates (must act together); (5) Single executor + 2 alternates (may act independently). Reply with 1–5."
  },
  {
    key: "giftsPack",
    paths: ["gifts[].gift","gifts[].recipient"],
    question: "Do you have specific gifts before residue? If yes, list like lines of 'item -> recipient'. Example: 'car -> Pat Green' and '10000 -> John Blue'. If none, say 'no gifts'."
  },
  {
    key: "residuePack",
    paths: ["residue.strategy","residueRecipients[].name","residueRecipients[].shares","residueList"],
    question: "Who gets the rest of your estate? Options: executor / children / siblings / list (equal shares) / shares (custom). If 'list', give the names (comma-separated). If 'shares', give lines: 'name -> shares'."
  },
  {
    key: "fallbackPack",
    paths: ["fallback.strategy","fallbackRecipients[].name","fallbackRecipients[].shares","fallbackList","fallbackPerson"],
    question: "Second choice if your first choice can’t receive the residue: options: person (name), children, siblings, list (equal), shares (custom). Provide the names as needed."
  },
  {
    key: "catastrophePack",
    paths: ["catastrophe.strategy","catastropheRecipients[].name","catastropheRecipients[].shares","catastropheList","catastrophePerson"],
    question: "If at any time a portion isn’t otherwise disposed of, who should receive it? Options: person (name), children, siblings, list (equal), shares (custom)."
  },
  {
    key: "perStirpesPack",
    paths: ["myChild","anyPerson"],
    question: "If someone dies before final distribution, should their children take their share? Options: (1) Only for your children, (2) For any beneficiary, (3) No. Reply 1, 2, or 3."
  },
  {
    key: "disabilityScreenPack",
    paths: ["hensonBenificiary","pronounOfBeneficiary","hensonAmount","altHensonTrustee","altHensonTrusteeCity","altHensonTrusteeProvince"],
    question: "Do any beneficiaries have a significant disability or receive disability benefits? If yes, give: beneficiary name; their pronouns; amount to set aside (number); trustee name; trustee city; trustee province (or code). If none, say 'no'."
  },
  {
    key: "lifeTenantPack",
    paths: ["lifeTenant","lifeTenantPronoun","residentialAddress","lifeTenant.strategy","lifeTenantDistributeList","lifeTenantTransferRecipiant"],
    question: "Do you want to let someone live in a residence for their lifetime? If yes, give: person’s name; their pronouns; property address; and what should happen after (choose: 'distribute list', 'transfer to X', or 'add to residue'). If 'distribute list', provide names (comma-separated). If 'transfer to', provide the recipient’s name."
  },
  {
    key: "petsPack",
    paths: ["petCare","petCareAmount"],
    question: "Do you want to set aside funds for pet care? If yes, provide the amount (number). If none, say 'no'."
  },
  {
    key: "omittedPack",
    paths: ["omittedName","omittedNamePronoun","independentSelfSufficient","substantialLifetimeSupport","supportDescription","prolongedEstrangement","prioritizing","priorityNames","strongFinancialPosition"],
    question: "If you plan to omit or limit provision for a person, give their name and pronouns (if any), and pick any reasons that apply: independent/self-sufficient; substantial lifetime support (describe); prolonged estrangement; prioritizing others (list names); already in strong financial position. You can say 'skip' if not needed."
  }
];

// ========= Default order =========
const DEFAULT_FIELD_ORDER = [
  // Identify + sign context
  "testator","testatorCity","testatorProvince","pronoun",
  "signingCity","signingMonth","signingDay","signingYear",

  // Executors + structure
  "executor","executorCity","executorProvince",
  "executor.structure",
  "altExecutor","altExecutorCity","altExecutorProvince",
  "alt2Executor","alt2ExecutorCity","alt2ExecutorProvince",

  // Spousal / foreign flags
  "foreignWills","marriage","intendedSpouse","divorce","spouseName",

  // Gifts
  "gifts[].gift","gifts[].recipient",

  // Residue / fallback / catastrophe
  "residue.strategy","residueList","residueRecipients[].name","residueRecipients[].shares",
  "fallback.strategy","fallbackPerson","fallbackList","fallbackRecipients[].name","fallbackRecipients[].shares",
  "catastrophe.strategy","catastrophePerson","catastropheList","catastropheRecipients[].name","catastropheRecipients[].shares",

  // Per stirpes preferences
  "myChild","anyPerson",

  // Disability / Henson-like screening
  "hensonBenificiary","pronounOfBeneficiary","hensonAmount",
  "altHensonTrustee","altHensonTrusteeCity","altHensonTrusteeProvince",

  // Life tenancy
  "lifeTenant","lifeTenantPronoun","residentialAddress","lifeTenant.strategy",
  "lifeTenantDistributeList","lifeTenantTransferRecipiant",

  // Pets
  "petCare","petCareAmount",

  // Omitted rationale
  "omittedName","omittedNamePronoun","independentSelfSufficient","substantialLifetimeSupport",
  "supportDescription","prolongedEstrangement","prioritizing","priorityNames","strongFinancialPosition",

  // Witnesses last
  "witness1","witness1Address","witness2","witness2Address"
];

const DEFAULT_QUESTIONS = {
  "testator": "What is your full legal name as it should appear on the will?",
  "testatorCity": "What city do you live in?",
  "testatorProvince": "What province do you live in? (full name or 2-letter code)",
  "pronoun": "What pronouns should we use in your will? (he/him, she/her, they/them — or your preference)",
  "signingCity": "What city will you sign the will in?",
  "signingMonth": "In what month will you sign the will? (name or number 1–12)",
  "signingDay": "On what day of the month will you sign the will? (1–31)",
  "signingYear": "In what year will you sign the will?",
  "executor": "Executor’s full name?",
  "executorCity": "Executor’s city?",
  "executorProvince": "Executor’s province (full name or 2-letter code)?",
  "altExecutor": "Alternate executor’s full name (or 'none')?",
  "altExecutorCity": "Alternate executor’s city?",
  "altExecutorProvince": "Alternate executor’s province?",
  "alt2Executor": "Second alternate’s full name (or 'none')?",
  "alt2ExecutorCity": "Second alternate’s city?",
  "alt2ExecutorProvince": "Second alternate’s province?",
  "foreignWills": "Do you have wills in another jurisdiction you want to keep in force (yes/no)?",
  "marriage": "Are you making this will in contemplation of marriage (yes/no)? If yes, what's their name?",
  "intendedSpouse": "Name of the intended spouse (if applicable)?",
  "divorce": "Should gifts to your spouse remain valid even if you later divorce (yes/no)? If yes, spouse name?",
  "spouseName": "Spouse’s name (if applicable)?"
};

// ========= Allowlist helpers =========
function pathAllowed(path) {
  const normalized = String(path).replace(/\[\d+\]/g, "[]");
  return ALLOWED_PATHS.has(normalized) && !HARD_BANNED_FIELDS.has(normalized);
}

// ========= Store path utils =========
function applyUpdates(store, updates) {
  for (const u of updates || []) {
    if (!u || !u.path || !pathAllowed(u.path)) continue;
    const parts = u.path.split(".");
    let cur = store;
    for (let i=0;i<parts.length;i++) {
      const p = parts[i];
      const arrMatch = p.match(/^(\w+)\[(\d+)\]$/);
      if (arrMatch) {
        const key = arrMatch[1], idx = Number(arrMatch[2]);
        cur[key] = Array.isArray(cur[key]) ? cur[key] : [];
        cur[key][idx] = cur[key][idx] || {};
        if (i === parts.length-1) cur[key][idx] = u.value; else cur = cur[key][idx];
      } else {
        if (i === parts.length-1) cur[p] = u.value; else { cur[p] = cur[p] || {}; cur = cur[p]; }
      }
    }
  }
}
function getValByPath(obj, path) {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    const m = p.match(/^(\w+)\[(\d+)\]$/);
    if (m) {
      const key = m[1], idx = Number(m[2]);
      if (!cur || !Array.isArray(cur[key]) || cur[key][idx] === undefined) return undefined;
      cur = cur[key][idx];
    } else {
      cur = cur ? cur[p] : undefined;
    }
    if (cur === undefined || cur === null) return undefined;
  }
  return cur;
}
const isMissing = (store, path) => {
  const v = getValByPath(store, path);
  return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
};

// ========= Validation & reprompts =========
function yesNoToBool(v) {
  const t = String(v || "").trim().toLowerCase();
  if (["y","yes","true","1"].includes(t)) return true;
  if (["n","no","false","0","none"].includes(t)) return false;
  return null;
}
function toMoneyNumber(v) {
  const cleaned = String(v || "").replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isFinite(num) && num > 0 ? num : null;
}
function validate(path, raw, store) {
  const val = typeof raw === "string" ? raw.trim() : raw;

  // Names
  if (/^(testator|executor|altExecutor|alt2Executor|hensonBenificiary|altHensonTrustee|lifeTenant|fallbackPerson|catastrophePerson|witness1|witness2|omittedName)$/.test(path)) {
    if (!val || typeof val !== "string" || !isAlphaSpaceDash(val)) {
      return { ok: false, reprompt: "Please enter the full name using letters, spaces, - or ' only.", value: null };
    }
    return { ok: true, value: titleCase(val) };
  }
  if (path === "pronoun" || path === "lifeTenantPronoun" || path === "omittedNamePronoun" || path === "pronounOfBeneficiary") {
    if (!val || typeof val !== "string") {
      return { ok: false, reprompt: "Please enter pronouns (e.g., he/him, she/her, they/them).", value: null };
    }
    return { ok: true, value: normalizePronoun(val) };
  }
  // City-like (must not be a province)
  if (/^(testatorCity|signingCity|executorCity|altExecutorCity|alt2ExecutorCity)$/.test(path)) {
    if (!val || typeof val !== "string" || !isAlphaSpaceDash(val)) {
      return { ok: false, reprompt: "City should be letters/spaces only. Example: Halifax", value: null };
    }
    if (looksLikeProvince(val)) {
      return { ok: false, reprompt: "That looks like a province. Please give the CITY (e.g., Halifax).", value: null };
    }
    return { ok: true, value: titleCase(val) };
  }
  // Province-like
  if (/^(testatorProvince|executorProvince|altExecutorProvince|alt2ExecutorProvince|altHensonTrusteeProvince)$/.test(path)) {
    const norm = normalizeProvince(val);
    if (!norm) return { ok: false, reprompt: "Please enter a Canadian province (full name or 2-letter code).", value: null };
    return { ok: true, value: norm };
  }
  // Witness addresses: allow numbers and commas
  if (/^(witness1Address|witness2Address)$/.test(path)) {
    if (!val || typeof val !== "string" || val.length < 4) {
      return { ok: false, reprompt: "Please provide a full mailing address.", value: null };
    }
    return { ok: true, value: val.trim() };
  }

  // Yes/No flags
  if (/^(foreignWills|marriage|divorce|petCare|independentSelfSufficient|substantialLifetimeSupport|prolongedEstrangement|prioritizing|strongFinancialPosition)$/.test(path)) {
    const b = yesNoToBool(val);
    if (b === null) return { ok: false, reprompt: "Please answer yes or no.", value: null };
    return { ok: true, value: b };
  }

  // Executor structure (1-5)
  if (path === "executor.structure") {
    const t = String(val || "").trim();
    const map = { "1":"single_plus_alt", "2":"co_joint", "3":"co_independent", "4":"single_plus_two_alts_joint", "5":"single_plus_two_alts_independent" };
    const code = map[t] || t;
    if (!["single_plus_alt","co_joint","co_independent","single_plus_two_alts_joint","single_plus_two_alts_independent"].includes(code)) {
      return { ok: false, reprompt: "Please reply 1–5 to choose the executor structure.", value: null };
    }
    return { ok: true, value: code };
  }

  // Month/day/year
  if (path === "signingMonth") {
    const m = normalizeMonth(val);
    if (!m) return { ok: false, reprompt: "Please enter the month by name or number 1–12. Example: June or 6.", value: null };
    return { ok: true, value: m };
  }
  if (path === "signingDay") {
    const n = parseInt(val, 10);
    if (!Number.isInteger(n) || n < 1 || n > 31) return { ok: false, reprompt: "Please enter a valid day of the month (1–31).", value: null };
    return { ok: true, value: String(n) };
  }
  if (path === "signingYear") {
    const n = parseInt(val, 10);
    const yr = new Date().getFullYear();
    if (!Number.isInteger(n) || n < yr - 1 || n > yr + 5) {
      return { ok: false, reprompt: `Please enter a year between ${yr - 1} and ${yr + 5}.`, value: null };
    }
    return { ok: true, value: String(n) };
  }

  // Gifts basic
  if (/^gifts\[\d+\]\.(gift|recipient)$/.test(path)) {
    if (!val || typeof val !== "string") return { ok: false, reprompt: "Please enter a non-empty value.", value: null };
    return { ok: true, value: val.trim() };
  }

  // Disability/Henson
  if (path === "hensonAmount") {
    const num = toMoneyNumber(val);
    if (!num) return { ok: false, reprompt: "Please provide a positive amount (e.g., 50000).", value: null };
    return { ok: true, value: `${Math.round(num)}` };
  }

  // Life tenant address & choices
  if (path === "residentialAddress") {
    if (!val || typeof val !== "string" || val.length < 6) return { ok: false, reprompt: "Please provide the full property address.", value: null };
    return { ok: true, value: val.trim() };
  }
  if (path === "lifeTenant.strategy") {
    const t = String(val || "").toLowerCase();
    if (!["distribute list","transfer","transfer to x","add to residue","residue"].some(x => t.includes(x))) {
      return { ok: false, reprompt: "After their lifetime, choose: 'distribute list', 'transfer to <name>', or 'add to residue'.", value: null };
    }
    if (t.includes("distribute")) return { ok: true, value: "distribute" };
    if (t.includes("transfer")) return { ok: true, value: "transfer" };
    return { ok: true, value: "residue" };
  }

  // Residue/fallback/catastrophe strategies
  if (/^(residue|fallback|catastrophe)\.strategy$/.test(path)) {
    const t = String(val || "").toLowerCase();
    const allowed = ["executor","children","siblings","list","shares","person"];
    const hit = allowed.find(k => t.includes(k));
    if (!hit) return { ok: false, reprompt: "Choose one: executor / children / siblings / list (equal) / shares (custom) / person (named).", value: null };
    return { ok: true, value: hit };
  }

  // Lists & shares text fields
  if (/^(residueList|fallbackList|catastropheList)$/.test(path)) {
    if (!val || typeof val !== "string") return { ok: false, reprompt: "Please provide a comma-separated list of names.", value: null };
    return { ok: true, value: val.trim() };
  }
  if (/^(residueRecipients|fallbackRecipients|catastropheRecipients)\[\d+\]\.(name|shares)$/.test(path)) {
    const isName = path.endsWith(".name");
    if (isName) {
      if (!val || typeof val !== "string" || !isAlphaSpaceDash(val)) {
        return { ok: false, reprompt: "Please enter the person's full name (letters/spaces only).", value: null };
      }
      return { ok: true, value: titleCase(val) };
    } else {
      const n = parseInt(val, 10);
      if (!Number.isInteger(n) || n <= 0) return { ok: false, reprompt: "Shares must be a positive whole number.", value: null };
      return { ok: true, value: String(n) };
    }
  }

  // Money
  if (path === "petCareAmount") {
    const num = toMoneyNumber(val);
    if (!num) return { ok: false, reprompt: "Please provide a positive amount (e.g., 2000).", value: null };
    return { ok: true, value: `${Math.round(num)}` };
  }

  // Omitted rationale texts
  if (path === "supportDescription" || path === "priorityNames") {
    if (!val || typeof val !== "string") return { ok: false, reprompt: "Please provide a brief description.", value: null };
    return { ok: true, value: val.trim() };
  }

  // Default: accept non-empty
  if (!val || (typeof val === "string" && !val.trim())) return { ok: false, reprompt: "Please provide a valid response.", value: null };
  return { ok: true, value: val };
}

// Packs: targeted follow-ups (e.g., signing date with "today/tomorrow" context)
function packForPath(path) { return PACKS.find(p => p.paths.includes(path)) || null; }

function contextualSigningQuestion(store) {
  const { y, m, d } = nowInTZParts(TIME_ZONE);
  const today = `${MONTHS[m-1]} ${d}, ${y}`;
  const tmr = addDaysUTC({ y, m, d }, 1);
  const tomorrow = `${MONTHS[tmr.m-1]} ${tmr.d}, ${tmr.y}`;
  const haveCity = getValByPath(store, "signingCity");
  const missing = ["signingCity","signingMonth","signingDay","signingYear"].filter(p => isMissing(store, p));
  if (missing.length === 3 && haveCity) {
    return `I’ve recorded the city as “${haveCity}”. Now please give Month; Day; Year. Today in Toronto is ${today}; tomorrow is ${tomorrow}. Example: August; 13; 2025`;
  }
  if (missing.length === 4) {
    return `Where and when will you sign your will? City; Month; Day; Year. Today in Toronto is ${today}; tomorrow is ${tomorrow}. Example: Halifax; June; 14; 2025`;
  }
  return "Please provide the remaining signing details (Month; Day; Year).";
}

function nextQuestionFromDefault(store) {
  for (const path of DEFAULT_FIELD_ORDER) {
    if (isMissing(store, path)) {
      const pack = packForPath(path);
      if (pack) {
        const remaining = pack.paths.filter(p => isMissing(store, p));
        if (remaining.length) {
          const q = pack.key === "signingPack" ? contextualSigningQuestion(store) : pack.question;
          return { paths: remaining, question: q, type: "string", choices: null };
        }
      }
      return { paths: [path], question: DEFAULT_QUESTIONS[path] || `Please provide: ${path}`, type: "string", choices: null };
    }
  }
  return null;
}

// Apply + validate; handle special paths that *derive* multiple booleans/fields
function validateAndApplyUpdates(store, updates) {
  const invalids = [];
  const applied = [];

  for (const u of updates || []) {
    if (!u || !u.path || !pathAllowed(u.path)) continue;

    // Pre-normalize relative date when user typed today/tomorrow into signing text
    if (["signingMonth","signingDay","signingYear"].includes(u.path)) {
      // handled by validate()
    }

    const res = validate(u.path, u.value, store);
    if (!res.ok) { invalids.push({ path: u.path, reprompt: res.reprompt || "Please try again." }); continue; }

    // Special: executor.structure → set booleans
    if (u.path === "executor.structure") {
      const code = res.value;
      store.executorOne = false; store.executorTwo = false; store.executorThree = false;
      store.altExecutorOne = false; store.altExecutorTwo = false; store.altExecutorThree = false;

      if (code === "single_plus_alt") { store.executorOne = true; store.altExecutorOne = true; }
      if (code === "co_joint") { store.executorTwo = true; }
      if (code === "co_independent") { store.executorThree = true; }
      if (code === "single_plus_two_alts_joint") { store.executorOne = true; store.altExecutorTwo = true; }
      if (code === "single_plus_two_alts_independent") { store.executorOne = true; store.altExecutorThree = true; }
      store.executor = store.executor || ""; // ensure key exists
      applied.push({ path: u.path, value: code });
      continue;
    }

    // Special: lifeTenant.strategy → set lifeTenantDistribute/Transfer/Rest booleans
    if (u.path === "lifeTenant.strategy") {
      store.lifeTenantDistribute = res.value === "distribute";
      store.lifeTenantTransfer = res.value === "transfer";
      store.lifeTenantRest = res.value === "residue";
      applied.push({ path: u.path, value: res.value });
      continue;
    }

    // Regular application
    applyUpdates(store, [{ path: u.path, value: res.value }]);
    applied.push({ path: u.path, value: res.value });
  }

  // Derivations (keep template booleans consistent)
  deriveTemplateFlags(store);

  return { applied, invalids };
}

// Derive all template booleans/fields from strategies & presence
function deriveTemplateFlags(store) {
  // gifts: gift vs giftList
  const giftsArr = Array.isArray(store.gifts) ? store.gifts.filter(g => g && g.gift && g.recipient) : [];
  store.gift = giftsArr.length === 1;
  store.giftList = giftsArr.length > 1;

  // petCare
  store.petCare = !!store.petCare && !!store.petCareAmount;

  // hensonTrust if beneficiary present
  store.hensonTrust = !!store.hensonBenificiary;

  // altAltExecutor: if second alternate present AND we did not select the 2-alternate structures
  const hasAlt2 = !!store.alt2Executor;
  const twoAltChosen = !!store.altExecutorTwo || !!store.altExecutorThree;
  store.altAltExecutor = hasAlt2 && !twoAltChosen;

  // residue strategy → booleans + text helpers
  setStrategyFlags(store, "residue");
  setStrategyFlags(store, "fallback");
  setStrategyFlags(store, "catastrophe");
}

function parseListToArray(listStr) {
  return String(listStr || "")
    .split(",")
    .map(s => titleCase(s.trim()))
    .filter(Boolean);
}
function setStrategyFlags(store, key) {
  const strat = getValByPath(store, `${key}.strategy`);
  const base = {
    toExecutor: false, toChildren: false, toSiblings: false, toList: false, shares: false
  };
  const flagMap = {
    residue: ["residueToExecutor","residueToChildren","residueToSiblings","residueToList","residueShares"],
    fallback: ["fallbackToNamedPerson","fallbackToChildren","fallbackToSiblings","fallbackToList","fallbackShares"],
    catastrophe: ["catastropheToNamedPerson","catastropheToChildren","catastropheToSiblings","catastropheToList","catastropheShares"]
  }[key];

  // reset
  const [fExec,fChild,fSib,fList,fShares] = flagMap;
  store[fExec] = store[fChild] = store[fSib] = store[fList] = store[fShares] = false;

  if (!strat) return;

  if (key === "residue") {
    if (strat === "executor") store[fExec] = true;
    if (strat === "children") store[fChild] = true;
    if (strat === "siblings") store[fSib] = true;
    if (strat === "list") { store[fList] = true; /* residueList already captured */ }
    if (strat === "shares") store[fShares] = true;
  } else {
    if (strat === "person") store[fExec] = true; // reuse "named person" slot
    if (strat === "children") store[fChild] = true;
    if (strat === "siblings") store[fSib] = true;
    if (strat === "list") store[fList] = true;
    if (strat === "shares") store[fShares] = true;
  }
}

// ========= Relative date pre-application for signing =========
function preApplyRelativeDateForSigning(store, lastQuestionMeta, userAnswer) {
  if (!lastQuestionMeta || !Array.isArray(lastQuestionMeta.paths)) return [];
  const needsDate = ["signingMonth","signingDay","signingYear"].some(p => lastQuestionMeta.paths.includes(p) && isMissing(store, p));
  if (!needsDate) return [];
  const rel = expandRelativeDateInText(userAnswer);
  if (!rel) return [];
  return [
    { path: "signingMonth", value: MONTHS[rel.m-1] },
    { path: "signingDay", value: String(rel.d) },
    { path: "signingYear", value: String(rel.y) }
  ];
}

// ========= Prompts =========
const SYSTEM = `
You are an intake assistant for creating a Canadian will.
- Speak plainly; avoid legal jargon (never say "Henson Trust" to the user).
- Extract multiple values when the user provides them (e.g., "Jane Smith; Halifax; NS").
- If the user uses relative dates like "today" or "tomorrow", convert them to absolute dates in the America/Toronto timezone.
- Output ONLY JSON (no prose).
`;
function plannerUserPrompt(intro) {
  return `
Create a dynamic intake plan from this brief: ${intro || "Start"}.
Plain-language rules:
- Never ask the user about "Henson Trust". Instead, screen with disability/benefits questions and fill the fields accordingly.
- Bundle related details into one question (e.g., "name; city; province").
Return ONLY JSON like:
{
  "modules": [
    {"key":"core","fields":["testator","testatorCity","testatorProvince","pronoun","signingCity","signingMonth","signingDay","signingYear"]},
    {"key":"executors","fields":["executor","executorCity","executorProvince","executor.structure","altExecutor","altExecutorCity","altExecutorProvince","alt2Executor","alt2ExecutorCity","alt2ExecutorProvince"]},
    {"key":"spousal","fields":["foreignWills","marriage","intendedSpouse","divorce","spouseName"]},
    {"key":"gifts","fields":["gifts[]: {gift, recipient}"]},
    {"key":"residue","fields":["residue.strategy","residueList","residueRecipients[]: {name, shares}"]},
    {"key":"fallback","fields":["fallback.strategy","fallbackPerson","fallbackList","fallbackRecipients[]: {name, shares}"]},
    {"key":"catastrophe","fields":["catastrophe.strategy","catastrophePerson","catastropheList","catastropheRecipients[]: {name, shares}"]},
    {"key":"perStirpes","fields":["myChild","anyPerson"]},
    {"key":"disability","fields":["hensonBenificiary","pronounOfBeneficiary","hensonAmount","altHensonTrustee","altHensonTrusteeCity","altHensonTrusteeProvince"]},
    {"key":"lifeTenant","fields":["lifeTenant","lifeTenantPronoun","residentialAddress","lifeTenant.strategy","lifeTenantDistributeList","lifeTenantTransferRecipiant"]},
    {"key":"pets","fields":["petCare","petCareAmount"]},
    {"key":"omitted","fields":["omittedName","omittedNamePronoun","independentSelfSufficient","substantialLifetimeSupport","supportDescription","prolongedEstrangement","prioritizing","priorityNames","strongFinancialPosition"]},
    {"key":"witnesses","fields":["witness1","witness1Address","witness2","witness2Address"]}
  ],
  "order":["core","executors","spousal","gifts","residue","fallback","catastrophe","perStirpes","disability","lifeTenant","pets","omitted","witnesses"]
}
`;
}
function turnUserPrompt({ plan, store, lastQuestionMeta, userAnswer, nowISO }) {
  const allowed = Array.from(ALLOWED_PATHS);
  const banned = Array.from(HARD_BANNED_FIELDS);
  return `
ALLOWED_FIELD_PATHS: ${JSON.stringify(allowed)}
HARD_BANNED_FIELDS: ${JSON.stringify(banned)}
CURRENT_DATE_TORONTO: ${nowISO}

Guidelines:
- Treat USER_ANSWER as primarily answering LAST_QUESTION_META.paths (one or many).
- Extract as many allowed fields as the answer includes (e.g., "Jane Smith; Halifax; NS").
- Convert relative dates ("today","tomorrow") to absolute Month/Day/Year using CURRENT_DATE_TORONTO.
- Ask only plain-language questions; do not mention legal jargon.
- If only part of a pack was answered (e.g., City only), propose a targeted follow-up for remaining pieces.
- Output ONLY JSON (no prose).

Given:
PLAN: ${JSON.stringify(plan)}
CURRENT_STORE: ${JSON.stringify(store)}
LAST_QUESTION_META: ${JSON.stringify(lastQuestionMeta)}
USER_ANSWER: ${JSON.stringify(userAnswer)}

Return ONLY JSON:
{
  "store_updates": [ {"path":"executor","value":"Jamie Smith"}, {"path":"executorCity","value":"Halifax"} ],
  "missing_fields": [
    {
      "path":"signingMonth",
      "question":"I’ve recorded the city. Now please provide Month; Day; Year. Example: August; 13; 2025",
      "type":"string",
      "choices": null
    }
  ],
  "complete": false,
  "notes": "brief rationale"
}
`;
}

// ========= Public API =========
async function startIntake(intro = "start") {
  const plan = await askClaude(
    [{ role: "system", content: SYSTEM }, { role: "user", content: plannerUserPrompt(intro) }]
  ).then(ensureJson);

  const store = {};
  let lastQuestionMeta = null;

  const now = nowInTZParts(TIME_ZONE);
  const turnJson = await askClaude(
    [{ role: "system", content: SYSTEM },
     { role: "user", content: turnUserPrompt({ plan, store, lastQuestionMeta, userAnswer: "", nowISO: now.iso }) }]
  ).then(ensureJson);

  const { invalids } = validateAndApplyUpdates(store, turnJson.store_updates);

  if (invalids.length) {
    const inv = invalids[0];
    lastQuestionMeta = { paths: [inv.path], question: inv.reprompt, type: "string", choices: null };
  } else {
    lastQuestionMeta = nextQuestionFromDefault(store);
  }

  const done = !lastQuestionMeta;

  return {
    plan,
    store,
    lastQuestionMeta: lastQuestionMeta || null,
    question: lastQuestionMeta ? lastQuestionMeta.question : null,
    expect: lastQuestionMeta ? lastQuestionMeta.type : null,
    choices: lastQuestionMeta ? lastQuestionMeta.choices : null,
    done
  };
}

async function continueIntake(session, userAnswer) {
  const { plan } = session;
  const store = session.store || {};
  let lastQuestionMeta = session.lastQuestionMeta || null;

  // Pre-apply relative date if answering the signing pack
  const pre = preApplyRelativeDateForSigning(store, lastQuestionMeta, userAnswer);
  if (pre.length) validateAndApplyUpdates(store, pre);

  const now = nowInTZParts(TIME_ZONE);
  const turnJson = await askClaude(
    [{ role: "system", content: SYSTEM },
     { role: "user", content: turnUserPrompt({ plan, store, lastQuestionMeta, userAnswer, nowISO: now.iso }) }]
  ).then(ensureJson);

  const before = JSON.stringify(store);
  const { invalids } = validateAndApplyUpdates(store, turnJson.store_updates);
  const after = JSON.stringify(store);

  // If nothing updated and only one path was asked, try saving user text with validation
  if (before === after && lastQuestionMeta && Array.isArray(lastQuestionMeta.paths) && lastQuestionMeta.paths.length === 1) {
    const p = lastQuestionMeta.paths[0];
    if (pathAllowed(p) && isMissing(store, p) && typeof userAnswer === "string" && userAnswer.trim()) {
      const res = validate(p, userAnswer.trim(), store);
      if (!res.ok) invalids.unshift({ path: p, reprompt: res.reprompt });
      else applyUpdates(store, [{ path: p, value: res.value }]);
      deriveTemplateFlags(store);
    }
  }

  if (invalids.length) {
    const inv = invalids[0];
    // If a signing date part is invalid and user used a relative phrase, explain expectations
    const rel = expandRelativeDateInText(userAnswer);
    let reprompt = inv.reprompt;
    if (!rel && /signing(Month|Day|Year)/.test(inv.path)) {
      const { y, m, d } = now;
      const today = `${MONTHS[m-1]} ${d}, ${y}`;
      const tmr = addDaysUTC({ y, m, d }, 1);
      const tomorrow = `${MONTHS[tmr.m-1]} ${tmr.d}, ${tmr.y}`;
      reprompt = `Please give an exact date as Month; Day; Year (e.g., August; 13; 2025). Today in Toronto is ${today}; tomorrow is ${tomorrow}. Relative phrases like “next month” are ambiguous.`;
    }
    lastQuestionMeta = { paths: [inv.path], question: reprompt, type: "string", choices: null };
  } else {
    // If we’re inside a pack, continue remaining fields; else move forward
    if (lastQuestionMeta && Array.isArray(lastQuestionMeta.paths) && lastQuestionMeta.paths.length > 1) {
      const remaining = lastQuestionMeta.paths.filter(p => isMissing(store, p));
      if (remaining.length > 0) {
        const q = remaining.some(p => p.startsWith("signing"))
          ? contextualSigningQuestion(store)
          : lastQuestionMeta.question;
        lastQuestionMeta = { paths: remaining, question: q, type: "string", choices: null };
      } else {
        lastQuestionMeta = nextQuestionFromDefault(store);
      }
    } else {
      lastQuestionMeta = nextQuestionFromDefault(store);
    }
  }

  const done = !lastQuestionMeta;

  return {
    store,
    lastQuestionMeta: lastQuestionMeta || null,
    done,
    question: lastQuestionMeta ? lastQuestionMeta.question : null,
    expect: lastQuestionMeta ? lastQuestionMeta.type : null,
    choices: lastQuestionMeta ? lastQuestionMeta.choices : null
  };
}

module.exports = { startIntake, continueIntake };
