from django.urls import path
from api.questionnaire_check import check_questionnaire
from api.auth_register import register_with_token
from api.auth_google import google_login
from api.auth_login import login_with_token
from api.auth_email import register_user, login_user
from api.chat_start import start_chat
from api.chat_add_message import add_message
from api.chat_fetch import get_messages
from api.chat_end import end_chat
from api.questionnaire import save_questionnaire
from api.questionnaire_get import get_questionnaire

urlpatterns = [
    # Direct email/password auth (used by frontend)
    path("auth/email/register/", register_user),
    path("auth/email/login/", login_user),

    # Firebase-based auth (legacy, for future Firebase integration)
    path("auth/firebase/google/", google_login),
    path("auth/firebase/register/", register_with_token),
    path("auth/firebase/login/", login_with_token),

    # questionnaire
    path("questionnaire/check/", check_questionnaire),
    path("questionnaire/save/", save_questionnaire),
    path("questionnaire/get/", get_questionnaire),

    # chats
    path("chat/start/", start_chat),
    path("chat/add/", add_message),
    path("chat/get/<str:uid>/<str:chatId>/", get_messages),
    path("chat/end/", end_chat),
]
