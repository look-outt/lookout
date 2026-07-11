# backend/api/auth_google.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from firebase_config import auth
from api.models import User

@api_view(["POST"])
def google_login(request):
    id_token = request.data.get("id_token")

    try:
        decoded = auth.verify_id_token(id_token)
        uid = decoded["uid"]
        email = decoded.get("email")
        name = decoded.get("name")

        # Create or update user in Neon DB
        user, created = User.objects.update_or_create(
            uid=uid,
            defaults={
                "email": email,
                "name": name,
                "provider": "google"
            }
        )

        return Response({"uid": uid})

    except Exception as e:
        return Response({"error": str(e)}, status=400)
