const fs = require('fs');

const replacements = [
  ['Abyss%20%20Journey.html', 'abyss-journey.html'],
  ['Abyss  Journey.html', 'abyss-journey.html'],
  ['Alternatives%20to%20Violence%20-%20Pat%20Cronin%20Foundation.html', 'alternatives-to-violence-pat-cronin-foundation.html'],
  ['Class%20Challenges.html', 'class-challenges.html'],
  ['Class Challenges.html', 'class-challenges.html'],
  ['Elite%20Minds.html', 'elite-minds.html'],
  ['Elite Minds.html', 'elite-minds.html'],
  ['Final%20Reflection.html', 'final-reflection.html'],
  ['Final Reflection.html', 'final-reflection.html'],
  ['Home.html', 'home.html'],
  ['Indigenous%20Learning.html', 'indigenous-learning.html'],
  ['Indigenous Learning.html', 'indigenous-learning.html'],
  ['Microcredentials.html', 'microcredentials.html'],
  ['My%20Story.html', 'my-story.html'],
  ['My Story.html', 'my-story.html'],
  ['New%20Metrics.html', 'new-metrics.html'],
  ['New Metrics.html', 'new-metrics.html'],
  ['Pathway%20Plans.html', 'pathway-plans.html'],
  ['Pathway Plans.html', 'pathway-plans.html'],
  ['Service.html', 'service.html'],
  ['The%20Calling.html', 'the-calling.html'],
  ['The Calling.html', 'the-calling.html'],
  ['The%20Departure.html', 'the-departure.html'],
  ['The Departure.html', 'the-departure.html'],
  ['Work%20Experience.html', 'work-experience.html'],
  ['Work Experience.html', 'work-experience.html'],
  ['Year%2010%20Futures.html', 'year-10-futures.html'],
  ['Year 10 Futures.html', 'year-10-futures.html'],
  ['Year%201112.html', 'year-11-12.html'],
  ['Year 1112.html', 'year-11-12.html'],
  ['Year%209%20Program.html', 'year-9-program.html'],
  ['Year 9 Program.html', 'year-9-program.html'],

  ['Abyss%20%20Journey/', 'abyss-journey/'],
  ['Abyss  Journey/', 'abyss-journey/'],
  ['Alternatives%20to%20Violence%20-%20Pat%20Cronin%20Foundation/', 'alternatives-to-violence-pat-cronin-foundation/'],
  ['Class%20Challenges/', 'class-challenges/'],
  ['Class Challenges/', 'class-challenges/'],
  ['Elite%20Minds/', 'elite-minds/'],
  ['Elite Minds/', 'elite-minds/'],
  ['Final%20Reflection/', 'final-reflection/'],
  ['Final Reflection/', 'final-reflection/'],
  ['Home/', 'home/'],
  ['Indigenous%20Learning/', 'indigenous-learning/'],
  ['Indigenous Learning/', 'indigenous-learning/'],
  ['Microcredentials/', 'microcredentials/'],
  ['My%20Story/', 'my-story/'],
  ['My Story/', 'my-story/'],
  ['New%20Metrics/', 'new-metrics/'],
  ['New Metrics/', 'new-metrics/'],
  ['Pathway%20Plans/', 'pathway-plans/'],
  ['Pathway Plans/', 'pathway-plans/'],
  ['Service/', 'service/'],
  ['The%20Calling/', 'the-calling/'],
  ['The Calling/', 'the-calling/'],
  ['The%20Departure/', 'the-departure/'],
  ['The Departure/', 'the-departure/'],
  ['Work%20Experience/', 'work-experience/'],
  ['Work Experience/', 'work-experience/'],
  ['Year%2010%20Futures/', 'year-10-futures/'],
  ['Year 10 Futures/', 'year-10-futures/'],
  ['Year%201112/', 'year-11-12/'],
  ['Year 1112/', 'year-11-12/'],
  ['Year%209%20Program/', 'year-9-program/'],
  ['Year 9 Program/', 'year-9-program/']
];

const htmlFiles = fs.readdirSync('.').filter((f) => f.endsWith('.html'));

for (const file of htmlFiles) {
  let s = fs.readFileSync(file, 'utf8');

  for (const [from, to] of replacements) {
    s = s.split(from).join(to);
  }

  s = s.replace(/Karina Potter\s*[—-]\s*Portfolio/g, 'Ruben Sutton - Portfolio');
  s = s.replace(/Karina Potter/g, 'Ruben Sutton');
  s = s.replace(/Samuel Leeson/g, 'Ruben Sutton');
  s = s.replace(/Karina&#39;s Portfolio/g, 'Ruben Sutton Portfolio');
  s = s.replace(/kpotter@friends\.tas\.edu\.au/gi, 'ruben.sutton@example.com');

  s = s.replace(/\s*<li>Home<\/li>[\s\S]*?<li>New Metrics<\/li>\s*/i, '\n');

  s = s.replace(/\n?\s*<script\b[^>]*>[\s\S]*?<\/script>\s*/gi, '\n');

  if (/<style>[\s\S]*?<\/style>/i.test(s)) {
    s = s.replace(/<style>[\s\S]*?<\/style>/i, '<link rel="stylesheet" href="assets/site.css">');
  }

  if (!/assets\/site\.css/i.test(s)) {
    s = s.replace(/<\/head>/i, '  <link rel="stylesheet" href="assets/site.css">\n</head>');
  }

  if (!/data-site-nav/i.test(s)) {
    s = s.replace(/<\/header>/i, '</header>\n<nav class="site-nav" data-site-nav></nav>');
  }

  if (!/assets\/site\.js/i.test(s)) {
    s = s.replace(/<\/body>/i, '  <script src="assets/site.js" defer></script>\n</body>');
  }

  s = s.replace(/<title>\s*Ruben Sutton\s*[—-]\s*/i, '<title>Ruben Sutton - ');

  fs.writeFileSync(file, s);
}

console.log(`Updated ${htmlFiles.length} HTML files.`);
