import urllib.request
import csv
import json
import os

# Cambiamos /htmlview por /export?format=csv para una extracción nativa, rápida y sin depender de pandas
csv_url = "https://docs.google.com/spreadsheets/u/0/d/1xTDybQfDSYES6SPI4yV1ea-TRCmCdadfvMwv86u1Qq4/export?format=csv"
output_json = r"C:\Users\BICHOTA\.gemini\antigravity\scratch\reconstruye_ve\data_lake\scraped_google_sheets.json"

def scrape_sheet():
    print(f"[*] Descargando datos de Google Sheets...")
    req = urllib.request.Request(csv_url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req) as response:
            lines = [l.decode('utf-8') for l in response.readlines()]
            
            reader = csv.DictReader(lines)
            data = []
            for row in reader:
                # Limpiar claves vacías por si hay columnas extra en el sheet
                clean_row = {k.strip(): v.strip() for k, v in row.items() if k and k.strip()}
                if any(clean_row.values()): # Si la fila no está totalmente vacía
                    data.append(clean_row)
                    
            with open(output_json, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                
            print(f"[+] Scraping exitoso. Se extrajeron {len(data)} registros.")
            print(f"[*] Primer registro de muestra: {data[0]}")
            print(f"[+] Datos guardados en {output_json}")
    except Exception as e:
        print(f"[-] Error al hacer scraping: {e}")

if __name__ == "__main__":
    scrape_sheet()
