# 🪙 Gold Arbitrage Panel

**Live Demo:** [https://gold-arbitrage-panel.onrender.com](https://gold-arbitrage-panel.onrender.com)

Gold Arbitrage Panel is a professional financial analysis tool designed to track real-time gold prices and identify arbitrage opportunities. It compares **Gold Certificates (Sertifika)** against **Physical Gold** and calculates the spread to help users make informed investment decisions.

The application features a "Guaranteed Data Engine" that switches to mathematical modeling if live market data is unavailable (e.g., weekends or market closures), ensuring the dashboard never appears broken.

## 🚀 Key Features

* **Real-Time Data Tracking:** Fetches live gold price data from Yahoo Finance (Global XAU/USD & BIST).
* **Arbitrage Analysis:** Automatically calculates the spread between global physical gold value and local certificate prices.
* **Fail-Safe Engine:** Automatically generates fallback data during market closures or API outages.
* **Interactive Charts:** Zoomable and dynamic charts powered by Plotly.
* **Mobile-Ready:** Fully responsive UI built with Streamlit.

---

## 🛠️ Installation & Usage

### Option 1: Standard Installation (General)

If you have Python installed and added to your PATH:

```bash
# 1. Clone the repository
git clone [https://github.com/akifkeklik/gold-arbitrage-panel.git](https://github.com/akifkeklik/gold-arbitrage-panel.git)
cd gold-arbitrage-panel

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the application
streamlit run app.py
