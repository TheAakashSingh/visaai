"""
Chat Router — LangChain + OpenAI GPT-4 + RAG Knowledge Base
"""
from fastapi import APIRouter, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import re

from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage, SystemMessage

router = APIRouter()
security = HTTPBearer()

VISA_SYSTEM_PROMPT = """You are VisaAI Pro, an expert AI visa consultation assistant for SinghJi Tech, an Indian immigration consultancy.

EXPERTISE:
- All visa types: Student, Work Permit, Tourist, Business, PR/Settlement, Family
- Key destinations: Canada, USA, UK, Australia, Germany, Schengen (all EU), UAE, NZ, Singapore, Japan
- Indian passport requirements, IELTS/language scores, financial requirements
- Processing times, success rates, fees in INR and foreign currencies

BEHAVIOR RULES:
1. Auto-detect language (Hindi/English/Hinglish) and respond in SAME language
2. For Hindi: use Devanagari or Hinglish based on user's style
3. Always be specific about requirements — no vague answers
4. Proactively mention important warnings (passport expiry < 6 months, financial requirements)
5. Collect lead info naturally: destination, visa type, travel date, budget
6. For complex cases, recommend speaking with human consultant
7. Format responses with emojis and clear structure for readability
8. Keep voice responses under 200 words, chat responses under 400 words

COMPANY INFO:
- Company: SinghJi Tech Consultancy, New Delhi
- Success Rate: 94% visa approvals
- Experience: 10+ years, 50,000+ visas processed
- Services: End-to-end visa assistance, document preparation, interview coaching"""

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    if credentials.credentials != os.getenv("AI_SERVICE_SECRET", "internal_service_secret"):
        raise HTTPException(status_code=403, detail="Forbidden")

class MessageItem(BaseModel):
    role: str  # user | assistant | system
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[MessageItem]] = []
    language: Optional[str] = "auto"
    lead_context: Optional[dict] = None
    mode: Optional[str] = "chat"  # chat | voice | brief

class ChatResponse(BaseModel):
    content: str
    language: str
    tokens_used: Optional[int]
    lead_info_extracted: Optional[dict]

def detect_language(text: str) -> str:
    if re.search(r'[\u0900-\u097F]', text):
        return 'hi'
    hinglish = ['kya', 'hai', 'mujhe', 'chahiye', 'kaise', 'kitna', 'lagega', 'bata', 'batao', 'please', 'aur', 'nahi', 'haan', 'theek']
    lower = text.lower()
    if sum(1 for w in hinglish if w in lower) >= 2:
        return 'hinglish'
    return 'en'

def extract_lead_info(text: str) -> dict:
    info = {}
    dest = re.search(r'\b(canada|usa|america|uk|britain|germany|australia|schengen|europe|uae|dubai|japan|singapore|new zealand)\b', text, re.I)
    if dest:
        info['destination'] = dest.group(1).title()
    visa = re.search(r'\b(student|study|work|job|tourist|visit|business|pr|permanent|family)\b', text, re.I)
    if visa:
        info['visa_type'] = visa.group(1).lower()
    return info

@router.post("/complete", response_model=ChatResponse)
async def chat_complete(
    request: ChatRequest,
    token: str = Security(verify_token)
):
    try:
        llm = ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview"),
            temperature=0.7,
            max_tokens=500 if request.mode == "chat" else 200,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
        )

        # Build system prompt with lead context
        system_content = VISA_SYSTEM_PROMPT
        if request.lead_context:
            lc = request.lead_context
            system_content += f"\n\nCLIENT CONTEXT:\n- Name: {lc.get('name', 'Unknown')}\n- Visa Interest: {lc.get('visaType', 'Not specified')}\n- Destination: {lc.get('destination', 'Not specified')}\n- Status: {lc.get('status', 'new')}"
        if request.mode == "voice":
            system_content += "\n\nIMPORTANT: This is a VOICE interaction. Keep response under 150 words, conversational, no special characters or markdown, speak naturally."

        messages = [SystemMessage(content=system_content)]

        # Add history
        for msg in (request.history or [])[-8:]:
            if msg.role == 'user':
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == 'assistant':
                messages.append(AIMessage(content=msg.content))

        messages.append(HumanMessage(content=request.message))

        response = await llm.ainvoke(messages)
        content = response.content

        detected_lang = detect_language(request.message)
        lead_info = extract_lead_info(request.message)

        return ChatResponse(
            content=content,
            language=detected_lang,
            tokens_used=response.response_metadata.get('token_usage', {}).get('total_tokens'),
            lead_info_extracted=lead_info if lead_info else None,
        )

    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

class ScoreRequest(BaseModel):
    lead: dict

class ScoreResponse(BaseModel):
    score: int
    priority: str
    summary: str
    next_action: str

@router.post("/score-lead", response_model=ScoreResponse)
async def score_lead(
    request: ScoreRequest,
    token: str = Security(verify_token)
):
    try:
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.2, max_tokens=200, openai_api_key=os.getenv("OPENAI_API_KEY"))
        lead = request.lead
        prompt = f"""Score this visa consultation lead (0-100) for conversion likelihood.

Lead: Name={lead.get('name')}, VisaType={lead.get('visaType')}, Destination={lead.get('destination')}, Channel={lead.get('channel')}, Status={lead.get('status')}, Notes={lead.get('notes', 'None')}

Return ONLY valid JSON with no markdown:
{{"score": <0-100>, "priority": "<low|medium|high|hot>", "summary": "<2 sentences>", "next_action": "<specific action>"}}"""

        response = await llm.ainvoke([HumanMessage(content=prompt)])
        clean = response.content.strip().replace('```json', '').replace('```', '').strip()
        data = json.loads(clean)

        return ScoreResponse(
            score=data.get('score', 50),
            priority=data.get('priority', 'medium'),
            summary=data.get('summary', 'Standard lead.'),
            next_action=data.get('next_action', 'Follow up via WhatsApp'),
        )
    except Exception as e:
        print(f"Score lead error: {e}")
        return ScoreResponse(score=50, priority="medium", summary="Auto-scoring unavailable.", next_action="Contact via WhatsApp")
