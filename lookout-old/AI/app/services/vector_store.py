"""
VectorStoreService — loads LinkedIn post datasets from local cache.
If HF_DATASET_REPO is set and any CSV is missing/stale, downloads fresh
copies from that Hugging Face dataset repository using huggingface_hub.
"""
from pathlib import Path
from typing import Optional

import pandas as pd
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from langchain_openai import AzureOpenAIEmbeddings
from ..core.config import settings

# Files expected inside the HF dataset repo
HF_CSV_FILES = [
    "linkedin_multiple_posts.csv",
    "hooks.csv",
    "frameworks.csv",
    "cta.csv",
]

def _download_datasets_from_hf(local_dir: Path) -> None:
    """
    Download all CSV files from the configured Hugging Face dataset repo
    into `local_dir`.  Silently skips if HF_DATASET_REPO is not set.
    """
    if not settings.HF_DATASET_REPO:
        return

    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        print("WARNING: huggingface_hub not installed — skipping HF download. Run: pip install huggingface_hub")
        return

    local_dir.mkdir(parents=True, exist_ok=True)
    token = settings.HF_TOKEN or None

    for filename in HF_CSV_FILES:
        dest = local_dir / filename
        try:
            downloaded = hf_hub_download(
                repo_id=settings.HF_DATASET_REPO,
                filename=filename,
                repo_type="dataset",
                token=token,
                local_dir=str(local_dir),
                local_dir_use_symlinks=False,
            )
            print(f"Downloaded {filename} from HF → {downloaded}")
        except Exception as e:
            print(f"WARNING: Could not download {filename} from HF ({e}). Using local copy if available.")


def _needs_download(csv_path: Path) -> bool:
    """Return True if the CSV does not exist yet."""
    return not csv_path.exists()


class VectorStoreService:
    def __init__(self):
        self.index_dir = Path(settings.FAISS_INDEX_PATH)
        self.dataset_path = Path(settings.LINKEDIN_POSTS_CSV_PATH)

        # Attempt HF download before loading if the main CSV is missing
        if _needs_download(self.dataset_path):
            _download_datasets_from_hf(self.dataset_path.parent)

        self.embeddings = AzureOpenAIEmbeddings(
            azure_deployment=settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
            openai_api_key=settings.AZURE_OPENAI_API_KEY,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            openai_api_version=settings.AZURE_OPENAI_API_VERSION,
        )
        self.vector_store = self._load_or_create_vector_store()

    def _load_or_create_vector_store(self) -> Optional[FAISS]:
        index_file = self.index_dir / "index.faiss"
        store_file = self.index_dir / "index.pkl"

        if index_file.exists() and store_file.exists():
            if not self.dataset_path.exists() or index_file.stat().st_mtime >= self.dataset_path.stat().st_mtime:
                return FAISS.load_local(
                    str(self.index_dir),
                    self.embeddings,
                    allow_dangerous_deserialization=True,
                )

        if self.dataset_path.exists():
            return self._build_vector_store_from_csv(self.dataset_path)

        self.index_dir.mkdir(parents=True, exist_ok=True)
        return None

    def _build_vector_store_from_csv(self, csv_path: Path) -> Optional[FAISS]:
        if not csv_path.exists():
            return None

        df = pd.read_csv(csv_path)
        if df.empty:
            return None

        content_col_candidates = ["content", "post_content", "text", "body"]
        content_col = next((c for c in content_col_candidates if c in df.columns), None)
        if content_col is None:
            raise ValueError(
                f"CSV must contain one of {content_col_candidates}. Found: {list(df.columns)}"
            )

        documents = []
        for _, row in df.iterrows():
            content = row.get(content_col)
            if pd.isna(content) or str(content).strip() == "":
                continue
            metadata = {
                key: ("" if pd.isna(value) else str(value))
                for key, value in row.items()
                if not pd.isna(value)
            }
            documents.append(Document(page_content=str(content), metadata=metadata))

        if not documents:
            return None

        self.index_dir.mkdir(parents=True, exist_ok=True)
        self.vector_store = FAISS.from_documents(documents, self.embeddings)
        self.vector_store.save_local(str(self.index_dir))
        return self.vector_store

    def load_posts_from_csv(self, csv_path):
        return self._build_vector_store_from_csv(Path(csv_path))

    def _ensure_vector_store(self):
        if self.vector_store is None:
            self.vector_store = self._load_or_create_vector_store()
        return self.vector_store

    def search_similar_posts(self, query, k=3):
        store = self._ensure_vector_store()
        if not store:
            return []
        return store.similarity_search(query, k=k)