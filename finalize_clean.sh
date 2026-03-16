#!/bin/sh
set -eu
HERE=$(dirname "$0")
cd "$HERE"

echo "Finalizing cleaned files: converting .clean.html into compact readable pages..."
PERL_SCRIPT=$(mktemp)
trap 'rm -f "$PERL_SCRIPT"' EXIT
cat > "$PERL_SCRIPT" <<'PERL'
#!/usr/bin/env perl
use strict; use warnings;
local $/ = undef;
my $file = shift @ARGV;
my $s = do { open my $fh, '<', $file or die $!; <$fh> };
  my $title = ($s =~ /<title>(.*?)<\/title>/is) ? $1 : "Site Page";
  $title =~ s/\s+/ /gs; $title =~ s/^\s+|\s+$//g;
  print "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n";
  print "<title>$title</title>\n";
  print <<'STYLE';
<style>:root{--max-width:980px;--accent:#5b2b7a}body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.45;color:#111;margin:0;padding:0}.site{max-width:var(--max-width);margin:0 auto;padding:24px}h1{margin:0 0 8px 0;color:var(--accent)}img.responsive{max-width:100%;height:auto;border-radius:6px}p{margin:0 0 12px 0}ul{margin:0 0 12px 20px}</style>
</head>
<body>
<div class="site">
<header>
STYLE
  print "<h1>$title</h1>\n</header>\n<main>\n";
while ($s =~ m{<(h[1-3]|p|li)\b[^>]*>(.*?)</\1>|<img\b([^>]*?)>}gis) {
  if (defined $1) {
    my ($tag,$inner) = ($1,$2);
    $inner =~ s/<[^>]+>//g; $inner =~ s/\s+/ /gs; $inner =~ s/^\s+|\s+$//g;
    next if $inner eq "";
    if ($tag =~ /^h[12]$/) { print "<h2>$inner</h2>\n"; }
    elsif ($tag eq 'h3') { print "<h3>$inner</h3>\n"; }
    elsif ($tag eq 'p') { print "<p>$inner</p>\n"; }
    elsif ($tag eq 'li') { print "<li>$inner</li>\n"; }
  } else {
    my $attr = $3 || '';
    my ($src) = $attr =~ /src=(?:\"([^\"]*)\"|'([^']*)'|([^\s>]+))/i;
    $src = $1||$2||$3 if defined $1||defined $2||defined $3;
    $src ||= '';
    my ($alt) = $attr =~ /alt=(?:\"([^\"]*)\"|'([^']*)'|([^\s>]+))/i;
    $alt = $1||$2||$3 if defined $1||defined $2||defined $3;
    $alt ||= '';
    next if $src eq '';
    print "<p><img src=\"$src\" alt=\"$alt\" class=\"responsive\"></p>\n";
  }
}
print "</main>\n";
print <<'FOOT';
<footer style="margin-top:30px;color:#666;font-size:0.95rem;">Contact: <a href="mailto:kpotter@friends.tas.edu.au">kpotter@friends.tas.edu.au</a></footer>
</div>
</body>
</html>
FOOT
PERL

for f in ./*.clean.html; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  orig="${f%.clean.html}.html"
  out="$orig"
  echo "Processing $base -> $(basename "$out")"
  perl "$PERL_SCRIPT" "$f" > "$out"

  # remove intermediate .clean.html
  rm -f "$f"
done

echo "Finalization complete. Originals were overwritten with compact cleaned pages; backups remain in ./originals/."
