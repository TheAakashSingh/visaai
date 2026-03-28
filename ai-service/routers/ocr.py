"""
OCR Router — Google Vision API + Tesseract fallback
Processes passports, visas, bank statements
"""
from fastapi import APIRouter, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import base64
import os
import io
import re
from PIL import Image

router = APIRouter()
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    if credentials.credentials != os.getenv("AI_SERVICE_SECRET", "internal_service_secret"):
        raise HTTPException(status_code=403, detail="Forbidden")
    return credentials.credentials

class OCRRequest(BaseModel):
    image_data: str          # base64 encoded
    mime_type: str
    document_type: Optional[str] = "auto"

class OCRResponse(BaseModel):
    full_name: Optional[str]
    date_of_birth: Optional[str]
    document_number: Optional[str]
    issue_date: Optional[str]
    expiry_date: Optional[str]
    nationality: Optional[str]
    gender: Optional[str]
    place_of_issue: Optional[str]
    detected_type: Optional[str]
    raw_text: str
    confidence: float
    provider: str

def extract_with_google_vision(image_bytes: bytes) -> tuple[str, float]:
    """Extract text using Google Vision API"""
    try:
        from google.cloud import vision
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_bytes)
        response = client.text_detection(image=image)
        
        if response.error.message:
            raise Exception(f"Vision API error: {response.error.message}")
        
        texts = response.text_annotations
        if not texts:
            return "", 0.0
        
        full_text = texts[0].description
        # Estimate confidence from word-level detections
        confidences = []
        for page in response.full_text_annotation.pages:
            for block in page.blocks:
                for para in block.paragraphs:
                    for word in para.words:
                        if hasattr(word, 'confidence'):
                            confidences.append(word.confidence)
        
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.85
        return full_text, avg_conf
    except Exception as e:
        print(f"Google Vision failed: {e}, falling back to Tesseract")
        return "", 0.0

def extract_with_tesseract(image_bytes: bytes) -> tuple[str, float]:
    """Fallback OCR using Tesseract"""
    try:
        import pytesseract
        img = Image.open(io.BytesIO(image_bytes))
        # Enhance image for better OCR
        img = img.convert('L')  # Grayscale
        
        # Get detailed data
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        text = pytesseract.image_to_string(img, config='--psm 6')
        
        # Calculate confidence
        confidences = [int(c) for c in data['conf'] if int(c) > 0]
        avg_conf = (sum(confidences) / len(confidences) / 100) if confidences else 0.7
        
        return text, avg_conf
    except Exception as e:
        print(f"Tesseract error: {e}")
        return "", 0.5

def parse_passport_data(text: str) -> dict:
    """Parse passport MRZ and text fields"""
    data = {}
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # MRZ parsing (Machine Readable Zone)
    mrz_lines = [l for l in lines if len(l) >= 30 and re.search(r'[A-Z<]{10,}', l)]
    
    if len(mrz_lines) >= 2:
        mrz1 = mrz_lines[0].replace(' ', '')
        mrz2 = mrz_lines[-1].replace(' ', '') if len(mrz_lines) > 1 else ''
        
        # Passport type line 1: P<INDLAST<<FIRST<MIDDLE<<<<
        if mrz1.startswith('P'):
            try:
                name_part = mrz1[5:44] if len(mrz1) > 44 else mrz1[5:]
                name_parts = name_part.split('<<')
                if name_parts:
                    last = name_parts[0].replace('<', ' ').strip()
                    first = name_parts[1].replace('<', ' ').strip() if len(name_parts) > 1 else ''
                    full = f"{first} {last}".strip()
                    if full and len(full) > 2:
                        data['full_name'] = full.title()
            except: pass
        
        # Line 2: doc_number(9) + check + nationality(3) + DOB(6) + check + sex + expiry(6) + check
        if len(mrz2) >= 28:
            try:
                data['document_number'] = mrz2[:9].replace('<', '')
                data['nationality'] = mrz2[10:13].replace('<', '')
                
                dob_raw = mrz2[13:19]
                if re.match(r'\d{6}', dob_raw):
                    yr = int(dob_raw[:2])
                    year = 1900 + yr if yr > 30 else 2000 + yr
                    data['date_of_birth'] = f"{dob_raw[4:6]}/{dob_raw[2:4]}/{year}"
                
                gender_code = mrz2[20]
                data['gender'] = 'Male' if gender_code == 'M' else 'Female' if gender_code == 'F' else 'Other'
                
                exp_raw = mrz2[21:27]
                if re.match(r'\d{6}', exp_raw):
                    yr = int(exp_raw[:2])
                    year = 2000 + yr if yr < 50 else 1900 + yr
                    data['expiry_date'] = f"{exp_raw[4:6]}/{exp_raw[2:4]}/{year}"
            except: pass
    
    # Fallback regex patterns for regular text
    if not data.get('full_name'):
        name_patterns = [
            r'(?:Name|Given Name|Surname)[:\s]+([A-Z][a-zA-Z\s]+)',
            r'([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)',
        ]
        for pat in name_patterns:
            m = re.search(pat, text)
            if m:
                data['full_name'] = m.group(1).strip().title()
                break
    
    if not data.get('document_number'):
        m = re.search(r'\b([A-Z][0-9]{7,8})\b', text)
        if m:
            data['document_number'] = m.group(1)
    
    # Place of issue
    m = re.search(r'(?:Place of Issue|Issued at|Issuing Authority)[:\s]+([A-Za-z\s]+)', text, re.IGNORECASE)
    if m:
        data['place_of_issue'] = m.group(1).strip()
    
    # Issue date patterns
    date_patterns = [
        r'(?:Date of Issue|Issue Date)[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
        r'(?:Issued on)[:\s]+(\d{1,2}\s+\w+\s+\d{4})',
    ]
    for pat in date_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            data['issue_date'] = m.group(1)
            break
    
    return data

def detect_document_type(text: str) -> str:
    text_lower = text.lower()
    if any(w in text_lower for w in ['passport', 'republic of india', 'p<ind']):
        return 'passport'
    if any(w in text_lower for w in ['visa', 'visa type', 'visa number', 'duration of stay']):
        return 'visa'
    if any(w in text_lower for w in ['bank statement', 'account number', 'balance', 'transaction']):
        return 'bank_statement'
    if any(w in text_lower for w in ['offer letter', 'employment', 'salary', 'appointment']):
        return 'offer_letter'
    if any(w in text_lower for w in ['degree', 'certificate', 'university', 'diploma']):
        return 'degree'
    return 'other'

@router.post("/process", response_model=OCRResponse)
async def process_document(
    request: OCRRequest,
    token: str = Security(verify_token)
):
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(request.image_data)
        
        # Try Google Vision first
        raw_text, confidence = extract_with_google_vision(image_bytes)
        provider = "google_vision"
        
        # Fallback to Tesseract
        if not raw_text or confidence < 0.3:
            raw_text, confidence = extract_with_tesseract(image_bytes)
            provider = "tesseract"
        
        if not raw_text:
            raise HTTPException(status_code=422, detail="Could not extract text from document")
        
        # Detect document type
        detected_type = request.document_type if request.document_type != "auto" else detect_document_type(raw_text)
        
        # Parse fields
        parsed = parse_passport_data(raw_text) if detected_type in ['passport', 'visa', 'auto'] else {}
        
        return OCRResponse(
            full_name=parsed.get('full_name'),
            date_of_birth=parsed.get('date_of_birth'),
            document_number=parsed.get('document_number'),
            issue_date=parsed.get('issue_date'),
            expiry_date=parsed.get('expiry_date'),
            nationality=parsed.get('nationality'),
            gender=parsed.get('gender'),
            place_of_issue=parsed.get('place_of_issue'),
            detected_type=detected_type,
            raw_text=raw_text[:2000],  # Trim for response
            confidence=round(confidence, 3),
            provider=provider,
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"OCR processing error: {e}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")
