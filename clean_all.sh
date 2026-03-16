#!/bin/sh
set -eu
# Simple shell cleaner for exported Google Sites HTML files.
# Creates a backup of each original into ./originals/ and writes a cleaned
# copy next to it with the suffix .clean.html. This uses only POSIX tools.

HERE=$(dirname "$0")
cd "$HERE"

ORIG_DIR="originals"
mkdir -p "$ORIG_DIR"

clean_body_to_tmp() {
  infile="$1"
  outfile="$2"
  # Use Perl to robustly extract <main>..</main> or fallback to <body>..</body>,
  # and to strip <script> and <style> blocks.
  perl -0777 -ne '
    my $s = $_;
    my $body = "";
    if ($s =~ /<main\b[^>]*>(.*?)<\/main>/is) { $body = $1 }
    elsif ($s =~ /<body\b[^>]*>(.*?)<\/body>/is) { $body = $1 }
    else { $body = $s }
    $body =~ s/<script\b[^>]*>.*?<\/script>//gis;
    $body =~ s/<style\b[^>]*>.*?<\/style>//gis;
    print $body;
  ' "$infile" > "$outfile"
}

strip_attributes() {
  # Use Perl to remove google-specific attributes, event handlers, comments, and
  # unnecessary wrapper tags (div/span) while preserving href/src/alt.
  perl -0777 -pe '
    s/<!--.*?-->//gs; 
    s/\s+(?:jscontroller|jsaction|jsname|jsmodel|data-[^=\s\>]+|aria-[^=\s\>]+|role|nonce)="[^"]*"//gi;
    s/\s+on[a-zA-Z]+="[^"]*"//gi;
    s#</?(?:div|span)[^>]*>##gi;
  '
}

for f in ./*.html; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  echo "Backing up $base"
  cp -p "$f" "$ORIG_DIR/$base"

  tmp1=$(mktemp)
  tmp2=$(mktemp)
  trap 'rm -f "$tmp1" "$tmp2"' EXIT

  # extract title (simple single-line match) or fallback to filename
  title=$(sed -n 's:.*<title>\(.*\)</title>.*:\1:p' "$f" || true)
  if [ -z "$title" ]; then title="${base%.*}"; fi

  clean_body_to_tmp "$f" "$tmp1"

  # remove heavy wrapper attributes and inline handlers
  strip_attributes < "$tmp1" > "$tmp2"

  out="${f%.html}.clean.html"
  echo "Writing cleaned copy to $(basename "$out")"

  cat > "$out" <<EOF
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <style>
    :root{--max-width:980px;--accent:#5b2b7a}
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.45;color:#111;margin:0;padding:0}
    .site{max-width:var(--max-width);margin:0 auto;padding:24px}
    header{display:flex;align-items:center;justify-content:space-between;gap:16px}
    h1{margin:0;font-size:1.4rem;color:var(--accent)}
    nav a{margin-left:12px;text-decoration:none;color:inherit}
    main{margin-top:18px}
    img.responsive{max-width:100%;height:auto;border-radius:6px}
    section{margin-top:18px}
  </style>
</head>
<body>
  <div class="site">
    <header>
      <div>
        <h1>${title}</h1>
      </div>
      <nav aria-label="Main navigation"></nav>
    </header>
    <main>
$(sed 's/^/      /' "$tmp2")
    </main>
    <footer style="margin-top:30px;color:#666;font-size:0.95rem;">Contact: <a href="mailto:kpotter@friends.tas.edu.au">kpotter@friends.tas.edu.au</a></footer>
  </div>
</body>
</html>
EOF

  rm -f "$tmp1" "$tmp2"
  trap - EXIT
done

echo "Cleaning complete. Cleaned files have suffix .clean.html and originals are in $ORIG_DIR/"
