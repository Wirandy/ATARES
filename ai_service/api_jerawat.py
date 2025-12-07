from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import base64
import mediapipe as mp
from contextlib import asynccontextmanager
from expert_logic import load_knowledge_base, get_advice

# --- LIFESPAN: LOAD DATABASE OBAT SAAT STARTUP ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("⏳ Loading Knowledge Base...")
    load_knowledge_base() 
    print("✅ Knowledge Base Siap!")
    yield

app = FastAPI(lifespan=lifespan)

# --- SETUP CORS ---
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

# --- LOAD MODEL YOLO ---
# Pastikan path ini mengarah ke hasil training terbaikmu (Small atau Medium)
path_model = 'runs/detect/train3/weights/best.pt' 
model = YOLO(path_model)

# --- SETUP MEDIAPIPE (FACE MESH) ---
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

# --- FUNGSI BANTUAN ---

def image_to_base64(image):
    _, buffer = cv2.imencode('.jpg', image)
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"

# 1. SATPAM KUALITAS GAMBAR (NEW FEATURE)
def check_image_quality(image):
    # Cek Kecerahan (Brightness)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    brightness = np.mean(gray)
    
    # Cek Keburaman (Blur) pakai Variance of Laplacian
    # Semakin kecil angkanya, semakin buram
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    messages = []
    is_bad = False
    
    # Ambang Batas (Threshold)
    if brightness < 40: # Terlalu Gelap
        is_bad = True
        messages.append("⚠️ Foto terlalu GELAP. Cari cahaya lebih terang.")
    elif brightness > 220: # Terlalu Silau
        is_bad = True
        messages.append("⚠️ Foto terlalu SILAU (Over-exposed).")
        
    if blur_score < 50: # Terlalu Blur (Angka 50 cukup toleran untuk webcam)
        is_bad = True
        messages.append("⚠️ Foto BURAM/GOYANG. Harap stabilkan kamera.")
        
    return is_bad, messages

# 2. PENAJAM CITRA (CLAHE)
def enhance_image(image):
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    limg = cv2.merge((clahe.apply(l),a,b))
    return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

# 3. MASKING (SENSOR MATA & MULUT)
def apply_masking(image, landmarks, h, w):
    img_masked = image.copy()
    
    indices_list = [
        [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398], # Mata Kiri
        [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],    # Mata Kanan
        [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146] # Mulut
    ]

    for indices in indices_list:
        pts = np.array([(int(landmarks[i].x * w), int(landmarks[i].y * h)) for i in indices])
        cv2.fillConvexPoly(img_masked, pts, (180, 180, 180)) # Tutup warna abu-abu
    return img_masked

# --- ENDPOINT UTAMA ---

@app.post("/analyze")
async def detect_pimple(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Mirror Image (Biar kayak cermin)
        img = cv2.flip(img, 1)

        # --- LANGKAH 1: QUALITY CONTROL (SATPAM) ---
        # Sebelum diproses berat-berat, cek dulu layak gak gambarnya
        is_bad, error_msgs = check_image_quality(img)
        
        if is_bad:
            # Kalau gambar jelek, langsung tolak halus
            return {
                "status": "success", 
                "counts": {}, 
                "expert_advice": error_msgs, # Kasih tau user kenapa ditolak
                "image_result": image_to_base64(img) # Balikin gambar asli
            }

        # --- LANGKAH 2: CARI WAJAH (AUTO-CROP LOGIC) ---
        rgb_image = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_image)

        # Kalau gak ada wajah, return pesan error
        if not results.multi_face_landmarks:
            return {
                "status": "success", 
                "counts": {}, 
                "expert_advice": ["❌ Wajah tidak terdeteksi. Pastikan wajah terlihat jelas."], 
                "image_result": image_to_base64(img)
            }

        landmarks = results.multi_face_landmarks[0].landmark
        h, w, _ = img.shape

        # Hitung Koordinat Crop (Potong Wajah)
        x_coords = [int(l.x * w) for l in landmarks]
        y_coords = [int(l.y * h) for l in landmarks]
        
        padding = 50 # Margin tambahan
        min_x = max(0, min(x_coords) - padding)
        max_x = min(w, max(x_coords) + padding)
        min_y = max(0, min(y_coords) - padding)
        max_y = min(h, max(y_coords) + padding)

        # --- LANGKAH 3: PREPROCESSING AI (ENHANCE + MASKING) ---
        img_enhanced = enhance_image(img)
        img_masked = apply_masking(img_enhanced, landmarks, h, w)

        # --- LANGKAH 4: LAKUKAN CROP ---
        # Potong gambar yg sudah dimasker (buat AI mikir)
        face_img_ai = img_masked[min_y:max_y, min_x:max_x]
        # Potong gambar asli bersih (buat ditampilkan ke user)
        face_img_display = img[min_y:max_y, min_x:max_x] 

        # --- LANGKAH 5: JALANKAN YOLO ---
        # Deteksi hanya pada area wajah yang sudah dipotong
        results_yolo = model(face_img_ai, conf=0.15, iou=0.5, augment=True)
        
        jerawat_data = {}
        img_hasil = face_img_display.copy()
        
        # Filter Ukuran Jerawat (Anti Salah Deteksi Hidung)
        h_crop, w_crop, _ = img_hasil.shape
        max_size = w_crop * 0.15 

        for result in results_yolo:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0]
                
                # Skip kalau deteksinya kebesaran (biasanya salah deteksi hidung/dagu)
                if (x2-x1) > max_size or (y2-y1) > max_size: 
                    continue 

                cls_id = int(box.cls[0])
                nama = model.names[cls_id]
                conf = float(box.conf[0])
                
                jerawat_data[nama] = jerawat_data.get(nama, 0) + 1
                
                # Gambar Kotak
                cv2.rectangle(img_hasil, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                cv2.putText(img_hasil, f"{nama}", (int(x1), int(y1)-5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 255), 1)
        
        # --- LANGKAH 6: SORTING & SARAN ---
        # Urutkan masalah dari yang terbanyak
        jerawat_sorted = dict(sorted(jerawat_data.items(), key=lambda item: item[1], reverse=True))
        
        rekomendasi = []
        for jenis in jerawat_sorted.keys():
            rekomendasi.append(get_advice(jenis))
            
        if not jerawat_sorted:
            rekomendasi.append({"type": "INFO", "treatment": "-", "advice": "Kulit tampak bersih! Pertahankan."})

        return {
            "status": "success",
            "counts": jerawat_sorted,
            "expert_advice": rekomendasi,
            "image_result": image_to_base64(img_hasil)
        }

    except Exception as e:
        print(f"ERROR: {e}") # Log ke terminal
        return {"status": "error", "message": str(e)}