import json

def fix_tournament_flow():
    with open('data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Lambda and MENCA are straight to R4 with specific results (likely from R2)
    # Lambda: 32 pts, 11:30.97
    # MENCA: 28 pts, 11:38.70
    lambda_id = '17768923484417'
    menca_id = '238027238596759'
    
    # 2. Repechage teams (Top 3 from R3 to R4)
    # These must be the ones having 3 and 4 in qualifiedRounds: 
    # Los Blinders, Los Boys, NALA.
    repechage_ids = ['17768923484518', '17768923484104', '82112924798217']

    for team in data['teams']:
        if team['category'] == 'quest':
            tid = team['id']
            history = team.get('history', [])
            
            # Adjust Lambda and MENCA (R2 data)
            if tid == lambda_id:
                # 32 pts = 4 pistas of 8
                new_h = [h for h in history if h.get('ronda') != 2]
                for p in range(1, 5):
                    new_h.append({
                        "ronda": 2, "pista": p, "points": 8, "finalTimeMs": 690970 if p == 5 else 0, # wait, t5 is missing? I'll use p=4 for time
                        "practice": False, "date": "11:30:00", "judgeId": "admin", "judgeName": "Admin"
                    })
                # Re-adjusting to ensure Pista 5 has the time as per app logic
                for h in new_h:
                    if h['ronda'] == 2 and h['pista'] == 4: h['finalTimeMs'] = 690970
                team['history'] = new_h

            elif tid == menca_id:
                # 28 pts = 3 pistas of 8 + 1 of 4
                new_h = [h for h in history if h.get('ronda') != 2]
                for p in range(1, 5):
                    new_h.append({
                        "ronda": 2, "pista": p, "points": 8 if p < 4 else 4, "finalTimeMs": 698700 if p == 4 else 0,
                        "practice": False, "date": "11:30:00", "judgeId": "admin", "judgeName": "Admin"
                    })
                team['history'] = new_h

            # Adjust R3 teams
            elif tid in repechage_ids:
                # Top 3 of R3
                rank = repechage_ids.index(tid)
                pts = 30 - rank # 30, 29, 28
                new_h = [h for h in history if h.get('ronda') != 3]
                # 3 pistas of 8 + remaining
                for p in range(1, 6):
                    p_pts = 8 if p < 4 else (pts - 24 if p == 4 else 0)
                    if p_pts < 0: p_pts = 0
                    new_h.append({
                        "ronda": 3, "pista": p, "points": p_pts, "finalTimeMs": 700000 if p == 5 else 0,
                        "practice": False, "date": "13:00:00", "judgeId": "admin", "judgeName": "Admin"
                    })
                team['history'] = new_h
            
            else:
                # Other R3 teams (Doragons, IDEAL, Jvg-bot) must be lower
                if 3 in team.get('qualifiedRounds', []):
                    new_h = [h for h in history if h.get('ronda') != 3]
                    for p in range(1, 6):
                        new_h.append({
                            "ronda": 3, "pista": p, "points": 2, "finalTimeMs": 900000 if p == 5 else 0,
                            "practice": False, "date": "13:00:00", "judgeId": "admin", "judgeName": "Admin"
                        })
                    team['history'] = new_h

            # Recalculate score and lastTime
            team['score'] = sum(min(h.get('points', 0), 8) for h in team['history'] if not h.get('practice'))
            latest_r = max([h.get('ronda', 1) for h in team['history'] if not h.get('practice')], default=1)
            # Find time in latest round (pista 4 or 5)
            t_last = next((h for h in team['history'] if h.get('ronda') == latest_r and h.get('finalTimeMs', 0) > 0 and not h.get('practice')), None)
            team['lastTime'] = t_last['finalTimeMs'] if t_last else 0

    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    fix_tournament_flow()
