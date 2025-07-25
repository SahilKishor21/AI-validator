import os
from pathlib import Path

print("[CONFIG] Starting config loading...")

BASE_DIR = Path(__file__).resolve().parent.parent.parent 

class Settings:
    def __init__(self):
        print("[CONFIG] Initializing Settings...")
     
        self._load_env_file()

        self.database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:19JUNe2001@localhost:5432/ai_editor')
        self.openai_api_key = os.getenv('OPENAI_API_KEY', '')
        self.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-here')
        self.debug = os.getenv('DEBUG', 'False').lower() in ('true', '1', 'yes')
        self.vite_api_url = os.getenv('VITE_API_URL', 'http://localhost:8000/api')
        
        print("[CONFIG] Settings initialized successfully!")
    
    def _load_env_file(self):
        """Load environment variables from .env file"""
        env_path = BASE_DIR / ".env"
        
        if not env_path.exists():
            print(f"[CONFIG] No .env file found at: {env_path}")
            return
        
        print(f"[CONFIG] Loading .env from: {env_path}")
        
        try:
            with open(env_path, 'r', encoding='utf-8-sig') as f: 
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue

                    if '=' not in line:
                        continue
                    
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip()
 
                    if value.startswith('"') and value.endswith('"'):
                        value = value[1:-1]
                    elif value.startswith("'") and value.endswith("'"):
                        value = value[1:-1]

                    os.environ[key] = value
                    print(f"[CONFIG] Loaded: {key}")
                    
        except Exception as e:
            print(f"[CONFIG] Error loading .env file: {e}")

settings = Settings()

print(f"[CONFIG] OpenAI API key loaded: {bool(settings.openai_api_key)}")
if settings.openai_api_key:
    print(f"[CONFIG] API key starts with: {settings.openai_api_key[:15]}...")

print("[CONFIG] Config loading completed!")
