# backend/api/auth_login.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from firebase_config import auth, db

@api_view(["POST"])
def login_with_token(request):
    """
    Called AFTER Firebase email/password login.
    Frontend sends Firebase ID token.
    We verify it and create/update user entry in Firestore.
    """

    id_token = request.data.get("id_token")
    if not id_token:
        return Response({"error": "ID token required"}, status=400)

    try:
        decoded = auth.verify_id_token(id_token)
        uid = decoded["uid"]

        email = decoded.get("email")
        name = decoded.get("name", "User")

        # Same Firestore collection your app already uses
        user_ref = db.collection("users").document(uid)
        user_ref.set({
            "email": email,
            "name": name,
            "provider": "email/password"
        }, merge=True)

        return Response({"uid": uid})

    except Exception as e:
        return Response({"error": str(e)}, status=400)
