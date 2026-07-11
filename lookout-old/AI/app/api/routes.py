from fastapi import APIRouter, HTTPException, Request
from ..models.schemas import PostRequest, PostResponse, PostChoice, ClientResponse, GeneratedPost, UserType
from ..services.llm_service import LLMService
from ..services.vector_store import VectorStoreService
from ..services.firebase_service import firebase_service
from ..core.rate_limit import limiter
from ..core.config import settings
from ..core.gemini_usage_tracker import GeminiUsageTracker
import uuid

# Initialize services as singletons
gemini_tracker = GeminiUsageTracker(
    rpm_limit=settings.GEMINI_RPM_LIMIT,
    rpd_limit=settings.GEMINI_RPD_LIMIT,
)
vector_store_service = VectorStoreService()
llm_service = LLMService(vector_store_service, gemini_tracker=gemini_tracker)

router = APIRouter()

@router.post("/generate_post", response_model=PostResponse)
def generate_post(request: PostRequest):
    # Determine the effective user type for this request
    user_type = request.user_type or UserType.BEGINNER
    
    # For PRO users and copywriters, generate multiple options
    if user_type in [UserType.PRO, UserType.COPYWRITER]:
        num_posts = 2
        is_pro = True
    else:
        num_posts = 1
        is_pro = False
    
    # Fetch user persona from Firebase questionnaire data
    user_persona = firebase_service.get_user_persona(request.user_id)
    if user_persona:
        print(f"Loaded persona for user {request.user_id}: {user_persona.get('vibe', 'unknown')}")
    else:
        print(f"No persona found for user {request.user_id}, generating without personalization")
    
    # Generate the posts
    generated_posts = []
    similar_posts_text = []
    
    # Get similar posts for context
    similar_docs = vector_store_service.search_similar_posts(request.query, k=3)
    if similar_docs:
        similar_posts_text = [doc.page_content for doc in similar_docs]
    
    # Generate multiple posts if needed
    fallback_triggered = False
    for _ in range(num_posts):
        post_content, fb_triggered = llm_service.generate_post(
            query=request.query,
            client_id=request.client_id or request.user_id,  # Use client_id if available, otherwise user_id
            is_pro_user=is_pro,
            user_persona=user_persona,
            model_preference=request.model_preference
        )
        if fb_triggered:
            fallback_triggered = True
        
        # Generate a unique post ID
        post_id = str(uuid.uuid4())
        
        # Add to response list
        generated_posts.append(
            GeneratedPost(
                post_id=post_id,
                content=post_content
            )
        )
    
    return PostResponse(
        posts=generated_posts,
        user_type=user_type,
        similar_posts=similar_posts_text if similar_posts_text else None,
        fallback_triggered=fallback_triggered
    )

@router.post("/save_choice", response_model=bool)
def save_choice(choice: PostChoice):
    # Since we're not using a database, just return success
    # In a real implementation, you might log this to a file or analytics service
    return True

@router.get("/clients/{user_id}", response_model=ClientResponse)
@limiter.limit("30/minute")
def get_clients(request: Request, user_id: str):
    # Without a database, return an empty list or implement file-based storage
    return ClientResponse(clients=[])

@router.post("/clients", response_model=ClientResponse)
def create_client(user_id: str, name: str, industry: str | None = None):
    # Without a database, just return empty clients list
    # In a real implementation, you'd store this in a file or external service
    return ClientResponse(clients=[])

@router.get("/gemini_status")
def get_gemini_status():
    """Return current Gemini API usage / availability for the frontend."""
    return gemini_tracker.get_usage_status()