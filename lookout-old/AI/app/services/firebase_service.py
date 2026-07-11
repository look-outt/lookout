"""
Firebase service for fetching user persona/questionnaire data from Firestore.
"""

import os
from pathlib import Path
from typing import Optional, Dict, Any

import firebase_admin
from firebase_admin import credentials, firestore


class FirebaseService:
    """Service for interacting with Firebase Firestore to fetch user data."""
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not FirebaseService._initialized:
            self._initialize_firebase()
            FirebaseService._initialized = True
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK."""
        try:
            # Check if already initialized
            firebase_admin.get_app()
            self.db = firestore.client()
        except ValueError:
            # Not initialized, do it now
            # Look for service account key in multiple locations
            possible_paths = [
                Path(__file__).parent.parent.parent / "serviceAccountKey.json",
                Path(__file__).parent.parent.parent.parent / "dbserver" / "serviceAccountKey.json",
                Path(os.environ.get("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")),
            ]
            
            cred_path = None
            for path in possible_paths:
                if path.exists():
                    cred_path = path
                    break
            
            if cred_path is None:
                print("WARNING: Firebase credentials not found. User persona features will be disabled.")
                self.db = None
                return
            
            try:
                cred = credentials.Certificate(str(cred_path))
                firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                print(f"Firebase initialized successfully with credentials from {cred_path}")
            except Exception as e:
                print(f"Failed to initialize Firebase: {e}")
                self.db = None
    
    def get_user_persona(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch user questionnaire/persona data from Django Backend (which reads from Neon DB).
        
        Args:
            user_id: The user ID (uid)
            
        Returns:
            Dictionary containing persona data or None if not found
        """
        import urllib.request
        import urllib.parse
        import json
        
        dbserver_url = os.environ.get("DBSERVER_URL", "http://localhost:8000")
        url = f"{dbserver_url}/api/questionnaire/get/?{urllib.parse.urlencode({'uid': user_id})}"
        
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    res_data = json.loads(response.read().decode())
                    if res_data.get("status") == "success" and res_data.get("data"):
                        q_data = res_data["data"]
                        return {
                            "vibe": q_data.get("vibe", ""),
                            "niches": q_data.get("niches", []),
                            "content_styles": q_data.get("content_styles", []),
                            "tones": q_data.get("tones", []),
                            "endgames": q_data.get("endgames", []),
                            "summary": q_data.get("summary", ""),
                        }
            return None
        except Exception as e:
            print(f"Error fetching user persona from Django for {user_id}: {e}")
            return None
    
    def format_persona_for_prompt(self, persona: Dict[str, Any]) -> str:
        """
        Format persona data into a prompt-friendly string.
        
        Args:
            persona: Dictionary containing persona data
            
        Returns:
            Formatted string for inclusion in prompts
        """
        if not persona:
            return ""
        
        parts = []
        
        if persona.get("vibe"):
            parts.append(f"Professional Identity: {persona['vibe']}")
        
        if persona.get("niches"):
            niches = ", ".join(persona["niches"])
            parts.append(f"Industry/Niche Focus: {niches}")
        
        if persona.get("content_styles"):
            styles = ", ".join(persona["content_styles"])
            parts.append(f"Preferred Content Style: {styles}")
        
        if persona.get("tones"):
            tones = ", ".join(persona["tones"])
            parts.append(f"Writing Tone: {tones}")
        
        if persona.get("endgames"):
            goals = ", ".join(persona["endgames"])
            parts.append(f"LinkedIn Goals: {goals}")
        
        if persona.get("summary"):
            parts.append(f"User Summary: {persona['summary']}")
        
        return "\n".join(parts)


# Singleton instance
firebase_service = FirebaseService()
