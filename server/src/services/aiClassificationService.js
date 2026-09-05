const env = require("../config/env");

const VALID_CATEGORIES = [
  "Classroom",
  "Lab",
  "Hostel",
  "Wi-Fi/Network",
  "Infrastructure",
  "Transportation",
  "Cleanliness",
  "Other",
];

const VALID_PRIORITIES = ["low", "medium", "high", "critical"];

const CATEGORY_DESCRIPTIONS = {
  Classroom: "classroom issues like fans, lights, furniture, projectors, AC",
  Lab: "computer lab, science lab, equipment issues",
  Hostel: "hostel room, dormitory, mess, water supply, cleanliness",
  "Wi-Fi/Network": "internet connectivity, Wi-Fi, network issues",
  Infrastructure: "building, plumbing, electrical, campus infrastructure",
  Transportation: "bus, shuttle, parking, campus transport",
  Cleanliness: "cleaning, waste management, hygiene, pest control",
  Other: "anything not covered by the above categories",
};

const SYSTEM_PROMPT = `You are a complaint classification assistant for a college campus complaint system.

Your task is to analyze a student complaint and return a JSON object with:
1. category: One of the allowed categories
2. priority: One of the allowed priorities
3. summary: A one-sentence summary of the complaint (max 100 chars)
4. tags: An array of 2-5 relevant keyword tags (lowercase, max 20 chars each)

ALLOWED CATEGORIES:
${VALID_CATEGORIES.map((c) => `- ${c}: ${CATEGORY_DESCRIPTIONS[c]}`).join("\n")}

ALLOWED PRIORITIES:
- low: Minor cosmetic issue, no impact on daily life
- medium: Needs attention but not urgent
- high: Significantly impacts studies or living conditions
- critical: Emergency, immediate action required (safety hazard, complete service outage)

RULES:
- Return ONLY valid JSON, no markdown, no explanation
- Category MUST be exactly one of the allowed values
- Priority MUST be exactly one of the allowed values
- Summary must be concise and factual
- Tags must be lowercase single words or short phrases
- If unclear, default to "Other" category and "medium" priority

Respond with JSON only in this exact format:
{"category":"...","priority":"...","summary":"...","tags":["...","..."]}`;

function buildUserPrompt(title, description) {
  return `Classify this complaint:

Title: ${title}

Description: ${description}

Return JSON only.`;
}

function validateAndSanitize(result) {
  let category = VALID_CATEGORIES.includes(result.category) ? result.category : "Other";
  let priority = VALID_PRIORITIES.includes(result.priority) ? result.priority : "medium";

  let summary = typeof result.summary === "string" ? result.summary.trim().slice(0, 150) : "";
  if (!summary) summary = "Complaint submitted";

  let tags = Array.isArray(result.tags)
    ? result.tags
        .filter((t) => typeof t === "string" && t.trim().length > 0)
        .map((t) => t.trim().toLowerCase().slice(0, 20))
        .slice(0, 5)
    : [];

  return { category, priority, summary, tags };
}

async function classifyWithOpenAI(title, description) {
  const apiKey = env.AI_API_KEY;
  const baseUrl = env.AI_BASE_URL || "https://api.openai.com/v1";
  const model = env.AI_MODEL || "gpt-3.5-turbo";

  if (!apiKey) {
    throw new Error("AI API key not configured");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(title, description) },
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "Unknown error");
    throw new Error(`AI API error (${response.status}): ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  return validateAndSanitize(parsed);
}

async function classifyWithLocal(title, description) {
  throw new Error(
    "Local model not configured. Set AI_PROVIDER=none or configure AI_PROVIDER=openai with an API key."
  );
}

async function classifyComplaint(title, description) {
  const provider = env.AI_PROVIDER || "none";

  if (provider === "none" || !provider) {
    throw new Error("AI classification is not enabled");
  }

  if (provider === "openai") {
    return classifyWithOpenAI(title, description);
  }

  if (provider === "local") {
    return classifyWithLocal(title, description);
  }

  throw new Error(`Unknown AI provider: ${provider}`);
}

module.exports = {
  classifyComplaint,
  VALID_CATEGORIES,
  VALID_PRIORITIES,
};
