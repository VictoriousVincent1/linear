# Linear

## Setup

Install dependencies from each workspace:

```bash
npm install
cd client && npm install
cd ../server && npm install
```

Run both apps from the root:

```bash
npm run dev
```

## Project Structure

- `client/` contains the Vite frontend.
- `server/` contains the Express API.
- SQLite data is stored at `server/db/project.db`.
- The backend runs on port `5001` by default because `5000` is commonly occupied on macOS.

## Environment

Copy `server/.env.example` to `server/.env` and adjust values as needed.
