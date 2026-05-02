import json

def fix_data():
    with open('data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Ranking provided by user:
    # 1. IDEAL N°1 (17768923483771)
    # 2. Jvg-bot (1776892156424)
    # 3. Lambda (17768923484417)
    # 4. MENCA M3NS (238027238596759)

    # Using realistic times (around 10 minutes) instead of the previous placeholders
    target_ids = {
        '17768923483771': {'rank': 1, 'time': 600000},  # 10:00.00
        '1776892156424': {'rank': 2, 'time': 610000},   # 10:10.00
        '17768923484417': {'rank': 3, 'time': 620000},  # 10:20.00
        '238027238596759': {'rank': 4, 'time': 630000}  # 10:30.00
    }

    for team in data['teams']:
        if team['category'] == 'quest':
            tid = team['id']
            if tid in target_ids:
                # Top 4 teams
                new_history = []
                for p in range(1, 6):
                    new_history.append({
                        "ronda": 1,
                        "pista": p,
                        "points": 8,
                        "finalTimeMs": target_ids[tid]['time'] if p == 5 else 0,
                        "practice": False,
                        "date": "09:00:00",
                        "judgeId": "admin",
                        "judgeName": "Administrador Central"
                    })
                # Preserve Round 2 history if it exists
                for h in team.get('history', []):
                    if h.get('ronda') == 2:
                        new_history.append(h)
                
                team['history'] = new_history
                # Recalculate score (only official)
                team['score'] = sum(h.get('points', 0) for h in new_history if not h.get('practice'))
                team['lastTime'] = target_ids[tid]['time']
            else:
                # Other quest teams
                new_history = []
                for h in team.get('history', []):
                    if h.get('ronda') == 1 and not h.get('practice'):
                        h['points'] = min(h.get('points', 0), 8) # Cap points per pista
                    new_history.append(h)
                
                team['history'] = new_history
                # Recalculate score
                team['score'] = sum(h.get('points', 0) for h in new_history if not h.get('practice'))
                # Ensure they don't have 40 or better time than top 4
                if team['score'] >= 40:
                    team['score'] = 39 

    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    fix_data()
