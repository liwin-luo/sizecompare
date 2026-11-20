#!/usr/bin/env python3
"""Wave E1: dog/cat breeds, TVs, mattresses -> library wave fragment.

Emits TS records + the emoji codepoint list for the asset pipeline.
Breed entries share the generic dog/cat Fluent icon; TVs share television;
mattresses share bed. Measurements are AKC breed standards (dogs), CFA/TICA
weight guides (cats), and industry-standard dimensions (TVs, mattresses),
each marked for the audit ledger.
"""
import json

def mm(inches): return round(inches * 25.4)

AKC = {
    'source_url': 'https://www.akc.org/dog-breeds/',
    'source_name': 'AKC breed standard',
    'checked_at': '2026-11-20',
}
AKC_NOTE = 'AKC standard: value is the midpoint of the breed standard range; individual dogs vary.'

def dog(id, name, height_in_lo, height_in_hi, weight_lb_lo, weight_lb_hi):
    h = mm((height_in_lo + height_in_hi) / 2)
    w_lb = (weight_lb_lo + weight_lb_hi) / 2
    w = round(w_lb * 453.59237)
    return {
        'id': f'dog-{id}', 'name': f'{name}', 'category': 'animal',
        'emoji': '1f415', 'primaryAttr': 'height', 'axis': 'vertical',
        'height': {'value': h, 'min': mm(height_in_lo), 'max': mm(height_in_hi),
                   'context': 'shoulder height (AKC standard range)', **AKC,
                   'uncertainty_note': AKC_NOTE},
        'weight': {'value': w, 'min': round(weight_lb_lo * 453.59237), 'max': round(weight_lb_hi * 453.59237),
                   'context': 'body mass (AKC standard range)', **AKC,
                   'uncertainty_note': AKC_NOTE},
    }

DOGS = [
    dog('golden-retriever', 'Golden Retriever', 23, 24, 65, 75),
    dog('german-shepherd', 'German Shepherd', 24, 26, 50, 90),
    dog('french-bulldog', 'French Bulldog', 11, 13, 22, 28),
    dog('bulldog', 'Bulldog (English)', 14, 15, 40, 50),
    dog('beagle', 'Beagle', 13, 15, 20, 30),
    dog('rottweiler', 'Rottweiler', 24, 27, 95, 135),
    dog('dachshund', 'Dachshund (standard)', 8, 9, 16, 32),
    dog('corgi', 'Pembroke Welsh Corgi', 10, 12, 25, 30),
    dog('chihuahua', 'Chihuahua', 5, 8, 4, 6),
    dog('pomeranian', 'Pomeranian', 6, 7, 3, 7),
    dog('husky', 'Siberian Husky', 20, 23.5, 35, 60),
    dog('maltese', 'Maltese', 8, 10, 5, 7),
    dog('border-collie', 'Border Collie', 18, 22, 30, 55),
    dog('aussie', 'Australian Shepherd', 18, 23, 40, 65),
    dog('doberman', 'Doberman Pinscher', 24, 28, 60, 100),
    dog('great-dane', 'Great Dane', 28, 32, 110, 175),
    dog('saint-bernard', 'Saint Bernard', 26, 30, 120, 180),
    dog('boxer', 'Boxer', 21.5, 25, 65, 80),
    dog('shih-tzu', 'Shih Tzu', 9, 10.5, 9, 16),
    dog('pug', 'Pug', 10, 13, 14, 18),
    dog('yorkie', 'Yorkshire Terrier', 7, 8, 4, 6),
    dog('cocker-spaniel', 'Cocker Spaniel', 13.5, 15.5, 20, 30),
    dog('dalmatian', 'Dalmatian', 19, 23, 45, 70),
    dog('border-terrier', 'Border Terrier', 10, 11, 11.5, 15.5),
]

CAT_GUIDE = {
    'source_url': 'https://cfa.org/breeds/',
    'source_name': 'CFA breed profiles',
    'checked_at': '2026-11-20',
}
CAT_NOTE = 'Typical healthy adult range for the breed; individual cats vary.'

def cat(id, name, weight_kg_lo, weight_kg_hi, length_mm):
    return {
        'id': f'cat-{id}', 'name': f'{name}', 'category': 'animal',
        'emoji': '1f408', 'primaryAttr': 'weight', 'axis': 'horizontal',
        'weight': {'value': round((weight_kg_lo + weight_kg_hi) / 2 * 1000),
                   'min': round(weight_kg_lo * 1000), 'max': round(weight_kg_hi * 1000),
                   'context': 'healthy adult body mass', **CAT_GUIDE,
                   'uncertainty_note': CAT_NOTE},
        'length': {'value': length_mm, 'context': 'head-and-body length, adult (representative)',
                   'source_url': CAT_GUIDE['source_url'], 'source_name': 'CFA breed profiles',
                   'checked_at': '2026-11-20',
                   'uncertainty_note': 'Representative value; body lengths are not standardised by registries.'},
    }

CATS = [
    cat('maine-coon', 'Maine Coon', 5.9, 11.3, 480),
    cat('ragdoll', 'Ragdoll', 4.5, 9.0, 460),
    cat('siamese', 'Siamese', 2.5, 5.0, 330),
    cat('persian', 'Persian', 3.0, 5.5, 380),
    cat('british-shorthair', 'British Shorthair', 4.0, 7.0, 420),
    cat('bengal', 'Bengal', 3.5, 6.5, 440),
    cat('sphynx', 'Sphynx', 3.0, 5.0, 330),
    cat('abyssinian', 'Abyssinian', 3.0, 5.0, 360),
    cat('scottish-fold', 'Scottish Fold', 3.5, 5.5, 400),
    cat('russian-blue', 'Russian Blue', 3.5, 5.5, 400),
]

TV_NOTE = ('Derived from the nominal diagonal and the 16:9 panel ratio; actual bezels add a little.')
TV_SRC = {'source_url': 'https://en.wikipedia.org/wiki/16:9_aspect_ratio',
          'source_name': '16:9 display standard (diagonal-derived)',
          'checked_at': '2026-11-20'}

def tv(inches):
    diag = inches * 25.4
    w = round(diag * 0.8716)
    h = round(diag * 0.4903)
    return {
        'id': f'tv-{inches}', 'name': f'{inches}-inch TV', 'category': 'everyday',
        'emoji': '1f4fa', 'primaryAttr': 'width', 'axis': 'horizontal',
        'width': {'value': w, 'context': f'{inches}-inch diagonal, 16:9 panel screen width', **TV_SRC,
                  'uncertainty_note': TV_NOTE},
        'height': {'value': h, 'context': f'{inches}-inch diagonal, 16:9 panel screen height', **TV_SRC,
                   'uncertainty_note': TV_NOTE},
    }

TVS = [tv(i) for i in (43, 50, 55, 65, 75, 85, 98)]

BED_SRC = {'source_url': 'https://en.wikipedia.org/wiki/Bed_size',
           'source_name': 'Standard US bed sizes', 'checked_at': '2026-11-20'}
BED_NOTE = 'Standard US mattress dimensions; frames add a little.'

def bed(id, name, w_mm, l_mm):
    return {
        'id': f'bed-{id}', 'name': f'{name} mattress', 'category': 'everyday',
        'emoji': '1f6cf', 'primaryAttr': 'width', 'axis': 'horizontal',
        'width': {'value': w_mm, 'context': 'mattress width (US standard)', **BED_SRC},
        'height': {'value': l_mm, 'context': 'mattress length (US standard)', **BED_SRC,
                   'uncertainty_note': BED_NOTE},
    }

BEDS = [
    bed('crib', 'Crib', 711, 1321),
    bed('twin', 'Twin', 965, 1905),
    bed('full', 'Full', 1372, 1905),
    bed('queen', 'Queen', 1524, 2032),
    bed('king', 'King', 1930, 2032),
    bed('cal-king', 'California King', 1829, 2134),
]

ALL = DOGS + CATS + TVS + BEDS

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

EMOJI_NAMES = {'1f415': 'dog', '1f408': 'cat', '1f4fa': 'television', '1f6cf': 'bed'}

def rec_ts(rr):
    r = dict(rr)
    emoji = r['emoji']; primary = r.pop('primaryAttr'); axis = r.pop('axis')
    r['emoji_name'] = EMOJI_NAMES[emoji]
    ms = {k: v for k, v in list(r.items()) if k in ('height', 'length', 'width', 'weight', 'volume')}
    lines = ["  {", f"    id: '{r['id']}',", f"    name: {json.dumps(r['name'])},", f"    category: '{r['category']}',",
             f"    silhouette: 'book',", f"    image: '/objects/{r['emoji_name']}.svg',",
             f"    aspect: 0.8,", f"    axis: '{axis}',", f"    primaryAttr: '{primary}',", "    measurements: {"]
    for k, v in ms.items():
        lines.append(f"      {k}: {m_ts(v)},")
    lines += ["    },", "    image_license: 'fluent-emoji-MIT',", "    attribution: 'Microsoft Fluent Emoji (MIT)',", "  }"]
    return '\n'.join(lines)

ts = ',\n'.join(rec_ts(r) for r in ALL)
open('scripts/emoji-tools/wave-e1.txt', 'w').write(ts + '\n')
cps = sorted(set(EMOJI_NAMES.values()))
json.dump(cps, open('scripts/emoji-tools/wave-e1-cps.json', 'w'))
print('records:', len(ALL), '| codepoints:', cps)
