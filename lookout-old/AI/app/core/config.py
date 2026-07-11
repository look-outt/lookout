from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    AZURE_OPENAI_API_KEY: str
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_DEPLOYMENT_NAME: str
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME: str
    AZURE_OPENAI_API_VERSION: str
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT_ENDPOINT: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None

    # Local cache paths for datasets (downloaded from Hugging Face if absent/stale)
    LINKEDIN_POSTS_CSV_PATH: str = "app/db/linkedin_multiple_posts.csv"
    HOOKS_CSV_PATH: str = "app/db/hooks.csv"
    FRAMEWORKS_CSV_PATH: str = "app/db/frameworks.csv"
    CTA_CSV_PATH: str = "app/db/cta.csv"

    FAISS_INDEX_PATH: str = "data/faiss_index"

    # Gemini free-tier rate limits (configurable via .env)
    GEMINI_RPM_LIMIT: int = 5
    GEMINI_RPD_LIMIT: int = 100
    GEMINI_MAX_RETRIES: int = 3

    # Hugging Face dataset repository
    # Set to your HF repo ID, e.g. "your-org/lookout-datasets"
    # The repo should contain: linkedin_multiple_posts.csv, hooks.csv, frameworks.csv, cta.csv
    HF_DATASET_REPO: str = ""
    # Optional: personal access token for private HF repos
    HF_TOKEN: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()