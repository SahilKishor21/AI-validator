import asyncio
import json
import traceback
import os
from typing import Dict, Any
import httpx

class AIService:
    def __init__(self):
        self.gemini_api_key = os.getenv('GEMINI_API_KEY', '')
        self.openai_api_key = os.getenv('OPENAI_API_KEY', '')
        
        self.use_gemini = bool(self.gemini_api_key)
        self.use_openai = bool(self.openai_api_key)
        
        print(f"[AI SERVICE] Gemini available: {self.use_gemini}")
        print(f"[AI SERVICE] OpenAI available: {self.use_openai}")
        print(f"[AI SERVICE] Hugging Face available: True (free)")

    async def fact_check(self, text: str) -> Dict[str, Any]:
        print(f"[AI SERVICE] Fact-checking: '{text}'")
        
        # Try Gemini first (free but can be overloaded)
        if self.use_gemini:
            try:
                print("[AI SERVICE] Trying Gemini API...")
                return await self._fact_check_with_gemini(text)
            except Exception as e:
                print(f"[AI SERVICE] Gemini failed: {e}")
        
        # Try OpenAI second
        if self.use_openai:
            try:
                print("[AI SERVICE] Trying OpenAI API...")
                return await self._fact_check_with_openai(text)
            except Exception as e:
                print(f"[AI SERVICE] OpenAI failed: {e}")
        
        # Try Hugging Face (always free, no API key needed)
        try:
            print("[AI SERVICE] Trying Hugging Face API...")
            return await self._fact_check_with_huggingface(text)
        except Exception as e:
            print(f"[AI SERVICE] Hugging Face failed: {e}")
        
        # Final fallback
        return self._mock_response(text)

    async def _fact_check_with_gemini(self, text: str) -> Dict[str, Any]:
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}"
        
        prompt = f'''Fact-check this statement: "{text}"

Respond with a JSON object containing:
- "result": Clear explanation of whether the statement is correct, incorrect, or uncertain
- "confidence": Number between 0.0 and 1.0
- "sources": Array of source types

Example: {{"result": "Correct. Mount Everest is the tallest mountain on Earth at 8,848.86 meters above sea level.", "confidence": 0.95, "sources": ["Geographic Survey", "Mountain Records"]}}'''

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 400}
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            
            if response.status_code != 200:
                raise Exception(f"Gemini API error: {response.status_code} - {response.text}")
            
            data = response.json()
            generated_text = data['candidates'][0]['content']['parts'][0]['text']
            
            try:
                clean_text = generated_text.strip()
                if clean_text.startswith('`json'):
                    clean_text = clean_text.split('`json')[1].split('`')[0].strip()
                elif clean_text.startswith('`'):
                    clean_text = clean_text.split('`')[1].split('`')[0].strip()
                
                result = json.loads(clean_text)
                return {
                    "result": str(result.get("result", generated_text)),
                    "confidence": float(result.get("confidence", 0.7)),
                    "sources": list(result.get("sources", ["Gemini AI"]))
                }
            except json.JSONDecodeError:
                return {"result": generated_text, "confidence": 0.7, "sources": ["Gemini AI"]}

    async def _fact_check_with_openai(self, text: str) -> Dict[str, Any]:
        import openai
        client = openai.AsyncOpenAI(api_key=self.openai_api_key)
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a fact-checker. Respond with JSON containing 'result', 'confidence', and 'sources' fields."},
                {"role": "user", "content": f"Fact-check: {text}"}
            ],
            max_tokens=300,
            temperature=0.2
        )
        
        result_text = response.choices[0].message.content.strip()
        result_json = json.loads(result_text)
        
        return {
            "result": str(result_json.get("result", "Unable to analyze")),
            "confidence": float(result_json.get("confidence", 0.7)),
            "sources": list(result_json.get("sources", ["OpenAI"]))
        }

    async def _fact_check_with_huggingface(self, text: str) -> Dict[str, Any]:
        # Use Hugging Face Inference API (free, no API key needed)
        url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
        
        prompt = f"Fact-check: {text}. Is this statement correct, incorrect, or uncertain? Explain briefly."
        
        payload = {"inputs": prompt}
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            
            if response.status_code != 200:
                raise Exception(f"HuggingFace error: {response.status_code}")
            
            data = response.json()
            
            if isinstance(data, list) and len(data) > 0:
                generated_text = data[0].get('generated_text', str(data))
                
                # Extract just the response part
                if prompt in generated_text:
                    generated_text = generated_text.replace(prompt, '').strip()
                
                # Determine confidence based on keywords
                confidence = 0.6
                lower_text = generated_text.lower()
                if any(word in lower_text for word in ["correct", "true", "accurate"]):
                    confidence = 0.8
                elif any(word in lower_text for word in ["incorrect", "false", "wrong"]):
                    confidence = 0.8
                elif any(word in lower_text for word in ["uncertain", "unclear", "maybe"]):
                    confidence = 0.4
                
                return {
                    "result": generated_text,
                    "confidence": confidence,
                    "sources": ["Hugging Face AI"]
                }
            else:
                raise Exception("Unexpected HuggingFace response format")

    def _mock_response(self, text: str) -> Dict[str, Any]:
        return {
            "result": f"All AI services are temporarily unavailable. Please try again later.",
            "confidence": 0.0,
            "sources": ["System Error"]
        }

ai_service = AIService()
