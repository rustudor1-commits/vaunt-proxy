const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const VAUNT_BASE = "https://api.vaunt.ro/v1/external";

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "VAUNT Proxy", timestamp: new Date().toISOString() });
});

app.all("/api/*", async (req, res) => {
  const vauntPath = req.path.replace("/api", "");
  const queryString = new URLSearchParams(req.query).toString();
  const vauntUrl = `${VAUNT_BASE}${vauntPath}${queryString ? "?" + queryString : ""}`;

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header lipsa" });
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(vauntUrl, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`[Proxy Error] ${req.method} ${vauntUrl}:`, err.message);
    res.status(500).json({ error: "Eroare proxy", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`VAUNT Proxy pornit pe portul ${PORT}`);
});
