"""
In-memory Gemini API usage tracker with sliding-window rate limiting.

Tracks requests-per-minute (RPM) and requests-per-day (RPD) using deques
of timestamps.  Thread-safe via a threading lock.

Usage:
    tracker = GeminiUsageTracker(rpm_limit=10, rpd_limit=1000)
    if tracker.can_use_gemini():
        # … call Gemini …
        tracker.record_request()
"""

import threading
import time
from collections import deque
from datetime import datetime, timezone
from typing import Dict, Any


class GeminiUsageTracker:
    """Sliding-window rate limiter for the free Gemini API tier."""

    _MINUTE = 60          # seconds
    _DAY = 86_400         # seconds

    def __init__(self, rpm_limit: int = 10, rpd_limit: int = 1000) -> None:
        self.rpm_limit = rpm_limit
        self.rpd_limit = rpd_limit
        self._minute_window: deque[float] = deque()
        self._day_window: deque[float] = deque()
        self._lock = threading.Lock()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _prune(self, now: float) -> None:
        """Remove timestamps that have fallen outside their windows."""
        minute_cutoff = now - self._MINUTE
        while self._minute_window and self._minute_window[0] < minute_cutoff:
            self._minute_window.popleft()

        day_cutoff = now - self._DAY
        while self._day_window and self._day_window[0] < day_cutoff:
            self._day_window.popleft()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def can_use_gemini(self) -> bool:
        """Return True if both RPM and RPD budgets have room."""
        with self._lock:
            self._prune(time.time())
            return (
                len(self._minute_window) < self.rpm_limit
                and len(self._day_window) < self.rpd_limit
            )

    def record_request(self) -> None:
        """Record a successful Gemini API request."""
        with self._lock:
            now = time.time()
            self._prune(now)
            self._minute_window.append(now)
            self._day_window.append(now)

    def get_usage_status(self) -> Dict[str, Any]:
        """
        Return a JSON-friendly snapshot of current Gemini availability.

        Keys:
            available       – bool, can we call Gemini right now?
            rpm_used        – int, requests in the current sliding minute
            rpm_limit       – int
            rpd_used        – int, requests in the current sliding day
            rpd_limit       – int
            rpm_resets_in   – int, seconds until the oldest minute-window entry expires
            rpd_resets_in   – int, seconds until the oldest day-window entry expires
            reason          – str | None, why Gemini is unavailable (if applicable)
        """
        with self._lock:
            now = time.time()
            self._prune(now)

            rpm_used = len(self._minute_window)
            rpd_used = len(self._day_window)
            available = rpm_used < self.rpm_limit and rpd_used < self.rpd_limit

            # Time until the oldest entry in each window expires
            rpm_resets_in = 0
            if self._minute_window:
                rpm_resets_in = max(0, int(self._MINUTE - (now - self._minute_window[0])))

            rpd_resets_in = 0
            if self._day_window:
                rpd_resets_in = max(0, int(self._DAY - (now - self._day_window[0])))

            reason = None
            if not available:
                if rpm_used >= self.rpm_limit:
                    reason = f"Minute limit reached ({rpm_used}/{self.rpm_limit} RPM). Resets in {rpm_resets_in}s."
                elif rpd_used >= self.rpd_limit:
                    reason = f"Daily limit reached ({rpd_used}/{self.rpd_limit} RPD). Resets in {rpd_resets_in}s."

            return {
                "available": available,
                "rpm_used": rpm_used,
                "rpm_limit": self.rpm_limit,
                "rpd_used": rpd_used,
                "rpd_limit": self.rpd_limit,
                "rpm_resets_in": rpm_resets_in,
                "rpd_resets_in": rpd_resets_in,
                "reason": reason,
            }
