import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api.routes import router
from app.core.rate_limit import limiter
from slowapi.errors import RateLimitExceeded

app = FastAPI(title="LinkedIn Post Generator API")
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Try again soon."},
    )

# Build allow-origins list from environment variable
origins_env = os.environ.get("CORS_ALLOWED_ORIGINS", "")
if origins_env:
    allowlisted = [o.strip() for o in origins_env.split(",") if o.strip()]
else:
    # Default to localhost for development + production Vercel URL
    allowlisted = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://lookoutt.vercel.app",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowlisted,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Mount static files directory
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

app.include_router(router, tags=["posts"])

@app.get("/")
@limiter.limit("30/minute")
def root(request: Request):
    return {"message": "Welcome to LinkedIn Post Generator API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
    )
