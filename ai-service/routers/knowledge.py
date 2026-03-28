"""knowledge.py — Semantic search over visa knowledge base"""
from fastapi import APIRouter, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import os

router = APIRouter()
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    from fastapi import HTTPException
    if credentials.credentials != os.getenv("AI_SERVICE_SECRET", "internal_service_secret"):
        raise HTTPException(status_code=403, detail="Forbidden")

KNOWLEDGE_STORE = {
    "canada": {
        "student": {"requirements": ["Letter of Acceptance from DLI", "IELTS 6.0+ Academic", "Proof of funds CAD 10,000+/year", "Valid passport (6+ months)", "Study Permit application (IMM 1294)", "Biometrics enrollment", "Medical exam if required"], "fee": "CAD 150", "processing": "8-16 weeks", "success_rate": "91%"},
        "work": {"requirements": ["Job offer or LMIA", "Relevant qualification", "Language proficiency", "Work Permit application"], "fee": "CAD 155", "processing": "2-27 weeks", "success_rate": "88%"},
        "tourist": {"requirements": ["Valid passport", "Financial proof", "Travel itinerary", "No criminal record"], "fee": "CAD 100", "processing": "4-8 weeks", "success_rate": "85%"},
    },
    "germany": {
        "work": {"requirements": ["Job offer from German employer or Job Seeker Visa", "Recognized qualification", "German language B1/B2", "Blocked account EUR 11,208", "Health insurance"], "fee": "EUR 75", "processing": "4-8 weeks", "success_rate": "87%"},
        "student": {"requirements": ["University admission letter", "Blocked account EUR 11,208", "IELTS or German language proof", "Health insurance", "Accommodation proof"], "fee": "EUR 75", "processing": "4-8 weeks", "success_rate": "89%"},
    },
    "uk": {
        "work": {"requirements": ["Job offer from licensed UK sponsor", "Certificate of Sponsorship (CoS)", "Salary min GBP 26,200", "IELTS B1 English", "Valid passport"], "fee": "GBP 719", "processing": "3-8 weeks", "success_rate": "90%"},
        "student": {"requirements": ["CAS from UK university", "IELTS 6.0+", "Funds GBP 1,334/month (London) or GBP 1,023/month (outside)", "Valid passport"], "fee": "GBP 490", "processing": "3-6 weeks", "success_rate": "88%"},
        "tourist": {"requirements": ["Travel itinerary", "Bank statements", "Employment/business proof", "Accommodation proof"], "fee": "GBP 115", "processing": "3-6 weeks", "success_rate": "82%"},
    },
    "australia": {
        "student": {"requirements": ["CoE from Australian institution", "IELTS 5.5-6.0+", "Funds AUD 21,041/year", "Health insurance (OSHC)", "Health exam"], "fee": "AUD 620", "processing": "4-12 weeks", "success_rate": "86%"},
        "work": {"requirements": ["Employer sponsorship or Skills Assessment", "IELTS 6.0+", "Positive Skills Assessment", "Points-based (189/190/491)"], "fee": "AUD 4,115", "processing": "4-16 months", "success_rate": "75%"},
    },
    "usa": {
        "student": {"requirements": ["I-20 from SEVIS-approved school", "IELTS 6.5+ or TOEFL 80+", "Funds USD 20,000+/year", "SEVIS fee USD 350", "Visa interview at embassy"], "fee": "USD 160", "processing": "2-8 weeks", "success_rate": "78%"},
        "tourist": {"requirements": ["Valid passport", "DS-160 form", "Bank statements", "Ties to India (job, property, family)", "Interview at US Embassy"], "fee": "USD 160", "processing": "2-8 weeks", "success_rate": "70%"},
    },
    "schengen": {
        "tourist": {"requirements": ["Passport valid 3+ months after return", "Travel insurance EUR 30,000 minimum", "Hotel/accommodation bookings", "Return flight tickets", "Bank statements (3-6 months)", "Funds EUR 85-100/day", "Employment/business proof"], "fee": "EUR 80", "processing": "15 working days", "success_rate": "94%"},
        "business": {"requirements": ["Business invitation letter", "Company registration", "Bank statements", "Travel insurance"], "fee": "EUR 80", "processing": "15 working days", "success_rate": "88%"},
    },
    "uae": {
        "work": {"requirements": ["Job offer from UAE employer", "Company-sponsored", "Medical fitness test", "Emirates ID after arrival"], "fee": "AED 1,000-2,000", "processing": "2-4 weeks", "success_rate": "92%"},
        "tourist": {"requirements": ["Passport 6+ months validity", "Photo", "Hotel booking", "Return ticket", "Bank statement"], "fee": "AED 270 (30 days)", "processing": "3-5 days", "success_rate": "95%"},
    },
    "new zealand": {
        "student": {"requirements": ["Offer from NZ institution", "Funds NZD 15,000/year", "IELTS 5.5-6.5", "Health insurance", "Medical exam"], "fee": "NZD 330", "processing": "4-6 weeks", "success_rate": "87%"},
    },
    "singapore": {
        "work": {"requirements": ["Job offer from Singapore employer", "EP/S Pass application", "Relevant qualifications", "Salary min SGD 4,500 (EP)"], "fee": "SGD 105", "processing": "3-8 weeks", "success_rate": "85%"},
    },
}

class KnowledgeRequest(BaseModel):
    country: str
    visa_type: Optional[str] = None

class KnowledgeResponse(BaseModel):
    country: str
    visa_type: str
    requirements: List[str]
    fee: str
    processing: str
    success_rate: str
    found: bool

@router.post("/lookup", response_model=KnowledgeResponse)
async def lookup_knowledge(
    request: KnowledgeRequest,
    token: str = Security(verify_token)
):
    country = request.country.lower().strip()
    visa_type = (request.visa_type or "tourist").lower().strip()

    country_data = KNOWLEDGE_STORE.get(country)
    if not country_data:
        # Try partial match
        for k in KNOWLEDGE_STORE:
            if k in country or country in k:
                country_data = KNOWLEDGE_STORE[k]
                country = k
                break

    if not country_data:
        return KnowledgeResponse(country=request.country, visa_type=visa_type, requirements=["Please contact our consultants for details"], fee="Contact us", processing="Varies", success_rate="N/A", found=False)

    visa_data = country_data.get(visa_type) or list(country_data.values())[0]
    visa_type_used = visa_type if visa_type in country_data else list(country_data.keys())[0]

    return KnowledgeResponse(
        country=country.title(),
        visa_type=visa_type_used,
        requirements=visa_data["requirements"],
        fee=visa_data["fee"],
        processing=visa_data["processing"],
        success_rate=visa_data["success_rate"],
        found=True,
    )

@router.get("/countries")
async def list_countries(token: str = Security(verify_token)):
    return {"countries": list(KNOWLEDGE_STORE.keys()), "total": len(KNOWLEDGE_STORE)}
