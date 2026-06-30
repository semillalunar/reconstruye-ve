import urllib.request
import re

url = "https://venezuela-terremoto.com/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print(f"Longitud del HTML: {len(html)}")
        
        # Buscar algo que parezca un nombre o tabla
        if "buscar" in html.lower():
            print("Contiene la palabra 'buscar'.")
        
        # Imprimir una parte del body
        body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
        if body_match:
            body = body_match.group(1)
            print(f"Primeros 500 caracteres del body:\n{body[:500]}")
        else:
            print("No se encontró body.")
except Exception as e:
    print(f"Error: {e}")
