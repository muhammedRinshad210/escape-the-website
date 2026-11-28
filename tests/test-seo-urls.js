const fs = require('fs');
const path = require('path');

// Repository root, so the suite runs from any working directory
const ROOT = path.join(__dirname, '..');

console.log('==================================================');
console.log('   SEO PRODUCTION URL REGRESSION AUDIT            ');
console.log('==================================================');

let passed = 0;
let failed = 0;

function assert(condition, name) {
    if (condition) {
        console.log('[PASS] ' + name);
        passed++;
    } else {
        console.error('[FAIL] ' + name);
        failed++;
    }
}

const PROD = 'https://escape-the-website.onrender.com';
const LEGACY = 'muhammedrinshad210.github.io';

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
const uiJs = fs.readFileSync(path.join(ROOT, 'js', 'ui.js'), 'utf8');
const analyticsJs = fs.readFileSync(path.join(ROOT, 'js', 'analytics.js'), 'utf8');

// 1. Canonical + Open Graph + Twitter point at the production host
const canonical = html.match(/<link rel="canonical" href="([^"]+)">/);
assert(canonical && canonical[1] === PROD + '/', 'Canonical URL is the production URL');

const ogUrl = html.match(/<meta property="og:url" content="([^"]+)">/);
assert(ogUrl && ogUrl[1] === PROD + '/', 'og:url matches the canonical production URL');

const ogImage = html.match(/<meta property="og:image" content="([^"]+)">/);
assert(ogImage && ogImage[1] === PROD + '/assets/images/og-preview.png', 'og:image is an absolute production URL');

const twitterImage = html.match(/<meta name="twitter:image" content="([^"]+)">/);
assert(twitterImage && twitterImage[1] === PROD + '/assets/images/og-preview.png', 'twitter:image is an absolute production URL');

// 2. Structured data parses and uses the production URL
const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
let ld = null;
try {
    ld = ldMatch ? JSON.parse(ldMatch[1]) : null;
} catch (err) {
    ld = null;
}
assert(ld !== null, 'JSON-LD block parses as valid JSON');
assert(ld && ld.url === PROD + '/', 'JSON-LD url is the production URL');
assert(ld && typeof ld['@id'] === 'string' && ld['@id'].startsWith(PROD + '/'), 'JSON-LD @id is scoped to the production URL');

// 3. Sitemap contains exactly one production URL & updated lastmod
const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
assert(locs.length === 1, 'Sitemap declares a single URL');
assert(locs[0] === PROD + '/', 'Sitemap loc is the production URL');
assert(/<lastmod>2026-11-27<\/lastmod>/.test(sitemap), 'Sitemap lastmod is updated to 2026-11-27');

// 4. robots.txt advertises the production sitemap
assert(robots.includes('Sitemap: ' + PROD + '/sitemap.xml'), 'robots.txt points at the production sitemap');
assert(/User-agent:\s*\*/.test(robots) && /Allow:\s*\//.test(robots), 'robots.txt still allows crawling');

// 5. Crawl directives stay open & About section is crawlable without puzzle answers
assert(/<meta name="robots" content="index, follow">/.test(html), 'Meta robots remains index, follow');
assert(!/noindex/i.test(html), 'No noindex directive was introduced');
assert(html.includes('id="cover-about"') && html.includes('About / How to play'), 'Visible About / How to play section exists from cover');
assert(!html.includes('741') && !html.includes('torch, magnet, clock, fruit'), 'About / How to play omits puzzle answers');

// 6. No legacy host references anywhere in shipped files
[['index.html', html], ['sitemap.xml', sitemap], ['robots.txt', robots], ['js/ui.js', uiJs]].forEach(([name, body]) => {
    assert(!body.includes(LEGACY), 'No legacy host in ' + name);
});

// 7. Share referral URL & GA4/Clarity analytics contract
assert(uiJs.includes("const gameUrl = '" + PROD + "/';"), 'Share referral URL is the production URL');
['game_start', 'room_start', 'room_complete', 'wrong_choice', 'hint_used', 'game_completed', 'share_clicked', 'replay_clicked'].forEach((ev) => {
    assert(uiJs.includes("'" + ev + "'"), 'Analytics tracks ' + ev);
});
assert(analyticsJs.includes("typeof window.clarity === 'function'"), 'Clarity custom events only execute when window.clarity exists');

// 8. Deployment safety: no root-absolute asset references, declared files exist
assert(!/(?:href|src)="\//.test(html), 'No root-absolute href/src paths');
assert(fs.existsSync(path.join(ROOT, 'assets', 'images', 'og-preview.png')), 'og-preview.png exists at the declared path');
assert(fs.existsSync(path.join(ROOT, 'assets', 'icons', 'favicon.svg')), 'favicon.svg exists at the declared path');

console.log('==================================================');
console.log('TOTAL TESTS: ' + (passed + failed) + ' | PASSED: ' + passed + ' | FAILED: ' + failed);
console.log('==================================================');
if (failed > 0) process.exit(1);
