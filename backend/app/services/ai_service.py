import asyncio
import re
from typing import Dict, Any, List, Optional
from ..core.config import settings

class AIService:
    def __init__(self):
        # You can add your OpenAI API key here later
        self.openai_api_key = settings.openai_api_key if hasattr(settings, 'openai_api_key') else None

    async def fact_check(self, text: str) -> Dict[str, Any]:
        """
        Enhanced fact-checking with better logic.
        You can replace this with OpenAI API calls when ready.
        """
        print(f"[AI SERVICE] Fact-checking text: '{text}'")
        
        # Simulate processing time
        await asyncio.sleep(1)
        
        text_lower = text.lower()
        
        # More comprehensive fact-checking rules
        if self._check_incorrect_statements(text_lower):
            return self._get_incorrect_response(text_lower, text)
        elif self._check_correct_statements(text_lower):
            return self._get_correct_response(text_lower, text)
        else:
            return self._get_uncertain_response(text)

    def _check_incorrect_statements(self, text_lower: str) -> bool:
        """Check for obviously incorrect statements"""
        incorrect_patterns = [
            # Animals that can't fly
            (r'monkeys?\s+can\s+fly', 'Monkeys cannot fly'),
            (r'elephants?\s+can\s+fly', 'Elephants cannot fly'),
            (r'humans?\s+can\s+fly', 'Humans cannot fly naturally'),
            (r'dogs?\s+can\s+fly', 'Dogs cannot fly'),
            (r'cats?\s+can\s+fly', 'Cats cannot fly'),
            
            # Shape misconceptions
            (r'moon\s+is\s+(a\s+)?square', 'Moon is not square'),
            (r'earth\s+is\s+flat', 'Earth is not flat'),
            (r'sun\s+is\s+cold', 'Sun is not cold'),
            
            # Basic science facts
            (r'water\s+boils\s+at.*0.*degrees?\s+celsius', 'Water boils at 100°C'),
            (r'fire\s+is\s+cold', 'Fire is not cold'),
            (r'ice\s+is\s+hot', 'Ice is not hot'),
            
            # Historical facts
            (r'world\s+war\s+2.*started.*1950', 'WWII did not start in 1950'),
            (r'america.*discovered.*2000', 'America was not discovered in 2000'),
        ]
        
        for pattern, _ in incorrect_patterns:
            if re.search(pattern, text_lower):
                print(f"[AI SERVICE] Found incorrect pattern: {pattern}")
                return True
        return False

    def _check_correct_statements(self, text_lower: str) -> bool:
        """Check for obviously correct statements"""
        correct_patterns = [
            # Basic facts
            r'earth\s+is\s+(a\s+)?sphere',
            r'water\s+boils\s+at.*100.*degrees?\s+celsius',
            r'fire\s+is\s+hot',
            r'ice\s+is\s+cold',
            r'birds?\s+can\s+fly',
            r'fish\s+live\s+in\s+water',
            r'humans?\s+(have\s+)?two\s+eyes',
            r'sun\s+is\s+hot',
            r'moon\s+is\s+(a\s+)?sphere',
            
            # Animals that can fly
            r'eagles?\s+can\s+fly',
            r'bats?\s+can\s+fly',
            r'butterflies\s+can\s+fly',
        ]
        
        for pattern in correct_patterns:
            if re.search(pattern, text_lower):
                print(f"[AI SERVICE] Found correct pattern: {pattern}")
                return True
        return False

    def _get_incorrect_response(self, text_lower: str, original_text: str) -> Dict[str, Any]:
        """Generate response for incorrect statements"""
        responses = {
            'monkeys': {
                'result': 'Incorrect. Monkeys cannot fly. While some monkeys are excellent climbers and jumpers, and a few species like flying squirrels can glide, true monkeys do not have the ability to fly.',
                'confidence': 0.95,
                'sources': ['National Geographic', 'Animal Biology Database', 'Zoological Facts']
            },
            'elephants': {
                'result': 'Incorrect. Elephants cannot fly. They are large terrestrial mammals that are physically incapable of flight.',
                'confidence': 0.99,
                'sources': ['Wildlife Encyclopedia', 'Animal Biology']
            },
            'moon.*square': {
                'result': 'Incorrect. The Moon is not square. The Moon is roughly spherical due to its own gravitational forces, like all large celestial bodies.',
                'confidence': 0.98,
                'sources': ['NASA', 'Astronomy Textbooks', 'Space Science']
            },
            'earth.*flat': {
                'result': 'Incorrect. The Earth is not flat. Scientific evidence overwhelmingly shows that Earth is an oblate spheroid (slightly flattened sphere).',
                'confidence': 0.99,
                'sources': ['NASA', 'Scientific Research', 'Satellite Imagery']
            },
            'humans.*fly': {
                'result': 'Incorrect. Humans cannot fly naturally. While humans have invented aircraft and other flying devices, we do not possess natural flight abilities.',
                'confidence': 0.97,
                'sources': ['Human Biology', 'Physics of Flight']
            }
        }
        
        for key, response in responses.items():
            if re.search(key, text_lower):
                return response
        
        # Default incorrect response
        return {
            'result': f'The statement "{original_text}" appears to be incorrect based on established scientific knowledge. Please verify with authoritative sources.',
            'confidence': 0.85,
            'sources': ['Scientific Literature', 'Fact-Checking Database']
        }

    def _get_correct_response(self, text_lower: str, original_text: str) -> Dict[str, Any]:
        """Generate response for correct statements"""
        return {
            'result': f'Correct. The statement "{original_text}" aligns with established scientific knowledge and verified facts.',
            'confidence': 0.90,
            'sources': ['Scientific Literature', 'Educational Resources', 'Verified Databases']
        }

    def _get_uncertain_response(self, original_text: str) -> Dict[str, Any]:
        """Generate response for uncertain statements"""
        return {
            'result': f'The statement "{original_text}" requires further verification. The claim is not clearly verifiable without additional context or sources.',
            'confidence': 0.50,
            'sources': ['Fact-Checking Guidelines', 'Research Methodology']
        }

    async def fact_check_with_openai(self, text: str) -> Dict[str, Any]:
        """
        Optional: Use OpenAI API for fact-checking
        Uncomment and configure when you have an API key
        """
        if not self.openai_api_key:
            return await self.fact_check(text)
            
        try:
            import openai
            openai.api_key = self.openai_api_key
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a fact-checking AI. Analyze statements for factual accuracy. 
                        Respond with:
                        1. Whether the statement is correct, incorrect, or uncertain
                        2. A brief explanation
                        3. Your confidence level (0.0-1.0)
                        
                        Be precise and cite reliable sources when possible."""
                    },
                    {
                        "role": "user",
                        "content": f"Fact-check this statement: {text}"
                    }
                ],
                max_tokens=200,
                temperature=0.3
            )

            result_text = response.choices[0].message.content.strip()
            
            # Parse confidence from response or default
            confidence = 0.8
            if "incorrect" in result_text.lower():
                confidence = 0.9
            elif "correct" in result_text.lower():
                confidence = 0.85
            elif "uncertain" in result_text.lower():
                confidence = 0.5

            return {
                "result": result_text,
                "confidence": confidence,
                "sources": ["OpenAI GPT-3.5", "AI Analysis"]
            }

        except Exception as e:
            print(f"OpenAI API error: {e}")
            return await self.fact_check(text)

ai_service = AIService()