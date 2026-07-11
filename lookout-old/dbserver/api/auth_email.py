"""
Simple email/password authentication views.
These replace the Firebase-based auth since the frontend does not use Firebase Auth SDK.
"""
import secrets
import hashlib
from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.models import User


def _hash_password(password: str) -> str:
    """Hash a password using SHA-256 for basic protection."""
    return hashlib.sha256(password.encode()).hexdigest()


def _generate_token() -> str:
    """Generate a secure random token."""
    return secrets.token_urlsafe(32)


@api_view(["POST"])
def register_user(request):
    """Register a new user with email and password."""
    email = request.data.get("email", "")
    password = request.data.get("password", "")
    name = request.data.get("name", "")

    if not email or not password:
        return Response({"error": "Email and password are required"}, status=400)

    # Check if user already exists in Neon DB
    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered"}, status=409)

    # Generate a unique user ID
    uid = secrets.token_urlsafe(20)
    token = _generate_token()

    # Store user in Neon DB
    user = User.objects.create(
        uid=uid,
        email=email,
        name=name or "User",
        password_hash=_hash_password(password),
        provider="email/password",
    )

    return Response({
        "user": {"id": user.uid, "name": user.name, "email": user.email},
        "token": token,
    })


@api_view(["POST"])
def login_user(request):
    """Authenticate user with email and password."""
    email = request.data.get("email", "")
    password = request.data.get("password", "")

    if not email or not password:
        return Response({"error": "Email and password are required"}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Invalid email or password"}, status=401)

    if user.password_hash != _hash_password(password):
        return Response({"error": "Invalid email or password"}, status=401)

    token = _generate_token()

    return Response({
        "user": {
            "id": user.uid,
            "name": user.name or "User",
            "email": user.email,
        },
        "token": token,
    })
