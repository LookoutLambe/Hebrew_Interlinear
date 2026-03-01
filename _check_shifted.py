import re, sys
sys.stdout.reconfigure(encoding='utf-8')
with open(r'C:/Users/chris/Desktop/Hebrew BOM/BOM.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        pairs = re.findall(r'\["([^"]+)","([^"]+)"\]', line)
        for j in range(len(pairs)-1):
            heb1, eng1 = pairs[j]
            heb2, eng2 = pairs[j+1]
            if eng1 == eng2 and heb1 != heb2 and eng1 != '' and len(eng1) > 2:
                print(f'Line {i}: ["{heb1}","{eng1}"],["{heb2}","{eng2}"]')
