from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.models import Chat

@api_view(["GET"])
def get_messages(request, uid, chatId):
    try:
        chat = Chat.objects.get(id=chatId, user__uid=uid)
    except Chat.DoesNotExist:
        return Response({"error": "Chat not found"}, status=404)

    # Fetch messages ordered by timestamp
    messages_qs = chat.messages.all().order_by("timestamp")
    messages = []
    for msg in messages_qs:
        messages.append({
            "sender": msg.sender,
            "text": msg.text,
            "timestamp": msg.timestamp.isoformat()
        })

    return Response({
        "is_finished": chat.is_finished,
        "messages": messages
    })
