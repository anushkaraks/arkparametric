# Ark (Arcutis) - Real-Time Income Stabilization Engine

Building a financial safety net for gig workers using AI, real-time data, and automated payouts for disruption-driven income loss. A parametric income protection platform for gig workers, offering dynamic premium calculation, automated disruption detection, and zero-touch claim processing.

## 🚀 Features
- **Dynamic Premium Calculation**: Weekly premium adjusted via Gemini ML based on hyper-local risk factors.
- **Automated Trigger Engine**: Real-time evaluation of Open-Meteo weather APIs (Rain, Heat, AQI) to detect disruptions automatically.
- **Zero-Touch Claims**: Instantly generated claims and payout simulations when disruption thresholds are breached.

## 🛠️ Tech Stack
- **Backend:** FastAPI, PostgreSQL, Redis, Celery (Alembic for migrations)
- **Frontend:** React, Vite, TailwindCSS (PWA-enabled)
- **Deployment:** Docker & docker-compose

## 🐳 Quick Start (Docker)

1. Clone the repository and navigate into the `Ark` directory.
2. Initialize environment variables from template:
   ```bash
   cp .env.example .env
   ```
3. Start the application stack:
   ```bash
   docker-compose up --build -d
   ```
4. Access the applications:
   - Frontend: `http://localhost:5173`
   - Backend API Docs: `http://localhost:8000/docs`

## 🧪 Demo Mode

The application includes a Demo Mode panel in the dashboard, enabling users to mock conditions that trigger parametric payout logic without waiting for real-world phenomena.
