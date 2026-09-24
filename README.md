# EmergencyAssist AI 🚑

> **Find the right help. Right when you need it.**

**EmergencyAssist AI** is a mission-critical web application that accelerates emergency response by combining user descriptions, real-time geolocation, **Google Gemini AI**, and structured medical/emergency triage heuristics to connect individuals with appropriate nearby emergency services (trauma hospitals, 24/7 pharmacies, fire departments, ambulances, blood banks, and police stations).

---

## 🌟 Key Features

### 1. AI-Powered Emergency Classification & Triage
- Users describe situations in plain natural language (e.g. *"My father has severe chest pain and difficulty breathing"*, *"Bike accident with bleeding"*).
- Direct integration with **Google Gemini (`@google/genai`)** returning structured JSON validated strictly with **Zod**.
- Classifies:
  - **Category**: Medical, Accident, Ambulance, Pharmacy, Blood Bank, Fire, Police, General.
  - **Severity**: Critical, High, Moderate, Low, Unknown.
  - **Urgency**: Immediate, Urgent, Standard.
  - **Immediate Emergency Dispatch Advice**: Flags life-threatening cases with prominent one-tap official hotline calling buttons (911, 112, 999).
  - **Actionable AI Safety Guidance**: Step-by-step precautions while waiting for first responders.
  - **Zero-Downtime Deterministic Fallback Engine**: If the Gemini API key is missing or offline, a rule-based triage heuristic engine ensures users are never left stranded.

### 2. Verified Emergency Service Discovery
- **8 Core Service Categories**:
  - Emergency Departments & Trauma Centers
  - General Hospitals
  - 24/7 Paramedic & Mobile ICU Ambulance Dispatchers
  - All-Hours Urgent Pharmacies & Dispensaries
  - Blood & Plasma Donation / Transfusion Banks
  - Fire & Hazard Rescue Stations
  - Police & Public Safety Precincts
- **Haversine Distance Formula**: Accurate distance computation from the user's coordinates to all resources.
- **One-Touch Actions**:
  - `tel:` dialing directly to verified helpline numbers.
  - Google Maps turn-by-turn directions link.
  - Favorite bookmarking to personal profile.
- **Demo Data Transparency**: Clearly labeled sources so test records are never mistaken for real-world dispatchers.

### 3. Geolocation & Privacy-First Architecture
- Browser geolocation with `navigator.geolocation.getCurrentPosition()`.
- Manual location fallback if GPS permissions are denied.
- Full privacy controls: users can view and permanently delete their incident history and search logs at any time.

### 4. Robust Authentication & User Isolation
- Secure password hashing using **Bcrypt**.
- Session management via JWT tokens and HTTP-only cookies.
- Strict backend authorization ensuring users can only read, modify, and delete their own confidential incident reports and favorites.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, React Router 7, Lucide React icons, Vite 6 |
| **Backend** | Node.js, Express 5, TypeScript, `tsx` |
| **Database** | PostgreSQL / Replit PostgreSQL (`pg` connection pooling) + built-in fallback store |
| **AI Integration** | Google Gemini (`@google/genai`) with structured JSON schema validation |
| **Validation** | Zod (strict client and server schema enforcement) |
| **Security** | Bcrypt password hashing, JWT authentication, CORS, HTTP-only cookies |

---

## 📁 Architecture & Directory Structure

```text
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── emergency/    # Severity badges, analysis cards, safety notices
│   │   │   ├── resources/    # ResourceCard, directory filters, map links
│   │   │   ├── ui/           # Buttons, Navbar, Footer, Spinner, Error & Empty states
│   │   ├── hooks/            # useAuth, useGeolocation
│   │   ├── pages/            # Home, Emergency, Services, Details, Login, Register, Dashboard, History, Favorites, Profile
│   │   ├── services/         # Typed API client
│   │   ├── App.tsx           # Route definitions & protected routes
│   │   ├── index.css         # Tailwind & theme variables
│   │   └── main.tsx          # React DOM entrypoint
├── server/
│   ├── db/
│   │   ├── schema.sql        # PostgreSQL schema migrations
│   │   ├── seed.ts           # Development seed data labeled as Demo Data
│   │   └── index.ts          # Database adapter with dual PostgreSQL/fallback support
│   ├── middleware/
│   │   └── auth.ts           # Authentication & user authorization
│   ├── routes/
│   │   ├── auth.ts           # Register, Login, Logout, Me
│   │   ├── emergency.ts      # Analyze, Reports, History, Deletion
│   │   ├── resources.ts      # Nearby, Search, Details
│   │   ├── favorites.ts      # Add, List, Remove favorites
│   │   └── profile.ts        # Profile details, update, history wipe
│   ├── schemas/              # Zod validation schemas
│   ├── services/
│   │   └── gemini.ts         # Google Gemini integration & fallback triage engine
│   └── index.ts              # Main Express server entrypoint
├── shared/
│   └── types/                # Shared TypeScript models & interfaces
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/emergency_assist
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_jwt_session_secret_key
NODE_ENV=development
PORT=5000
```

*Note: If `DATABASE_URL` is omitted, the application automatically uses its built-in emergency local datastore so you can run and test immediately without any database setup.*

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
# Starts both the backend API server and the Vite dev server concurrently
npm run dev
```
- Backend runs at: `http://localhost:5000`
- Frontend runs at: `http://localhost:5173`
- Health check: `http://localhost:5000/api/health`

### 3. Production Build & Start
```bash
npm run build
npm start
```

---

## 🗄️ Database Setup & Migrations

If using PostgreSQL (e.g., Neon, Replit PostgreSQL, Supabase, or local Docker):
1. Provide the connection string in `DATABASE_URL`.
2. The server automatically verifies and executes `server/db/schema.sql` on startup.
3. To seed initial emergency resources manually:
```bash
npm run seed
```

---

## 🛡️ Critical Safety Notice & Medical Disclaimer

> **IMPORTANT**: EmergencyAssist AI is an assistance discovery tool designed to aid individuals in quickly identifying and locating emergency resources. **It does NOT provide medical diagnoses, prescribe medications, or replace emergency dispatchers.**
>
> If you or someone around you is experiencing a life-threatening crisis, **dial your local official emergency number immediately**:
> - **911** (United States & Canada)
> - **112** (European Union & India)
> - **999** (United Kingdom)

---

## 📄 License
MIT License. Built for public safety and emergency health preparedness.
