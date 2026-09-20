import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in current directory, backend directory, or project root
root_dir = Path(__file__).resolve().parent.parent.parent
backend_dir = Path(__file__).resolve().parent.parent

load_dotenv(dotenv_path=root_dir / ".env")
load_dotenv(dotenv_path=backend_dir / ".env")

OPENAQ_API_KEY = os.getenv("OPENAQ_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
PORT = int(os.getenv("PORT", "8000"))

# Provider status helpers
def is_openaq_configured() -> bool:
    return bool(OPENAQ_API_KEY)

def is_groq_configured() -> bool:
    return bool(GROQ_API_KEY)
