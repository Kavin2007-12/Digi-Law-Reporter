# ⚖️ Digi Law Reporter — Enterprise Legal Research & Precedents Platform

**Author / Maintainer:** [Kavin2007-12](https://github.com/Kavin2007-12)  
**Version:** 2.4.0  
**Stack:** React 19 + Vite + Node.js/Express + PostgreSQL 18 + Flutter/Capacitor Mobile  

---

## 📁 Repository Overview

This repository contains the full production codebase for **Digi Law Reporter**:

```text
lawyer site/
├── digital-lawyer-app-main/    # Full Stack Core Application
│   ├── frontend/               # Vite + React 19 + Tailwind CSS Web Portal
│   ├── backend/                # Node.js + Express + PostgreSQL 18 REST API
│   └── mobile/                 # Flutter / Multi-Platform Mobile Application
├── privacy policy/             # Standalone & Play Store Compliant Privacy Policy Package
└── child safety/               # Standalone & Families Policy Compliant Child Safety Package
```

---

## 🚀 Getting Started

### 1. Database Setup (PostgreSQL 18)
- Ensure PostgreSQL is running on `localhost:5432` with database `digi_law_reporter`.

### 2. Backend Setup
```bash
cd digital-lawyer-app-main/backend
npm install
node server.js
```
*Backend API runs on `http://localhost:5000`*

### 3. Frontend Setup
```bash
cd digital-lawyer-app-main/frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🏛️ Legal & App Store Compliance Packages
- **Privacy Policy**: Located in `/privacy policy/index.html` (DPDP Act 2023, IT Act 2000, In-Memory Zero Storage Guarantee).
- **Child Safety Policy**: Located in `/child safety/index.html` (POCSO Act 2012, Juvenile Justice Act 2015, Google Play Families Policy).
