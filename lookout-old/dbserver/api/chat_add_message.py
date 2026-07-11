from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.models import Chat, ChatMessage

@api_view(["POST"])
def add_message(request):
    uid = request.data["uid"]
    chatId = request.data["chatId"]
    sender = request.data["sender"]
    text = request.data["text"]

    try:
        chat = Chat.objects.get(id=chatId, user__uid=uid)
    except Chat.DoesNotExist:
        return Response({"error": "Chat not found"}, status=404)

    # Store message in Neon DB
    ChatMessage.objects.create(
        chat=chat,
        sender=sender,
        text=text
    )

    return Response({"status": "added"})
