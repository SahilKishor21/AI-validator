import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def debug_env_loading():
    env_path = BASE_DIR / ".env"
    print(f"Debugging .env loading from: {env_path}")
    
    with open(env_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            print(f"Line {line_num}: '{line.rstrip()}'")
            
            line = line.strip()
            if not line or line.startswith('#'):
                print(f"  -> Skipping (empty or comment)")
                continue
            
            if '=' not in line:
                print(f"  -> Skipping (no =)")
                continue
            
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip()
            
            print(f"  -> Key: '{key}', Value length: {len(value)}")
            print(f"  -> Value starts with: '{value[:20]}...'")
            
            if value.startswith('"') and value.endswith('"'):
                value = value[1:-1]
                print(f"  -> Removed double quotes")
            elif value.startswith("'") and value.endswith("'"):
                value = value[1:-1]
                print(f"  -> Removed single quotes")
            
            os.environ[key] = value
            print(f"  -> Set env var '{key}'")
            
            read_back = os.getenv(key)
            print(f"  -> Read back: '{read_back[:20] if read_back else 'None'}...'")
            print(f"  -> Read back length: {len(read_back) if read_back else 0}")
            print()

debug_env_loading()

openai_key = os.getenv('OPENAI_API_KEY', '')
print(f"Final OPENAI_API_KEY check:")
print(f"  Length: {len(openai_key)}")
print(f"  Boolean: {bool(openai_key)}")
print(f"  Starts with: '{openai_key[:15] if openai_key else 'None'}...'")
