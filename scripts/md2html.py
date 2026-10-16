import sys, markdown
src, dst, title = sys.argv[1:4]
body = markdown.markdown(open(src, encoding='utf-8').read(), extensions=['tables', 'fenced_code'])
css = """
@page { size: A4; margin: 18mm 16mm; }
body { font-family: 'DejaVu Sans', 'Noto Sans', sans-serif; font-size: 11pt; line-height: 1.5; color: #1f1b3a; max-width: 100%; }
h1 { color: #5f52c8; font-size: 22pt; border-bottom: 2px solid #7c6fe0; padding-bottom: 6px; margin-top: 0; }
h2 { color: #5f52c8; font-size: 15pt; margin-top: 22px; }
table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 10pt; page-break-inside: avoid; }
th, td { border: 1px solid #d9d4ee; padding: 6px 8px; vertical-align: top; text-align: left; }
th { background: #ece8fb; }
code { background: #f3f1fb; padding: 1px 4px; border-radius: 4px; font-size: 9.5pt; }
pre { background: #f3f1fb; padding: 10px; border-radius: 8px; font-size: 9.5pt; white-space: pre-wrap; }
hr { page-break-after: always; border: 0; }
"""
open(dst, 'w', encoding='utf-8').write(f"<!doctype html><html><head><meta charset='utf-8'><title>{title}</title><style>{css}</style></head><body>{body}</body></html>")
