"""
Extracts the exact "fonUFAL" wordmark vector paths (the outlined letterforms,
red "fon" + blue "UFAL", no subtitle) from the official fonUFAL brand file
(marca-fonUFAL.ai) and prints/saves the resulting SVG.

The .ai file is PDF-compatible (default Illustrator export setting), so
PyMuPDF can read it directly: `pip install pymupdf`. The wordmark's letters
were converted to outlines (curves) rather than live text in the source
file, so `get_text()` returns nothing — the glyphs have to be reconstructed
from `page.get_drawings()` instead, which returns each letter as its own
filled path made of line/cubic-bezier segments.

Usage:
  python scrape/extract-wordmark-from-brand-file.py "path/to/marca-fonUFAL.ai"

Official palette (from identidade-visual-fonUFAL.pdf):
  Vermelho fonUFAL  #C4161C
  Azul fonUFAL      #005E9E
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

    # The 17 waveform-icon bars sit in the same artboard (255 < x0 < 370,
    # see extract-favicon-from-brand-file.py) — excluded here since we only
    # want the wordmark letters. The gray subtitle line ("Estudos em
    # fonética e fonologia / Universidade Federal de Alagoas") is excluded
    # by color, keeping only the red "fon" + blue "UFAL" glyphs.
    letters = [
        d for d in drawings
        if not (255 < d['rect'].x0 < 370) and classify(d['fill']) in ('red', 'blue')
    ]
    if not letters:
        print('WARNING: no wordmark letter paths found — check the source file has not changed shape.')
        return

    min_x = min(d['rect'].x0 for d in letters)
    max_x = max(d['rect'].x1 for d in letters)
    min_y = min(d['rect'].y0 for d in letters)
    max_y = max(d['rect'].y1 for d in letters)

    # Empirically (rendered and visually compared against the reference
    # wordmark), get_drawings() already returns points in a top-left-origin,
    # y-down space here — no PDF-to-SVG Y flip is needed, unlike the manual
    # bar-geometry math in the favicon script.
    def pt(p):
        return f'{p.x - min_x:.3f},{p.y - min_y:.3f}'

    COLORS = {'red': '#C4161C', 'blue': '#005E9E'}
    paths = [
        f'  <path d="{items_to_path(d["items"], pt)}" fill="{COLORS[classify(d["fill"])]}"/>'
        for d in letters
    ]

    w = max_x - min_x
    h = max_y - min_y
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.3f} {h:.3f}">\n'
        + '\n'.join(paths) +
        '\n</svg>\n'
    )

    out_path = 'public/brand/fonufal-wordmark.svg'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f'Wrote {out_path} ({len(letters)} letter paths, viewBox 0 0 {w:.3f} {h:.3f})')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python extract-wordmark-from-brand-file.py <path to marca-fonUFAL.ai>')
        sys.exit(1)
    main(sys.argv[1])
