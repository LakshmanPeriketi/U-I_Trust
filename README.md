# U&I Trust Platform

A donation-matching platform connecting **Donors** with verified **NGOs**, overseen by **Admins**.

## Project Structure

```
uandi-trust/
├── client/        # React + Vite frontend
└── server/        # Express + MongoDB backend
```

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB running locally or Atlas URI

### Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Running the App

```bash
# Start backend (from /server)
npm run dev

# Start frontend (from /client)
npm run dev
```

The client runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:5000`.

## Roles

| Role  | Description |
|-------|-------------|
| Donor | Lists donations, views NGO requirements, tracks matches |
| NGO   | Registers, posts requirements, confirms receipts |
| Admin | Vets NGOs, manages users, configures quotas |
