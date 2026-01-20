# 📊 Vestra & Orta Real-Time Analytics Dashboard

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech](https://img.shields.io/badge/built%20with-Next.js%20%7C%20Supabase%20%7C%20n8n-black)

A full-stack, autonomous crypto analysis dashboard designed to monitor **Vestra DAO (VSTR)** and **Orta (ORTA)** tokens in real-time. This project demonstrates a complete **Modern Data Stack** implementation, moving beyond simple API calls to a self-hosted, automated cloud architecture.

🔗 **Live Demo:** [Click Here to View Dashboard](https://orta-vstr-crypto-dashboard-qgh2.vercel.app/)

---

## 🏗️ System Architecture

Unlike traditional dashboards that fetch data on client-side page loads, this system uses an **autonomous background pipeline**.

```mermaid
graph LR
A[CoinGecko API] -- JSON Data --> B(n8n Automation / Railway)
B -- Processed Data --> C[(Supabase PostgreSQL)]
C -- Real-time WebSocket --> D[Next.js Dashboard]
Data Ingestion: Self-hosted n8n workflows (running on Railway via Docker) query the CoinGecko API every 30 seconds.

Storage: Processed market data is stored in Supabase (PostgreSQL).

Real-Time Delivery: The frontend subscribes to database changes via Supabase Realtime, updating the UI instantly without page refreshes.

🛠️ Tech Stack
Frontend: Next.js 14 (App Router), Tailwind CSS, Recharts, Framer Motion.

Backend / Database: Supabase (PostgreSQL + Realtime).

DevOps / Automation: n8n (Self-Hosted on Railway), Docker.

Infrastructure: Railway (Cloud Hosting), Vercel (Frontend Deployment).

Data Source: CoinGecko API.

🚀 Features
✅ Autonomous Data Pipeline: Runs 24/7 on the cloud, independent of local machines.

✅ Live Price Updates: WebSocket integration for instant price reflection.

✅ Time-Series Analysis: Dynamic filtering (1H, 24H, 7D) for historical data visualization.

✅ Modern UI: Glassmorphism design with responsive "Bento Grid" layout.

📦 Getting Started (Local Development)
To run this project locally:

Clone the repository:

Bash
git clone [https://github.com/akifkeklik/orta-vstr-crypto-dashboard.git](https://github.com/akifkeklik/orta-vstr-crypto-dashboard.git)
cd orta-vstr-crypto-dashboard
Install dependencies:

Bash
npm install
Set up Environment Variables: Create a .env.local file in the root directory and add your Supabase credentials:

Kod snippet'i
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
Run the development server:

Bash
npm run dev
Open http://localhost:3000 with your browser to see the result.

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

📝 License
This project is open-source and available under the MIT License.

Developed by Akif Keklik.


### 🎯 Yapman Gerekenler:

1.  Proje klasöründeki `README.md` dosyasını aç.
2.  İçindeki her şeyi sil.
3.  Yukarıdaki kodu yapıştır.
4.  Kaydet ve terminalden şu komutları gir:

```bash
git add README.md
git commit -m "docs: update readme with system architecture"
git push origin main
