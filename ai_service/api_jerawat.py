from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import base64

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

# Load Model YOLO (Pastikan path benar)
path_model = 'runs/detect/train2/weights/best.pt'
model = YOLO(path_model)

def image_to_base64(image):
    _, buffer = cv2.imencode('.jpg', image)
    img_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{img_str}"

@app.get("/")
def home():
    return {"service": "Pimple Detection Service (YOLO)", "status": "Online"}

# --- ENDPOINT DETEKSI ---
@app.post("/detect")
async def detect_pimple(file: UploadFile = File(...)):
    try:
        # Baca gambar
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Jalankan YOLO
        results = model(img, conf=0.25)
        
        jerawat_data = {}
        img_hasil = img.copy()

        for result in results:
            img_hasil = result.plot() # Gambar kotak merah
            for box in result.boxes:
                cls_id = int(box.cls[0])
                nama = model.names[cls_id]
                jerawat_data[nama] = jerawat_data.get(nama, 0) + 1
        
        # Convert gambar hasil ke Base64
        gambar_output = image_to_base64(img_hasil)

        return {
            "status": "success",
            "detail_acne": jerawat_data,
            "image_result": gambar_output
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}