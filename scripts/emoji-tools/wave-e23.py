#!/usr/bin/env python3
"""Wave E2+E3: balls, food, animals, vehicles, instruments, Saturn, everyday."""
import json

def mm(inches): return round(inches * 25.4)

def rec(id, name, category, emoji, emoji_name, primary, axis, ms, aspect=0.8):
    return {'id': id, 'name': name, 'category': category, 'emoji': emoji,
            'emoji_name': emoji_name, 'primaryAttr': primary, 'axis': axis,
            'measurements': ms, 'aspect': aspect}

def m(value, context, source_url, source_name=None, **kw):
    if isinstance(source_url, (tuple, list)):
        source_url, source_name = source_url[0], source_url[1]
    base = {'value': value, 'context': context, 'source_url': source_url,
            'source_name': source_name, 'checked_at': '2026-11-20'}
    base.update(kw)
    return base

ANIMAL_NOTE = 'Typical adult size varies by sex, age and population; a representative value is shown.'

# ── balls (official specifications) ─────────────────────────────
def ball(id, name, emoji, emoji_name, src, diameter_mm=None, length_mm=None, weight_g=None):
    ms = {}
    if diameter_mm: ms['diameter'] = m(diameter_mm, 'official diameter (mid of spec range)', src[0], src[1], uncertainty_note='Official spec range; mid value shown.')
    if length_mm: ms['length'] = m(length_mm, 'official long-axis length (mid of spec range)', src[0], src[1], uncertainty_note='Official spec range; mid value shown.')
    if weight_g: ms['weight'] = m(weight_g, 'official weight (mid of spec range)', src[0], src[1], uncertainty_note='Official spec range; mid value shown.')
    return rec(f'ball-{id}', name, 'everyday', emoji, emoji_name,
               'diameter' if diameter_mm else 'length', 'both' if diameter_mm else 'horizontal', ms)

BALLS = [
    ball('soccer', 'Soccer ball', '26bd', 'soccer-ball', diameter_mm=219, weight_g=430,
         src=('https://www.fifa.com/football-rules-lawmakers/laws-game', 'FIFA Laws of the Game — Law 2 (circumference 68–70 cm, weight 410–450 g)')),
    ball('football', 'American football', '1f3c8', 'american-football', length_mm=mm(11), weight_g=411,
         src=('https://operations.nfl.com/gameday/nfl-officials/rules-emu', 'NFL Rules — the ball (11–11.25 in long axis, 14–15 oz)')),
    ball('volleyball', 'Volleyball', '1f3d0', 'volleyball', diameter_mm=211, weight_g=270,
         src=('https://www.fivb.com/en/volleyball/the-game', 'FIVB Official Volleyball Rules — the ball (Ø 20.9–21.3 cm, 260–280 g)')),
    ball('baseball', 'Baseball', '26be', 'baseball', diameter_mm=mm(2.94), weight_g=145,
         src=('https://www.mlb.com/official-information', 'MLB Official Baseball Rules — the ball (73–76 mm, 142–149 g)')),
    ball('eightball', '8-ball (pool)', '1f3b1', '8-ball', diameter_mm=mm(2.25), weight_g=170,
         src=('https://wpapool.com/equipment-specifications/', 'WPA Equipment Specifications — pool ball (57.15 mm, 5.5–6 oz)')),
    ball('pingpong', 'Table tennis ball', '1f3d3', 'ping-pong', diameter_mm=40, weight_g=3,
         src=('https://www.ittf.com/equipment/', 'ITTF Technical Leaflet — the ball (Ø 40 mm, 2.7 g)')),
    ball('bowling', 'Bowling ball', '1f3b3', 'bowling', diameter_mm=mm(8.5), weight_g=6800,
         src=('https://bowl.com/equipment-specs', 'USBC Equipment Specifications — Ø ≤ 8.5 in, ≤ 16 lb; typical 12–16 lb shown')),
    ball('hockeypuck', 'Hockey puck', '1f3d2', 'ice-hockey', diameter_mm=mm(3), weight_g=165,
         src=('https://cdn.nhl.com/gh/nhl-rulebook', 'NHL Official Rules — the puck (Ø 3 in × 1 in, 5.5–6 oz)')),
    ball('rugby', 'Rugby ball', '1f3c9', 'rugby-football', length_mm=290, weight_g=435,
         src=('https://www.world.rugby/the-game/laws/', 'World Rugby Laws — the ball (280–300 mm long axis, 410–460 g)')),
]

# ── food (typical medium retail values, USDA reference) ─────────
USDA = ('https://fdc.nal.usda.gov/', 'USDA FoodData Central — typical retail item')

def food(id, name, emoji, emoji_name, primary, axis, ms):
    return rec(f'food-{id}', name, 'food', emoji, emoji_name, primary, axis, ms)

FOOD = [
    food('bread', 'Loaf of bread', '1f35e', 'bread', 'length', 'horizontal', {
        'length': m(230, 'typical sandwich loaf, longest side', *USDA, uncertainty_note='Loaves vary by bakery; 20–25 cm is typical.'),
        'weight': m(500, 'typical sandwich loaf', *USDA, uncertainty_note='450–680 g is typical.')}),
    food('cheese', 'Cheese wedge', '1f9c0', 'cheese-wedge', 'weight', 'both', {
        'weight': m(250, 'typical retail wedge', *USDA, uncertainty_note='Wedges vary; 200–400 g is typical.')}),
    food('pizza-slice', 'Pizza slice', '1f355', 'pizza', 'length', 'horizontal', {
        'length': m(130, 'slice from a 12-inch pizza, tip to crust', *USDA, uncertainty_note='Depends on pizza size and cut.'),
        'weight': m(100, 'typical slice', *USDA)}),
    food('hamburger', 'Hamburger', '1f354', 'hamburger', 'diameter', 'both', {
        'diameter': m(100, 'typical quarter-pound burger diameter', *USDA),
        'weight': m(200, 'typical quarter-pounder', *USDA)}),
    food('hotdog', 'Hot dog', '1f32d', 'hot-dog', 'length', 'horizontal', {
        'length': m(152, 'standard bun length (6-inch)', *USDA),
        'weight': m(100, 'frankfurter + bun', *USDA)}),
    food('fries', 'French fries (medium)', '1f35f', 'french-fries', 'length', 'vertical', {
        'length': m(120, 'longest fries in a medium serving', *USDA, uncertainty_note='Cut styles vary.'),
        'weight': m(110, 'medium serving', *USDA)}),
    food('sushi', 'Nigiri sushi piece', '1f363', 'sushi', 'length', 'horizontal', {
        'length': m(65, 'typical nigiri piece length', *USDA),
        'weight': m(30, 'typical nigiri piece', *USDA)}),
    food('ramen', 'Bowl of ramen', '1f35c', 'steaming-bowl', 'volume', 'both', {
        'volume': m(500, 'typical ramen bowl fill', *USDA, uncertainty_note='Bowls commonly hold 450–650 ml.')}),
    food('taco', 'Taco', '1f32e', 'taco', 'length', 'horizontal', {
        'length': m(130, 'typical hard taco length', *USDA),
        'weight': m(170, 'typical filled taco', *USDA)}),
    food('croissant', 'Croissant', '1f950', 'croissant', 'length', 'horizontal', {
        'length': m(150, 'typical bakery croissant length', *USDA),
        'weight': m(60, 'typical bakery croissant', *USDA)}),
    food('donut', 'Doughnut', '1f369', 'doughnut', 'diameter', 'both', {
        'diameter': m(90, 'typical ring doughnut diameter', *USDA),
        'weight': m(60, 'typical ring doughnut', *USDA)}),
    food('avocado', 'Avocado', '1f951', 'avocado', 'weight', 'both', {
        'weight': m(200, 'medium avocado', *USDA, uncertainty_note='150–250 g is typical.'),
        'length': m(100, 'medium avocado length', *USDA)}),
    food('strawberry', 'Strawberry', '1f353', 'strawberry', 'length', 'vertical', {
        'length': m(30, 'medium berry length', *USDA),
        'weight': m(14, 'medium berry', *USDA)}),
    food('lemon', 'Lemon', '1f34b', 'lemon', 'diameter', 'both', {
        'diameter': m(65, 'medium lemon diameter', *USDA),
        'weight': m(85, 'medium lemon', *USDA)}),
    food('peach', 'Peach', '1f351', 'peach', 'diameter', 'both', {
        'diameter': m(70, 'medium peach diameter', *USDA),
        'weight': m(130, 'medium peach', *USDA)}),
    food('cherry', 'Cherry', '1f352', 'cherries', 'diameter', 'both', {
        'diameter': m(20, 'sweet cherry diameter', *USDA),
        'weight': m(8, 'sweet cherry', *USDA)}),
    food('kiwi', 'Kiwi fruit', '1f95d', 'kiwi-fruit', 'length', 'both', {
        'length': m(60, 'medium kiwi length', *USDA),
        'weight': m(75, 'medium kiwi', *USDA)}),
    food('corn', 'Ear of corn', '1f33d', 'ear-of-corn', 'length', 'horizontal', {
        'length': m(200, 'typical sweet corn ear length', *USDA),
        'weight': m(110, 'typical husked ear', *USDA)}),
    food('carrot', 'Carrot', '1f955', 'carrot', 'length', 'horizontal', {
        'length': m(180, 'medium carrot length', *USDA),
        'weight': m(70, 'medium carrot', *USDA)}),
    food('broccoli', 'Broccoli crown', '1f966', 'broccoli', 'diameter', 'both', {
        'diameter': m(100, 'typical crown diameter', *USDA, uncertainty_note='80–120 mm is typical.'),
        'weight': m(150, 'typical crown', *USDA)}),
    food('tomato', 'Tomato', '1f345', 'tomato', 'diameter', 'both', {
        'diameter': m(60, 'medium tomato diameter', *USDA),
        'weight': m(120, 'medium tomato', *USDA)}),
    food('potato', 'Potato', '1f954', 'potato', 'length', 'horizontal', {
        'length': m(90, 'medium potato length', *USDA),
        'weight': m(170, 'medium potato', *USDA)}),
    food('mushroom', 'Button mushroom', '1f344', 'mushroom', 'diameter', 'both', {
        'diameter': m(40, 'white button cap diameter', *USDA),
        'weight': m(25, 'white button mushroom', *USDA)}),
    food('coffee', 'Cup of coffee', '2615', 'hot-beverage', 'volume', 'both', {
        'volume': m(240, 'standard 8 oz cup fill', *USDA),
        'weight': m(300, 'cup + 8 oz coffee', *USDA)}),
    food('beer', 'Pint of beer', '1f37a', 'beer-mug', 'volume', 'both', {
        'volume': m(473, 'US pint (16 fl oz) fill', *USDA),
        'weight': m(700, 'glass + 16 oz beer', *USDA)}),
    food('wine', 'Glass of wine', '1f376', 'wine-glass', 'height', 'vertical', {
        'height': m(200, 'standard red wine glass height', *USDA, uncertainty_note='Stemware varies; 190–210 mm is typical.'),
        'volume': m(150, 'standard 5 oz pour', *USDA)}),
    food('milk', 'Glass of milk', '1f95b', 'glass-of-milk', 'volume', 'both', {
        'volume': m(240, 'standard 8 oz glass fill', *USDA),
        'weight': m(330, 'glass + 8 oz milk', *USDA)}),
    food('baguette', 'Baguette', '1f956', 'baguette-bread', 'length', 'horizontal', {
        'length': m(600, 'traditional baguette length', *USDA, uncertainty_note='550–650 mm is typical.'),
        'weight': m(300, 'traditional baguette', *USDA)}),
]

# ── animals wave 3 ───────────────────────────────────────────────
NG = lambda n: ('https://www.nationalgeographic.com/animals/mammals/facts/' + n, 'National Geographic — ' + n.replace('-', ' '))

def animal(id, name, emoji, emoji_name, ms):
    return rec(f'animal-{id}', name, 'animal', emoji, emoji_name, 'height', 'vertical', ms)

ANIMALS = [
    animal('brown-bear', 'Brown bear', '1f43b', 'bear', {
        'height': m(1200, 'shoulder height, adult (on all fours)', *NG('brown-bear'), min=900, max=1500, uncertainty_note=ANIMAL_NOTE),
        'weight': m(300000, 'body mass, adult', *NG('brown-bear'), min=150000, max=600000, uncertainty_note=ANIMAL_NOTE)}),
    animal('panda', 'Giant panda', '1f43c', 'panda', {
        'length': m(1500, 'head-and-body length, adult', *NG('giant-panda'), min=1200, max=1900, uncertainty_note=ANIMAL_NOTE),
        'weight': m(115000, 'body mass, adult', *NG('giant-panda'), min=100000, max=130000, uncertainty_note=ANIMAL_NOTE)}),
    animal('koala', 'Koala', '1f428', 'koala', {
        'length': m(720, 'head-and-body length, adult', *NG('koala'), min=600, max=850, uncertainty_note=ANIMAL_NOTE),
        'weight': m(9000, 'body mass, adult (southern populations larger)', *NG('koala'), min=4000, max=15000, uncertainty_note=ANIMAL_NOTE)}),
    animal('frog', 'Common frog', '1f438', 'frog', {
        'length': m(75, 'head-and-body length, adult', ('https://www.britannica.com/animal/frog', 'Britannica — frog'), min=60, max=90)}),
    animal('turtle', 'Green sea turtle', '1f422', 'turtle', {
        'length': m(1000, 'carapace (shell) length, adult', ('https://www.nationalgeographic.com/animals/reptiles/facts/green-sea-turtle', 'National Geographic — green sea turtle'), min=800, max=1200, uncertainty_note=ANIMAL_NOTE),
        'weight': m(150000, 'body mass, adult', *NG('green-sea-turtle'), min=68000, max=190000, uncertainty_note=ANIMAL_NOTE)}),
    animal('ball-python', 'Ball python', '1f40d', 'snake', {
        'length': m(1200, 'total length, adult', ('https://www.britannica.com/animal/snake', 'Britannica — snake (ball python form)'), min=900, max=1500)}),
    animal('bald-eagle', 'Bald eagle', '1f985', 'eagle', {
        'length': m(1000, 'total length (bill to tail), adult', *NG('bald-eagle'), min=900, max=1100, uncertainty_note=ANIMAL_NOTE),
        'weight': m(4600, 'body mass, adult', *NG('bald-eagle'), min=3000, max=6300, uncertainty_note=ANIMAL_NOTE)}),
    animal('great-horned-owl', 'Great horned owl', '1f989', 'owl', {
        'length': m(550, 'total length, adult', *NG('great-horned-owl'), min=480, max=650, uncertainty_note=ANIMAL_NOTE),
        'weight': m(1400, 'body mass, adult', *NG('great-horned-owl'), min=1200, max=1800, uncertainty_note=ANIMAL_NOTE)}),
    animal('zebra', 'Zebra (plains)', '1f993', 'zebra', {
        'height': m(1370, 'shoulder height, adult', *NG('zebra'), min=1200, max=1500, uncertainty_note=ANIMAL_NOTE),
        'weight': m(270000, 'body mass, adult', *NG('zebra'), min=200000, max=320000, uncertainty_note=ANIMAL_NOTE)}),
    animal('gorilla', 'Gorilla (eastern)', '1f98d', 'gorilla', {
        'height': m(1700, 'standing height (upright), adult male (estimate)', *NG('gorilla'), min=1400, max=1800, uncertainty_note='Upright-height estimates vary; knuckle-walking shoulder height is lower.'),
        'weight': m(160000, 'body mass, adult male', *NG('gorilla'), min=100000, max=200000, uncertainty_note=ANIMAL_NOTE)}),
    animal('rhino', 'White rhinoceros', '1f98f', 'rhinoceros', {
        'height': m(1600, 'shoulder height, adult', *NG('white-rhinoceros'), min=1400, max=1800, uncertainty_note=ANIMAL_NOTE),
        'weight': m(2200000, 'body mass, adult', *NG('white-rhinoceros'), min=2000000, max=2400000, uncertainty_note=ANIMAL_NOTE)}),
    animal('camel', 'Dromedary camel', '1f42a', 'camel', {
        'height': m(2000, 'height to top of hump, adult', *NG('camel'), min=1800, max=2000, uncertainty_note=ANIMAL_NOTE),
        'weight': m(450000, 'body mass, adult', *NG('camel'), min=300000, max=600000, uncertainty_note=ANIMAL_NOTE)}),
    animal('rhesus-macaque', 'Rhesus macaque', '1f412', 'monkey', {
        'length': m(550, 'head-and-body length, adult', ('https://www.britannica.com/animal/rhesus-monkey', 'Britannica — rhesus macaque'), min=470, max=640),
        'weight': m(6500, 'body mass, adult', ('https://www.britannica.com/animal/rhesus-monkey', 'Britannica — rhesus macaque'), min=5500, max=8000)}),
    animal('sheep', 'Sheep (domestic ewe)', '1f411', 'ewe', {
        'height': m(900, 'height at withers, adult (representative)', ('https://www.britannica.com/animal/sheep', 'Britannica — sheep'), uncertainty_note='Breeds differ greatly.'),
        'weight': m(70000, 'body mass, adult ewe', ('https://www.britannica.com/animal/sheep', 'Britannica — sheep'), min=45000, max=100000, uncertainty_note='Breeds differ greatly.')}),
    animal('goat', 'Domestic goat', '1f410', 'goat', {
        'height': m(700, 'shoulder height, adult (representative)', ('https://www.britannica.com/animal/goat', 'Britannica — goat'), min=600, max=900, uncertainty_note='Breeds differ greatly.'),
        'weight': m(65000, 'body mass, adult doe', ('https://www.britannica.com/animal/goat', 'Britannica — goat'), min=50000, max=80000, uncertainty_note='Breeds differ greatly.')}),
    animal('chicken', 'Chicken (hen)', '1f413', 'rooster', {
        'height': m(300, 'standing height, adult hen (representative)', ('https://www.britannica.com/animal/chicken', 'Britannica — chicken')),
        'weight': m(2500, 'body mass, adult hen', ('https://www.britannica.com/animal/chicken', 'Britannica — chicken'), min=1500, max=3000)}),
    animal('mallard-duck', 'Mallard duck', '1f986', 'duck', {
        'length': m(580, 'total length, adult', *NG('mallard'), min=500, max=650, uncertainty_note=ANIMAL_NOTE),
        'weight': m(1100, 'body mass, adult', *NG('mallard'), min=1000, max=1300, uncertainty_note=ANIMAL_NOTE)}),
    animal('mute-swan', 'Mute swan', '1f9a2', 'swan', {
        'length': m(1500, 'total length, adult', ('https://www.britannica.com/animal/swan', 'Britannica — swan'), min=1400, max=1650),
        'weight': m(10000, 'body mass, adult', ('https://www.britannica.com/animal/swan', 'Britannica — swan'), min=9000, max=11500)}),
    animal('harbor-seal', 'Harbor seal', '1f9ad', 'seal', {
        'length': m(1700, 'total length, adult', *NG('harbor-seal'), min=1500, max=1900, uncertainty_note=ANIMAL_NOTE),
        'weight': m(100000, 'body mass, adult', *NG('harbor-seal'), min=55000, max=170000, uncertainty_note=ANIMAL_NOTE)}),
    animal('honeybee', 'Honeybee (worker)', '1f41d', 'honeybee', {
        'length': m(13, 'body length, worker', ('https://www.britannica.com/animal/honeybee', 'Britannica — honeybee'), min=12, max=15),
        'weight': m(0.1, 'body mass, worker', ('https://www.britannica.com/animal/honeybee', 'Britannica — honeybee'), uncertainty_note='≈100 mg.')}),
    animal('llama', 'Llama', '1f999', 'llama', {
        'height': m(1700, 'height at shoulder, adult', *NG('llama'), uncertainty_note=ANIMAL_NOTE),
        'weight': m(130000, 'body mass, adult', *NG('llama'), uncertainty_note=ANIMAL_NOTE)}),
    animal('hippo', 'Hippopotamus', '1f99b', 'hippopotamus', {
        'height': m(1500, 'shoulder height, adult', *NG('hippopotamus'), uncertainty_note=ANIMAL_NOTE),
        'weight': m(2000000, 'body mass, adult', *NG('hippopotamus'), min=1500000, max=3000000, uncertainty_note=ANIMAL_NOTE)}),
    animal('red-kangaroo', 'Red kangaroo', '1f998', 'kangaroo', {
        'height': m(2000, 'standing height (upright), large adult male', *NG('red-kangaroo'), uncertainty_note='Standing height varies with posture.'),
        'weight': m(85000, 'body mass, large adult male', *NG('red-kangaroo'), uncertainty_note=ANIMAL_NOTE)}),
]

# ── vehicles wave 2 ──────────────────────────────────────────────
VEHICLES = [
    rec('delivery-truck', 'Delivery truck', 'vehicle', '1f69a', 'delivery-truck', 'length', 'horizontal', {
        'length': m(6700, 'typical box delivery truck length', ('https://en.wikipedia.org/wiki/Delivery_truck', 'Typical box truck dimensions (range)'), min=6000, max=7500),
        'weight': m(5000000, 'typical curb weight, loaded class', ('https://en.wikipedia.org/wiki/Delivery_truck', 'Class 3–5 curb weight (approx.)'), uncertainty_note='Approximate; classes span 3.5–8 t GVW.')}),
    rec('ambulance', 'Ambulance', 'vehicle', '1f691', 'ambulance', 'length', 'horizontal', {
        'length': m(5800, 'typical Type I/III ambulance length', ('https://en.wikipedia.org/wiki/Emergency_medical_services_vehicle', 'Typical ambulance dimensions (range)'), min=5500, max=6200),
        'weight': m(6000000, 'typical in-service weight (approx.)', ('https://en.wikipedia.org/wiki/Emergency_medical_services_vehicle', 'Typical ambulance curb weight (approx.)'), uncertainty_note='Approximate; 5.5–7 t depending on chassis.')}),
    rec('fire-engine', 'Fire engine', 'vehicle', '1f692', 'fire-engine', 'length', 'horizontal', {
        'length': m(9000, 'typical pumper length', ('https://en.wikipedia.org/wiki/Fire_engine', 'Typical fire engine dimensions (range)'), min=8500, max=10000),
        'weight': m(15000000, 'typical in-service weight (approx.)', ('https://en.wikipedia.org/wiki/Fire_engine', 'Typical fire engine curb weight (approx.)'), uncertainty_note='Approximate; 13–18 t common.')}),
    rec('motorcycle', 'Motorcycle', 'vehicle', '1f3cd', 'motorcycle', 'length', 'horizontal', {
        'length': m(2200, 'total length, typical road bike', ('https://en.wikipedia.org/wiki/Motorcycle', 'Typical motorcycle dimensions (range)')),
        'weight': m(250000, 'typical wet weight', ('https://en.wikipedia.org/wiki/Motorcycle', 'Typical motorcycle wet weight (range)'), min=180000, max=300000)}),
    rec('scooter', 'Motor scooter', 'vehicle', '1f6f4', 'motor-scooter', 'length', 'horizontal', {
        'length': m(1900, 'total length, typical 125 cc scooter', ('https://en.wikipedia.org/wiki/Motor_scooter', 'Typical scooter dimensions (range)')),
        'weight': m(110000, 'typical wet weight', ('https://en.wikipedia.org/wiki/Motor_scooter', 'Typical scooter wet weight (range)'), min=100000, max=120000)}),
    rec('tractor', 'Farm tractor', 'vehicle', '1f69c', 'tractor', 'length', 'horizontal', {
        'length': m(4000, 'typical utility tractor length', ('https://en.wikipedia.org/wiki/Tractor', 'Typical utility tractor dimensions (range)')),
        'weight': m(4000000, 'typical utility tractor weight', ('https://en.wikipedia.org/wiki/Tractor', 'Typical utility tractor weight (range)'), min=3000000, max=5000000)}),
    rec('rocket', 'Saturn V rocket', 'vehicle', '1f680', 'rocket', 'height', 'vertical', {
        'height': m(110600, 'total stack height (110.6 m)', ('https://www.nasa.gov/historical/saturn-v/', 'NASA — Saturn V fact sheet')),
        'weight': m(2900000000, 'liftoff mass (~2,900 t)', ('https://www.nasa.gov/historical/saturn-v/', 'NASA — Saturn V fact sheet'))}),
    rec('airplane-737', 'Boeing 737', 'vehicle', '2708', 'airplane', 'length', 'horizontal', {
        'length': m(39500, 'fuselage length, 737-800', ('https://www.boeing.com/company/general-info/about-us', 'Boeing 737-800 airplane characteristics')),
        'weight': m(79000000, 'maximum takeoff weight (79 t)', ('https://www.boeing.com/company/general-info/about-us', 'Boeing 737-800 specifications'))}),
    rec('helicopter', 'Robinson R44 helicopter', 'vehicle', '1f681', 'helicopter', 'length', 'horizontal', {
        'length': m(11600, 'total length with rotors', ('https://robinsonheli.com/product/r44-series/', 'Robinson R44 specifications')),
        'weight': m(1100000, 'maximum gross weight (1,100 kg)', ('https://robinsonheli.com/product/r44-series/', 'Robinson R44 specifications'))}),
    rec('sailboat', 'Sailboat (22–25 ft)', 'vehicle', '26f5', 'sailboat', 'length', 'horizontal', {
        'length': m(7000, 'typical small cruising sailboat length', ('https://en.wikipedia.org/wiki/Sailing', 'Typical small sailboat dimensions (range)'), min=6000, max=7600),
        'weight': m(2000000, 'typical displacement', ('https://en.wikipedia.org/wiki/Sailing', 'Typical small sailboat displacement (range)'), min=1500000, max=2500000)}),
    rec('locomotive', 'Diesel locomotive', 'vehicle', '1f682', 'steam-locomotive', 'length', 'horizontal', {
        'length': m(20000, 'typical modern diesel-electric locomotive length', ('https://en.wikipedia.org/wiki/Locomotive', 'Typical locomotive dimensions (range)')),
        'weight': m(150000000, 'typical operating weight', ('https://en.wikipedia.org/wiki/Locomotive', 'Typical diesel-electric locomotive weight (range)'), min=120000000, max=190000000)}),
]

# ── instruments ──────────────────────────────────────────────────
INSTRUMENTS = [
    rec('digital-keyboard', 'Digital keyboard (61-key)', 'everyday', '1f3b9', 'musical-keyboard', 'width', 'horizontal', {
        'width': m(950, 'typical 61-key keyboard width', ('https://www.yamaha.com/en/products/', 'Typical 61-key portable keyboard dimensions (range)')),
        'weight': m(7000, 'typical 61-key keyboard weight', ('https://www.yamaha.com/en/products/', 'Typical 61-key portable keyboard weight (range)'), min=5000, max=9000)}),
    rec('violin', 'Violin (4/4)', 'everyday', '1f3bb', 'violin', 'length', 'vertical', {
        'length': m(590, 'total length, full-size 4/4 violin', ('https://en.wikipedia.org/wiki/Violin', 'Standard 4/4 violin dimensions')),
        'weight': m(450, 'typical instrument weight (no case)', ('https://en.wikipedia.org/wiki/Violin', 'Typical violin weight (range)'), min=400, max=500)}),
    rec('trumpet', 'Trumpet', 'everyday', '1f3ba', 'trumpet', 'length', 'horizontal', {
        'length': m(490, 'assembled length, standard B♭ trumpet', ('https://www.yamaha.com/en/products/', 'Typical B♭ trumpet dimensions (range)')),
        'weight': m(1100, 'typical instrument weight', ('https://www.yamaha.com/en/products/', 'Typical trumpet weight (range)'), min=1000, max=1250)}),
    rec('snare-drum', 'Snare drum (14 in)', 'everyday', '1f941', 'drum', 'diameter', 'both', {
        'diameter': m(356, 'shell diameter (14 in standard)', ('https://en.wikipedia.org/wiki/Snare_drum', 'Standard snare drum dimensions')),
        'weight': m(5500, 'typical drum with stand (approx.)', ('https://en.wikipedia.org/wiki/Snare_drum', 'Typical snare + stand weight (approx.)'), uncertainty_note='Approximate; shells and hardware vary.')}),
    rec('saxophone', 'Alto saxophone', 'everyday', '1f3b7', 'saxophone', 'height', 'vertical', {
        'height': m(660, 'height with mouthpiece attached', ('https://www.yamaha.com/en/products/', 'Typical alto saxophone dimensions (range)')),
        'weight': m(2300, 'typical instrument weight', ('https://www.yamaha.com/en/products/', 'Typical alto saxophone weight (range)'), min=2000, max=2500)}),
    rec('banjo', 'Five-string banjo', 'everyday', '1fa95', 'banjo', 'length', 'vertical', {
        'length': m(965, 'total length, resonator banjo', ('https://en.wikipedia.org/wiki/Banjo', 'Typical 5-string banjo dimensions (range)')),
        'weight': m(4300, 'typical instrument weight', ('https://en.wikipedia.org/wiki/Banjo', 'Typical banjo weight (range)'), min=4000, max=4500)}),
]

# ── space: saturn ────────────────────────────────────────────────
SATURN = rec('saturn', 'Saturn', 'space', '1fa90', 'ringed-planet', 'diameter', 'both', {
    'diameter': m(116460000000, 'equatorial diameter (116,460 km)', 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html', 'NASA Saturn Fact Sheet'),
    'volume': m(8.2713e29, 'volume (8.2713×10¹⁴ km³)', 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html', 'NASA Saturn Fact Sheet'),
})

# ── everyday wave 2 ──────────────────────────────────────────────
EVERYDAY = [
    rec('chair', 'Dining chair', 'everyday', '1fa91', 'chair', 'height', 'vertical', {
        'height': m(850, 'total back height from floor', ('https://en.wikipedia.org/wiki/Chair', 'Standard chair dimensions (range)'), min=800, max=900),
        'weight': m(4500, 'typical wooden dining chair', ('https://en.wikipedia.org/wiki/Chair', 'Typical chair weight (range)'), min=3000, max=6000)}),
    rec('umbrella', 'Umbrella (stick)', 'everyday', '2602', 'umbrella', 'diameter', 'both', {
        'diameter': m(1000, 'open canopy diameter, typical stick umbrella', ('https://en.wikipedia.org/wiki/Umbrella', 'Typical canopy coverage (range)'), min=900, max=1100),
        'weight': m(420, 'typical stick umbrella weight', ('https://en.wikipedia.org/wiki/Umbrella', 'Typical umbrella weight (range)'), min=350, max=500)}),
    rec('backpack', 'Backpack (daypack)', 'everyday', '1f392', 'backpack', 'height', 'vertical', {
        'height': m(450, 'typical daypack height', ('https://en.wikipedia.org/wiki/Backpack', 'Typical daypack dimensions (range)')),
        'weight': m(700, 'typical empty daypack weight', ('https://en.wikipedia.org/wiki/Backpack', 'Typical daypack weight (range)'), min=500, max=1000)}),
    rec('scissors', 'Scissors', 'everyday', '2702', 'scissors', 'length', 'horizontal', {
        'length': m(165, 'typical household scissors length', ('https://en.wikipedia.org/wiki/Scissors', 'Typical household size (range)'), min=150, max=180),
        'weight': m(75, 'typical household scissors', ('https://en.wikipedia.org/wiki/Scissors', 'Typical scissors weight (range)'), min=60, max=90)}),
    rec('hammer', 'Claw hammer (16 oz)', 'everyday', '1f528', 'hammer', 'length', 'horizontal', {
        'length': m(330, 'typical 16 oz claw hammer length', ('https://en.wikipedia.org/wiki/Hammer', 'Standard 16 oz hammer dimensions')),
        'weight': m(570, 'typical 16 oz hammer total weight', ('https://en.wikipedia.org/wiki/Hammer', 'Standard 16 oz hammer weight'))}),
    rec('wrench', 'Combination wrench (8 in)', 'everyday', '1f527', 'wrench', 'length', 'horizontal', {
        'length': m(200, 'typical 8-inch combination wrench', ('https://en.wikipedia.org/wiki/Wrench', 'Standard 8-inch wrench')),
        'weight': m(250, 'typical 8-inch wrench', ('https://en.wikipedia.org/wiki/Wrench', 'Typical 8-inch wrench weight'))}),
    rec('key', 'House key', 'everyday', '1f511', 'key', 'length', 'vertical', {
        'length': m(65, 'typical pin-tumbler house key length', ('https://en.wikipedia.org/wiki/Key_(lock)', 'Typical key dimensions (range)')),
        'weight': m(25, 'typical brass key', ('https://en.wikipedia.org/wiki/Key_(lock)', 'Typical key weight (range)'), min=20, max=30)}),
    rec('alarm-clock', 'Alarm clock (twin bell)', 'everyday', '23f0', 'alarm-clock', 'diameter', 'both', {
        'diameter': m(100, 'typical twin-bell clock face diameter', ('https://en.wikipedia.org/wiki/Alarm_clock', 'Typical twin-bell dimensions (range)')),
        'weight': m(500, 'typical twin-bell clock', ('https://en.wikipedia.org/wiki/Alarm_clock', 'Typical twin-bell clock weight (range)'), min=400, max=600)}),
    rec('camera', 'Mirrorless camera (with lens)', 'everyday', '1f4f7', 'camera', 'weight', 'both', {
        'weight': m(650, 'typical body + kit lens', ('https://en.wikipedia.org/wiki/Mirrorless_interchangeable-lens_camera', 'Typical mirrorless kit weight (range)')),
        'width': m(125, 'typical body width', ('https://en.wikipedia.org/wiki/Mirrorless_interchangeable-lens_camera', 'Typical body width (range)'), min=120, max=135)}),
    rec('headphones', 'Over-ear headphones', 'everyday', '1f3a7', 'headphone', 'width', 'horizontal', {
        'width': m(180, 'typical over-ear headphone width (earcup to earcup)', ('https://en.wikipedia.org/wiki/Headphones', 'Typical over-ear dimensions (range)')),
        'weight': m(250, 'typical over-ear headphone weight', ('https://en.wikipedia.org/wiki/Headphones', 'Typical over-ear weight (range)'), min=200, max=320)}),
    rec('battery-aa', 'AA battery', 'everyday', '1f50b', 'battery', 'length', 'vertical', {
        'length': m(mm(1.99), 'AA cell length (IEC 60086)', 'https://en.wikipedia.org/wiki/AA_battery', 'IEC 60086 — AA cell dimensions (1.99 in × 0.57 in)'),
        'weight': m(23, 'typical alkaline AA cell', 'https://en.wikipedia.org/wiki/AA_battery', 'Typical alkaline AA weight (range)', min=19, max=24)}),
    rec('light-bulb', 'Light bulb (A19)', 'everyday', '1f4a1', 'light-bulb', 'height', 'vertical', {
        'height': m(110, 'A19 bulb height (lamp base to top)', ('https://en.wikipedia.org/wiki/A19_light_bulb', 'ANSI A19 bulb dimensions')),
        'weight': m(50, 'typical LED A19 bulb', ('https://en.wikipedia.org/wiki/A19_light_bulb', 'Typical LED A19 weight (range)'), min=40, max=70)}),
    rec('toothbrush', 'Toothbrush', 'everyday', '1fa79', 'toothbrush', 'length', 'horizontal', {
        'length': m(190, 'typical manual toothbrush length', ('https://en.wikipedia.org/wiki/Toothbrush', 'Typical toothbrush length (range)'), min=180, max=200),
        'weight': m(17, 'typical manual toothbrush', ('https://en.wikipedia.org/wiki/Toothbrush', 'Typical toothbrush weight (range)'), min=15, max=20)}),
    rec('broom', 'Push broom', 'everyday', '1f9f9', 'broom', 'length', 'vertical', {
        'length': m(1400, 'typical push broom total length', ('https://en.wikipedia.org/wiki/Broom', 'Typical broom length (range)'), min=1300, max=1500),
        'weight': m(1000, 'typical push broom', ('https://en.wikipedia.org/wiki/Broom', 'Typical broom weight (range)'), min=800, max=1200)}),
]

ALL = BALLS + FOOD + ANIMALS + VEHICLES + INSTRUMENTS + [SATURN] + EVERYDAY

def m_ts(m):
    parts = [f"value: {m['value']}"]
    if 'min' in m: parts.append(f"min: {m['min']}")
    if 'max' in m: parts.append(f"max: {m['max']}")
    parts.append(f"context: {json.dumps(m['context'])}")
    parts.append(f"source_url: {json.dumps(m['source_url'])}")
    parts.append(f"source_name: {json.dumps(m['source_name'])}")
    parts.append(f"checked_at: {json.dumps(m['checked_at'])}")
    if m.get('uncertainty_note'): parts.append(f"uncertainty_note: {json.dumps(m['uncertainty_note'])}")
    return '{\n        ' + ',\n        '.join(parts) + '\n      }'

def rec_ts(r):
    ms = r['measurements']
    lines = ["  {", f"    id: '{r['id']}',", f"    name: {json.dumps(r['name'])},", f"    category: '{r['category']}',",
             "    silhouette: 'book',", f"    image: '/objects/{r['emoji_name']}.svg',",
             f"    aspect: {r['aspect']},", f"    axis: '{r['axis']}',", f"    primaryAttr: '{r['primaryAttr']}',", "    measurements: {"]
    for k, v in ms.items():
        lines.append(f"      {k}: {m_ts(v)},")
    lines += ["    },", "    image_license: 'fluent-emoji-MIT',", "    attribution: 'Microsoft Fluent Emoji (MIT)',", "  }"]
    return '\n'.join(lines)

ts = ',\n'.join(rec_ts(r) for r in ALL)
open('scripts/emoji-tools/wave-e2.txt', 'w').write(ts + '\n')
names = sorted({r['emoji_name'] for r in ALL})
json.dump(names, open('scripts/emoji-tools/wave-e23-names.json', 'w'))
print('records:', len(ALL), '| emoji assets:', len(names))
