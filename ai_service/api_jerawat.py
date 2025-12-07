from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import base64
import mediapipe as mp
from contextlib import asynccontextmanager
from expert_logic import load_knowledge_base, get_advice

# Load Knowledge Base
@asynccontextmanager
async def lifespan(app: FastAPI):
    load_knowledge_base() 
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

# LOAD MODEL (Pastikan path benar)
path_model = 'runs/detect/train3/weights/best.pt' 
model = YOLO(path_model)

# SETUP MEDIAPIPE
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True, max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.5
)

def image_to_base64(image):
    _, buffer = cv2.imencode('.jpg', image)
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"

# 1. ENHANCE IMAGE
def enhance_image(image):
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    limg = cv2.merge((clahe.apply(l),a,b))
    return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

# 2. MASKING (Tutup Mata & Mulut)
def apply_masking(image, landmarks, h, w):
    img_masked = image.copy()
    
    indices_list = [
        [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398], # Mata Kiri
        [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],    # Mata Kanan
        [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146] # Mulut
    ]

    for indices in indices_list:
        pts = np.array([(int(landmarks[i].x * w), int(landmarks[i].y * h)) for i in indices])
        cv2.fillConvexPoly(img_masked, pts, (180, 180, 180)) # Warna Abu-abu
    return img_masked

@app.post("/detect")
async def detect_pimple(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img = cv2.flip(img, 1) # Mirror

        # A. CARI WAJAH DULU PAKAI MEDIAPIPE
        rgb_image = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_image)

        # Kalau gak ada wajah, balikan gambar asli (biar gak error)
        if not results.multi_face_landmarks:
            return {"status": "success", "counts": {}, "expert_advice": ["Wajah tidak terdeteksi jelas"], "image_result": image_to_base64(img)}

        landmarks = results.multi_face_landmarks[0].landmark
        h, w, _ = img.shape

        # B. HITUNG KOORDINAT CROP (POTONG WAJAH)
        x_coords = [int(l.x * w) for l in landmarks]
        y_coords = [int(l.y * h) for l in landmarks]
        
        # Tambah margin (padding) biar dagu/jidat gak kepotong pas
        padding = 50 
        min_x = max(0, min(x_coords) - padding)
        max_x = min(w, max(x_coords) + padding)
        min_y = max(0, min(y_coords) - padding)
        max_y = min(h, max(y_coords) + padding)

        # C. PROSES AI PADA GAMBAR ASLI DULU (MASKING MATA)
        # Kita masking dulu sebelum crop, biar koordinatnya akurat
        img_enhanced = enhance_image(img)
        img_masked = apply_masking(img_enhanced, landmarks, h, w)

        # D. LAKUKAN CROPPING
        # Kita potong gambar yang sudah dimasker (buat AI)
        # Dan potong gambar asli (buat ditampilkan ke user)
        face_img_ai = img_masked[min_y:max_y, min_x:max_x]
        face_img_display = img[min_y:max_y, min_x:max_x] # Gambar bersih tapi terpotong

        # E. JALANKAN YOLO (Hanya pada area wajah yang sudah dipotong)
        results_yolo = model(face_img_ai, conf=0.15, iou=0.5, augment=True)
        
        jerawat_data = {}
        img_hasil = face_img_display.copy()
        
        # Ukuran jerawat maksimal relatif terhadap wajah yang dicrop
        h_crop, w_crop, _ = img_hasil.shape
        max_size = w_crop * 0.15 

        for result in results_yolo:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0]
                if (x2-x1) > max_size or (y2-y1) > max_size: continue 

                cls_id = int(box.cls[0])
                nama = model.names[cls_id]
                conf = float(box.conf[0])
                jerawat_data[nama] = jerawat_data.get(nama, 0) + 1
                
                cv2.rectangle(img_hasil, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                cv2.putText(img_hasil, f"{nama}", (int(x1), int(y1)-5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 255), 1)
        
        rekomendasi = [get_advice(j) for j in jerawat_data.keys()]

        # F. Return Gambar yang sudah di-CROP
        return {"status": "success", "counts": jerawat_data, "expert_advice": rekomendasi, "image_result": image_to_base64(img_hasil)}

    except Exception as e:
        return {"status": "error", "message": str(e)}