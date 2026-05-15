const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const VAUNT_BASE = "https://api.vaunt.ro/v1/external";

app.use(cors());
app.use(express.json());

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "VAUNT Proxy", timestamp: new Date().toISOString() });
});

// ── CHAT (Anthropic API) ──────────────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  const { system, messages, max_tokens } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages lipseste sau invalid" });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: max_tokens || 1000,
        system: system || "",
        messages,
      }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("[Chat Error]:", err.message);
    res.status(500).json({ error: "Eroare chat", details: err.message });
  }
});

// ── VAUNT API ─────────────────────────────────────────────────────────────────
app.all("/api/*", async (req, res) => {
  const vauntPath = req.path.replace("/api", "");
  const { agency_uuid, ...restParams } = req.query;
  const queryString = new URLSearchParams(restParams).toString();
  const vauntUrl = `${VAUNT_BASE}${vauntPath}${queryString ? "?" + queryString : ""}`;

  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Authorization header lipsa" });
  if (!agency_uuid) return res.status(400).json({ error: "agency_uuid lipsa" });

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        "Authorization": authHeader,
        "agency-uuid": agency_uuid,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Language": "ro",
      },
    };
    if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    console.log(`[VAUNT] ${req.method} ${vauntUrl}`);
    const response = await fetch(vauntUrl, fetchOptions);
    const data = await response.json();
    console.log(`[VAUNT] -> ${response.status}`);
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`[VAUNT Error]:`, err.message);
    res.status(500).json({ error: "Eroare proxy", details: err.message });
  }
});

app.listen(PORT, () => console.log(`VAUNT Proxy pornit pe portul ${PORT}`));

  if (!authHeader) return res.status(401).json({ error: "Authorization header lipsa" });
  if (!agency_uuid) return res.status(400).json({ error: "agency_uuid lipsa" });

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        "Authorization": authHeader,
        "agency-uuid": agency_uuid,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Language": "ro",
      },
    };
    if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    console.log(`[VAUNT] ${req.method} ${vauntUrl}`);
    const response = await fetch(vauntUrl, fetchOptions);
    const data = await response.json();
    console.log(`[VAUNT] -> ${response.status}`);
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`[VAUNT Error]:`, err.message);
    res.status(500).json({ error: "Eroare proxy", details: err.message });
  }
});

app.listen(PORT, () => console.log(`VAUNT Proxy pornit pe portul ${PORT}`));

