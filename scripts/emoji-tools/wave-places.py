#!/usr/bin/env python3
"""Wave P: places — country areas for the area family (quiz + compare pages).

Single-source discipline: CIA World Factbook "Geography > Area: total"
(land + water) for every entry, checked 2026-11-21. Set = the ~60 largest
countries plus six small contrast states (Vatican, Monaco, Liechtenstein,
Luxembourg, Belgium, Netherlands) for quiz spread.

Fluent Emoji has no country flags, so places carry no image — the
AreaSquares chart draws honest side-∝√A squares and the picker uses the
'placesquare' silhouette.

Emits TS records to wave-places.txt for splicing into src/data/library.ts.
"""

KM2_TO_MM2 = 1e12
CIA = 'https://www.cia.gov/the-world-factbook/countries/{slug}/'
SOURCE_NAME = 'CIA World Factbook — Geography'
CHECKED_AT = '2026-11-21'

# (id, name, total area km², CIA country slug)
COUNTRIES = [
    ('russia', 'Russia', 17_098_242, 'russia'),
    ('canada', 'Canada', 9_984_670, 'canada'),
    ('united-states', 'United States', 9_833_517, 'united-states'),
    ('china', 'China', 9_596_960, 'china'),
    ('brazil', 'Brazil', 8_515_767, 'brazil'),
    ('australia', 'Australia', 7_741_220, 'australia'),
    ('india', 'India', 3_287_263, 'india'),
    ('argentina', 'Argentina', 2_780_400, 'argentina'),
    ('kazakhstan', 'Kazakhstan', 2_724_900, 'kazakhstan'),
    ('algeria', 'Algeria', 2_381_741, 'algeria'),
    ('dr-congo', 'DR Congo', 2_344_858, 'congo-democratic-republic-of-the'),
    ('saudi-arabia', 'Saudi Arabia', 2_149_690, 'saudi-arabia'),
    ('mexico', 'Mexico', 1_964_375, 'mexico'),
    ('indonesia', 'Indonesia', 1_904_569, 'indonesia'),
    ('sudan', 'Sudan', 1_861_484, 'sudan'),
    ('libya', 'Libya', 1_759_540, 'libya'),
    ('iran', 'Iran', 1_648_195, 'iran'),
    ('mongolia', 'Mongolia', 1_564_116, 'mongolia'),
    ('peru', 'Peru', 1_285_216, 'peru'),
    ('chad', 'Chad', 1_284_000, 'chad'),
    ('niger', 'Niger', 1_267_000, 'niger'),
    ('angola', 'Angola', 1_246_700, 'angola'),
    ('mali', 'Mali', 1_240_192, 'mali'),
    ('south-africa', 'South Africa', 1_221_037, 'south-africa'),
    ('colombia', 'Colombia', 1_138_910, 'colombia'),
    ('ethiopia', 'Ethiopia', 1_104_300, 'ethiopia'),
    ('bolivia', 'Bolivia', 1_098_581, 'bolivia'),
    ('mauritania', 'Mauritania', 1_030_700, 'mauritania'),
    ('egypt', 'Egypt', 1_001_450, 'egypt'),
    ('tanzania', 'Tanzania', 947_300, 'tanzania'),
    ('nigeria', 'Nigeria', 923_768, 'nigeria'),
    ('venezuela', 'Venezuela', 912_050, 'venezuela'),
    ('pakistan', 'Pakistan', 881_913, 'pakistan'),
    ('namibia', 'Namibia', 824_292, 'namibia'),
    ('mozambique', 'Mozambique', 799_380, 'mozambique'),
    ('turkey', 'Turkey', 783_562, 'turkey'),
    ('chile', 'Chile', 756_102, 'chile'),
    ('zambia', 'Zambia', 752_618, 'zambia'),
    ('myanmar', 'Myanmar', 676_578, 'burma'),
    ('afghanistan', 'Afghanistan', 652_230, 'afghanistan'),
    ('south-sudan', 'South Sudan', 644_329, 'south-sudan'),
    ('france', 'France', 643_801, 'france'),
    ('somalia', 'Somalia', 637_657, 'somalia'),
    ('central-african-republic', 'Central African Republic', 622_984, 'central-african-republic'),
    ('ukraine', 'Ukraine', 603_550, 'ukraine'),
    ('madagascar', 'Madagascar', 587_041, 'madagascar'),
    ('botswana', 'Botswana', 581_730, 'botswana'),
    ('kenya', 'Kenya', 580_367, 'kenya'),
    ('yemen', 'Yemen', 527_968, 'yemen'),
    ('thailand', 'Thailand', 513_120, 'thailand'),
    ('spain', 'Spain', 505_370, 'spain'),
    ('turkmenistan', 'Turkmenistan', 488_100, 'turkmenistan'),
    ('cameroon', 'Cameroon', 475_442, 'cameroon'),
    ('papua-new-guinea', 'Papua New Guinea', 462_840, 'papua-new-guinea'),
    ('sweden', 'Sweden', 450_295, 'sweden'),
    ('uzbekistan', 'Uzbekistan', 447_400, 'uzbekistan'),
    ('morocco', 'Morocco', 446_550, 'morocco'),
    ('iraq', 'Iraq', 438_317, 'iraq'),
    ('paraguay', 'Paraguay', 406_752, 'paraguay'),
    ('zimbabwe', 'Zimbabwe', 390_757, 'zimbabwe'),
    ('norway', 'Norway', 385_207, 'norway'),
    # small contrast states for quiz spread
    ('netherlands', 'Netherlands', 41_850, 'netherlands'),
    ('belgium', 'Belgium', 30_528, 'belgium'),
    ('luxembourg', 'Luxembourg', 2_586, 'luxembourg'),
    ('liechtenstein', 'Liechtenstein', 160, 'liechtenstein'),
    ('monaco', 'Monaco', 2.02, 'monaco'),
    ('vatican-city', 'Vatican City', 0.44, 'holy-see'),
]


def mm2_literal(km2: float) -> str:
    """mm² value as a compact TS literal (e.g. 9.59696e18), keeping every
    significant digit of the km² source value (up to 8)."""
    v = km2 * KM2_TO_MM2
    s = f'{v:.8e}'.replace('e+', 'e')
    # strip trailing zeros in the mantissa: 9.59696000e18 -> 9.59696e18
    mant, _, exp = s.partition('e')
    if '.' in mant:
        mant = mant.rstrip('0').rstrip('.')
    return f'{mant}e{exp}'


def record(cid: str, name: str, km2: float, slug: str) -> str:
    return '\n'.join([
        '  {',
        f"    id: '{cid}',",
        f"    name: '{name}',",
        "    category: 'place',",
        "    silhouette: 'placesquare',",
        '    aspect: 1,',
        "    axis: 'both',",
        "    primaryAttr: 'area',",
        '    measurements: {',
        '      area: {',
        f'        value: {mm2_literal(km2)},',
        "        context: 'total area (land and water)',",
        f"        source_url: '{CIA.format(slug=slug)}',",
        f"        source_name: '{SOURCE_NAME}',",
        f"        checked_at: '{CHECKED_AT}',",
        '      },',
        '    },',
        "    image_license: 'original-CC0',",
        "    attribution: 'SizeCompare original',",
        '  }',
    ])


assert len({c[0] for c in COUNTRIES}) == len(COUNTRIES), 'duplicate ids'
areas = [c[2] for c in COUNTRIES]
assert areas == sorted(areas, reverse=True), 'table must be sorted by area desc'

out = ',\n'.join(record(*c) for c in COUNTRIES) + ',\n'
open('scripts/emoji-tools/wave-places.txt', 'w').write(out)
print(f'places: {len(COUNTRIES)} | largest {COUNTRIES[0][1]} {COUNTRIES[0][2]:,} km²'
      f' | smallest {COUNTRIES[-1][1]} {COUNTRIES[-1][2]} km²')
