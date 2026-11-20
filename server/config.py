"""All of Jyan settings in one place."""
import os

from dotenv import load_dotenv

load_dotenv()  # reads server/.env

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# If Groq says "model not found", check the current list at
# https://console.groq.com/docs/models and change this one line.
MODEL = "openai/gpt-oss-20b"

# Groq's built-in web search (works on the gpt-oss models).
TOOLS = [{"type": "browser_search"}]

HOST = "127.0.0.1"
PORT = 5001  # not 5000, macOS AirPlay already uses it

MAX_DOCUMENT_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_DOCUMENT_TEXT_CHARS = 80_000
MAX_DOCUMENT_UNCOMPRESSED_BYTES = 20 * 1024 * 1024
MAX_STORED_DOCUMENTS = 20

CHECK_SECONDS = 2  # how often we peek at the active window

SYSTEM_PROMPT = """You are Jyan, a friendly sprite who lives on the user's computer and
works as their study buddy. You help with homework and any other question: explain things
clearly, work through problems step by step, and check the user's understanding.
Be cheerful and encouraging. Keep answers short (2-6 sentences) unless the question
needs a longer worked solution. When a question needs current or factual information,
use web search instead of guessing, and mention where it came from."""

# A window title containing any of these counts as a distraction.
DISTRACTION_WORDS = [
    "youtube", "netflix", "twitch", "tiktok", "instagram", "facebook", "twitter",
    "reddit", "discord", "snapchat", "whatsapp", "steam", "roblox", "minecraft",
    "fortnite", "hulu", "disney+", "prime video", "9gag", "buzzfeed",
]

# Pip's own windows must never count as leaving.
OWN_WINDOWS = {"pip", "python", "python3", "pythonw", "tk", "electron"}

NUDGES = [
    "Hey! Eyes back on the books. I see {what} 👀",
    "Caught you! {what} can wait until the timer's done.",
    "Nope nope nope, back to studying! ({what})",
    "I'm watching you, you know. {what}? Really?",
    "Focus time! Close {what} and let's get back to it.",
]
