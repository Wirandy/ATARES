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
    load_knowledge_base() # <--- Load Excel Arka di sini
    yield

app = FastAPI(lifespan=lifespan)

# <-- TAMBAHKAN BLOK INI SETELAH app = FastAPI()
origins = [
    "http://localhost:3000",  # Domain Next.js Anda
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# END TAMBAH BLOK CORS

# Load Model YOLO
path_model = 'runs/detect/train2/weights/best.pt'
model = YOLO(path_model)

def image_to_base64(image):
    _, buffer = cv2.imencode('.jpg', image)
    img_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{img_str}"

@app.get("/")
def home():
    return {"service": "Pimple Detection + Expert System", "status": "Online"}

@app.post("/detect")
async def detect_pimple(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 1. DETEKSI (YOLO)
        results = model(img, conf=0.15, augment=True)
        
        jerawat_data = {} # Hitung jumlah: {'whitehead': 2, 'acne': 1}
        img_hasil = img.copy()

        for result in results:
            img_hasil = result.plot()
            for box in result.boxes:
                cls_id = int(box.cls[0])
                nama = model.names[cls_id]
                jerawat_data[nama] = jerawat_data.get(nama, 0) + 1
        
        # 2. MINTA SARAN (EXPERT SYSTEM ARKA)
        rekomendasi_list = []
        for jenis_jerawat in jerawat_data.keys():
            # Panggil fungsi Arka buat dapet saran
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