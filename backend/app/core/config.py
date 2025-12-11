from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import field_validator

class Settings(BaseSettings):
    SECRET_KEY: str = "dev_secret_key"
    DATABASE_URL: str = "sqlite:///./pulseai.db"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 jours
    
    # CORS Configuration
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "https://pulseai.vercel.app"]
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    # Google Sheets Configuration
    GOOGLE_SHEET_ID: str = ""
    GOOGLE_CREDENTIALS_PATH: str = "./pulseai-backend-94eaf873090c.json"
    SERVICE_ACCOUNT_EMAIL: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
