from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime

class UserType(str, Enum):
    COPYWRITER = "copywriter"
    NORMAL = "normal"
    PRO = "pro"
    BEGINNER = "beginner"

class UserPersona(BaseModel):
    """User persona/questionnaire data from onboarding."""
    vibe: Optional[str] = None  # e.g., "Student", "Freelancer", "Founder"
    niches: Optional[List[str]] = None  # e.g., ["Tech & STEM", "Business & Startups"]
    content_styles: Optional[List[str]] = None  # e.g., ["short & punchy", "medium with stories"]
    tones: Optional[List[str]] = None  # e.g., ["professional", "conversational"]
    endgames: Optional[List[str]] = None  # e.g., ["land clients", "build my brand"]
    linkedin_url: Optional[str] = None
    summary: Optional[str] = None

class Client(BaseModel):
    client_id: str
    name: str
    industry: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

class PostRequest(BaseModel):
    user_id: str
    query: str
    client_id: Optional[str] = None
    user_type: Optional[UserType] = None
    model_preference: Optional[str] = "gemini"

class PostChoice(BaseModel):
    user_id: str
    post_id: str
    chosen_index: int
    client_id: Optional[str] = None

class GeneratedPost(BaseModel):
    post_id: str
    content: str
    score: Optional[float] = None

class PostResponse(BaseModel):
    posts: List[GeneratedPost]
    user_type: UserType
    similar_posts: Optional[List[str]] = None
    fallback_triggered: Optional[bool] = False

class ClientResponse(BaseModel):
    clients: List[Client]