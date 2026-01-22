# 📊 Vestra & Orta – Real-Time Crypto Analytics Dashboard

![Status](https://img.shields.io/badge/Status-Live-success)
![Stack](https://img.shields.io/badge/Stack-Next.js_|_Supabase_|_n8n-black)
![License](https://img.shields.io/badge/License-MIT-blue)

A full-stack, autonomous crypto analytics platform designed to monitor  
**Vestra DAO (VSTR)** and **Orta (ORTA)** tokens in real time.

This project demonstrates a complete **Modern Data Stack** implementation — moving beyond simple client-side API calls into a fully automated, event-driven cloud architecture.

🔗 **Live Demo:**  
👉 https://orta-vstr-crypto-dashboard-qgh2.vercel.app/

---

## 🧠 System Architecture

Unlike traditional dashboards that fetch data directly from the browser, this system operates as a fully autonomous background pipeline.

### 🔄 Data Flow

1. 🤖 **Ingest – n8n (Self-Hosted on Railway)**  
   Background workers periodically fetch market data from the CoinGecko API.

2. 💾 **Store – Supabase (PostgreSQL + Realtime)**  
   Data is normalized, processed, and securely stored.

3. ⚡ **Stream – WebSockets (Realtime Subscriptions)**  
   Frontend automatically receives updates without refresh.

4. 🌐 **Serve – Next.js (Vercel)**  
   Optimized SSR + API proxy layer with caching and rate-limit protection.

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 14 (App Router)
- Tailwind CSS
- Recharts

**Backend**
- Supabase (PostgreSQL, Realtime Engine)

**Automation & DevOps**
- n8n (Workflow Automation)
- Docker
- Railway (Cloud Workers)
- Vercel (Frontend Hosting)

---

## 🚀 Key Features

- ✅ Autonomous Data Pipeline – Runs 24/7 independently of local machines  
- ✅ Realtime Updates – Instant price updates via WebSockets  
- ✅ Historical Analytics – Time-series filtering (1H, 24H, 7D, etc.)  
- ✅ API Proxy & Caching Layer – Server-side CoinGecko proxy with ISR  
- ✅ Modern UI/UX – Glassmorphism + responsive Bento layout  
- ✅ Production Ready Architecture – CI/CD enabled deployment  


