from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import shutil
import os
import cv2
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

DB_PATH = "database_wajah"
os.makedirs(DB_PATH, exist_ok=True)

@app.post("/signup")
async def signup_face(username: str = Form(...), file: UploadFile = File(...)):
    file_location = f"{DB_PATH}/{username}.jpg"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"status": "success", "message": f"User {username} terdaftar!"}

@app.post("/login")
async def login_face(username: str = Form(...), file: UploadFile = File(...)):
    user_img_path = f"{DB_PATH}/{username}.jpg"
    
    if not os.path.exists(user_img_path):
        return {"status": "error", "message": "User belum terdaftar!"}

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    login_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    try:
        # --- PERUBAHAN UTAMA DI SINI ---
        # Ganti model_name="VGG-Face" menjadi "FaceNet512"
        result = DeepFace.verify(
            img1_path=login_img,
            img2_path=user_img_path,
            model_name="Facenet512", # Request Dosen
            detector_backend="opencv",
            distance_metric="cosine"
        )
        
        if result['verified']:
            return {"status": "success", "message": "Wajah Cocok!", "score": result['distance']}
        else:
            return {"status": "fail", "message": "Wajah Tidak Cocok"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}