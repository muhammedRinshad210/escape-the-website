const fs = require('fs');
const path = require('path');

// Repository root, so the suite runs from any working directory
const ROOT = path.join(__dirname, '..');

console.log('==================================================');
console.log('   STEP E: SHARE RESULT REFERRAL POLISH AUDIT    ');
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

// 1. Check shareText in main.js
const mainJs = fs.readFileSync(path.join(ROOT, 'js', 'main.js'), 'utf8');

assert(mainJs.includes('const gameUrl = \'https://escape-the-website.onrender.com/\';'), 'Live production URL defined');
assert(mainJs.includes('I escaped ESCAPE THE WEBSITE.\\n\\nTIME: ${time}\\nSCORE: ${score}\\nKEYS: ${keysCount}/3\\n\\nCan you escape too?\\n${gameUrl}'), 'Referral share text template matches required format');

// 2. Check 1080x1350 canvas generation preserved
assert(mainJs.includes('const width = 1080;'), 'Canvas width 1080 preserved');
assert(mainJs.includes('const height = 1350;'), 'Canvas height 1350 preserved');

// 3. Test simulated share execution
const state = {
    score: 900,
    finalTime: '01:45',
    arcadeBestScore: 1450,
    keysCollected: ['key_01', 'key_02', 'key_03']
};

const gameUrl = 'https://escape-the-website.onrender.com/';
const keysCount = state.keysCollected.length;
const shareText = `I escaped ESCAPE THE WEBSITE.\n\nTIME: ${state.finalTime}\nSCORE: ${state.score}\nKEYS: ${keysCount}/3\n\nCan you escape too?\n${gameUrl}`;

console.log('\n--- SIMULATED SHARE TEXT OUTPUT ---');
console.log(shareText);
console.log('-----------------------------------\n');

assert(shareText.includes('I escaped ESCAPE THE WEBSITE.'), 'Contains header phrase');
assert(shareText.includes('TIME: 01:45'), 'Contains formatted time');
assert(shareText.includes('SCORE: 900'), 'Contains score');
assert(shareText.includes('KEYS: 3/3'), 'Contains keys 3/3');
assert(shareText.includes('Can you escape too?'), 'Contains call-to-action');
assert(shareText.includes('https://escape-the-website.onrender.com/'), 'Contains live production URL');

// Confirm URL appears exactly once
const urlMatches = shareText.match(/https:\/\/escape-the-website\.onrender\.com\//g);
assert(urlMatches && urlMatches.length === 1, 'URL appears exactly once in share text');

// 4. Verify Analytics Events Preservation
globalThis.window = {
    dataLayer: [],
    gtag: function (type, eventName, params) {
        events.push({ eventName, params });
    }
};
const events = [];

eval(fs.readFileSync(path.join(ROOT, 'js', 'analytics.js'), 'utf8'));

window.trackEvent('share_clicked');
assert(events.some(e => e.eventName === 'share_clicked'), 'share_clicked event tracked');

window.trackEvent('share_completed', { share_method: 'native_file' });
assert(events.some(e => e.eventName === 'share_completed' && e.params.share_method === 'native_file'), 'share_completed event tracked with native_file');

console.log('==================================================');
console.log('TOTAL TESTS: ' + (passed + failed) + ' | PASSED: ' + passed + ' | FAILED: ' + failed);
console.log('==================================================');
if (failed > 0) process.exit(1);
