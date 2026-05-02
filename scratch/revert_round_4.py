import json

def revert_round_4():
    with open('data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    for team in data['teams']:
        if team['category'] == 'quest':
            # Remove Round 4 history entries for Quest teams
            history = team.get('history', [])
            new_history = [h for h in history if h.get('ronda') != 4]
            team['history'] = new_history
            
            # Recalculate official score
            team['score'] = sum(min(h.get('points', 0), 8) for h in new_history if not h.get('practice'))
            
            # Update lastTime to reflect the latest round (1, 2 or 3)
            latest_r = max([h.get('ronda', 1) for h in new_history if not h.get('practice')], default=1)
            t5 = next((h for h in new_history if h.get('ronda') == latest_r and h.get('pista') == 5 and not h.get('practice')), None)
            if t5:
                team['lastTime'] = t5.get('finalTimeMs', 0)
            else:
                # If no Pista 5 in latest round, check previous rounds or set 0
                team['lastTime'] = 0

    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    revert_round_4()
