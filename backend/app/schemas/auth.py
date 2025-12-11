from pydantic import BaseModel, EmailStr

class HospitalRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    address: str | None = None
    phone: str | None = None

class HospitalLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
