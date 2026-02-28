import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

filepath = os.path.join(os.environ.get('USERPROFILE', ''), 'Desktop', 'Hebrew BOM', 'BOM.html')
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Comprehensive set of known proper names / legitimate single-cap words
legitimate = {
    # BOM proper names
    'Nephi','Alma','Moroni','Ammonihah','Zarahemla','Zeezrom','Amulek','Gideon',
    'Nehor','Mosiah','Helaman','Limhi','Abinadi','Noah','Laban','Lehi','Sariah',
    'Sam','Laman','Lemuel','Jerusalem','Israel','Moses','Aaron','Zoram','Ishmael',
    'Christ','Messiah','God','Lord','Zion','Joseph','Egypt','Jacob','Esau','David',
    'Solomon','Isaiah','Judah','Benjamin','Zedekiah','Isaac','Abraham','Bountiful',
    'Irreantum','Nahom','Liahona','Shazer','Coriantumr','Moronihah','Shiz','Ether',
    'Morianton','Pahoran','Teancum','Moriantum','Desolation','Cumorah','Ramah',
    'Ablom','Jared','Gilgal','Seth','Adam','Eve','Riplakish','Shiblon','Corianton',
    'Zeniff','Giddonah','Sidon','Melek','Jershon','Antionah','Zoramite','Rameumptom',
    'Onidah','Antionum','Amnigaddah','Amalickiah','Mormon','Amen','Selah','Joshua',
    'Gilead','Assyria','Babylon','Lebanon','Jordan','Samaria','Syria','Ephraim',
    'Manasseh','Rezin','Ahaz','Immanuel','Lucifer','Galilee','Midian','Nod','Bashan',
    'Jesus','Yeshua','Smith','America','Manchester','Ontario','New','York','Urim',
    'Thummim','Pharaoh','Hosanna','Nazareth','Counselor','Creator','Jeremiah',
    'Abarah','Judean','Enos','Jarom','Omni','Chemish','Amaron','Abinadom',
    'Helam','Shilom','Shemlon','Amulon','Sinim','Tarshish','Ophir','Chaldeans',
    'Philistia','Sheol','Uzziah','Aram','Damascus','Uriah','Jeberechiah',
    'Zebulun','Naphtali','Calno','Hamath','Oreb','Geba','Saul','Anathoth',
    'Madmenah','Gebim','Jesse','Coriantor','Moron','Sherem','Mary','Sinai',
    'Zenock','Neum','Zenos','Ammonites','Lamanite','Nephite','Zoramite',
    'Gidgiddoni','Lachoneus','Zemnarihah','Giddianhi','Kishkumen','Gadianton',
    'Timothy','Jonas','Mathoni','Mathonihah','Kumen','Kumenonhi',
    'Amaleki','Muloki','Ammah','Abish','Lamoni','Middoni','Antiomno',
    'Anti','Antipas','Zerahemnah','Amalickiahites',
    'Teomner','Antipus','Mulek','Judea','Cumeni','Antiparah','Manti',
    'Nephihah','Gid','Amalekites',
    'Hagoth','Tubaloth','Cezoram','Samuel','Lib','Shule','Kib','Orihah',
    'Corihor','Shared','Akish','Heth','Shez','Kim','Levi','Corom',
    'Omer','Esrom','Nimrod','Pagag','Com','Shiblom',
    'Coriantum','Ethem','Ogath','Ripliancum','Shurr','Cohor',
    'Jaredite','Zenephi','Neas','Sheum','Rahab','Ammon',
    # Legitimate English words used as glosses
    'He','Him','Himself','Eternal','Almighty','John','Reeds',
    'Holiness','Hosts','Bible','Jew',
    'Lamanites','Nephites','Jacobites','Josephites','Zoramites','Lemuelites',
    'Gentiles','Gentile','Hebrew','Lamb','Israelites','Me',
    'She','Her','His','My','Our','Your','Their','Its',
    'One','Two','Three','Jaredites','Amalekite',
    'Rabbanah','Sebus','Aminadab','Limnah','Onti','Seon','Shum',
    'Ezias','Isabel','Hermounts',
    'Zedekiah','Mulek','Sidon',
    # Other common English words that might appear capitalized
    'Sabbath','Passover','Tabernacle','Temple',
}

suspicious = []

for i in range(3134, min(47100, len(lines))):
    line = lines[i]
    pairs = re.findall(r'\["([^"]*?)","([^"]*?)"\]', line)
    for hebrew, gloss in pairs:
        if not gloss or gloss == '':
            continue

        flagged = False
        reason = ''

        # Pattern 1: Contains "???"
        if '???' in gloss:
            flagged = True
            reason = 'Contains ???'

        # Pattern 2: Single capitalized word that's NOT in legitimate names list
        # and looks like a Hebrew transliteration
        elif re.match(r'^[A-Z][a-z]+$', gloss) and gloss not in legitimate:
            lower = gloss.lower()
            # Check if it resembles a Hebrew transliteration vs. a real English word
            # Hebrew transliterations: unusual consonant combos, no standard English word form
            # Common English words we should NOT flag
            english_words = {
                'eternal','almighty','holiness','hosts','creator','counselor',
                'reeds','bible','jew','gentile','gentiles','lamb','hebrew',
                'me','he','him','she','her','his','my','our','your','their',
                'its','one','two','three','four','five','six','seven','eight','nine','ten',
                'north','south','east','west','king','queen','priest','prophet',
                'angel','spirit','heaven','hell','earth','water','fire','wind',
                'sword','shield','bow','arrow','stone','iron','brass','gold','silver',
                'copper','steel','wood','fruit','seed','tree','vine','olive',
                'wheat','barley','corn','wine','oil','honey','milk','bread',
                'city','land','sea','river','mountain','valley','wilderness',
                'desert','forest','field','garden','tower','wall','gate','door',
                'house','temple','altar','throne','judgment','covenant','law',
                'commandment','testimony','record','scripture','book','letter',
                'word','voice','name','people','nation','tribe','family',
                'father','mother','son','daughter','brother','sister','wife','husband',
                'child','infant','youth','man','woman','servant','master','lord',
                'ruler','captain','general','commander','chief','elder','judge',
                'war','peace','battle','army','host','camp','prison','death','life',
                'blood','flesh','bone','soul','heart','mind','eye','hand','foot',
                'head','mouth','ear','face','skin','hair',
                'righteous','wicked','holy','pure','clean','unclean',
                'true','false','good','evil','great','small','mighty','strong','weak',
                'rich','poor','wise','foolish','proud','humble','faithful','merciful',
                'just','unjust','free','captive',
                'love','hate','joy','sorrow','anger','fear','hope','faith',
                'grace','mercy','truth','light','darkness','glory','power',
                'salvation','redemption','atonement','resurrection','baptism',
                'repentance','forgiveness','blessing','curse','oath','promise',
                'sign','wonder','miracle','vision','dream','revelation',
                'offering','sacrifice','tithe','fast','prayer','worship',
                'morning','evening','night','day','month','year','time','season',
                'forever','always','never','now','then','here','there',
            }
            if lower not in english_words:
                flagged = True
                reason = 'Single capitalized word - possible transliteration'

        if flagged:
            suspicious.append((i+1, hebrew, gloss, reason))

for linenum, heb, gloss, reason in sorted(suspicious):
    print(f'Line {linenum}: ["{heb}","{gloss}"] - {reason}')

print(f'\nTotal suspicious: {len(suspicious)}')
