# Django models for the api app
from django.db import models

class User(models.Model):
    uid = models.CharField(max_length=255, primary_key=True)
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    password_hash = models.CharField(max_length=255, blank=True, null=True)
    provider = models.CharField(max_length=50) # 'email/password' or 'google'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} ({self.provider})"

class Questionnaire(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='questionnaire')
    vibe = models.TextField(blank=True, null=True)
    niches = models.JSONField(default=list, blank=True)
    content_styles = models.JSONField(default=list, blank=True)
    tones = models.JSONField(default=list, blank=True)
    endgames = models.JSONField(default=list, blank=True)
    summary = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Questionnaire for {self.user.email}"

class Chat(models.Model):
    id = models.CharField(max_length=100, primary_key=True) # UUID string or custom ID
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chats')
    is_finished = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat {self.id} for {self.user.email}"

class ChatMessage(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=50) # 'user' or 'ai'
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message by {self.sender} in {self.chat.id}"
