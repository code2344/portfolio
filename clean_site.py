#!/usr/bin/env python3
"""
Simple cleaner for Google Sites exported HTML pages.
Creates a backup of originals in ./originals/ and writes cleaned HTML files
over the files in-place. It extracts title, navigation links (first <nav> or
header anchors) and main content (headings, paragraphs, images, lists).
"""
import os
import shutil
from bs4 import BeautifulSoup

ROOT = os.path.dirname(__file__)
DRAFT = ROOT
ORIGINALS = os.path.join(DRAFT, 'originals')

def ensure_backup_dir():
    os.makedirs(ORIGINALS, exist_ok=True)

def list_html_files():
    return [f for f in os.listdir(DRAFT) if f.lower().endswith('.html')]

def backup_file(path):
    dest = os.path.join(ORIGINALS, os.path.basename(path))
    shutil.copy2(path, dest)

def extract_nav(soup):
    nav = soup.find('nav') or soup.find(role='navigation')
    links = []
    if nav:
        for a in nav.find_all('a', href=True):
            text = a.get_text(strip=True)
            href = a['href']
            if text:
                links.append((text, href))
    else:
        # try header anchors
        header = soup.find('header')
        if header:
            for a in header.find_all('a', href=True):
                text = a.get_text(strip=True)
                href = a['href']
                if text:
                    links.append((text, href))
    return links

def extract_content(soup):
    # prefer <main>
    main = soup.find('main')
    if not main:
        # fallback: large sections or first article
        main = soup.find('article') or soup.find('body')

    blocks = []
    if not main:
        return blocks

    # remove scripts/styles
    for tag in main(['script','style']):
        tag.extract()

    for el in main.find_all(['h1','h2','h3','p','ul','ol','img','a']):
        if el.name == 'img' and el.get('src'):
            blocks.append(('img', el.get('src'), el.get('alt','')))
        elif el.name in ('ul','ol'):
            items = [li.get_text(strip=True) for li in el.find_all('li')]
            if items:
                blocks.append(('list', items))
        elif el.name == 'a' and el.get('href') and el.get_text(strip=True):
            blocks.append(('link', el.get_text(strip=True), el.get('href')))
        elif el.name.startswith('h') or el.name == 'p':
            text = el.get_text(strip=True)
            if text:
                blocks.append((el.name, text))
    return blocks

TEMPLATE = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title}</title>
  <style>
    :root{{--max-width:980px;--accent:#5b2b7a}}
    body{{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.45;color:#111;margin:0;padding:0}}
    .site{{max-width:var(--max-width);margin:0 auto;padding:24px}}
    header{{display:flex;align-items:center;justify-content:space-between;gap:16px}}
    h1{{margin:0;font-size:1.4rem;color:var(--accent)}}
    nav a{{margin-left:12px;text-decoration:none;color:inherit}}
    main{{margin-top:18px}}
    img.responsive{{max-width:100%;height:auto;border-radius:6px}}
    section{{margin-top:18px}}
  </style>
</head>
<body>
  <div class="site">
    <header>
      <div>
        <h1>{title}</h1>
      </div>
      <nav aria-label="Main navigation">
        {nav_html}
      </nav>
    </header>
    <main>
      {content_html}
    </main>
    <footer style="margin-top:30px;color:#666;font-size:0.95rem;">Contact: <a href="mailto:kpotter@friends.tas.edu.au">kpotter@friends.tas.edu.au</a></footer>
  </div>
</body>
</html>
'''

def build_nav_html(links):
    if not links:
        return ''
    parts = []
    for text,href in links:
        parts.append(f'<a href="{href}">{text}</a>')
    return ' '.join(parts)

def build_content_html(blocks):
    parts = []
    for b in blocks:
        if b[0] in ('h1','h2','h3'):
            parts.append(f'<{b[0]}>{b[1]}</{b[0]}>')
        elif b[0] == 'p':
            parts.append(f'<p>{b[1]}</p>')
        elif b[0] == 'img':
            src,alt = b[1], b[2]
            parts.append(f'<img src="{src}" alt="{alt}" class="responsive">')
        elif b[0] == 'list':
            items = ''.join(f'<li>{it}</li>' for it in b[1])
            parts.append(f'<ul>{items}</ul>')
        elif b[0] == 'link':
            parts.append(f'<p><a href="{b[2]}">{b[1]}</a></p>')
    return '\n'.join(parts)

def clean_file(path):
    with open(path, 'rb') as fh:
        raw = fh.read()
    try:
        soup = BeautifulSoup(raw, 'html.parser')
    except Exception:
        soup = BeautifulSoup(raw, 'html.parser')

    title = (soup.title.string.strip() if soup.title and soup.title.string else os.path.splitext(os.path.basename(path))[0])
    nav_links = extract_nav(soup)
    blocks = extract_content(soup)

    nav_html = build_nav_html(nav_links)
    content_html = build_content_html(blocks)

    out = TEMPLATE.format(title=title, nav_html=nav_html, content_html=content_html)
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(out)

def main():
    ensure_backup_dir()
    files = list_html_files()
    for f in files:
        path = os.path.join(DRAFT, f)
        print('Backing up', f)
        backup_file(path)
        print('Cleaning', f)
        try:
            clean_file(path)
        except Exception as e:
            print('Failed to clean', f, e)

if __name__ == '__main__':
    main()
