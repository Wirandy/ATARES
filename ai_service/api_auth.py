from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import cv2
import numpy as np
import os
import shutil
import math

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

DATABASE_PATH = "database_wajah"
if not os.path.exists(DATABASE_PATH):
    os.makedirs(DATABASE_PATH)

def load_image_from_upload(file_bytes):
    nparr = np.frombuffer(file_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

@app.get("/")
def home():
    return {"service": "Authentication Service (DeepFace)", "status": "Online"}

# --- 1. REGISTER / SIGN UP ---
@app.post("/signup")
async def signup(username: str = Form(...), file: UploadFile = File(...)):
    try:
        file_location = os.path.join(DATABASE_PATH, f"{username}.jpg")
        if os.path.exists(file_location):
            return JSONResponse(status_code=400, content={"status": "failed", "message": "Username sudah ada!"})
        
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {"status": "success", "message": f"User {username} berhasil didaftarkan."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# --- 2. LOGIN (VERIFIKASI SAJA) ---
@app.post("/login")
async def login_only(username: str = Form(...), file: UploadFile = File(...)):
    try:
        # Baca gambar
        contents = await file.read()
        frame_input = load_image_from_upload(contents)
        temp_filename = "temp_login.jpg"
        cv2.imwrite(temp_filename, frame_input)

        db_img_path = os.path.join(DATABASE_PATH, f"{username}.jpg")
        
        if not os.path.exists(db_img_path):
            return JSONResponse(status_code=404, content={"status": "failed", "message": "User tidak ditemukan"})

        # Proses DeepFace
        status_login = "failed"
        pesan = "Wajah tidak cocok"
        skor = 1.0

        try:
            verifikasi = DeepFace.verify(img1_path=temp_filename, 
                                         img2_path=db_img_path, 
                                         model_name="VGG-Face", 
                                         enforce_detection=False)
            
            # Sanitasi angka (biar gak error JSON)
            raw_score = float(verifikasi['distance'])
            if math.isnan(raw_score) or math.isinf(raw_score):
                skor = 1.0
            else:
                skor = raw_score

            if verifikasi['verified']:
                status_login = "success"
                pesan = "Login Berhasil"
        except:
            pesan = "Wajah tidak terdeteksi"

        return {
            "status": status_login,
            "message": pesan,
            "username": username,
            "score": skor
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})