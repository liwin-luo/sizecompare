#!/usr/bin/env python3
"""
wave-population.py — population attribute for the 67 place objects.

Single source: World Bank Open Data, indicator SP.POP.TOTL, latest year
(2024). Micro-states not covered by the World Bank (Liechtenstein, Monaco,
Vatican City) fall back to CIA World Factbook estimates — each measurement
cites whichever source provided its number.

Fetches live from api.worldbank.org (read-only), then emits the
POPULATION literal for src/data/library.ts. Re-run:
    python3 scripts/emoji-tools/wave-population.py
Output: wave-population.txt — paste the literal into library.ts.
"""

import json
import urllib.request

# our library id → World Bank ISO3
ISO3 = {
    'russia': 'RUS', 'canada': 'CAN', 'united-states': 'USA', 'china': 'CHN',
    'brazil': 'BRA', 'australia': 'AUS', 'india': 'IND', 'argentina': 'ARG',
    'kazakhstan': 'KAZ', 'algeria': 'DZA', 'dr-congo': 'COD', 'saudi-arabia': 'SAU',
    'mexico': 'MEX', 'indonesia': 'IDN', 'sudan': 'SDN', 'libya': 'LBY',
    'iran': 'IRN', 'mongolia': 'MNG', 'peru': 'PER', 'chad': 'TCD',
    'niger': 'NER', 'angola': 'AGO', 'mali': 'MLI', 'south-africa': 'ZAF',
    'colombia': 'COL', 'ethiopia': 'ETH', 'bolivia': 'BOL', 'mauritania': 'MRT',
    'egypt': 'EGY', 'tanzania': 'TZA', 'nigeria': 'NGA', 'venezuela': 'VEN',
    'pakistan': 'PAK', 'namibia': 'NAM', 'mozambique': 'MOZ', 'turkey': 'TUR',
    'chile': 'CHL', 'zambia': 'ZMB', 'myanmar': 'MMR', 'afghanistan': 'AFG',
    'south-sudan': 'SSD', 'somalia': 'SOM', 'central-african-republic': 'CAF',
    'ukraine': 'UKR', 'madagascar': 'MDG', 'botswana': 'BWA', 'kenya': 'KEN',
    'yemen': 'YEM', 'thailand': 'THA', 'spain': 'ESP', 'turkmenistan': 'TKM',
    'cameroon': 'CMR', 'papua-new-guinea': 'PNG', 'sweden': 'SWE',
    'uzbekistan': 'UZB', 'morocco': 'MAR', 'iraq': 'IRQ', 'paraguay': 'PRY',
    'zimbabwe': 'ZWE', 'norway': 'NOR', 'netherlands': 'NLD', 'belgium': 'BEL',
    'luxembourg': 'LUX', 'france': 'FRA',
}
# not covered by the World Bank → CIA WFB estimates (July 2025 est.)
CIA_FALLBACK = {
    'liechtenstein': 39_780,
    'monaco': 38_350,
    'vatican-city': 825,
}

WB_BULK = (
    'https://api.worldbank.org/v2/country/{}/indicator/SP.POP.TOTL'
    '?format=json&date=2024&per_page=500'
)


def fetch_bulk(iso3_list):
    """One request for all countries (the per-country endpoint rate-limits)."""
    url = WB_BULK.format(';'.join(iso3_list))
    with urllib.request.urlopen(url, timeout=30) as r:
        data = json.load(r)
    rows = data[1] or []
    return {row['countryiso3code']: int(row['value']) for row in rows if row['value'] is not None}


def main():
    out = []
    misses = []
    iso_by_id = {lib_id: iso3 for lib_id, iso3 in ISO3.items()}
    try:
        values = fetch_bulk(list(iso_by_id.values()))
    except Exception as e:  # noqa: BLE001
        raise SystemExit(f'bulk fetch failed: {e}')
    for lib_id, iso3 in sorted(iso_by_id.items()):
        value = values.get(iso3)
        if value is None:
            misses.append(f'{lib_id} ({iso3}): no 2024 value in bulk response')
            continue
        out.append((lib_id, value, 'wb'))
    for lib_id, value in sorted(CIA_FALLBACK.items()):
        out.append((lib_id, value, 'cia'))

    if misses:
        print('MISSES:')
        for m in misses:
            print(' ', m)
    assert len(out) + len(misses) == len(ISO3) + len(CIA_FALLBACK), (
        f'expected {len(ISO3) + len(CIA_FALLBACK)} places, got {len(out)}+{len(misses)}'
    )

    lines = []
    for lib_id, value, src in out:
        source = (
            ('https://data.worldbank.org/indicator/SP.POP.TOTL', 'World Bank — SP.POP.TOTL (2024)')
            if src == 'wb'
            else ('https://www.cia.gov/the-world-factbook/field/population/', 'CIA World Factbook — Population (2025 est.)')
        )
        lines.append(
            f"  '{lib_id}': {{ value: {value}, source_url: '{source[0]}', source_name: '{source[1]}' }},"
        )
    body = '\n'.join(lines)
    text = f'const POPULATION: Record<string, {{ value: number; source_url: string; source_name: string }}> = {{\n{body}\n}};\n'
    with open('scripts/emoji-tools/wave-population.txt', 'w') as f:
        f.write(text)
    total = sum(v for _, v, _ in out)
    print(f'wrote wave-population.txt: {len(out)} entries, wb={sum(1 for x in out if x[2] == "wb")}, cia={sum(1 for x in out if x[2] == "cia")}')
    print(f'sanity total (should be ~8.1–8.2 billion): {total:,}')


if __name__ == '__main__':
    main()
