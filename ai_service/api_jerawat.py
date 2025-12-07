from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import base64
from contextlib import asynccontextmanager

# --- IMPORT LOGIKA ARKA ---
from expert_logic import load_knowledge_base, get_advice

# Fungsi biar Excel diload pas Server nyala
@asynccontextmanager
async def lifespan(app: FastAPI):
    load_knowledge_base() 
    yield

app = FastAPI(lifespan=lifespan)

# Setup CORS
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

# Load Model YOLO (Pastikan file best.pt kamu sudah yang paling pinter/train3)
path_model = 'runs/detect/train2/weights/best.pt'
model = YOLO(path_model)

# --- FUNGSI BANTUAN ---

def image_to_base64(image):
    _, buffer = cv2.imencode('.jpg', image)
    img_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{img_str}"

# FUNGSI BARU: PENAJAM CITRA (MATA KUCING)
# Biar webcam burik jadi jelas di mata AI
def enhance_image(image):
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl,a,b))
    final = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    return final

@app.get("/")
def home():
    return {"service": "Pimple Detection + Expert System", "status": "Online"}

@app.post("/analyze")
async def detect_pimple(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 1. FLIP GAMBAR (Biar kayak bercermin dan teks gak kebalik)
        img = cv2.flip(img, 1) 

        # 2. PERJELAS GAMBAR (Untuk dilihat AI)
        # Kita pakai gambar yg dipertajam buat deteksi, tapi gambar asli buat ditampilkan
        img_ai = enhance_image(img)

        # 3. JALANKAN YOLO (Settingan Sweet Spot)
        # Pakai img_ai (tajam)
        results = model(img_ai, conf=0.15, iou=0.5, augment=True)
        
        jerawat_data = {}
        img_hasil = img.copy() # Kita gambar kotak di foto asli yang natural

        # Hitung batas ukuran maksimal jerawat (misal 15% lebar layar)
        # Kalau lebih gede dari ini, kemungkinan itu hidung/mulut
        height, width, _ = img.shape
        max_pimple_size = width * 0.15 

        for result in results:
            for box in result.boxes:
                # Ambil koordinat kotak
                x1, y1, x2, y2 = box.xyxy[0]
                box_w = x2 - x1
                box_h = y2 - y1
                
                # --- LOGIC FILTER (BIAR GAK HALU) ---
                # Kalau kotaknya raksasa, skip aja
                if box_w > max_pimple_size or box_h > max_pimple_size:
                    continue 

                # Ambil Data
                cls_id = int(box.cls[0])
                nama = model.names[cls_id]
                conf = float(box.conf[0])
                
                # Masukkan ke Data Statistik
                jerawat_data[nama] = jerawat_data.get(nama, 0) + 1
                
                # Gambar Kotak Merah Manual & Teks
                cv2.rectangle(img_hasil, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                cv2.putText(img_hasil, f"{nama} {conf:.2f}", (int(x1), int(y1)-10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        
        # 4. MINTA SARAN (EXPERT SYSTEM ARKA)
        rekomendasi_list = []
        for jenis_jerawat in jerawat_data.keys():
            saran = get_advice(jenis_jerawat)
            rekomendasi_list.append(saran)

        gambar_output = image_to_base64(img_hasil)

        return {
            "status": "success",
            "counts": jerawat_data,       # Data Statistik
            "expert_advice": rekomendasi_list, # Data Saran Pengobatan (Punya Arka)
            "image_result": gambar_output
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}