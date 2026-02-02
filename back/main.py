from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from audit import PropertyAuditEngine

# Initialize FastAPI app
app = FastAPI()

# Allow frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://housingbriidgeaudit.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request model
class AuditRequest(BaseModel):                                                                                                 
    url: str   


@app.post("/api/audit")
def run_audit(request: AuditRequest):
    engine = PropertyAuditEngine(request.url)
    engine.fetch_listing()
    result = engine.run_scam_analysis()

    return {                                                                                                                   
        "price": result.get("price", 0),                                                                                       
        "neighborhood": result.get("neighborhood", "Unknown"),                                                                 
        "scamScore": result.get("scam_score", 50),                                                                             
        "transitScore": 0,                                                                                                     
        "wifiSpeed": "N/A",                                                                                                    
        "description": result.get("description", ""),                                                                          
    }   