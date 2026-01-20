# 📊 Vestra & Orta Real-Time Analytics Dashboard

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech](https://img.shields.io/badge/stack-Next.js_|_Supabase_|_n8n-black)

An autonomous, real-time crypto analysis dashboard designed to monitor **Vestra DAO (VSTR)** and **Orta (ORTA)** tokens. This project demonstrates a complete **Modern Data Stack** implementation, featuring a self-hosted cloud pipeline rather than simple client-side API calls.

🔗 **Live Demo:** [View Dashboard](https://orta-vstr-crypto-dashboard-qgh2.vercel.app/)

---

## 🏗️ System Architecture

The system operates on a 24/7 autonomous cycle, ensuring data persistence and historical analysis.

```mermaid
graph LR
A[CoinGecko API] -->|JSON| B(n8n Automation / Railway)
B -->|Processed Data| C[(Supabase PostgreSQL)]
C -->|Real-time WebSocket| D[Next.js Dashboard]
Ingest: n8n robots (Dockerized on Railway) fetch market data every 30 seconds.

Store: Data is normalized and stored in Supabase (PostgreSQL).

Serve: Frontend receives live updates via Supabase Realtime (WebSockets).

🛠️ Tech Stack
Frontend: Next.js 14 (App Router), Tailwind CSS, Recharts.

Backend: Supabase (PostgreSQL + Realtime).

Automation: n8n (Self-Hosted Workflow Automation).

Infrastructure: Railway (Cloud Hosting), Vercel.

🚀 Features
✅ Zero-Downtime Pipeline: Runs independently of local machines.

✅ Live Updates: Instant price reflection without page refreshes.

✅ Historical Data: Dynamic time-series visualization (1H, 24H, 7D).

✅ Responsive UI: Modern "Bento Grid" layout with Glassmorphism.

📦 Getting Started
Bash
# 1. Clone the repository
git clone [https://github.com/akifkeklik/orta-vstr-crypto-dashboard.git](https://github.com/akifkeklik/orta-vstr-crypto-dashboard.git)

# 2. Install dependencies
npm install

# 3. Set up environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 4. Run the development server
npm run dev
📝 License
Distributed under the MIT License. See LICENSE for more information.

Developed by Akif Keklik
