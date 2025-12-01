from ultralytics import YOLO

if __name__ == '__main__':
    # 1. GANTI MODEL: Pakai 's' (Small) biar lebih pintar dari 'n' (Nano)
    print("⏳ Sedang menyiapkan Training Mode 'BIG BRAIN'...")
    model = YOLO('yolov8s.pt') 

    # 2. MULAI TRAINING
    print("🚀 Gas Training! (Estimasi 4-6 Jam)")
    results = model.train(
        data='datasets/data.yaml',  # Pastikan folder datasets sudah dicopy!
        epochs=50,      # Latihan lebih lama (50 putaran)
        imgsz=640, 
        device='cpu',   # Ganti '0' kalau laptopmu kuat & mau pake GPU
        patience=10,    # Stop kalau 10x gak ada kemajuan
        
        # --- TEKNIK AUGMENTASI (LATIHAN FISIK) ---
        hsv_h=0.015,    # Variasi warna
        hsv_s=0.7,      # Variasi saturasi
        hsv_v=0.4,      # PENTING: Variasi Gelap/Terang (buat webcam redup)
        degrees=15.0,   # Rotasi (kepala miring)
        fliplr=0.5,     # Flip kiri-kanan
        mosaic=1.0,     # Potong-tempel gambar
        scale=0.5,      # Zoom in/out
    )
    
    print("✅ TRAINING SELESAI! Cek folder 'runs/detect/train...'")