import re
import json

def parse_pistas(html_path):
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    cards = content.split('<div class="card">')[1:]
    tracks_data = {}

    for card in cards:
        # Extraer Ronda y Pista
        ronda_match = re.search(r'Ronda (\d+)', card)
        pista_match = re.search(r'Pista (\d+)', card)
        if not ronda_match or not pista_match:
            continue
            
        ronda = int(ronda_match.group(1))
        pista = int(pista_match.group(1))

        if ronda not in tracks_data:
            tracks_data[ronda] = {}

        # Extraer Bonus Points
        bonus_match = re.search(r'<div class="bv-num">(\d+)</div>', card)
        bonus_pts = int(bonus_match.group(1)) if bonus_match else 3

        # Extraer Bonus Rules
        rules_match = re.search(r'<td rowspan="\d" class="bonus-text">(.*?)</td>', card, re.DOTALL)
        bonus_rules = rules_match.group(1).strip() if rules_match else ""
        bonus_rules = re.sub(r'<.*?>', '', bonus_rules) # Clean HTML

        # Extraer Secuencia y Obstáculos del Grid
        # El grid tiene 6 filas de datos (6 a 1) y 10 columnas (A a J)
        grid_match = re.search(r'<table class="inner-grid".*?>(.*?)</table>', card, re.DOTALL)
        sequence_map = {} # {step_num: "A1"}
        obstacles = []
        bonus_start = ""
        bonus_dir = ""

        if grid_match:
            grid_content = grid_match.group(1)
            rows = re.findall(r'<tr>(.*?)</tr>', grid_content, re.DOTALL)
            # Las primeras 6 filas son los datos. La 7ma es la etiqueta A-J.
            for row_idx, row_content in enumerate(rows[:6]):
                row_label = 6 - row_idx
                cells = re.findall(r'<td.*?>(.*?)</td>', row_content, re.DOTALL)
                # La primera celda es la etiqueta del número de fila
                for col_idx, cell_content in enumerate(cells[1:]):
                    col_label = chr(ord('A') + col_idx)
                    coord = f"{col_label}{row_label}"
                    
                    # Secuencia
                    seq_match = re.search(r'<b>([①-⑩\d]+)</b>', cell_content)
                    if seq_match:
                        val = seq_match.group(1)
                        # Convertir círculos ①..⑩ a números si es necesario
                        circles = "①②③④⑤⑥⑦⑧⑨⑩"
                        if val in circles:
                            step_num = circles.find(val) + 1
                        else:
                            step_num = int(re.sub(r'\D', '', val))
                        sequence_map[step_num] = coord
                    
                    # Obstáculo
                    if '✕' in cell_content or 'class="obs"' in cell_content:
                        obstacles.append(coord)
                        
                    # Bonus Start
                    if '★' in cell_content or 'bs-star' in cell_content:
                        bonus_start = coord
                        dir_match = re.search(r'<small class="bs-dir">(.*?)</small>', cell_content)
                        if dir_match:
                            bonus_dir = dir_match.group(1)

        # Construir secuencia ordenada
        sorted_steps = sorted(sequence_map.keys())
        sequence = [sequence_map[s] for s in sorted_steps]

        tracks_data[ronda][pista] = {
            "sequence": sequence,
            "obstacles": obstacles,
            "bonusPoints": bonus_pts,
            "bonusStart": bonus_start,
            "bonusDir": bonus_dir,
            "bonusRules": bonus_rules
        }

    return tracks_data

if __name__ == "__main__":
    data = parse_pistas(r"c:\Users\Sargas-PC\Desktop\Proyectos\Adagames-2026\pistas_revision.html")
    with open(r"c:\Users\Sargas-PC\Desktop\Proyectos\Adagames-2026\Sistema_Univ.Sar\tracks_parsed.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Parsing completado. Archivo tracks_parsed.json generado.")
