import pandas as pd
import os

# Variabel Global buat nyimpen data
treatment_dict = {}

def load_knowledge_base():
    """Membaca Excel database Arka saat server nyala"""
    global treatment_dict
    file_path = "pimple_treatment_dataset.xlsx"
    
    if not os.path.exists(file_path):
        print(f"⚠️ WARNING: File '{file_path}' tidak ditemukan! Expert System mati.")
        return

    try:
        # Baca Excel
        df = pd.read_excel(file_path)
        
        # Konversi ke Dictionary biar pencariannya cepet
        treatment_dict = {
            str(row["Class"]).lower().strip(): {
                "Treatment": row["Treatment"],
                "Advice": row["Advice"]
            }
            for _, row in df.iterrows()
        }
        print("✅ Knowledge Base (Excel) berhasil dimuat!")
    except Exception as e:
        print(f"❌ Error baca Excel: {e}")

def get_advice(pimple_type):
    """Mencari saran berdasarkan jenis jerawat"""
    pimple_type = pimple_type.lower().strip()
    
    # Cari di kamus
    if pimple_type in treatment_dict:
        return {
            "type": pimple_type,
            "treatment": treatment_dict[pimple_type]["Treatment"],
            "advice": treatment_dict[pimple_type]["Advice"]
        }
    else:
        # Kalau jenis jerawatnya gak ada di Excel Arka
        return {
            "type": pimple_type,
            "treatment": "Konsultasikan ke dokter.",
            "advice": "Jenis jerawat ini belum ada di database kami."
        }