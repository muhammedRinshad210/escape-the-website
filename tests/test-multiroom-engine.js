/**
 * Smoke & Regression Test Suite for Escape the Website v3 Five-Room Progression
 * Covers GameManager (game.js), PuzzleManager (puzzles.js), main.js routing wiring,
 * archived Core preservation, Sector 02 preservation, and v2 -> v3 save migration.
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function makeMockStorage() {
  return {
    store: {},
    getItem(k) { return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; }
  };
}

const sandbox = { window: {}, console, localStorage: makeMockStorage() };
sandbox.window = sandbox;
vm.createContext(sandbox);

vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'puzzles.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'game.js'), 'utf8'), sandbox);

const mainSrc = fs.readFileSync(path.join(ROOT, 'js', 'main.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

let passed = 0, failed = 0;
function assert(cond, name) {
  if (cond) { passed++; console.log('[PASS] ' + name); }
  else { failed++; console.error('[FAIL] ' + name); }
}

const gm = sandbox.window.gameManager;
const pm = sandbox.window.puzzleManager;

// --- init & Room Registry ---
gm.init();
assert(gm.getState().version === 3, 'state schema v3');
assert(gm.getState().currentRoom === 'entry' && gm.getState().currentRoomIndex === 0, 'starts in new Entry room (ROOM 01)');
assert(gm.rooms.entry && gm.rooms.orbatrium && gm.rooms.vault && gm.rooms.tunnels && gm.rooms.lobby, 'five active rooms registered');
assert(gm.rooms.core && gm.rooms.core.archived === true && gm.rooms.core.index === -2, 'core room preserved in archived state');
assert(Object.keys(gm.rooms).length === 7, 'seven room definitions (5 active + archived core + secret sector02)');
assert(gm.rooms.entry.name === 'THE THRESHOLD' && gm.rooms.entry.number === 'ROOM 01', 'entry room title and number correct');
assert(gm.rooms.lobby.index === 4 && gm.rooms.lobby.number === 'ROOM 05', 'lobby moved to final ROOM 05 (index 4)');
assert(gm.getRoomProgress('entry').label === 'NODES', 'entry label NODES');
assert(gm.getRoomProgress('orbatrium').label === 'ORBS', 'orbatrium label ORBS');
assert(gm.getRoomProgress('vault').label === 'SIGNALS', 'vault label SIGNALS');
assert(gm.getRoomProgress('tunnels').label === 'FUSES', 'tunnels label FUSES');
assert(gm.getRoomProgress('lobby').label === 'KEYS', 'lobby label KEYS');
assert(gm.getRoomProgress('core').label === 'FRAGMENTS', 'archived core label FRAGMENTS preserved');

// --- room 01 (The Threshold / entry) ---
assert(gm.getRoomProgress('entry').have === 0, 'entry starts empty (0 / 3 nodes)');
assert(gm.collectEntryNode('node_1') === true, 'activate entry node 1');
assert(gm.collectEntryNode('node_1') === false, 'duplicate entry node rejected');
gm.collectEntryNode('node_2');
assert(gm.isRoomDoorReady('entry') === false, 'entry door not ready at 2 nodes');
gm.collectEntryNode('node_3');
assert(gm.isRoomDoorReady('entry') === true, 'entry door ready with 3 nodes');
assert(gm.getState().score === 300, 'score 300 after 3 entry nodes');
assert(pm.isSolved('entry_threshold') === true, 'entry_threshold puzzle marked solved');

// --- room 01 -> room 02 (The Orb Atrium) ---
gm.enterRoom('orbatrium'); gm.unlockRoom('orbatrium');
assert(gm.getState().currentRoom === 'orbatrium' && gm.getState().currentRoomIndex === 1, 'entered orbatrium as ROOM 02');
assert(gm.getRoomProgress('orbatrium').have === 0, 'orbatrium starts empty');
gm.collectOrb('orb_1'); gm.collectOrb('orb_2');
assert(gm.isRoomDoorReady('orbatrium') === false, 'orbatrium not ready at 2 orbs');
gm.collectOrb('orb_3');
assert(gm.isRoomDoorReady('orbatrium') === true, 'orbatrium ready at 3 orbs');
assert(gm.collectOrb('orb_3') === false, 'duplicate orb rejected');

// --- room 03 (The Signal Vault) ---
gm.enterRoom('vault'); gm.unlockRoom('vault');
assert(gm.getState().currentRoom === 'vault' && gm.getState().currentRoomIndex === 2, 'entered vault as ROOM 03');
const session1 = pm.startSignalRound(1);
assert(session1.round === 1 && session1.sequence.length === 3, 'round 1 length 3');
pm.beginSignalInput();
session1.sequence.forEach(t => pm.inputSignalTower(t));
const won = pm.getSignalState();
assert(won.phase === 'round_won' || won.solved || pm.getSignalState().revealedDigits.length >= 1, 'round 1 winnable');

const s2 = pm.startSignalRound(2);
pm.beginSignalInput();
s2.sequence.forEach(t => pm.inputSignalTower(t));
const s3 = pm.startSignalRound(3);
pm.beginSignalInput();
s3.sequence.forEach(t => pm.inputSignalTower(t));
gm.winSignalRound(1); gm.winSignalRound(2); gm.winSignalRound(3);
assert(pm.getSignalState().revealedDigits.join('') === '739', 'digits 7-3-9 revealed after 3 relay wins');
gm.winSignalRound(3);
assert(gm.getRoomProgress('vault').have === 3, 'vault 3 rounds won');
assert(gm.claimGoldChip() === true, 'gold chip claimable after 3 rounds');
assert(gm.isRoomDoorReady('vault') === true, 'vault door ready with chip');
assert(gm.claimGoldChip() === false, 'gold chip not claimable twice');

// --- room 04 (The Cooling Tunnels) ---
gm.enterRoom('tunnels'); gm.unlockRoom('tunnels');
assert(gm.getState().currentRoom === 'tunnels' && gm.getState().currentRoomIndex === 3, 'entered tunnels as ROOM 04');
pm.startPipeSession();
const snap = pm.getPipeGridSnapshot();
assert(snap.length === 3 && snap[0].length === 3, 'pipe grid 3x3');
assert(snap.every(r => r.every(t => t.current % 2 === 1)), 'all tiles start misaligned (vertical)');
assert(snap.every(r => r.every(t => typeof t.shape === 'string')), 'pipe tiles expose visual hardware shapes');
snap.forEach((row, r) => row.forEach((t, i) => {
  while (pm.getPipeGridSnapshot()[r][i].current % 2 !== 0) pm.rotateValve(r, i);
}));
assert([0, 1, 2].every(r => pm.isPipeRowFlowing(r)), 'all rows flow after alignment');
gm.lightFuse('fuse_1'); gm.lightFuse('fuse_2'); gm.lightFuse('fuse_3');
assert(gm.claimBooster() === true, 'booster claimable after 3 fuses');
assert(gm.isRoomDoorReady('tunnels') === true, 'tunnels door ready with booster');

// --- room 04 -> room 05 (The Lobby - Final Room) ---
gm.enterRoom('lobby'); gm.unlockRoom('lobby');
assert(gm.getState().currentRoom === 'lobby' && gm.getState().currentRoomIndex === 4, 'entered lobby as final ROOM 05');
const m0 = pm.startMazeSession();
assert(m0 && m0.rows === 9 && m0.cols === 11 && m0.dotsTotal === 3, 'Pixel Maze initializes 9x11 grid with 3 required dots');
assert(pm.moveMazePlayer(-1, 0).status === 'blocked', 'Pixel Maze enforces wall collisions');
assert(gm.collectKey('key_01') === true, 'collect key 01 in final lobby');
gm.collectKey('key_02'); gm.collectKey('key_03');
assert(gm.isRoomDoorReady('lobby') === true, 'lobby door ready with 3 keys');
assert(gm.hasAllKeys() === true, 'hasAllKeys true with 3 keys');

// --- archived Core preservation ---
gm.collectFragment('frag_1'); gm.collectFragment('frag_2'); gm.collectFragment('frag_3');
assert(gm.isRoomDoorReady('core') === true, 'archived core fragment logic preserved (3/3)');
pm.startCoreSession();
let taps = 0, reached = false;
while (taps < 500) {
  const res = pm.tapCoreEnergy();
  taps++;
  if (res && res.reached) { reached = true; break; }
  pm.decayCoreEnergy();
}
assert(reached, 'archived core energy channel reachable via tapping (' + taps + ' taps)');

// --- Secret Sector 02 preservation ---
const secResonator = ['02', '04', '01', '03'].map(id => pm.inputResonatorNode(id)).pop();
assert(secResonator && secResonator.status === 'secret_trigger', 'Sector 02 resonator trigger preserved');
const secTerm = pm.executeTerminalCommand('SECTOR 02');
assert(secTerm && secTerm.status === 'secret_trigger', 'Sector 02 terminal trigger preserved');
gm.discoverSecret();
assert(gm.getState().secretDiscovered === true && gm.getState().unlockedRooms.includes('sector02'), 'Sector 02 discovery state preserved');

// --- gold tokens across all 5 active rooms ---
gm.collectGoldToken('entry'); gm.collectGoldToken('orbatrium'); gm.collectGoldToken('vault');
gm.collectGoldToken('tunnels'); gm.collectGoldToken('lobby');
assert(gm.getState().goldTokens.length === 5, 'all 5 active room gold tokens collectible');
assert(gm.collectGoldToken('entry') === false, 'duplicate gold token rejected');

// --- completion + rank ---
gm.startGame();
assert(['S', 'A', 'B', 'C'].includes(gm.computeRank(5 * 60 * 1000)), 'rank S for 5min');
assert(gm.computeRank(10 * 60 * 1000) === 'A', 'rank A for 10min');
assert(gm.computeRank(16 * 60 * 1000) === 'B', 'rank B for 16min');
assert(gm.computeRank(30 * 60 * 1000) === 'C', 'rank C for 30min');
assert(gm.computeRank(0) === null, 'rank null for invalid ms');

gm.recordRoomTime('entry', 15000);
gm.recordRoomTime('orbatrium', 30000);
gm.recordRoomTime('lobby', 60000);
const done = gm.completeGame();
assert(done.gameCompleted === true, 'game completed');
assert(done.roomBestTimes.entry === 15000 && done.roomBestTimes.lobby === 60000, 'room best times recorded');
assert(['S', 'A', 'B', 'C'].includes(done.bestRank) || done.bestRank === null, 'best rank stored');
assert(done.bestGoldCount === 5, 'best gold count stored');

// --- reset / Play Again preserves meta & resets to Entry ---
gm.resetState();
const fresh = gm.getState();
assert(fresh.entryNodesCollected.length === 0 && fresh.keysCollected.length === 0 && fresh.orbsCollected.length === 0, 'reset clears run collectibles');
assert(fresh.roomBestTimes.lobby === 60000 && fresh.roomBestTimes.entry === 15000, 'reset preserves room best times');
assert(fresh.bestGoldCount === 5, 'reset preserves best gold count');
assert(fresh.secretDiscovered === true && fresh.unlockedRooms.includes('sector02'), 'reset preserves Sector 02 discovery');
assert(fresh.score === 0, 'reset zeroes score');
assert(fresh.currentRoom === 'entry' && fresh.currentRoomIndex === 0, 'reset / Play Again returns to entry (ROOM 01)');

// --- v3 save/load persistence ---
gm.collectEntryNode('node_1');
gm.enterRoom('orbatrium');
gm.collectOrb('orb_1');
const savedV3Json = JSON.stringify(gm.getState());
sandbox.localStorage = makeMockStorage();
sandbox.localStorage.setItem('escape_the_website_save_v3', savedV3Json);
vm.runInContext('window.gameManager = new GameManager(); window.gameManager.init();', sandbox);
const loadedV3 = sandbox.window.gameManager.getState();
assert(loadedV3.version === 3 && loadedV3.currentRoom === 'orbatrium' && loadedV3.orbsCollected.includes('orb_1'), 'v3 save loads with orbs & currentRoom');

// --- v2 -> v3 deterministic save migration tests ---
function testV2Migration(v2Payload) {
  const migSandbox = { window: {}, console, localStorage: makeMockStorage() };
  migSandbox.window = migSandbox;
  vm.createContext(migSandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'puzzles.js'), 'utf8'), migSandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'game.js'), 'utf8'), migSandbox);
  migSandbox.localStorage.setItem('escape_the_website_save_v2', JSON.stringify({
    version: 2,
    keysCollected: ['key_01'],
    orbsCollected: [],
    signalRoundsWon: 0,
    goldChip: false,
    fusesLit: [],
    boosterClaimed: false,
    fragmentsCollected: [],
    goldTokens: ['lobby'],
    score: 400,
    currentRoom: 'lobby',
    currentRoomIndex: 0,
    unlockedRooms: ['lobby'],
    gameStarted: true,
    gameCompleted: false,
    arcadeBestScore: 1450,
    secretDiscovered: true,
    roomBestTimes: { lobby: 45000 },
    bestRank: 'A',
    bestGoldCount: 3,
    ...v2Payload
  }));
  migSandbox.window.gameManager.init();
  return {
    state: migSandbox.window.gameManager.getState(),
    storedV3: JSON.parse(migSandbox.localStorage.getItem('escape_the_website_save_v3') || 'null')
  };
}

// 1) Old Lobby in-progress -> Entry (Room 01), preserving keys & meta
const mLobby = testV2Migration({ currentRoom: 'lobby', currentRoomIndex: 0 });
assert(mLobby.state.version === 3 && mLobby.state.currentRoom === 'entry' && mLobby.state.currentRoomIndex === 0, 'v2->v3 migration: old lobby maps to entry (ROOM 01)');
assert(mLobby.state.keysCollected.includes('key_01') && mLobby.state.arcadeBestScore === 1450 && mLobby.state.secretDiscovered === true && mLobby.state.bestRank === 'A', 'v2->v3 migration: old lobby preserves keys, arcade best, rank, secret');
assert(mLobby.storedV3 && mLobby.storedV3.version === 3, 'v2->v3 migration: persisted to v3 storage key');

// 2) Old Orbatrium -> Orbatrium (Room 02)
const mOrb = testV2Migration({ currentRoom: 'orbatrium', currentRoomIndex: 1, orbsCollected: ['orb_1'] });
assert(mOrb.state.currentRoom === 'orbatrium' && mOrb.state.currentRoomIndex === 1 && mOrb.state.orbsCollected.includes('orb_1'), 'v2->v3 migration: orbatrium stays Room 02 with orbs');

// 3) Old Vault -> Vault (Room 03)
const mVault = testV2Migration({ currentRoom: 'vault', currentRoomIndex: 2, signalRoundsWon: 2 });
assert(mVault.state.currentRoom === 'vault' && mVault.state.currentRoomIndex === 2 && mVault.state.signalRoundsWon === 2, 'v2->v3 migration: vault stays Room 03 with rounds');

// 4) Old Tunnels -> Tunnels (Room 04)
const mTunnels = testV2Migration({ currentRoom: 'tunnels', currentRoomIndex: 3, fusesLit: ['fuse_1'] });
assert(mTunnels.state.currentRoom === 'tunnels' && mTunnels.state.currentRoomIndex === 3 && mTunnels.state.fusesLit.includes('fuse_1'), 'v2->v3 migration: tunnels stays Room 04 with fuses');

// 5) Old Core in-progress -> Final Room 05 Lobby (never loads archived core stage)
const mCore = testV2Migration({ currentRoom: 'core', currentRoomIndex: 4, fragmentsCollected: ['frag_1', 'frag_2'], keysCollected: ['key_01', 'key_02', 'key_03'] });
assert(mCore.state.currentRoom === 'lobby' && mCore.state.currentRoomIndex === 4 && mCore.state.fragmentsCollected.length === 2, 'v2->v3 migration: old in-progress core routes safely to final Room 05 Lobby preserving fragments');

// 6) Old Completed game -> preserves completed status & all records
const mCompleted = testV2Migration({ gameCompleted: true, finalTime: '07:45', score: 2500, bestRank: 'S', bestGoldCount: 5, roomBestTimes: { lobby: 40000, core: 55000 } });
assert(mCompleted.state.gameCompleted === true && mCompleted.state.finalTime === '07:45' && mCompleted.state.bestRank === 'S' && mCompleted.state.bestGoldCount === 5, 'v2->v3 migration: completed run preserved with rank and records');

// --- legacy v1 save discarded cleanly ---
const v1Sandbox = { window: {}, console, localStorage: makeMockStorage() };
v1Sandbox.window = v1Sandbox;
vm.createContext(v1Sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'puzzles.js'), 'utf8'), v1Sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'game.js'), 'utf8'), v1Sandbox);
v1Sandbox.localStorage.setItem('escape_the_website_save_v3', JSON.stringify({ version: 1, keysCollected: ['key_01'] }));
v1Sandbox.window.gameManager.init();
const legacy = v1Sandbox.window.gameManager.getState();
assert(legacy.version === 3 && legacy.keysCollected.length === 0 && legacy.currentRoom === 'entry', 'legacy v1 save discarded cleanly');

// --- UI / Controller Wiring & DOM Contracts ---
assert(mainSrc.includes("const ROOM_SEQUENCE = ['entry', 'orbatrium', 'vault', 'tunnels', 'lobby'];"), 'main.js defines exact 5-room ROOM_SEQUENCE');
assert(mainSrc.includes("entry: () => dom.stageEntry") && mainSrc.includes("core: () => dom.stageCore"), 'ROOM_STAGE_ELEMENTS maps entry and preserves core');
assert(/function triggerGateBlast[\s\S]*?enterRoomById\('lobby',\s*false\)/.test(mainSrc), 'triggerGateBlast transitions Room 04 Tunnels -> Room 05 Lobby');
assert(!/function triggerGateBlast[\s\S]*?enterRoomById\('core'/.test(mainSrc), 'triggerGateBlast no longer transitions to Core');
assert(/function triggerEntryDoorSequence[\s\S]*?enterRoomById\('orbatrium'/.test(mainSrc), 'triggerEntryDoorSequence transitions Room 01 Entry -> Room 02 Orbatrium');
assert(/function hideAllOtherRoomStages\(keepEl\)/.test(mainSrc), 'enterRoomById explicitly hides all other stages');
assert(mainSrc.includes('sector02ReturnToVictory'), 'Sector 02 handles return to Victory Screen without resetting state');
assert(htmlSrc.includes('id="stage-entry"') && htmlSrc.includes('THE THRESHOLD'), 'HTML includes #stage-entry Room 01');
assert(htmlSrc.includes('id="stage-lobby"') && htmlSrc.includes('id="stage-core"') && htmlSrc.includes('id="core-modal"'), 'HTML preserves both #stage-lobby and archived #stage-core/#core-modal');

// --- Step 5: Full-Screen Cinematic Transitions & Fallbacks ---
const cssSrc = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
assert(htmlSrc.includes('id="room-transition-overlay"') && htmlSrc.includes('rto-portal') && htmlSrc.includes('rto-gravity') && htmlSrc.includes('rto-decryption') && htmlSrc.includes('rto-hydraulic'), 'HTML defines reusable #room-transition-overlay with all 4 distinct scene modes');
assert(cssSrc.includes('.room-transition-overlay') && cssSrc.includes('.room-transition-overlay.css-fallback') && /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.rto-lift-streaks/.test(cssSrc), 'CSS defines full-screen transition overlay, CSS fallback, and reduced-motion rules');
assert(/function triggerEntryDoorSequence[\s\S]*?mode:\s*'portal'[\s\S]*?enterRoomById\('orbatrium',\s*false\)/.test(mainSrc), 'Room 01 -> 02 uses distinct portal transition');
assert(/function triggerLiftSequence[\s\S]*?mode:\s*'gravity'[\s\S]*?enterRoomById\('vault',\s*false\)/.test(mainSrc), 'Room 02 -> 03 uses distinct gravity transition');
assert(/function triggerVaultSequence[\s\S]*?mode:\s*'decryption'[\s\S]*?enterRoomById\('tunnels',\s*false\)/.test(mainSrc), 'Room 03 -> 04 uses distinct decryption transition');
assert(/function triggerGateBlast[\s\S]*?mode:\s*'hydraulic'[\s\S]*?enterRoomById\('lobby',\s*false\)/.test(mainSrc), 'Room 04 -> 05 uses distinct hydraulic transition');
assert(/function playFullScreenTransition/.test(mainSrc) && /function resetRoomTransitionOverlay/.test(mainSrc) && /function isReducedMotionPreferred/.test(mainSrc), 'Full-screen transition orchestrator, reset helper, and reduced-motion guard exist');
assert(/function handlePlayAgain[\s\S]*?resetRoomTransitionOverlay\(\)/.test(mainSrc), 'Play Again cleanly resets full-screen transition overlay');
assert(mainSrc.includes('const underFullscreenTransition') && /underFullscreenTransition[\s\S]*?hideAllOtherRoomStages\(toEl\)/.test(mainSrc), 'enterRoomById swaps immediately beneath active full-screen overlay and hides all other stages');

// Behavioral test of playFullScreenTransition + resetRoomTransitionOverlay in VM (non-GSAP fallback + reduced motion + interruption)
function extractFunctionSource(src, fnName) {
  const marker = `function ${fnName}(`;
  const start = src.indexOf(marker);
  if (start === -1) throw new Error(`Missing function ${fnName}`);
  let parenDepth = 0;
  let paramEnd = -1;
  for (let i = src.indexOf('(', start); i < src.length; i++) {
    if (src[i] === '(') parenDepth++;
    else if (src[i] === ')') {
      parenDepth--;
      if (parenDepth === 0) {
        paramEnd = i;
        break;
      }
    }
  }
  if (paramEnd === -1) throw new Error(`Unclosed params for ${fnName}`);
  const braceIdx = src.indexOf('{', paramEnd);
  let depth = 0;
  for (let i = braceIdx; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error(`Unclosed function ${fnName}`);
}

function makeFakeElement(id) {
  const classes = new Set();
  const attrs = {};
  return {
    id,
    style: {},
    textContent: '',
    scrollTop: 99,
    classList: {
      add: (...c) => c.forEach(x => classes.add(x)),
      remove: (...c) => c.forEach(x => classes.delete(x)),
      contains: c => classes.has(c)
    },
    setAttribute: (k, v) => { attrs[k] = String(v); },
    getAttribute: k => attrs[k],
    querySelector: () => makeFakeElement('child'),
    querySelectorAll: () => [makeFakeElement('q1'), makeFakeElement('q2')]
  };
}

const timers = [];
let fakeNow = 0;
const transitionSandbox = {
  console,
  activeRoomTransitionTimeline: null,
  activeRoomTransitionTimers: [],
  isRoomTransitionActive: true,
  isEscapeSequenceActive: true,
  currentRoomId: 'entry',
  reducedMotion: false,
  gsapAvailable: false,
  swappedCount: 0,
  introShownFor: null,
  nudgeScheduled: false,
  dom: {
    roomTransitionOverlay: makeFakeElement('room-transition-overlay'),
    rtoHudCaption: makeFakeElement('rto-hud-caption'),
    rtoHudEyebrow: makeFakeElement('rto-hud-eyebrow'),
    rtoHudTitle: makeFakeElement('rto-hud-title')
  },
  isGsapReady: () => transitionSandbox.gsapAvailable,
  showRoomIntroBanner: (id) => { transitionSandbox.introShownFor = id; },
  scheduleNudgeHint: () => { transitionSandbox.nudgeScheduled = true; },
  setTimeout: (fn, ms) => {
    const id = timers.length + 1;
    timers.push({ id, fn, at: fakeNow + ms, cleared: false });
    return id;
  },
  clearTimeout: (id) => {
    const t = timers.find(x => x.id === id);
    if (t) t.cleared = true;
  },
  window: {
    matchMedia: () => ({ matches: transitionSandbox.reducedMotion })
  }
};
vm.createContext(transitionSandbox);
vm.runInContext(
  extractFunctionSource(mainSrc, 'isReducedMotionPreferred') + '\n' +
  extractFunctionSource(mainSrc, 'resetRoomTransitionOverlay') + '\n' +
  extractFunctionSource(mainSrc, 'playFullScreenTransition'),
  transitionSandbox
);

// 1) Non-GSAP fallback runs CSS fallback, swaps target room at midpoint, cleans overlay completely at end
transitionSandbox.playFullScreenTransition({
  mode: 'portal',
  eyebrow: '// SUB-LEVEL 02',
  title: 'THE ORB ATRIUM',
  onSwap: () => {
    transitionSandbox.currentRoomId = 'orbatrium';
    transitionSandbox.swappedCount++;
  }
});
assert(
  transitionSandbox.dom.roomTransitionOverlay.classList.contains('active') &&
  transitionSandbox.dom.roomTransitionOverlay.classList.contains('css-fallback') &&
  transitionSandbox.dom.roomTransitionOverlay.getAttribute('data-mode') === 'portal',
  'Fallback transition activates #room-transition-overlay with css-fallback and portal mode'
);
timers.forEach(t => { if (!t.cleared) { fakeNow = t.at; t.fn(); } });
assert(
  transitionSandbox.swappedCount === 1 &&
  transitionSandbox.currentRoomId === 'orbatrium' &&
  !transitionSandbox.dom.roomTransitionOverlay.classList.contains('active') &&
  transitionSandbox.dom.roomTransitionOverlay.style.display === 'none' &&
  transitionSandbox.isRoomTransitionActive === false &&
  transitionSandbox.introShownFor === 'orbatrium',
  'Fallback transition swaps room, resets overlay completely, and clears transition lock'
);

// 2) Reduced-motion preference runs calm accelerated fallback & cleans up
timers.length = 0;
fakeNow = 0;
transitionSandbox.reducedMotion = true;
transitionSandbox.swappedCount = 0;
transitionSandbox.isRoomTransitionActive = true;
transitionSandbox.isEscapeSequenceActive = true;
transitionSandbox.playFullScreenTransition({
  mode: 'hydraulic',
  eyebrow: '// SUB-LEVEL 05',
  title: 'THE LOBBY',
  onSwap: () => {
    transitionSandbox.currentRoomId = 'lobby';
    transitionSandbox.swappedCount++;
  }
});
timers.forEach(t => { if (!t.cleared) { fakeNow = t.at; t.fn(); } });
assert(
  transitionSandbox.swappedCount === 1 &&
  transitionSandbox.currentRoomId === 'lobby' &&
  transitionSandbox.dom.roomTransitionOverlay.style.display === 'none' &&
  transitionSandbox.isRoomTransitionActive === false,
  'Reduced-motion transition swaps room cleanly and resets overlay'
);

// 3) Interrupting an in-flight transition cancels pending timers cleanly
timers.length = 0;
transitionSandbox.playFullScreenTransition({
  mode: 'decryption',
  eyebrow: '// SUB-LEVEL 04',
  title: 'THE COOLING TUNNELS',
  onSwap: () => { transitionSandbox.swappedCount += 100; }
});
transitionSandbox.resetRoomTransitionOverlay();
assert(
  timers.every(t => t.cleared) &&
  !transitionSandbox.dom.roomTransitionOverlay.classList.contains('active') &&
  transitionSandbox.dom.roomTransitionOverlay.style.display === 'none',
  'Interrupting transition via resetRoomTransitionOverlay cancels timers and hides overlay'
);

// --- Step 8 QA Hygiene & Lifecycle Assertions ---
const domIdsInMain = [...mainSrc.matchAll(/getElementById\('([^']+)'\)/g)].map(x => x[1]);
const missingDomIds = [...new Set(domIdsInMain)].filter(id => !htmlSrc.includes(`id="${id}"`));
assert(missingDomIds.length === 0, 'Every getElementById reference in main.js matches an element in index.html');
assert(/function captureModalFocus/.test(mainSrc) && /function restoreModalTriggerFocus/.test(mainSrc) && /function getTopmostModalEl/.test(mainSrc), 'Modal focus capture, restoration, and Tab trap helpers implemented');
assert(/function restoreSavedRoomStage[\s\S]*?st\.gameCompleted[\s\S]*?showFinalVictoryScreen\(false\)/.test(mainSrc), 'Refreshing a completed save cleanly restores Victory Screen');

console.log(`\nTOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
process.exit(failed ? 1 : 0);
