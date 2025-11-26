# 🔌 Plug-n-Pay

**x402 Powered API Subscriptions**

A developer toolkit that lets you add flexible, usage-based subscriptions to any API in minutes, powered by Avalanche x402 payment intents.

## 🚀 Current Progress

### ✅ Phase 1: Foundation & Setup
- Node.js + Express + TypeScript backend
- React + TypeScript frontend foundation  
- Project structure and configuration
- Development environment setup

### ✅ Phase 2: Database & x402 Integration
- **PostgreSQL database** with 4 core tables
- **Database services** for developers, subscriptions, and usage tracking
- **x402 Payment Service** with payment intents
- **TypeScript models** and data layer

### 🚧 Phase 3: API Routes & Middleware (Next)
- REST API endpoints for developers
- Subscription management routes
- x402 payment middleware
- Usage tracking integration

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, TypeScript, PostgreSQL
- **Blockchain:** Avalanche, x402, Ethers.js v6
- **Frontend:** React, TypeScript, Tailwind CSS (Ready for Phase 4)
- **Web3:** Wagmi, Viem

## 📦 Quick Start

```bash
# Backend
cd backend
npm install
npm run dev

# Database setup
createdb plug_n_pay
psql -U postgres -d plug_n_pay -f setup.sql

# Frontend (Phase 4)
cd frontend
npm install
npm start
