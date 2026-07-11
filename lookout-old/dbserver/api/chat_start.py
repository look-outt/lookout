import uuid
from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.models import User, Chat

@api_view(["POST"])
def start_chat(request):
    uid = request.data["uid"]

    try:
        user = User.objects.get(uid=uid)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    # Generate unique chatId
    chat_id = uuid.uuid4().hex

    chat = Chat.objects.create(
        id=chat_id,
        user=user,
        is_finished=False
    )

    return Response({"chatId": chat.id})
