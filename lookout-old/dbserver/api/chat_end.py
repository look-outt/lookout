from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.models import Chat

@api_view(["POST"])
def end_chat(request):
    uid = request.data["uid"]
    chatId = request.data["chatId"]

    try:
        chat = Chat.objects.get(id=chatId, user__uid=uid)
        chat.is_finished = True
        chat.save()
        return Response({"status": "ended"})
    except Chat.DoesNotExist:
        return Response({"error": "Chat not found"}, status=404)
