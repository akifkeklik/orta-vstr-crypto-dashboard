Haklısın, o hatayı vermesinin sebebi Mermaid (şema) kodunun içine düz yazı karışması. GitHub bunu render edemediği için o kırmızı hatayı fırlattı.

Hem o hatayı düzelttim hem de yazıyı jilet gibi sadeleştirdim. Gereksiz her şeyi attım.

Bunu kopyala, README.md dosyasının içindekileri sil ve tek seferde yapıştır.

Markdown
# 📊 Vestra & Orta Real-Time Analytics

![Status](https://img.shields.io/badge/Status-Active-success)
![Stack](https://img.shields.io/badge/Stack-Next.js_|_Supabase_|_n8n-black)

A self-hosted, autonomous crypto dashboard monitoring **Vestra DAO** and **Orta** tokens in real-time. Moving beyond client-side fetching, this project utilizes a **cloud-native pipeline** for 24/7 data persistence.

🔗 **Live Demo:** [Click Here](https://orta-vstr-crypto-dashboard-qgh2.vercel.app/)

---

## 🏗️ Architecture

```mermaid
graph LR
A[CoinGecko API] -->|JSON| B(n8n / Railway)
B -->|Save| C[(Supabase DB)]
C -->|WebSocket| D[Next.js UI]
Ingest: n8n robots (Dockerized) fetch data every 30 seconds.

Store: Data is normalized and stored in PostgreSQL.

Serve: Frontend updates instantly via Supabase Realtime.

🛠️ Tech Stack
Core: Next.js 14, Tailwind CSS, TypeScript.

Backend: Supabase (PostgreSQL + Realtime).

DevOps: n8n (Self-Hosted), Docker, Railway.

🚀 Key Features
✅ Autonomous Pipeline: Runs 24/7 on the cloud.

✅ Real-Time: Zero-latency updates via WebSockets.

✅ Time-Series: 1H, 24H, 7D historical data analysis.

📦 Run Locally
Bash
git clone [https://github.com/akifkeklik/orta-vstr-crypto-dashboard.git](https://github.com/akifkeklik/orta-vstr-crypto-dashboard.git)
npm install
npm run dev
Developed by Akif Keklik
