// netlify/functions/narrative-animate.js
// Proxies requests to Anthropic API for the Narrative Animator

const SYSTEM_PROMPT = `You are a narrative scene interpreter. Analyze the text and return ONLY valid JSON describing an animated scene. No markdown, no explanation — raw JSON only.

Schema:
{
  "title": "short evocative scene title",
  "mood": "ethereal|dark|hopeful|tense|serene|ominous|joyful|melancholic|epic|mystical",
  "timeOfDay": "day|dusk|night|dawn",
  "background": { "topColor": "#hex", "bottomColor": "#hex" },
  "stars": { "present": bool, "count": 0-200, "color": "#hex", "twinkle": bool },
  "moon": { "present": bool, "x": 0-1, "y": 0-0.5, "size": 0.04-0.15, "color": "#hex", "glow": bool },
  "sun": { "present": bool, "x": 0-1, "y": 0-0.5, "size": 0.05-0.15, "color": "#hex" },
  "clouds": { "present": bool, "count": 1-6, "color": "#hex", "opacity": 0.1-0.9, "speed": 0.1-1 },
  "mountains": { "present": bool, "count": 3-7, "color": "#hex", "snow": bool },
  "ground": { "present": bool, "color": "#hex", "y": 0.65-0.9 },
  "water": { "present": bool, "y": 0.6-0.9, "color": "#hex", "choppy": bool },
  "trees": { "present": bool, "count": 3-12, "color": "#hex", "type": "pine|oak|dead|palm", "sway": bool },
  "fog": { "present": bool, "color": "#hex", "density": 0.1-0.6 },
  "fire": { "present": bool, "x": 0.3-0.7, "color": "#hex" },
  "fireflies": { "present": bool, "count": 10-60, "color": "#hex" },
  "rain": { "present": bool, "intensity": 0.1-1, "color": "#hex" },
  "snow": { "present": bool, "intensity": 0.1-1, "color": "#hex" },
  "particles": { "present": bool, "type": "ember|dust|petal|spark|ash", "count": 20-100, "color": "#hex", "rise": bool },
  "figures": { "present": bool, "count": 1-4, "color": "#hex", "walking": bool },
  "wind": { "strength": 0-1, "direction": "left|right" }
}

Be creative and specific with colors. Match the emotional tone of the narrative precisely.`;

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { narrative } = body;
  if (!narrative || typeof narrative !== "string") {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing narrative field" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: narrative }]
      })
    });

    const data = await response.json();
    const raw = data.content?.find(b => b.type === "text")?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const scene = JSON.parse(clean);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ scene })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Scene parse failed", detail: err.message })
    };
  }
};
