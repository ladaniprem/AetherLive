const apiKey = process.env.AI_Credits_API_KEY;

if (!apiKey) {
  console.error("AI_Credits_API_KEY not found in env");
  process.exit(1);
}

const res = await fetch("https://api.aicredits.in/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "openai/gpt-4o",
    messages: [{ role: "user", content: "Say hello in one short sentence." }],
    stream: false,
  }),
});

console.log("Status:", res.status);
const body = await res.text();
try {
  const json = JSON.parse(body);
  console.log("Reply:", json.choices?.[0]?.message?.content ?? "(no content)");
  if (!res.ok) console.log("Error body:", body);
} catch {
  console.log("Raw body:", body);
}
