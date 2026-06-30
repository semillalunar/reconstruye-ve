import pandas as pd

url = "https://docs.google.com/spreadsheets/u/0/d/1xTDybQfDSYES6SPI4yV1ea-TRCmCdadfvMwv86u1Qq4/htmlview"

try:
    tables = pd.read_html(url, match='.*')
    if tables:
        df = tables[0]
        # Limpiar filas y columnas vacías generadas por Google Sheets
        df = df.dropna(how='all', axis=1).dropna(how='all', axis=0)
        # Asumir que la primera fila no nula son los headers
        print("Columnas encontradas:")
        print(df.iloc[0].values)
        print("Primeras 3 filas de datos:")
        print(df.head(3))
except Exception as e:
    print(f"Error: {e}")
