/**
 * Node tests for Escape the Website v4 — Room 1 (Bedroom)
 */
const { EscapeEngine } = require('../js/engine.js');
const room1 = require('../js/rooms/room1-bedroom.js');
const room2 = require('../js/rooms/room2-library.js');
const room3 = require('../js/rooms/room3-darkroom.js');
const room4 = require('../js/rooms/room4-workshop.js');
const room5 = require('../js/rooms/room5-door.js');

let passed = 0;
let failed = 0;

function assert(cond, name) {
  if (cond) {
    console.log('[PASS] ' + name);
    passed++;
  } else {
    console.error('[FAIL] ' + name);
    failed++;
  }
}

function makeStorage() {
  const map = {};
  return {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null),
    setItem: (k, v) => { map[k] = String(v); },
    removeItem: (k) => { delete map[k]; }
  };
}

// 1. Randomization across new games
const seenFrozen = new Set();
for (let i = 0; i < 30; i++) {
  const eng = new EscapeEngine({ storage: makeStorage(), rooms: [room1] });
  eng.init();
  seenFrozen.add(eng.getRoomState('room1').flags.frozenIndex);
}
assert(seenFrozen.size >= 2, 'Frozen clock index is randomized across new games');

// 2. Full Room 1 flow: Note -> Clocks -> Wrong Wardrobes -> Torch -> Rug -> Key -> Door
const storage = makeStorage();
const engine = new EscapeEngine({ storage, rooms: [room1] });
engine.init();
engine.startGame();

const flags = engine.getRoomState('room1').flags;
const frozenIdx = flags.frozenIndex;
const catIdx = flags.catIndex;
const clothesIdx = flags.clothesIndex;
assert(new Set([frozenIdx, catIdx, clothesIdx]).size === 3, 'Three distinct wardrobe roles assigned');

// Inspect Note
const noteRes = engine.inspectHotspot('note');
assert(noteRes.caption.includes('Where time stands still'), 'Note displays riddle clue');

// Inspect Clocks
const frozenClockRes = engine.inspectHotspot(`clock_${frozenIdx}`);
const tickClockRes = engine.inspectHotspot(`clock_${catIdx}`);
assert(frozenClockRes.caption.toLowerCase().includes('frozen'), 'Frozen clock inspection reports frozen hands');
assert(tickClockRes.caption.toLowerCase().includes('tick'), 'Ticking clock inspection reports ticking');

// Wrong Wardrobe: Cat (triggers cat reaction & varies text on repeat)
const cat1 = engine.inspectHotspot(`wardrobe_${catIdx}`);
const cat2 = engine.inspectHotspot(`wardrobe_${catIdx}`);
assert(cat1.type === 'wrong' && cat1.reaction === 'cat', 'Cat wardrobe triggers cat reaction');
assert(cat1.caption !== cat2.caption, 'Repeated cat wardrobe visit uses a different variation');

// Wrong Wardrobe: Clothes (first time requires wipe/tap, second time auto-clears)
const cloth1 = engine.inspectHotspot(`wardrobe_${clothesIdx}`);
const cloth2 = engine.inspectHotspot(`wardrobe_${clothesIdx}`);
assert(cloth1.type === 'wrong' && cloth1.reaction === 'clothes_first', 'Clothes wardrobe first hit uses clothes_first');
assert(cloth2.type === 'wrong' && cloth2.reaction === 'clothes_repeat', 'Clothes wardrobe repeat hit uses clothes_repeat');

// Correct Wardrobe: gets Torch
const torchRes = engine.inspectHotspot(`wardrobe_${frozenIdx}`);
assert(torchRes.type === 'collect' && engine.hasItem('torch'), 'Frozen wardrobe gives Torch');

// Use Torch on rug -> reveals glint
engine.selectItem('torch');
const litRes = engine.inspectHotspot('rug');
assert(litRes.type === 'item_used' && engine.getRoomState('room1').flags.roomLit === true, 'Using torch on rug illuminates room');
assert(!engine.hasItem('torch') && engine.hasUsedItem('torch'), 'Torch is consumed after lighting room');

// Tap/swipe rug -> pulls rug back -> tap again -> picks up Brass Key
const pullRes = engine.inspectHotspot('rug');
assert(pullRes.type === 'inspect' && engine.getRoomState('room1').flags.rugMoved === true, 'Tapping/swiping lit rug pulls it back');

const keyRes = engine.inspectHotspot('rug');
assert(keyRes.type === 'collect' && engine.hasItem('brass_key'), 'Next tap picks up Brass Key');

// Save/Load preserves randomized frozenIndex and key
const reloaded = new EscapeEngine({ storage, rooms: [room1] });
reloaded.init();
assert(reloaded.getRoomState('room1').flags.frozenIndex === frozenIdx, 'Reload preserves randomized frozenIndex');
assert(reloaded.hasItem('brass_key'), 'Reload preserves collected Brass Key');

// Use Brass Key on door -> wins Room 1
reloaded.selectItem('brass_key');
const winRes = reloaded.inspectHotspot('door');
assert(winRes.type === 'win' && winRes.diaryPage && winRes.diaryPage.number === 1, 'Using key on door wins Room 1 and unlocks Diary Page 1');
assert(room1.winSequence.resultHeading === 'Room 1 Escaped', 'Win heading matches "Room 1 Escaped"');

// Restart room re-initializes cleanly
reloaded.restartRoom('room1');
assert(reloaded.getRoomState('room1').completed === false && typeof reloaded.getRoomState('room1').flags.frozenIndex === 'number', 'Restarting Room 1 clears progress and re-initializes clocks');

// --- Room 2: Library ---
const engine2 = new EscapeEngine({ storage: makeStorage(), rooms: [room1, room2] });
engine2.init();
engine2.startGame();

// Room 1 -> Room 2 transition
const r1F = engine2.getRoomState('room1').flags;
engine2.inspectHotspot(`wardrobe_${r1F.frozenIndex}`);
engine2.selectItem('torch');
engine2.inspectHotspot('rug');
engine2.inspectHotspot('rug');
engine2.inspectHotspot('rug');
engine2.selectItem('brass_key');
engine2.inspectHotspot('door');
const nav = engine2.goToNextRoom();
assert(nav.moved === true && nav.roomId === 'room2', 'Room 1 Next Room advances to Room 2 (Library)');

const r2Flags = engine2.getRoomState('room2').flags;
assert(Array.isArray(r2Flags.bookOrder) && r2Flags.bookOrder.length === 4, 'Room 2 initializes 4 books');
assert(r2Flags.bookOrder.join(',') !== 'seed,sapling,tree,fruit', 'Room 2 initial book order is shuffled (not already solved)');

const carvingRes = engine2.inspectHotspot('carving');
assert(carvingRes.caption.includes('Put life in its order'), 'Wall carving displays clue');

// Wrong lever pulls alternate: books_tumble -> owl_shhh
const wrong1 = engine2.inspectHotspot('lever');
const wrong2 = engine2.inspectHotspot('lever');
const wrong3 = engine2.inspectHotspot('lever');
assert(wrong1.type === 'wrong' && wrong1.reaction === 'books_tumble', 'First wrong lever pull triggers books_tumble');
assert(wrong2.type === 'wrong' && wrong2.reaction === 'owl_shhh', 'Second wrong lever pull alternates to owl_shhh');
assert(wrong3.type === 'wrong' && wrong3.reaction === 'books_tumble', 'Third wrong lever pull alternates back to books_tumble');

// Swap books into seed, sapling, tree, fruit (should NOT auto-win until lever pulled)
const target = ['seed', 'sapling', 'tree', 'fruit'];
for (let i = 0; i < 4; i++) {
  const cur = engine2.getRoomState('room2').flags.bookOrder;
  if (cur[i] !== target[i]) {
    const j = cur.indexOf(target[i]);
    engine2.inspectHotspot(`book_${i}`);
    const swapRes = engine2.inspectHotspot(`book_${j}`);
    assert(swapRes.type !== 'win', `Swapping slot ${i} and ${j} does not auto-win before lever`);
  }
}
assert(engine2.getRoomState('room2').flags.bookOrder.join(',') === 'seed,sapling,tree,fruit', 'Books swapped into exact target order');
assert(engine2.getRoomState('room2').completed === false, 'Room 2 remains incomplete until lever is pulled');

// Pull lever -> wins Room 2 & unlocks Diary Page 2
const r2Win = engine2.inspectHotspot('lever');
assert(r2Win.type === 'win' && r2Win.diaryPage && r2Win.diaryPage.number === 2, 'Pulling lever with correct order wins Room 2 and unlocks Diary Page 2');
assert(room2.winSequence.resultHeading === 'Room 2 Escaped', 'Room 2 win heading matches "Room 2 Escaped"');

// --- Room 3: Dark Room ---
const engine3 = new EscapeEngine({ storage: makeStorage(), rooms: [room1, room2, room3] });
engine3.init();
engine3.startGame();
engine3.state.currentRoomId = 'room3';
engine3.ensureRoomInitialized('room3');

const paintRes = engine3.inspectHotspot('painting');
assert(paintRes.caption.includes('Blue Circle') && paintRes.caption.includes('Red Triangle') && paintRes.caption.includes('Green Square'), 'Painting describes color + shape stripes');
assert(engine3.inspectHotspot('clue_blue').caption.includes('7'), 'Blue circle clue reveals 7');
assert(engine3.inspectHotspot('clue_red').caption.includes('4'), 'Red triangle clue reveals 4');
assert(engine3.inspectHotspot('clue_green').caption.includes('1'), 'Green square clue reveals 1');

const lockTap = engine3.inspectHotspot('padlock');
assert(lockTap.openCodeLock === true, 'Tapping padlock opens code lock');

const r3Wrong1 = engine3.submitRoomCode('123');
const r3Wrong2 = engine3.submitRoomCode('999');
const r3Wrong3 = engine3.submitRoomCode('000');
assert(r3Wrong1.type === 'wrong' && r3Wrong1.reaction === 'ghost_broom', 'First wrong code triggers ghost_broom');
assert(r3Wrong2.type === 'wrong' && r3Wrong2.reaction === 'lock_tongue', 'Second wrong code alternates to lock_tongue');
assert(r3Wrong3.type === 'wrong' && r3Wrong3.reaction === 'ghost_broom', 'Third wrong code alternates back to ghost_broom');

const r3Win = engine3.submitRoomCode('741');
assert(r3Win.type === 'win' && r3Win.diaryPage && r3Win.diaryPage.number === 3, 'Code 741 wins Room 3 and unlocks Diary Page 3');
assert(room3.winSequence.resultHeading === 'Room 3 Escaped', 'Room 3 win heading matches "Room 3 Escaped"');

// --- Room 4: Workshop ---
const engine4 = new EscapeEngine({ storage: makeStorage(), rooms: [room1, room2, room3, room4] });
engine4.init();
engine4.startGame();
engine4.state.currentRoomId = 'room4';
engine4.ensureRoomInitialized('room4');

engine4.inspectHotspot('item_stick');
engine4.inspectHotspot('item_string');
engine4.inspectHotspot('item_magnet');
engine4.inspectHotspot('item_duck');
engine4.inspectHotspot('item_spring');
engine4.inspectHotspot('item_balloon');
assert(engine4.getRoomState('room4').inventory.length === 6, 'Collects 3 real tools + 3 decoys');

// Decoy gags
const duckGag = engine4.combineItems('duck', 'stick');
const springGag = engine4.combineItems('spring', 'string');
const balloonGag = engine4.combineItems('balloon', 'magnet');
assert(duckGag.type === 'wrong' && duckGag.reaction === 'duck_squeak', 'Duck combo triggers duck_squeak');
assert(springGag.type === 'wrong' && springGag.reaction === 'spring_boing', 'Spring combo triggers spring_boing');
assert(balloonGag.type === 'wrong' && balloonGag.reaction === 'balloon_soot', 'Balloon combo triggers balloon_soot');

// Craft stick + string -> stick_string -> + magnet -> fishing_rod
const craft1 = engine4.combineItems('stick', 'string');
assert(craft1.type === 'craft' && engine4.hasItem('stick_string') && !engine4.hasItem('stick'), 'Combines stick + string into stick_string');

const craft2 = engine4.combineItems('stick_string', 'magnet');
assert(craft2.type === 'craft' && engine4.hasItem('fishing_rod') && !engine4.hasItem('magnet'), 'Combines stick_string + magnet into fishing_rod');

// Use rod on drain -> hatch_key
engine4.selectItem('fishing_rod');
const fished = engine4.inspectHotspot('drain');
assert(fished.type === 'item_used' && engine4.hasItem('hatch_key'), 'Fishing rod retrieves Brass Key from drain');

// Use key on hatch -> win Room 4 & Diary Page 4
engine4.selectItem('hatch_key');
const r4Win = engine4.inspectHotspot('hatch');
assert(r4Win.type === 'win' && r4Win.diaryPage && r4Win.diaryPage.number === 4, 'Key on hatch wins Room 4 and unlocks Diary Page 4');
assert(room4.winSequence.resultHeading === 'Room 4 Escaped', 'Room 4 win heading matches "Room 4 Escaped"');

// --- Room 5: Final Door + Full 5-Room Run ---
const fullEngine = new EscapeEngine({ storage: makeStorage(), rooms: [room1, room2, room3, room4, room5] });
fullEngine.init();
fullEngine.startGame();

// Room 1 -> 2 -> 3 -> 4 -> 5
const rf1 = fullEngine.getRoomState('room1').flags;
fullEngine.inspectHotspot(`wardrobe_${rf1.frozenIndex}`);
fullEngine.selectItem('torch');
fullEngine.inspectHotspot('rug');
fullEngine.inspectHotspot('rug');
fullEngine.inspectHotspot('rug');
fullEngine.selectItem('brass_key');
fullEngine.inspectHotspot('door');
assert(fullEngine.goToNextRoom().roomId === 'room2', 'Full run: advances Room 1 -> Room 2');

const targetR2 = ['seed', 'sapling', 'tree', 'fruit'];
for (let i = 0; i < 4; i++) {
  const cur = fullEngine.getRoomState('room2').flags.bookOrder;
  if (cur[i] !== targetR2[i]) {
    const j = cur.indexOf(targetR2[i]);
    fullEngine.inspectHotspot(`book_${i}`);
    fullEngine.inspectHotspot(`book_${j}`);
  }
}
fullEngine.inspectHotspot('lever');
assert(fullEngine.goToNextRoom().roomId === 'room3', 'Full run: advances Room 2 -> Room 3');

fullEngine.submitRoomCode('741');
assert(fullEngine.goToNextRoom().roomId === 'room4', 'Full run: advances Room 3 -> Room 4');

fullEngine.inspectHotspot('item_stick');
fullEngine.inspectHotspot('item_string');
fullEngine.inspectHotspot('item_magnet');
fullEngine.combineItems('stick', 'string');
fullEngine.combineItems('stick_string', 'magnet');
fullEngine.selectItem('fishing_rod');
fullEngine.inspectHotspot('drain');
fullEngine.selectItem('hatch_key');
fullEngine.inspectHotspot('hatch');
assert(fullEngine.goToNextRoom().roomId === 'room5', 'Full run: advances Room 4 -> Room 5');

// Verify diary pages 1-4 match riddle lines
assert(fullEngine.state.diaryPages[0].body === 'First, I needed light.', 'Diary Page 1 matches riddle line 1');
assert(fullEngine.state.diaryPages[1].body === 'Then I pulled what I could not reach.', 'Diary Page 2 matches riddle line 2');
assert(fullEngine.state.diaryPages[2].body === 'After that, I made time stand still.', 'Diary Page 3 matches riddle line 3');
assert(fullEngine.state.diaryPages[3].body === 'At last, I tasted freedom.', 'Diary Page 4 matches riddle line 4');

// Diary book opens reader
assert(fullEngine.inspectHotspot('diary_book').openDiaryReader === true, 'Diary book opens diary reader in Room 5');

// Alternating wrong reactions
['clock', 'fruit', 'torch', 'magnet'].forEach((s) => fullEngine.inspectHotspot(`sym_${s}`));
const r5Wrong1 = fullEngine.inspectHotspot('sym_clock');
// Need 4 presses for reaction 1:
const pressSeq = (arr) => arr.map((s) => fullEngine.inspectHotspot(`sym_${s}`)).pop();
fullEngine.restartRoom('room5');
const wBrick = pressSeq(['clock', 'fruit', 'torch', 'magnet']);
const wFake = pressSeq(['fruit', 'clock', 'torch', 'magnet']);
assert(wBrick.type === 'wrong' && wBrick.reaction === 'brick_wall', 'First wrong 4-symbol sequence triggers brick_wall');
assert(wFake.type === 'wrong' && wFake.reaction === 'fake_escape', 'Second wrong 4-symbol sequence alternates to fake_escape');

// Correct sequence: torch, magnet, clock, fruit
const r5Win = pressSeq(['torch', 'magnet', 'clock', 'fruit']);
assert(r5Win.type === 'win' && r5Win.isFinale === true, 'torch -> magnet -> clock -> fruit triggers Finale');
assert(r5Win.stats && r5Win.stats.totalStars === 14 && r5Win.stats.maxStars === 15, 'Total stars calculated across all 5 rooms (14/15 with 2 mistakes in R5)');

// --- Bugfix Regression Tests: Hotspot Non-Overlap (Room 2 at 340px width) & Non-Spoiler Level 2 Hints ---
function rectsOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
function hsPixelBox(hs, frameW, frameH) {
  const w = Math.max(44, (hs.w / 100) * frameW);
  const h = Math.max(44, (hs.h / 100) * frameH);
  const cx = (hs.x / 100) * frameW;
  const cy = (hs.y / 100) * frameH;
  return { id: hs.id, left: cx - w / 2, right: cx + w / 2, top: cy - h / 2, bottom: cy + h / 2, width: w, height: h };
}

const r2Boxes360 = room2.hotspots.map((hs) => hsPixelBox(hs, 340, 378));
for (let i = 0; i < r2Boxes360.length; i++) {
  assert(r2Boxes360[i].width >= 44 && r2Boxes360[i].height >= 44, `Room 2 hotspot ${r2Boxes360[i].id} >= 44px at 360x640`);
  for (let j = i + 1; j < r2Boxes360.length; j++) {
    assert(!rectsOverlap(r2Boxes360[i], r2Boxes360[j]), `Room 2 hotspots ${r2Boxes360[i].id} & ${r2Boxes360[j].id} do not overlap at 360x640`);
  }
}

// Room 1 Level 2 hints do not reveal left/middle/right answer or target glow; only Level 3 highlights target
const hEng1 = new EscapeEngine({ storage: makeStorage(), rooms: [room1] });
hEng1.init();
hEng1.startGame();
const r1h1 = hEng1.requestHint();
const r1h2 = hEng1.requestHint();
const r1h3 = hEng1.requestHint();
assert(!/\b(left|middle|right)\b/i.test(r1h2.text) && !r1h2.targetHotspotId, 'Room 1 Hint Level 2 gives clearer clue without naming wardrobe side or highlighting spot');
assert(/\b(left|middle|right)\b/i.test(r1h3.text) && Boolean(r1h3.targetHotspotId), 'Room 1 Hint Level 3 reveals answer and targetHotspotId');

// Room 2 Level 2 hints do not print seed/sapling/tree/fruit order; only Level 3 reveals answer & target glow
const hEng2 = new EscapeEngine({ storage: makeStorage(), rooms: [room2] });
hEng2.init();
hEng2.startGame();
hEng2.requestHint();
const r2h2 = hEng2.requestHint();
const r2h3 = hEng2.requestHint();
assert(!r2h2.text.toLowerCase().includes('seed') && !r2h2.text.toLowerCase().includes('fruit') && !r2h2.targetHotspotId, 'Room 2 Hint Level 2 gives growth clue without listing answer or highlighting');
assert(r2h3.text.toLowerCase().includes('seed') && Boolean(r2h3.targetHotspotId), 'Room 2 Hint Level 3 reveals order and targetHotspotId');

console.log('==================================================');
console.log('TOTAL TESTS: ' + (passed + failed) + ' | PASSED: ' + passed + ' | FAILED: ' + failed);
console.log('==================================================');
if (failed > 0) process.exit(1);
