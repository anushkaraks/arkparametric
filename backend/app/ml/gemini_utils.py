"""Shared Gemini AI utilities — configuration and prompt sanitization."""

import re
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

_configured = False


def configure_gemini() -> bool:
    """Configure the Gemini SDK once. Returns True if a valid key is present."""
    global _configured
    if not settings.GEMINI_API_KEY:
        return False
    if not _configured:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _configured = True
        logger.info("Gemini API configured successfully.")
    return True


def sanitize_input(value: str) -> str:
    """Strip characters that could be used for prompt injection."""
    # Remove newlines, control chars, and curly braces that might break JSON prompts
    sanitized = re.sub(r'[\n\r\t]', ' ', str(value))
    sanitized = re.sub(r'[{}]', '', sanitized)
    sanitized = sanitized.strip()
    # Truncate to a reasonable length
    return sanitized[:200]


def get_model(model_name: str = "gemini-2.0-flash") -> genai.GenerativeModel:
    """Return a configured GenerativeModel instance."""
    return genai.GenerativeModel(model_name)
