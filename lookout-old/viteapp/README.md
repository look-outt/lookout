# Vite Frontend Setup

This frontend requires two backend services:

- Auth/API backend at `VITE_API_URL` (default local: `http://localhost:3001`)
- AI backend at `VITE_AI_API_URL` (default local: `http://localhost:8000`)

## Environment Configuration

Create your local env file from the template:

```bash
cp .env.development.example .env.development
```

For production builds, use:

```bash
cp .env.production.example .env.production
```

Set real values for:

- `VITE_API_URL`
- `VITE_AI_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

## Run Locally

1. Start auth backend (from `viteapp/`):

```bash
npm install
npm run server
```

2. Start AI backend (from `../AI/`):

```bash
pip install -r requirements.txt
python -m app.main
```

3. Start frontend (from `viteapp/`):

```bash
npm run dev
```

Frontend: `http://localhost:5173`
