from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.models import User, Questionnaire

@api_view(["POST"])
def save_questionnaire(request):
    try:
        uid = request.data.get("uid")
        if not uid:
            return Response({"error": "uid missing"}, status=400)

        try:
            user = User.objects.get(uid=uid)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Save or update the questionnaire in DB
        Questionnaire.objects.update_or_create(
            user=user,
            defaults={
                "vibe": request.data.get("vibe"),
                "niches": request.data.get("niches", []),
                "content_styles": request.data.get("content_styles", []),
                "tones": request.data.get("tones", []),
                "endgames": request.data.get("endgames", []),
                "summary": request.data.get("summary"),
            }
        )

        return Response({"status": "saved"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)
