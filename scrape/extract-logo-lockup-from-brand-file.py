"""
Extracts the official "icon + fonUFAL wordmark" horizontal lockup (no
subtitle) from marca-fonUFAL.ai — the same combination shown as the primary
"assinatura" in identidade-visual-fonUFAL.pdf (used on letterhead, business
cards, notebooks) and matching fonufal_high/logo2.psd.

Reuses the icon-bar selection from extract-favicon-from-brand-file.py and
the letter-path reconstruction from extract-wordmark-from-brand-file.py.

The icon and wordmark are NOT simply kept at their raw relative position
from the source artboard: measured directly, the icon's bounding box
(y 273.98-340.15) and the wordmark's (y 273.59-309.28) share almost the same
TOP edge, not a common baseline or optical center — rendering that raw
relationship puts the wordmark visibly top-heavy against the icon, which
doesn't match the actual reference lockup (fonufal_high/logo2.psd) or how
the "assinaturas" page of the brand PDF shows it. Centering the wordmark's
bounding box on the icon's bounding box vertically reproduces the reference
correctly instead.

Usage:
  python scrape/extract-logo-lockup-from-brand-file.py "path/to/marca-fonUFAL.ai"
"""
import sys
import fitz  # pymupdf


def classify(fill):
    r, g, b = fill
    if r > 0.6 and g < 0.2:
        return 'red'
    if b > 0.4 and r < 0.2:
        return 'blue'
    return 'gray'


def items_to_path(items, pt):
    d = []
    last = None
    for item in items:
        op = item[0]
        if op == 'l':
            p1, p2 = item[1], item[2]
            if last is None or abs(p1.x - last.x) > 0.01 or abs(p1.y - last.y) > 0.01:
                d.append(f'M{pt(p1)}')
            d.append(f'L{pt(p2)}')
            last = p2
        elif op == 'c':
            p1, p2, p3, p4 = item[1], item[2], item[3], item[4]
            if last is None or abs(p1.x - last.x) > 0.01 or abs(p1.y - last.y) > 0.01:
                d.append(f'M{pt(p1)}')
            d.append(f'C{pt(p2)} {pt(p3)} {pt(p4)}')
            last = p4
    d.append('Z')
    return ' '.join(d)


def main(ai_path):
    doc = fitz.open(ai_path)
    page = doc[0]
    drawings = page.get_drawings()

    icon = sorted((d for d in drawings if 255 < d['rect'].x0 < 370), key=lambda d: d['rect'].x0)
    letters = [d for d in drawings if not (255 < d['rect'].x0 < 370) and classify(d['fill']) in ('red', 'blue')]
    if len(icon) != 17 or not letters:
        print('WARNING: expected 17 icon bars and wordmark letters — check the source file has not changed shape.')

    icon_y0 = min(d['rect'].y0 for d in icon)
    icon_y1 = max(d['rect'].y1 for d in icon)
    icon_center = (icon_y0 + icon_y1) / 2

    word_y0 = min(d['rect'].y0 for d in letters)
    word_y1 = max(d['rect'].y1 for d in letters)
    word_center = (word_y0 + word_y1) / 2

    y_shift = icon_center - word_center  # applied to wordmark points only

    min_x = min(d['rect'].x0 for d in icon + letters)
    max_x = max(d['rect'].x1 for d in icon + letters)
    min_y = min(icon_y0, word_y0 + y_shift)
    max_y = max(icon_y1, word_y1 + y_shift)

    def pt_word(p):
        return f'{p.x - min_x:.3f},{p.y + y_shift - min_y:.3f}'

    COLORS = {'red': 'var(--fon-red)', 'blue': 'var(--fon-blue)', 'gray': 'var(--fon-gray)'}

    icon_els = []
    for d in icon:
        r = d['rect']
        x0, y0, x1, y1 = r.x0 - min_x, r.y0 - min_y, r.x1 - min_x, r.y1 - min_y
        w = x1 - x0
        rx = w * 0.32
        icon_els.append(f'  <rect x="{x0:.3f}" y="{y0:.3f}" width="{w:.3f}" height="{(y1 - y0):.3f}" rx="{rx:.3f}" fill="{COLORS[classify(d["fill"])]}"/>')

    letter_els = [
        f'  <path d="{items_to_path(d["items"], pt_word)}" fill="{COLORS[classify(d["fill"])]}"/>'
        for d in letters
    ]

    w = max_x - min_x
    h = max_y - min_y
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.3f} {h:.3f}">\n'
        + '\n'.join(icon_els) + '\n'
        + '\n'.join(letter_els) +
        '\n</svg>\n'
    )

    out_path = 'public/brand/fonufal-logo-lockup.svg'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f'Wrote {out_path} (viewBox 0 0 {w:.3f} {h:.3f}, wordmark y-shift {y_shift:.3f})')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python extract-logo-lockup-from-brand-file.py <path to marca-fonUFAL.ai>')
        sys.exit(1)
    main(sys.argv[1])
