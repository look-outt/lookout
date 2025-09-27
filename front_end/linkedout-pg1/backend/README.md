# Waitlist Backend (Node.js + SQLite)

## Setup
1. Open a terminal in the `backend` folder.
2. Run:
   ```sh
   npm install
   npm start
   ```
3. The server will run at `http://localhost:4000`.

## API
- **POST /api/waitlist**
  - Body: `{ "name": "Your Name", "email": "your@email.com" }`
  - Adds a new entry to the waitlist database.

## Database
- SQLite file: `waitlist.db` (created automatically)
