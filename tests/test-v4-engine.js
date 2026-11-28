/**
 * Node regression & unit tests for Escape the Website v4 Engine
 * Covers: inventory pickup/use/consume, stars formula, 3-level hints,
 * wrong-choice variations & progress preservation, save/load & try/catch safety,
 * and GSAP-unavailable guard compatibility.
 */
const fs = require('fs');
const path = require('path');

const { EscapeEngine, STORAGE_KEY_V4, isGsapReady } = require('../js/engine.js');

// Minimal self-contained placeholder room fixture for unit tests
const placeholderRoom = {
  id: 'room1',
  number: 'ROOM 1',
  title: 'The Quiet Room (Test Fixture)',
  mission: 'Find the key and unlock the door.',
  introCaption: 'You are inside a quiet room. Tap around to look.',
  items: {
    brass_key: { id: 'brass_key', name: 'Brass Key', shortLabel: 'Key', iconSvg: '<svg></svg>' }
  },
  wrongChoices: [
    'That does not seem to fit there.',
    'Nothing happens. Try another spot.',
    'Not there — look closer at the door.'
  ],
  hotspots: [
    {
      id: 'box',
      label: 'Wooden Box',
      onInspect(ctx) {
        if (!ctx.getFlag('boxOpened')) {
          ctx.setFlag('boxOpened', true);
          ctx.giveItem('brass_key');
          return { caption: 'You open the box and find a Brass Key!', sound: 'collect' };
        }
        return { caption: 'The small wooden box is empty.' };
      }
    },
    {
      id: 'rug',
      label: 'Woven Rug',
      wrongChoices: ['The rug has no keyhole.', 'Still just an old rug. Try the door.'],
      onInspect() {
        return { caption: 'A dusty woven rug.' };
      }
    },
    {
      id: 'door',
      label: 'Locked Door',
      onInspect() {
        return { caption: 'The door is locked. You need a key.', sound: 'locked' };
      },
      onUseItem(itemId, ctx) {
        if (itemId === 'brass_key') {
          ctx.consumeItem('brass_key');
          return { win: true, consumed: true, caption: 'Click! The brass key turns.' };
        }
        return { wrong: true };
      }
    }
  ],
  getHints(roomState) {
    const hasKey = roomState.inventory.includes('brass_key') || roomState.usedItems.includes('brass_key');
    if (!hasKey) {
      return [
        { text: 'Look closely at the wooden table on the left.' },
        { text: 'Something small is waiting inside the box on the table.' },
        { text: 'Tap the wooden box to take the Brass Key!', targetHotspotId: 'box' }
      ];
    }
    return [
      { text: 'That key must fit somewhere tall on the right.' },
      { text: 'Tap the Brass Key in your bag, then tap the door.' },
      { text: 'Use the Brass Key on the locked door!', targetHotspotId: 'door', targetItemId: 'brass_key' }
    ];
  },
  winSequence: {
    resultHeading: 'Room 1 Escaped',
    diaryPage: { number: 1, title: 'Bedroom Note', body: 'First, I needed light.' },
    nextRoomId: null
  }
};

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

function makeMemoryStorage(throwOnRead = false, throwOnWrite = false) {
  const map = {};
  return {
    store: map,
    getItem(k) {
      if (throwOnRead) throw new Error('Storage read denied');
      return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null;
    },
    setItem(k, v) {
      if (throwOnWrite) throw new Error('Storage quota exceeded');
      map[k] = String(v);
    },
    removeItem(k) {
      delete map[k];
    }
  };
}

// 1. Engine initialization & room registration
const storage1 = makeMemoryStorage();
const engine1 = new EscapeEngine({ storage: storage1, rooms: [placeholderRoom] });
engine1.init();
assert(engine1.getCurrentRoom().id === 'room1', 'Initializes with registered placeholder room');
assert(engine1.state.started === false, 'Fresh state starts unstarted');

// 2. Inventory pickup, duplicate prevention, selection & item consumption
engine1.startGame();
assert(engine1.state.started === true, 'startGame sets started = true');

const boxRes = engine1.inspectHotspot('box');
assert(boxRes.type === 'collect' && boxRes.collectedItems.length === 1, 'Inspecting box collects Brass Key');
assert(engine1.hasItem('brass_key') === true, 'Inventory contains brass_key');

const boxAgain = engine1.inspectHotspot('box');
assert(boxAgain.type === 'inspect' && engine1.getRoomState().inventory.length === 1, 'Re-inspecting box does not duplicate brass_key');

assert(engine1.selectItem('brass_key') === 'brass_key', 'selectItem selects inventory item');
assert(engine1.selectItem('brass_key') === null, 'selectItem toggles off on second tap');

// 3. Wrong-choice system: increments mistakes, varies response, never resets progress
engine1.selectItem('brass_key');
const w1 = engine1.inspectHotspot('rug');
engine1.selectItem('brass_key');
const w2 = engine1.inspectHotspot('rug');
assert(w1.type === 'wrong' && w2.type === 'wrong', 'Using key on rug returns wrong reaction');
assert(w1.caption !== w2.caption, 'Repeated wrong choices produce different reaction text');
assert(engine1.hasItem('brass_key') === true && engine1.getRoomState().flags.boxOpened === true, 'Wrong choice never resets inventory or room flags');
assert(engine1.getRoomState().mistakes === 2, 'Mistake count increments accurately');

// 4. Using item on target wins room & unlocks diary page
engine1.selectItem('brass_key');
const winRes = engine1.inspectHotspot('door');
assert(winRes.type === 'win', 'Using brass_key on door completes room');
assert(engine1.hasItem('brass_key') === false && engine1.hasUsedItem('brass_key') === true, 'Key is consumed into usedItems on use');
assert(engine1.getRoomState().completed === true, 'Room marked completed');
assert(engine1.state.diaryPages.length === 1 && engine1.state.diaryPages[0].number === 1, 'Diary page 1 unlocked on win');
assert(winRes.stars === 2, '0 hints + 2 mistakes earns 2 stars');

// 5. Star rating rules: 3 = 0 hints & <=1 mistake; 2 = <=1 hint; 1 = finished (2+ hints)
assert(engine1.calculateStars(0, 0) === 3, 'Stars: 0 hints, 0 mistakes -> 3 stars');
assert(engine1.calculateStars(0, 1) === 3, 'Stars: 0 hints, 1 mistake -> 3 stars');
assert(engine1.calculateStars(0, 2) === 2, 'Stars: 0 hints, 2 mistakes -> 2 stars');
assert(engine1.calculateStars(1, 0) === 2, 'Stars: 1 hint, 0 mistakes -> 2 stars');
assert(engine1.calculateStars(1, 5) === 2, 'Stars: 1 hint, 5 mistakes -> 2 stars');
assert(engine1.calculateStars(2, 0) === 1, 'Stars: 2 hints, 0 mistakes -> 1 star');
assert(engine1.calculateStars(3, 4) === 1, 'Stars: 3 hints, 4 mistakes -> 1 star');

// 6. 3-level hint progression & target glow on Level 3
const engineHints = new EscapeEngine({ storage: makeMemoryStorage(), rooms: [placeholderRoom] });
engineHints.init();
engineHints.startGame();

const h1 = engineHints.requestHint();
assert(h1.level === 1 && h1.targetHotspotId === null && h1.hintsUsed === 1, 'Hint level 1 gives gentle clue without target glow');

const h2 = engineHints.requestHint();
assert(h2.level === 2 && h2.targetHotspotId === null && h2.hintsUsed === 2, 'Hint level 2 gives clearer clue without target glow');

const h3 = engineHints.requestHint();
assert(h3.level === 3 && h3.targetHotspotId === 'box' && h3.hintsUsed === 3, 'Hint level 3 reveals targetHotspotId for glow');

const h4 = engineHints.requestHint();
assert(h4.level === 3 && h4.hintsUsed === 3, 'Requesting hint past level 3 stays at level 3 cleanly');

// Collecting key switches hints to door context and resets displayed level cleanly
engineHints.inspectHotspot('box');
const hDoor = engineHints.requestHint();
assert(hDoor.level === 1 && hDoor.text.toLowerCase().includes('right'), 'After key pickup, hint adapts to door objective');

// 7. Save / Load & refresh resume + try/catch storage resilience
const sharedStorage = makeMemoryStorage();
const engineSaveA = new EscapeEngine({ storage: sharedStorage, rooms: [placeholderRoom] });
engineSaveA.init();
engineSaveA.startGame();
engineSaveA.inspectHotspot('box');
engineSaveA.requestHint();

assert(Boolean(sharedStorage.getItem(STORAGE_KEY_V4)), 'Saves under new v4 localStorage key');

const engineSaveB = new EscapeEngine({ storage: sharedStorage, rooms: [placeholderRoom] });
engineSaveB.init();
assert(engineSaveB.state.started === true, 'Reload restores started session');
assert(engineSaveB.state.currentRoomId === 'room1', 'Reload resumes current room');
assert(engineSaveB.hasItem('brass_key') === true, 'Reload restores collected inventory');
assert(engineSaveB.getRoomState().hintsUsed === 1, 'Reload restores hint count');

// Corrupted JSON or throwing storage never crashes
const badJsonStorage = makeMemoryStorage();
badJsonStorage.setItem(STORAGE_KEY_V4, '{broken-json');
const engineCorrupt = new EscapeEngine({ storage: badJsonStorage, rooms: [placeholderRoom] });
engineCorrupt.init();
assert(engineCorrupt.state.started === false && engineCorrupt.getCurrentRoom().id === 'room1', 'Corrupted save falls back cleanly without throwing');

const throwingStorage = makeMemoryStorage(true, true);
const engineThrow = new EscapeEngine({ storage: throwingStorage, rooms: [placeholderRoom] });
engineThrow.init();
engineThrow.startGame();
assert(engineThrow.saveState() === false, 'Storage errors are caught and return false safely');

// 8. GSAP fallback & preserved index.html tags check
assert(isGsapReady() === false, 'isGsapReady returns false cleanly when GSAP is absent in Node');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(html.includes('G-F5SSDGO5CT'), 'index.html preserves Google Analytics tag');
assert(html.includes('alS53WyJL5cutf1e5GspnrTOfVawwZ30KAM_B7IjAcA'), 'index.html preserves first Google verification tag');
assert(html.includes('IHLIzwNtl0F5s1oQw2sBVoUtSdA8Ous8xC7bWpfHl-s'), 'index.html preserves second Google verification tag');
assert(html.includes('z78i0p5iw7'), 'index.html preserves Microsoft Clarity snippet');
assert(html.includes('https://escape-the-website.onrender.com/'), 'index.html preserves canonical URL');

// 9. Analytics wrapper safety: GA4 + optional Clarity custom events, never throws
const vm = require('node:vm');
const analyticsSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'analytics.js'), 'utf8');

const gaCalls = [];
const sandboxNoClarity = {
  window: {
    gtag: (...args) => gaCalls.push(args)
  }
};
vm.runInNewContext(analyticsSrc, sandboxNoClarity);
sandboxNoClarity.window.trackEvent('hint_used', { room_number: 2, hint_level: 1, nested: { bad: true } });
assert(gaCalls.length === 1 && gaCalls[0][1] === 'hint_used', 'GA4 receives tracked event without Clarity present');
assert(gaCalls[0][2].room_number === 2 && gaCalls[0][2].hint_level === 1 && gaCalls[0][2].nested === undefined, 'Sanitizes analytics params to primitives only');

const clarityCalls = [];
const sandboxBroken = {
  window: {
    gtag: () => { throw new Error('gtag blocked'); },
    clarity: (...args) => {
      clarityCalls.push(args);
      if (args[1] === 'boom') throw new Error('clarity error');
    }
  }
};
vm.runInNewContext(analyticsSrc, sandboxBroken);
let analyticsThrew = false;
try {
  sandboxBroken.window.trackEvent('room_complete', { room_number: 3 });
  sandboxBroken.window.trackEvent('boom', { room_number: 1 });
} catch (e) {
  analyticsThrew = true;
}
assert(!analyticsThrew, 'Analytics errors in gtag or clarity never break game execution');
assert(clarityCalls.length === 2 && clarityCalls[0][0] === 'event' && clarityCalls[0][1] === 'room_complete', 'Clarity receives custom events only when window.clarity exists');

console.log('==================================================');
console.log('TOTAL TESTS: ' + (passed + failed) + ' | PASSED: ' + passed + ' | FAILED: ' + failed);
console.log('==================================================');
if (failed > 0) process.exit(1);
