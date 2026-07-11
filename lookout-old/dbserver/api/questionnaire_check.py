from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.models import Questionnaire

@api_view(["POST"])
def check_questionnaire(request):
    uid = request.data.get("uid")

    exists = Questionnaire.objects.filter(user__uid=uid).exists()

    return Response({"filled": exists})
