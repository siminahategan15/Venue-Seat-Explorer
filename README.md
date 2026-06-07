# Venue Seat Explorer

A full-stack web application for exploring venues seat-by-seat. Users can browse
venues, drill into sections and individual seats, and see **real reviews and
photos of the view from a given seat** before choosing where to sit. Venue
admins can create and manage venues, sections and seats and manage
user-submitted reviews and media.

---

## Tech stack

| Layer    | Technology                                                       |
| -------- | ---------------------------------------------------------------- |
| Frontend | Angular 16, PrimeNG, PrimeFlex, Google Maps                      |
| Backend  | Node.js, Express 5                                               |
| Database | MongoDB (Mongoose ODM)                                           |
| Auth     | Firebase Authentication (web SDK + Admin SDK token verification) |
| Media    | Cloudinary (image/video upload & hosting)                        |
| CI       | GitHub Actions (lint both apps + production build of frontend)   |

The repository contains two independent apps that run together:

---

## Prerequisites

- **Node.js 20+** and npm
- A **MongoDB** instance (local or MongoDB Atlas connection string)
- A **Firebase** project with Authentication enabled (Email/Password)
- A **Cloudinary** account
- A **Google Maps** API key (Maps JavaScript API)

---

## Getting started

### 1. Backend

```bash
cd Backend_Venue-Seat-Explorer
npm install
```

Create a `.env` file in `Backend_Venue-Seat-Explorer/` (see
[Configuration](#configuration) below), and place your Firebase Admin service
account JSON in `config/` (it is git-ignored).

```bash
npm run dev      # start with nodemon (auto-reload)
# or
npm start        # start once with node
```

The API runs on **http://localhost:5000** by default.

### 2. Frontend

```bash
cd Frontend_Venue-Seat-Explorer
npm install
npm start        # ng serve
```

The app runs on **http://localhost:4200** and talks to the API at the `apiUrl`
defined in `src/environments/environment.ts`.

---

## Configuration

### Backend — `Backend_Venue-Seat-Explorer/.env`

| Variable            | Description                                  |
| ------------------- | -------------------------------------------- |
| `PORT`              | Port the API listens on (defaults to `5000`) |
| `MONGO_URI`         | MongoDB connection string                    |
| `CLOUDINARY_NAME`   | Cloudinary cloud name                        |
| `CLOUDINARY_KEY`    | Cloudinary API key                           |
| `CLOUDINARY_SECRET` | Cloudinary API secret                        |

In addition, the backend loads a **Firebase Admin service account** JSON file
from `config/` (referenced by `config/firebaseAdmin.js`). This file contains a
private key and **must never be committed** — the pattern
`config/*-adminsdk-*.json` is already in `.gitignore`.

---

### Frontend — `Frontend_Venue-Seat-Explorer/src/environments/environment.ts`

```ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:5000",
  googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  firebaseConfig: {
    apiKey: "YOUR_FIREBASE_WEB_API_KEY",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "...",
    measurementId: "...",
  },
};
```

---

## Available scripts

### Backend

| Command        | Description                       |
| -------------- | --------------------------------- |
| `npm start`    | Run the API with Node             |
| `npm run dev`  | Run the API with nodemon (reload) |
| `npm run lint` | Lint with ESLint                  |

### Frontend

| Command         | Description                   |
| --------------- | ----------------------------- |
| `npm start`     | Dev server (`ng serve`)       |
| `npm run build` | Production build (`ng build`) |
| `npm test`      | Unit tests (Karma + Jasmine)  |
| `npm run lint`  | Lint with Angular ESLint      |

---

## API overview

All endpoints are prefixed with `/api`. Protected routes require a Firebase ID
token in the `Authorization: Bearer <token>` header.

| Group    | Base path       | Purpose                              |
| -------- | --------------- | ------------------------------------ |
| Auth     | `/api/auth`     | Register, login, availability checks |
| Users    | `/api/users`    | User profiles                        |
| Venues   | `/api/venues`   | Venue CRUD + admin stats             |
| Sections | `/api/sections` | Section CRUD                         |
| Seats    | `/api/seats`    | Seat CRUD                            |
| Reviews  | `/api/reviews`  | Seat reviews + moderation            |
| Media    | `/api/media`    | Seat photos/videos + moderation      |
| Search   | `/api/search`   | Search venues, seats, and combined   |

See [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md) for the full endpoint
reference with request/response shapes.

---

## Continuous integration

`.github/workflows/ci.yml` runs on pushes and pull requests:

- **Backend Lint** — `npm ci` + `eslint .`
- **Frontend Lint & Build** — `npm ci` + `ng lint` + `ng build --configuration production`

---

## License

ISC (backend `package.json`). Update as appropriate for your use.
