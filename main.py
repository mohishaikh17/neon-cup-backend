from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

app = FastAPI()

# IMPORTANT: This allows your HTML files to talk to your Python code
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to Supabase
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

@app.get("/")
def home():
    return {"status": "Neon Cup Backend is Running"}

# 1. Endpoint to Register a New User
@app.post("/register")
async def register_user(user_data: dict):
    try:
        # UPDATED: We now include the password in the insert
        response = supabase.table("profiles").insert({
            "username": user_data["username"],
            "email": user_data["email"],
            "password": user_data["password"]  
        }).execute()
        return {"message": "Success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 2. LOGIN ENDPOINT
@app.post("/login")
async def login(credentials: dict):
    try:
        # UPDATED: We check both email AND password
        response = supabase.table("profiles").select("*") \
            .eq("email", credentials["email"]) \
            .eq("password", credentials["password"]) \
            .execute()
        
        if len(response.data) > 0:
            user = response.data[0]
            return {"message": "Login Successful", "user": user}
        else:
            # This triggers if the email doesn't exist OR the password is wrong
            raise HTTPException(status_code=401, detail="Invalid email or password")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 3. GET STATUS ENDPOINT
@app.get("/get-status")
async def get_status(email: str):
    try:
        response = supabase.table("tournament_registrations").select("*").eq("user_email", email).execute()
        if len(response.data) > 0:
            reg = response.data[0]
            return {
                "registered": True,
                "teamName": reg["team_name"],
                "playerId": reg["leader_id"]
            }
        return {"registered": False}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 4. Endpoint to Join the Tournament
@app.post("/join-tournament")
async def join_tournament(team_data: dict):
    try:
        response = supabase.table("tournament_registrations").insert(team_data).execute()
        return {"message": "Joined Successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))