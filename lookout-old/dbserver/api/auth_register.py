# backend/api/auth_register.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from firebase_config import auth, db

@api_view(["POST"])
def register_with_token(request):
    """
    Frontend creates the user using Firebase createUserWithEmailAndPassword.
    Then sends id_token here.
    """

    id_token = request.data.get("id_token")

    if not id_token:
        return Response({"error": "ID token missing"}, status=400)

    try:
        decoded = auth.verify_id_token(id_token)
        uid = decoded["uid"]
        
        email = decoded.get("email")
        name = decoded.get("name", "New User")

        # insert into your Firestore users collection
        db.collection("users").document(uid).set({
            "email": email,
            "name": name,
            "provider": "email/password"
        }, merge=True)

        return Response({"uid": uid})

    except Exception as e:
        return Response({"error": str(e)}, status=400)
