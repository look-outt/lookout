from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.models import Questionnaire

@api_view(["GET"])
def get_questionnaire(request):
    try:
        uid = request.GET.get("uid")
        if not uid:
            return Response({"error": "uid missing"}, status=400)

        try:
            q = Questionnaire.objects.get(user__uid=uid)
            data = {
                "vibe": q.vibe,
                "niches": q.niches,
                "content_styles": q.content_styles,
                "tones": q.tones,
                "endgames": q.endgames,
                "summary": q.summary,
            }
            return Response({"status": "success", "data": data})
        except Questionnaire.DoesNotExist:
            return Response({"status": "success", "data": None})

    except Exception as e:
        return Response({"error": str(e)}, status=500)
