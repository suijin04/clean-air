# CleanAir AI
### Real-Time Air Quality Intelligence

CleanAir AI is a modern, responsive environmental monitoring dashboard that allows users to monitor real-time air quality, criteria pollutants, historical trends, and monitoring stations across major cities globally. It features an integrated AI Assistant powered by Groq, grounded strictly in live sensor telemetry and the US EPA Air Quality Index standard.

---

## 🌟 Key Features

1. **Live Air Quality Dashboard**: Displays primary AQI hero card, current health categories, dominant pollutants, and live synchronization timestamps.
2. **Criteria Pollutant Monitoring**: Comprehensive cards for **PM2.5, PM10, NO₂, SO₂, CO, and O₃** with units (\(\mu g/m^3\) and \(mg/m^3\)) and threshold comparison.
3. **Major Cities Catalog**: Real-time summaries across key Indian (*Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad, Dehradun*) and International (*London, New York, Paris, Tokyo, Singapore, Dubai, Los Angeles, Toronto, Sydney*) metropolitan areas.
4. **City Details & Historical Analytics**: In-depth city views with interactive Recharts time-series trends (24 hours, 7 days, 30 days) and monitoring station details.
5. **Multi-City Comparison**: Side-by-side matrix and visual bar charts comparing up to 5 cities simultaneously.
6. **Station Geospatial Map**: Interactive Leaflet & OpenStreetMap visualization plotting real monitoring sensor coordinates.
7. **CleanAir AI Assistant**: Conversational assistant powered by Groq providing grounded explanations of air quality, pollutant risks, and mitigation strategies without hallucination or medical diagnoses.
8. **Responsible AI & Ethics Page**: Clear documentation of data provenance, AI grounding, scientific limitations, and zero-leakage credential protection.
9. **Resilient Data Architecture**: Transparent handling of missing parameters (`No current measurement` / `AQI Unavailable`) and graceful fallback between live OpenAQ API and demo data.

---

## 🏗️ Architecture

```
                    ┌─────────────────────────┐
                    │  React + Vite Frontend  │
                    │   (Tailwind & Recharts) │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     FastAPI Backend     │
                    │  (Port 8000 /api proxy) │
                    └───────┬─────────┬───────┘
                            │         │
              ┌─────────────┘         └─────────────┐
              ▼                                     ▼
    ┌──────────────────┐                  ┌──────────────────┐
    │  OpenAQ REST v3  │                  │     Groq API     │
    │  (Air Telemetry) │                  │  (Llama-3.3-70b) │
    └──────────────────┘                  └──────────────────┘
```

> **Security Note**: React never touches or exposes API keys. All credentials (`OPENAQ_API_KEY`, `GROQ_API_KEY`) remain strictly server-side.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React, Leaflet, OpenStreetMap
- **Backend**: Python 3.10+, FastAPI, Uvicorn, httpx, Pydantic v2, python-dotenv
- **Data Provider**: OpenAQ API v3
- **AI Provider**: Groq API (`llama-3.3-70b-versatile`)

---

## 📐 AQI Calculation Methodology

CleanAir AI implements the **United States Environmental Protection Agency (US EPA)** standard.

### Formula:
$$I = \frac{I_{\text{high}} - I_{\text{low}}}{C_{\text{high}} - C_{\text{low}}} \times (C - C_{\text{low}}) + I_{\text{low}}$$

Where:
- $I$ = Air Quality Sub-Index
- $C$ = Pollutant concentration
- $[C_{\text{low}}, C_{\text{high}}]$ = Concentration breakpoint category
- $[I_{\text{low}}, I_{\text{high}}]$ = AQI index breakpoint range

### Categories:
- **0 – 50**: Good (Green)
- **51 – 100**: Moderate (Amber)
- **101 – 150**: Unhealthy for Sensitive Groups (Orange)
- **151 – 200**: Unhealthy (Red)
- **201 – 300**: Very Unhealthy (Purple)
- **301 – 500+**: Hazardous (Maroon)

*If sufficient pollutant data is missing to calculate an AQI, the application displays `AQI Unavailable` while still presenting whatever raw pollutant measurements exist.*

---

## 🚀 Getting Started (Windows)

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

---

### Step 1: Clone or Navigate to Project Directory
```powershell
cd c:\CA2
```

---

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in the project root:
```powershell
copy .env.example .env
```

Open `.env` and fill in your API keys:
```env
PORT=8000
OPENAQ_API_KEY=your_openaq_api_key_here
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```
> *Note: If keys are left blank, the application will automatically run in Demo/Mock Mode with realistic test data so you can test all features immediately.*

---

### Step 3: Start the Backend Server

```powershell
cd backend
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000`  
Swagger API Documentation: `http://localhost:8000/docs`

---

### Step 4: Start the Frontend Development Server

Open a new PowerShell terminal:
```powershell
cd c:\CA2\frontend
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, OpenAQ/Groq status |
| `GET` | `/api/cities` | List of major cities with summary AQI |
| `GET` | `/api/air-quality/{city}` | Full air quality snapshot and pollutant cards |
| `GET` | `/api/air-quality/{city}/latest` | Latest pollutant telemetry |
| `GET` | `/api/air-quality/{city}/history` | Historical pollutant measurements |
| `GET` | `/api/stations` | Ground monitoring stations with coordinates |
| `GET` | `/api/trends/{city}` | Timeseries trend points, averages, min/max |
| `POST` | `/api/chat` | Groq AI assistant with live context grounding |

---

## 🤝 Responsible AI & Transparency

1. **No Data Fabrication**: We never generate artificial live readings or imaginary station locations.
2. **Grounding**: The AI assistant is provided with the current city's live sensor data packet as explicit system context.
3. **Medical Disclaimer**: Air quality intelligence is for informational and environmental awareness purposes only and does not substitute for clinical medical advice.
