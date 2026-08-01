# Splitly — Expense Splitter

[![CI](https://github.com/Precious-466/ExpenseSplitter/actions/workflows/ci.yml/badge.svg)](https://github.com/Precious-466/ExpenseSplitter/actions/workflows/ci.yml)

A full-stack expense-splitting app (like Splitwise) built with **ASP.NET Core 8** and **React + TypeScript**. Create groups, log shared expenses with flexible splits, and settle up with the minimum number of payments.

## Screenshots

| Dashboard | Balances & suggested settlements |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.jpg) | ![Balances](docs/screenshots/balances.jpg) |

## Features

- **Auth** — JWT-based registration/login with BCrypt password hashing
- **Groups** — create groups, invite members by email
- **Expenses** — split equally, by exact amounts, or by percentage
- **Balances** — real-time net balance per member
- **Debt simplification** — a min-cash-flow algorithm reduces N-way group debt to the minimum number of payments needed to settle up (instead of everyone paying everyone)
- **Analytics** — spending by category and monthly trend charts
- **Settlements** — record a payment and it clears from the outstanding balances

## Architecture

```
ExpenseSplitter/
├── src/
│   ├── ExpenseSplitter.Api/              # ASP.NET Core Web API — controllers, auth, Swagger
│   ├── ExpenseSplitter.Core/             # Domain entities, DTOs, business logic (no EF/framework dependencies)
│   └── ExpenseSplitter.Infrastructure/   # EF Core DbContext, migrations, JWT/password services
├── tests/
│   └── ExpenseSplitter.Tests/            # xUnit tests for split calculation & debt simplification
└── frontend/                             # React + TypeScript (Vite), Tailwind CSS, Recharts
```

Clean separation of concerns: `Core` has zero framework dependencies, so the split-calculation and debt-simplification logic is fully unit-testable in isolation from the database and web layer.

### Key algorithm: debt simplification

Naively, an expense group ends up with a payment obligation between every pair of members who owe each other money. `DebtSimplifier` (`src/ExpenseSplitter.Core/Services/DebtSimplifier.cs`) reduces this to the minimum number of transactions using a greedy max-debtor/max-creditor matching — e.g. a 3-person group with tangled debts settles in at most 2 payments instead of up to 6.

## Tech stack

| Layer | Tech |
|---|---|
| Backend | ASP.NET Core 8, EF Core 8, SQLite, JWT auth, BCrypt |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Axios |
| Testing | xUnit |

## Running locally

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)

### Backend

```bash
cd src/ExpenseSplitter.Api
dotnet run
```

The API starts at `http://localhost:5078`, auto-applies EF Core migrations, and serves Swagger UI at `http://localhost:5078/swagger`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts at `http://localhost:5173`.

### Running with Docker Compose

```bash
docker compose up --build
```

This runs both the API (port 5078) and frontend (port 5173) in containers, no local .NET/Node install required.

### Running tests

```bash
dotnet test
```

## Configuration

The JWT secret in `src/ExpenseSplitter.Api/appsettings.json` is a placeholder for local development only. For any real deployment, override it via an environment variable or `dotnet user-secrets` — never commit a real secret.

## API overview

| Endpoint | Description |
|---|---|
| `POST /api/auth/register`, `/login` | Auth |
| `GET/POST /api/groups` | List / create groups |
| `POST /api/groups/{id}/members` | Add a member by email |
| `GET/POST /api/groups/{groupId}/expenses` | List / add expenses |
| `GET /api/groups/{id}/balances` | Net balances + suggested settlements |
| `POST /api/groups/{id}/settlements` | Record a payment |
| `GET /api/groups/{groupId}/analytics/by-category` | Spending breakdown |
| `GET /api/groups/{groupId}/analytics/monthly` | Monthly trend |

Full interactive docs at `/swagger` when the API is running.
