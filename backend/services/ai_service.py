import datetime
import json
import logging
from typing import Optional, Dict, Any
import httpx
from models.schemas import ChatResponse
from utils.config import GROQ_API_KEY, GROQ_MODEL, is_groq_configured

logger = logging.getLogger("cleanair.ai")

SYSTEM_PROMPT = """You are CleanAir AI, an air-quality information assistant.

Use the provided current air-quality data when discussing current conditions.
Never invent measurements, timestamps, monitoring stations, or data sources.
If current data is unavailable, clearly state that it is unavailable.
Distinguish between measured air-quality data and general environmental information.
Do not provide medical diagnoses.
Give concise, understandable explanations.
When discussing current data, mention the source and measurement time when available.
Format your responses using clear, readable paragraphs and bullet points where helpful."""


class AIService:
    """
    AI Assistant Service Abstraction.
    Interacts with Groq API when GROQ_API_KEY is available,
    or falls back to an intelligent mock assistant for development/testing.
    """

    def __init__(self):
        self.groq_api_key = GROQ_API_KEY
        self.model = GROQ_MODEL
        self.groq_url = "https://api.groq.com/openai/v1/chat/completions"

    async def ask_question(
        self,
        question: str,
        city: Optional[str] = None,
        current_data: Optional[Dict[str, Any]] = None
    ) -> ChatResponse:
        now_str = datetime.datetime.now(datetime.timezone.utc).strftime("%I:%M %p UTC")

        # If Groq is configured, invoke Groq API
        if is_groq_configured():
            try:
                reply = await self._call_groq(question, city, current_data)
                return ChatResponse(
                    reply=reply,
                    source=f"OpenAQ (Live) | Model: {self.model}",
                    timestamp=now_str,
                    is_demo=False,
                    provider="Groq"
                )
            except Exception as e:
                logger.error(f"Groq API call failed: {e}")
                # Fallback to local demo responder with warning
                return self._mock_respond(question, city, current_data, is_fallback=True)

        # Groq not configured: intelligent mock response
        return self._mock_respond(question, city, current_data, is_fallback=False)

    async def _call_groq(
        self,
        question: str,
        city: Optional[str],
        current_data: Optional[Dict[str, Any]]
    ) -> str:
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }

        context_str = ""
        if current_data:
            context_str = f"\n\nCURRENT AIR QUALITY DATA:\n{json.dumps(current_data, indent=2)}"
        elif city:
            context_str = f"\n\nTarget City: {city} (No live data packet provided)."

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT + context_str},
                {"role": "user", "content": question}
            ],
            "temperature": 0.3,
            "max_tokens": 600
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(self.groq_url, headers=headers, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Groq API error HTTP {resp.status_code}: {resp.text}")
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    def _mock_respond(
        self,
        question: str,
        city: Optional[str],
        current_data: Optional[Dict[str, Any]],
        is_fallback: bool = False
    ) -> ChatResponse:
        q_lower = question.lower()
        now_str = datetime.datetime.now(datetime.timezone.utc).strftime("%I:%M %p UTC")
        provider_name = "Groq (Fallback Mode)" if is_fallback else "CleanAir Assistant (Demo Mode)"

        # 1. Check for general pollutant questions
        if "pm2.5" in q_lower or "pm25" in q_lower:
            reply = (
                "**PM2.5** refers to fine inhalable particles with diameters generally 2.5 micrometers or smaller "
                "(about 30 times smaller than a human hair).\n\n"
                "• **Why it's harmful:** Because they are so tiny, they penetrate deep into the respiratory tract, reach the lungs, and can even enter the bloodstream.\n"
                "• **Sources:** Vehicle emissions, industrial burning, dust, forest fires, and power plants.\n"
                "• **Protection:** Using certified N95 masks outdoors on high pollution days and running HEPA air purifiers indoors helps reduce exposure."
            )
        elif "pm10" in q_lower:
            reply = (
                "**PM10** refers to inhalable particles with diameters of 10 micrometers or smaller.\n\n"
                "• **Composition:** Includes dust from roads, construction sites, pollen, and mold spores.\n"
                "• **Health impact:** Irritates eyes, nose, throat, and exacerbates asthma or bronchitis.\n"
                "• **Difference from PM2.5:** PM10 is coarser and mostly trapped in the upper respiratory tract, whereas PM2.5 penetrates deep into lung alveoli."
            )
        elif "aqi" in q_lower and ("what is" in q_lower or "mean" in q_lower or "how" in q_lower):
            reply = (
                "**Air Quality Index (AQI)** is a standardized scale used by government agencies to communicate how clean or polluted the air is.\n\n"
                "In CleanAir AI, we use the **US EPA AQI Standard**:\n"
                "• **0 - 50 (Good):** Air quality is satisfactory; negligible risk.\n"
                "• **51 - 100 (Moderate):** Acceptable; small concern for sensitive groups.\n"
                "• **101 - 150 (Unhealthy for Sensitive Groups):** General public not affected.\n"
                "• **151 - 200 (Unhealthy):** Public may experience adverse effects.\n"
                "• **201 - 300 (Very Unhealthy):** Serious health alert for all individuals.\n"
                "• **301+ (Hazardous):** Emergency conditions."
            )
        elif "reduce" in q_lower or "protect" in q_lower or "safe" in q_lower:
            reply = (
                "**Recommended actions to minimize exposure to air pollution:**\n\n"
                "1. **Check Live AQI:** Postpone strenuous outdoor exercise when AQI exceeds 150.\n"
                "2. **Indoor Air Filtration:** Keep windows closed during peak pollution hours and use HEPA air purifiers.\n"
                "3. **Wear Appropriate Masks:** Standard cloth masks do not filter fine particles; use well-fitted N95 or FFP2 respirators outdoors.\n"
                "4. **Avoid High-Emission Zones:** Maintain distance from heavy traffic congestion and idling vehicles.\n\n"
                "*Note: This information is for environmental awareness and does not replace medical advice.*"
            )
        # 2. Context-specific question using current_data
        elif current_data and current_data.get("city"):
            c_name = current_data.get("city")
            aqi_val = current_data.get("aqi")
            status = current_data.get("aqi_status", "Unavailable")
            station = current_data.get("station", "Monitoring Station")
            pollutants = current_data.get("pollutants", {})
            pm25_info = pollutants.get("pm25")
            pm25_val = f"{pm25_info['value']} {pm25_info['unit']}" if pm25_info and pm25_info.get("value") is not None else "No current data"

            reply = (
                f"Based on current data for **{c_name}**:\n\n"
                f"• **AQI:** {aqi_val if aqi_val is not None else 'Unavailable'} ({status})\n"
                f"• **PM2.5:** {pm25_val}\n"
                f"• **Monitoring Station:** {station}\n"
                f"• **Data Source:** OpenAQ\n\n"
                f"Currently, air quality in {c_name} is categorized as **{status}**. "
                f"{'Outdoor activities are generally safe for the public.' if status == 'Good' else 'Consider limiting prolonged heavy exertion outdoors.'}"
            )
        else:
            reply = (
                "Hello! I am CleanAir AI Assistant. I can explain pollutant metrics (PM2.5, PM10, NO₂, SO₂, CO, O₃), "
                "interpret current air quality for any selected city, compare conditions, and suggest evidence-based ways to reduce exposure.\n\n"
                "Feel free to select a city or click one of the suggested questions below!"
            )

        return ChatResponse(
            reply=reply,
            source="OpenAQ / CleanAir Knowledge Base",
            timestamp=now_str,
            is_demo=True,
            provider=provider_name
        )

ai_service = AIService()
