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

  // agency_uuid vine din query params -> trebuie trimis ca header la VAUNT
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

    console.log(`[Proxy] ${req.method} ${vauntUrl}`);
    const response = await fetch(vauntUrl, fetchOptions);
    const data = await response.json();
    console.log(`[Proxy] -> ${response.status}`);
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`[Proxy Error]:`, err.message);
    res.status(500).json({ error: "Eroare proxy", details: err.message });
  }
});

app.listen(PORT, () => console.log(`VAUNT Proxy pornit pe portul ${PORT}`));
