# 📊 Vestra & Orta Real-Time Analytics Dashboard

![Status](https://img.shields.io/badge/Status-Live-success)
![Stack](https://img.shields.io/badge/Stack-Next.js_|_Supabase_|_n8n-black)
![License](https://img.shields.io/badge/License-MIT-blue)

A full-stack, autonomous crypto analysis dashboard designed to monitor **Vestra DAO (VSTR)** and **Orta (ORTA)** tokens in real-time. This project demonstrates a complete **Modern Data Stack** implementation, moving beyond simple API calls to a self-hosted, automated cloud architecture.

🔗 **Live Demo:** [Click Here to View Dashboard](https://orta-vstr-crypto-dashboard-qgh2.vercel.app/)

---

## 🏗️ System Architecture & Workflow

Unlike traditional dashboards that fetch data on client-side page loads, this system uses an **autonomous background pipeline**.

**The Data Journey:**
1.  🤖 **Ingest (n8n & Railway):** Self-hosted robots wake up every 30 seconds to fetch global market data from CoinGecko API.
2.  💾 **Store (Supabase):** Raw data is normalized, processed, and securely stored in a PostgreSQL database.
3.  ⚡ **Serve (Realtime):** The Next.js frontend subscribes to database changes via WebSockets, updating prices instantly without page refreshes.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 14 (App Router), Tailwind CSS, Recharts
* **Backend:** Supabase (PostgreSQL + Realtime Engine)
* **DevOps:** n8n (Self-Hosted Workflow Automation), Docker
* **Infrastructure:** Railway (Cloud Hosting), Vercel

---

## 🚀 Key Features

* ✅ **Autonomous Pipeline:** Runs 24/7 on the cloud, independent of local machines.
* ✅ **Zero Latency:** WebSocket integration for instant price reflection.
* ✅ **Time-Series Analysis:** Dynamic filtering (1H, 24H, 7D) for historical trends.
* ✅ **Modern UI:** Glassmorphism design with a responsive "Bento Grid" layout.

---

## 📦 Getting Started (Local Development)

To run this project locally:

```bash
# 1. Clone the repository
git clone https://github.com/akifkeklik/orta-vstr-crypto-dashboard.git

# 2. Install dependencies
npm install

# 3. Create .env.local file and add Supabase keys
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 4. Run the development server
npm run dev

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

📝 License
This project is open-source and available under the MIT License.

Developed by Akif Keklik
