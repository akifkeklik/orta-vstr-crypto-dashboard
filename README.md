# 📊 Vestra & Orta Analytics Dashboard

![Status](https://img.shields.io/badge/Status-Live-success)
![Stack](https://img.shields.io/badge/Next.js-Supabase-black)

An autonomous, real-time crypto tracking system for **Vestra DAO** and **Orta** tokens. Built to demonstrate a **serverless cloud architecture** moving beyond simple API calls.

🔗 **Live Project:** [orta-vstr-crypto-dashboard.vercel.app](https://orta-vstr-crypto-dashboard-qgh2.vercel.app/)

---

## 🏗️ How It Works

The system runs on a 24/7 autonomous loop, ensuring data is always fresh.

```mermaid
graph LR
A[CoinGecko API] -->|JSON| B(n8n / Railway)
B -->|Save| C[(Supabase DB)]
C -->|Realtime| D[Next.js Dashboard]
Automated: n8n robots fetch data every 30 seconds (Self-Hosted).

Storage: Historical data is saved in PostgreSQL.

Live: Frontend updates instantly via WebSockets.

⚡ Tech Stack
Core: Next.js 14, Tailwind CSS

Data: Supabase (PostgreSQL + Realtime)

DevOps: n8n (Self-Hosted), Railway, Docker

🛠️ Quick Start
Bash
git clone [https://github.com/akifkeklik/orta-vstr-crypto-dashboard.git](https://github.com/akifkeklik/orta-vstr-crypto-dashboard.git)
npm install
npm run dev
Built by Akif Keklik
