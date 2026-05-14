# VAUNT Proxy Server — BLU Drumul Taberei

Server intermediar care rezolvă restricțiile CORS pentru conectarea
aplicației Agent AI la api.vaunt.ro.

---

## Deployment GRATUIT pe Render.com (10 minute)

### Pasul 1 — Urcă codul pe GitHub
1. Mergi pe [github.com](https://github.com) → **New repository**
2. Nume: `vaunt-proxy` → **Create repository**
3. Încarcă cele 2 fișiere: `server.js` și `package.json`
   - Click **Add file → Upload files**
   - Trage fișierele → **Commit changes**

### Pasul 2 — Creează serviciul pe Render
1. Mergi pe [render.com](https://render.com) → **Sign up** (gratuit cu GitHub)
2. Click **New → Web Service**
3. Conectează repository-ul `vaunt-proxy`
4. Setările serviciului:
   - **Name:** `vaunt-proxy-blu`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Click **Create Web Service**

### Pasul 3 — Copiază URL-ul
După ~2 minute, Render îți dă un URL de forma:
```
https://vaunt-proxy-blu.onrender.com
```

### Pasul 4 — Introdu URL-ul în aplicația Agent AI
În ecranul de conectare al agentului, completează câmpul
**"URL Proxy Server"** cu URL-ul de mai sus.

---

## Testare locală (opțional)

```bash
npm install
npm start
# Serverul pornește pe http://localhost:3001
```

Testează că funcționează:
```
http://localhost:3001/health
```

---

## Cum funcționează

```
Aplicație (claude.ai)
        ↓
Proxy (render.com)   ← adaugă CORS headers
        ↓
api.vaunt.ro         ← API-ul real VAUNT
```

Tokenul tău API este transmis securizat în header-ul Authorization
și nu este stocat nicăieri pe server.
