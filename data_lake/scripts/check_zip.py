import zipfile
import os

zip_path = r"C:\Users\BICHOTA\Downloads\drive-download-20260627T203109Z-3-001.zip"

if os.path.exists(zip_path):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        print(f"[*] Contenido de {zip_path}:")
        for info in zip_ref.infolist():
            print(f"  - {info.filename} ({info.file_size} bytes)")
else:
    print("[-] El archivo ZIP no existe en la ruta especificada.")
