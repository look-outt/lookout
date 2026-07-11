import random
import re
import time
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from openai import AzureOpenAI
from google import genai

from ..core.config import settings
from ..core.gemini_usage_tracker import GeminiUsageTracker


class LLMService:
    """Service responsible for orchestrating LinkedIn post generation."""

    _HOOK_CHANGE_PATTERNS = [
        r"change\s+the\s+hook",
        r"change\s+hook",
        r"switch\s+the\s+hook",
        r"switch\s+hook",
        r"use\s+a\s+different\s+hook",
        r"different\s+hook",
        r"another\s+hook",
        r"new\s+hook",
        r"replace\s+the\s+hook",
        r"replace\s+hook",
        r"swap\s+the\s+hook",
        r"update\s+the\s+hook",
    ]
    _CTA_CHANGE_PATTERNS = [
        r"change\s+the\s+cta",
        r"change\s+cta",
        r"switch\s+the\s+cta",
        r"switch\s+cta",
        r"use\s+a\s+different\s+cta",
        r"different\s+cta",
        r"another\s+cta",
        r"new\s+cta",
        r"replace\s+the\s+cta",
        r"replace\s+cta",
        r"swap\s+the\s+cta",
        r"update\s+the\s+cta",
    ]
    _FRAMEWORK_CHANGE_PATTERNS = [
        r"change\s+the\s+framework",
        r"change\s+framework",
        r"switch\s+the\s+framework",
        r"switch\s+framework",
        r"use\s+a\s+different\s+framework",
        r"different\s+framework",
        r"another\s+framework",
        r"new\s+framework",
        r"replace\s+the\s+framework",
        r"replace\s+framework",
        r"swap\s+the\s+framework",
        r"update\s+the\s+framework",
    ]

    _HOOK_CHANGE_REGEX = re.compile("|".join(_HOOK_CHANGE_PATTERNS), re.IGNORECASE)
    _CTA_CHANGE_REGEX = re.compile("|".join(_CTA_CHANGE_PATTERNS), re.IGNORECASE)
    _FRAMEWORK_CHANGE_REGEX = re.compile("|".join(_FRAMEWORK_CHANGE_PATTERNS), re.IGNORECASE)
    _ALL_CHANGE_REGEX = re.compile(
        "|".join(_HOOK_CHANGE_PATTERNS + _CTA_CHANGE_PATTERNS + _FRAMEWORK_CHANGE_PATTERNS),
        re.IGNORECASE,
    )

    def __init__(self, vector_store_service, gemini_tracker: Optional[GeminiUsageTracker] = None):
        self.client = AzureOpenAI(
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
        )
        self.gemini_client = genai.Client(api_key=settings.GOOGLE_API_KEY or "")
        self.deployment_name = settings.AZURE_OPENAI_DEPLOYMENT_NAME
        self.vector_store_service = vector_store_service

        # Gemini usage tracker (shared singleton)
        self.gemini_tracker = gemini_tracker or GeminiUsageTracker(
            rpm_limit=settings.GEMINI_RPM_LIMIT,
            rpd_limit=settings.GEMINI_RPD_LIMIT,
        )

        self.client_memory: Dict[str, List[Dict]] = {}
        self.client_last_hook: Dict[str, str] = {}
        self.client_last_framework: Dict[str, str] = {}
        self.client_last_cta: Dict[str, str] = {}
        self.client_last_topic: Dict[str, str] = {}

        self.hooks = self._load_hooks()
        self.frameworks = self._load_frameworks()
        self.ctas = self._load_ctas()

    @staticmethod
    def _normalise_phrase(value: str) -> str:
        text = value.strip()
        if not text:
            return ""
        text = text.strip('"').strip()
        text = text.strip('“”').strip()
        return text

    def _load_phrases(self, file_path: Path, skip_keywords: Optional[List[str]] = None) -> List[str]:
        if not file_path.exists():
            print(f"Dataset not found at {file_path}.")
            return []

        skip_keywords = [keyword.lower() for keyword in (skip_keywords or [])]
        phrases: List[str] = []
        try:
            with file_path.open("r", encoding="utf-8") as handle:
                for raw_line in handle:
                    text = self._normalise_phrase(raw_line)
                    if not text:
                        continue
                    lowered = text.lower()
                    if skip_keywords and any(keyword in lowered for keyword in skip_keywords):
                        continue
                    phrases.append(text)
        except Exception as exc:
            print(f"Failed to load phrases from {file_path}: {exc}")
            return []

        if not phrases:
            print(f"No usable entries found in {file_path}.")
        return phrases

    def _load_hooks(self) -> List[str]:
        phrases = self._load_phrases(Path(settings.HOOKS_CSV_PATH), skip_keywords=["hooks"])
        if not phrases:
            phrases = [
                "Here's a thought most professionals overlook…",
                "Quick insight that changed my approach this year…",
            ]
        return phrases

    def _load_frameworks(self) -> List[str]:
        return self._load_phrases(Path(settings.FRAMEWORKS_CSV_PATH), skip_keywords=["frameworks"])

    def _load_ctas(self) -> List[str]:
        return self._load_phrases(Path(settings.CTA_CSV_PATH), skip_keywords=["ctas"])

    def _normalize_client_id(self, client_id: str) -> str:
        return client_id or "default"

    def _get_client_memory(self, client_id: str) -> str:
        history = self.client_memory.get(client_id, [])
        if not history:
            return ""

        recent_history = history[-5:]
        formatted_history = ""
        for interaction in recent_history:
            topic = interaction.get("topic") or interaction.get("query")
            hook = interaction.get("hook")
            framework = interaction.get("framework")
            cta = interaction.get("cta")
            formatted_history += f"User request: {topic}\n"
            if hook:
                formatted_history += f"Hook used: {hook}\n"
            if framework:
                formatted_history += f"Framework used: {framework}\n"
            if cta:
                formatted_history += f"CTA used: {cta}\n"
            formatted_history += f"Generated post: {interaction['response']}\n\n"
        return formatted_history

    def _update_client_memory(
        self,
        client_id: str,
        original_query: str,
        topic: str,
        hook: str,
        framework: str,
        cta: str,
        response: str,
    ) -> None:
        if client_id not in self.client_memory:
            self.client_memory[client_id] = []

        self.client_memory[client_id].append(
            {
                "timestamp": time.time(),
                "query": original_query,
                "topic": topic,
                "hook": hook,
                "framework": framework,
                "cta": cta,
                "response": response,
            }
        )

        # Keep only recent interactions to prevent memory leaks
        if len(self.client_memory[client_id]) > 20:
            self.client_memory[client_id] = self.client_memory[client_id][-20:]

        if topic:
            self.client_last_topic[client_id] = topic
        if hook:
            self.client_last_hook[client_id] = hook
        if framework:
            self.client_last_framework[client_id] = framework
        if cta:
            self.client_last_cta[client_id] = cta

    def _retrieve_similar_posts(self, topic: str, top_k: int = 3) -> str:
        try:
            similar_docs = self.vector_store_service.search_similar_posts(topic, k=top_k)
            if not similar_docs:
                return ""

            examples = "Here are some example LinkedIn posts that might be relevant:\n\n"
            for index, doc in enumerate(similar_docs, 1):
                metadata = getattr(doc, "metadata", {}) or {}
                author = metadata.get("profile_name") or "Unknown Author"
                post_date = metadata.get("post_date") or ""
                profile_url = metadata.get("profile_url") or ""

                header_parts = [f"Example {index}"]
                if author:
                    header_parts.append(f"by {author}")
                if post_date:
                    header_parts.append(f"({post_date})")

                header = " ".join(header_parts)
                examples += f"{header}:\n{doc.page_content.strip()}\n"
                if profile_url:
                    examples += f"Source: {profile_url}\n"
                examples += "\n"
            return examples
        except Exception as exc:
            print(f"Error retrieving similar posts: {exc}")
            return ""

    def _build_persona_context(self, user_persona: Optional[Dict]) -> str:
        """Build a formatted persona context string from questionnaire data."""
        if not user_persona:
            return ""
        
        parts = []
        
        if user_persona.get("vibe"):
            parts.append(f"• Professional Identity: {user_persona['vibe']}")
        
        if user_persona.get("niches"):
            niches = user_persona["niches"]
            if isinstance(niches, list):
                niches = ", ".join(niches)
            parts.append(f"• Industry/Niche Focus: {niches}")
        
        if user_persona.get("content_styles"):
            styles = user_persona["content_styles"]
            if isinstance(styles, list):
                styles = ", ".join(styles)
            parts.append(f"• Preferred Content Style: {styles}")
        
        if user_persona.get("tones"):
            tones = user_persona["tones"]
            if isinstance(tones, list):
                tones = ", ".join(tones)
            parts.append(f"• Writing Tone: {tones}")
        
        if user_persona.get("endgames"):
            goals = user_persona["endgames"]
            if isinstance(goals, list):
                goals = ", ".join(goals)
            parts.append(f"• LinkedIn Goals: {goals}")
        
        if user_persona.get("summary"):
            parts.append(f"• User Summary: {user_persona['summary']}")
        
        return "\n".join(parts)

    def _call_gemini_with_retry(self, prompt_text: str, max_retries: int = 3) -> Optional[str]:
        """Call Gemini API with exponential backoff retry on transient errors.

        Returns the generated text on success, or None if all retries fail.
        On None the caller should fall back to Azure GPT.
        """
        for attempt in range(max_retries):
            try:
                response = self.gemini_client.models.generate_content(
                    model='gemini-3.1-pro-preview',
                    contents=prompt_text,
                )
                return response.text
            except Exception as e:
                error_str = str(e).lower()
                retryable_signals = [
                    '429', 'resource exhausted', 'quota',
                    '500', '503', 'overloaded', 'internal',
                    'unavailable', 'deadline exceeded',
                ]
                is_retryable = any(sig in error_str for sig in retryable_signals)

                if is_retryable and attempt < max_retries - 1:
                    wait = (2 ** attempt) + random.uniform(0, 1)
                    print(
                        f"Gemini retry {attempt + 1}/{max_retries}, "
                        f"waiting {wait:.1f}s — {e}"
                    )
                    time.sleep(wait)
                else:
                    print(f"Gemini failed after {attempt + 1} attempt(s): {e}")
                    return None
        return None

    def _clean_query(self, query: str) -> str:
        cleaned = self._ALL_CHANGE_REGEX.sub(" ", query)
        cleaned = re.sub(r"\s+", " ", cleaned)
        return cleaned.strip()

    def _is_hook_change_request(self, query: str) -> bool:
        return bool(query and self._HOOK_CHANGE_REGEX.search(query))

    def _is_cta_change_request(self, query: str) -> bool:
        return bool(query and self._CTA_CHANGE_REGEX.search(query))

    def _is_framework_change_request(self, query: str) -> bool:
        return bool(query and self._FRAMEWORK_CHANGE_REGEX.search(query))

    def _resolve_topic(self, client_id: str, query: str, reuse_previous: bool) -> str:
        cleaned = self._clean_query(query)
        if cleaned:
            topic = cleaned
        elif reuse_previous:
            topic = self.client_last_topic.get(client_id, "").strip()
        else:
            topic = query.strip()

        if not topic:
            topic = "LinkedIn post for my audience"

        return topic

    def _select_from_list(self, items: List[str], previous: Optional[str], force_change: bool) -> str:
        if not items:
            return ""

        candidates = items
        if previous and len(items) > 1:
            candidates = [item for item in items if item != previous]
            if not candidates and force_change:
                candidates = items
        return random.choice(candidates)

    def _select_hook(self, client_id: str, force_change: bool = False) -> str:
        previous = self.client_last_hook.get(client_id)
        selected = self._select_from_list(self.hooks, previous, force_change)
        if selected:
            self.client_last_hook[client_id] = selected
        return selected

    def _select_framework(self, client_id: str, force_change: bool = False) -> str:
        previous = self.client_last_framework.get(client_id)
        selected = self._select_from_list(self.frameworks, previous, force_change)
        if selected:
            self.client_last_framework[client_id] = selected
        return selected

    def _select_cta(self, client_id: str, force_change: bool = False) -> str:
        previous = self.client_last_cta.get(client_id)
        selected = self._select_from_list(self.ctas, previous, force_change)
        if selected:
            self.client_last_cta[client_id] = selected
        return selected

    def _build_prompt(
        self,
        topic: str,
        client_id: str,
        hook: str,
        framework: str,
        cta: str,
        is_pro_user: bool,
        previous_hook: Optional[str],
        previous_framework: Optional[str],
        previous_cta: Optional[str],
        hook_change_requested: bool,
        framework_change_requested: bool,
        cta_change_requested: bool,
        user_persona: Optional[Dict] = None,
    ) -> List[Dict[str, str]]:
        client_history = self._get_client_memory(client_id)
        similar_posts = self._retrieve_similar_posts(topic)

        # Build persona context from questionnaire data
        persona_context = self._build_persona_context(user_persona)

        system_prompt = (
            """
Act like you are an experienced LinkedIn ghostwriter with years of several years of experience crafting high-performing posts that hook readers, drive engagement and align with the long term personal brand and goal. Apply that expertise to write a LinkedIn post on [x] in approximately [z] words. The post should feel authentic and insightful, tailored for LinkedIn’s professional yet social environment.
Requirements:
Every post has 3 parts: Hook, Body, CTA (Call to Action)
Draft it in the following sequence:
Body
- Research all recent news on the topic from the web and generate 3 fresh takes of it with different perspectives. Then, assess all 3 takes separately and combine the best of all 3 to make it 1 new fresh insight.
- After researching, go through these frameworks and assess which one fits best as per the situation:]

- After selecting the framework, structure your post around it.
- Maintain a [tone: bold, witty, conversational, professional] voice suited for [b: target audience] throughout the post.
CTA
Refer to the library of CTAs.
End with a clear takeaway or a strong call-to-action, inviting engagement or reflection.


Hook
Refer to the library of hooks and see which suits the post.

- Do not use em dashes or emojis at any point in your response. However, you are allowed to use bullets and arrows.
- Ensure all requirements are addressed before concluding.
- If your response is incomplete or you need to revise for clarity, persist until all objectives are met prior to producing the final answer.
- To prioritise user engagement, break down the text into single or 2 sentences, not paragraphs.


make it like a one post dont write "framework: "framework used" , "body" and then "CTA" no need to write these elements individually just straight up create a post that can be copy pasted into linkedin

            """
        )

        if hook:
            system_prompt += (
                "\n- Start the post with the provided hook on its own line (customise bracketed placeholders to match the topic)"
            )

        if is_pro_user:
            system_prompt += (
                "\n- For PRO users: Include more sophisticated content structures"
                "\n- For PRO users: Add a hook at the beginning and call-to-action at the end"
                "\n- For PRO users: Optimize for maximum engagement with advanced storytelling techniques"
            )

        full_context = system_prompt

        # Add user persona context if available
        if persona_context:
            full_context += (
                "\n\nUSER PERSONA (use this to personalize the post):\n"
                f"{persona_context}\n"
                "\nIMPORTANT: Tailor the content to match this user's professional identity, "
                "preferred tone, content style, industry focus, and LinkedIn goals. "
                "Make the post feel authentically theirs."
            )

        if hook:
            full_context += (
                "\n\nHOOK REQUIREMENTS:\n"
                f"Use this hook as the opening line (adapt placeholders like [industry] or [goal] to the topic):\n{hook}\n"
            )
            if previous_hook and previous_hook != hook:
                full_context += f"Avoid reusing the previous hook: {previous_hook}\n"
            if hook_change_requested:
                full_context += "Ensure the new hook feels noticeably different from the previous version."

        if framework:
            full_context += (
                "\n\nFRAMEWORK TO FOLLOW:\n"
                f"{framework}\n"
                "Use this framework to shape the narrative (sections, sequencing, and transitions) while keeping the copy natural."
            )
            if previous_framework and previous_framework != framework:
                full_context += f"\nDo not fall back to the former framework: {previous_framework}."
            if framework_change_requested:
                full_context += "\nMake the change of framework obvious in structure and flow."

        if cta:
            full_context += (
                "\n\nCALL-TO-ACTION REQUIREMENT:\n"
                f"Close the post with a CTA inspired by this line (adjust wording to fit tone while keeping the intent intact):\n{cta}\n"
                "Place the CTA as the final sentence or paragraph."
            )
            if previous_cta and previous_cta != cta:
                full_context += f"\nAvoid reusing the previous CTA phrase: {previous_cta}."
            if cta_change_requested:
                full_context += "\nEnsure the CTA feels clearly different from the prior one."

        full_context += f"\n\nTOPIC OR REQUEST:\n{topic}"

        if client_history:
            full_context += "\n\nPREVIOUS INTERACTIONS WITH THIS USER:\n" + client_history

        if similar_posts:
            full_context += "\n\n" + similar_posts

        messages = [
            {"role": "system", "content": full_context},
            {
                "role": "user",
                "content": (
                    "Please craft a polished LinkedIn post about the topic above while respecting the hook, framework, and CTA requirements."
                ),
            },
        ]

        return messages

    def generate_post(self, query: str, client_id: str, is_pro_user: bool = False, user_persona: Optional[Dict] = None, model_preference: str = "gemini") -> Tuple[str, bool]:
        try:
            client_key = self._normalize_client_id(client_id)

            hook_change_requested = self._is_hook_change_request(query)
            framework_change_requested = self._is_framework_change_request(query)
            cta_change_requested = self._is_cta_change_request(query)

            reuse_previous_topic = hook_change_requested or framework_change_requested or cta_change_requested

            previous_hook = self.client_last_hook.get(client_key)
            previous_framework = self.client_last_framework.get(client_key)
            previous_cta = self.client_last_cta.get(client_key)

            topic = self._resolve_topic(client_key, query, reuse_previous_topic)
            selected_hook = self._select_hook(client_key, force_change=hook_change_requested)
            selected_framework = self._select_framework(client_key, force_change=framework_change_requested)
            selected_cta = self._select_cta(client_key, force_change=cta_change_requested)

            messages = self._build_prompt(
                topic=topic,
                client_id=client_key,
                hook=selected_hook,
                framework=selected_framework,
                cta=selected_cta,
                is_pro_user=is_pro_user,
                previous_hook=previous_hook,
                previous_framework=previous_framework,
                previous_cta=previous_cta,
                hook_change_requested=hook_change_requested,
                framework_change_requested=framework_change_requested,
                cta_change_requested=cta_change_requested,
                user_persona=user_persona,
            )

            fallback_triggered = False
            generated_text = None

            if model_preference.lower() == "gemini":
                # Check usage budget before attempting Gemini
                if not self.gemini_tracker.can_use_gemini():
                    print("Gemini rate limit exhausted. Falling back to Azure GPT.")
                    fallback_triggered = True
                else:
                    # Extract text from messages for Gemini
                    prompt_text = ""
                    for msg in messages:
                        prompt_text += msg["content"] + "\n\n"

                    generated_text = self._call_gemini_with_retry(
                        prompt_text,
                        max_retries=settings.GEMINI_MAX_RETRIES,
                    )

                    if generated_text is None:
                        print("Gemini failed after retries. Falling back to Azure GPT.")
                        fallback_triggered = True
                    else:
                        # Record successful usage
                        self.gemini_tracker.record_request()

            if not generated_text:
                response = self.client.chat.completions.create(
                    model=self.deployment_name,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=800,
                    top_p=0.95,
                    frequency_penalty=0.5,
                    presence_penalty=0.5,
                )
                generated_text = response.choices[0].message.content

            if generated_text is None:
                generated_text = "I couldn't generate a LinkedIn post at this time. Please try again."

            self._update_client_memory(
                client_id=client_key,
                original_query=query,
                topic=topic,
                hook=selected_hook,
                framework=selected_framework,
                cta=selected_cta,
                response=generated_text,
            )

            return generated_text, fallback_triggered

        except Exception as exc:
            error_message = f"Error generating post: {exc}"
            print(error_message)
            return "I'm sorry, I encountered an error while generating your LinkedIn post. Please try again later.", False
