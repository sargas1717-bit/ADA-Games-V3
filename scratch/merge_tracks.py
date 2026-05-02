import json

def merge_tracks():
    data_path = r"c:\Users\Sargas-PC\Desktop\Proyectos\Adagames-2026\Sistema_Univ.Sar\backend\data_quest.json"
    parsed_path = r"c:\Users\Sargas-PC\Desktop\Proyectos\Adagames-2026\Sistema_Univ.Sar\tracks_parsed.json"

    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    with open(parsed_path, 'r', encoding='utf-8') as f:
        parsed_tracks = json.load(f)

    # El formato del parsed_tracks es { "1": { "1": {...} } }
    # Asegurarnos de que las llaves sean strings si el data.json lo requiere (ya lo son)
    data["tracks"] = parsed_tracks

    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("data_quest.json actualizado con éxito.")

if __name__ == "__main__":
    merge_tracks()
