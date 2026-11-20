#!/usr/bin/env python3
"""Build standalone Fluent Emoji SVG assets for our object library.

Reads @iconify-json/fluent-emoji/icons.json, resolves asset-id → iconify
name from the codepoint map (built from repo metadata), rewrites all
defs ids with an asset-id prefix (10k ids are shared across icons —
two emojis on one canvas would cross-link gradients otherwise), and
writes standalone SVGs into public/objects/.
"""
import json, re, sys

MAP = json.load(open('scripts/emoji-tools/fluent-map.json'))  # asset_id -> codepoint
d = json.load(open('node_modules/@iconify-json/fluent-emoji/icons.json'))
icons, aliases = d['icons'], d.get('aliases', {})
W = d.get('width', 32)
H = d.get('height', 32)

def resolve(asset_id):
    cp = MAP[asset_id]
    if cp in icons: return icons[cp]
    if cp in aliases:  # alias entry: {parent, ...}
        return icons[aliases[cp]['parent']]
    raise KeyError(f"{asset_id}: codepoint {cp} not in iconify set")

def rewrite_ids(body, prefix):
    seen = set()
    def repl_id(m):
        old = m.group(1)
        seen.add(old)
        return f'id="{prefix}-{old}"'
    body = re.sub(r'id="([^"]+)"', repl_id, body)
    for old in seen:
        body = body.replace(f'url(#{old})', f'url(#{prefix}-{old})')
        body = body.replace(f'href="#{old}', f'href="#{prefix}-{old}')
    return body

out = []
for asset_id in sorted(MAP):
    try:
        icon = resolve(asset_id)
    except KeyError as e:
        print('MISS', e); continue
    body = rewrite_ids(icon['body'], asset_id)
    w = icon.get('width', W); h = icon.get('height', H)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
           f'width="{w}" height="{h}">{body}</svg>')
    path = f'public/objects/{asset_id}.svg'
    open(path, 'w').write(svg)
    out.append(asset_id)

print(f'wrote {len(out)} assets')
