const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('==================================================');
console.log('   ARCADE / PIXEL MAZE LIFECYCLE REGRESSION TESTS ');
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

const ROOT = path.join(__dirname, '..');
const mainSrc = fs.readFileSync(path.join(ROOT, 'js', 'main.js'), 'utf8');
const puzzlesSrc = fs.readFileSync(path.join(ROOT, 'js', 'puzzles.js'), 'utf8');
const gameSrc = fs.readFileSync(path.join(ROOT, 'js', 'game.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

function extractFunction(src, name) {
  const start = src.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('Function not found in js/main.js: ' + name);

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
  const braceIdx = src.indexOf('{', paramEnd);
  let depth = 0;
  for (let i = braceIdx; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error('Unbalanced braces while extracting: ' + name);
}

const FN_NAMES = [
  'openArcadeModal',
  'closeArcadeModal',
  'stopArcadeCountdown',
  'startArcadeCountdown',
  'startArcadeGame',
  'renderPixelMaze',
  'handleMazeMove',
  'stopArcadeGame',
  'clearArcadePlayfield',
  'hideArcadeSummaryStage',
  'endArcadeGame'
];
const FN_SRC = {};
FN_NAMES.forEach(name => {
  FN_SRC[name] = extractFunction(mainSrc, name);
  assert(FN_SRC[name].length > 15, 'Extracted real source for ' + name + '()');
});

function makeClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...c) => c.forEach(x => set.add(x)),
    remove: (...c) => c.forEach(x => set.delete(x)),
    contains: c => set.has(c),
    toggle: (c, force) => {
      if (force === undefined) set.has(c) ? set.delete(c) : set.add(c);
      else if (force) set.add(c);
      else set.delete(c);
    }
  };
}

function makeFakeEl(id) {
  const attrs = {};
  const children = [];
  return {
    id,
    innerHTML: '',
    textContent: '',
    className: '',
    style: {},
    children,
    classList: makeClassList(),
    setAttribute: (k, v) => { attrs[k] = String(v); },
    getAttribute: k => attrs[k],
    appendChild: (c) => { children.push(c); return c; }
  };
}

function createHarness() {
  let intervalsCreated = 0;
  const storage = {};
  const audioCalls = [];

  const dom = {
    arcadeModal: makeFakeEl('arcade-modal'),
    arcadeCard: makeFakeEl('arcade-card'),
    arcadeBestBadge: makeFakeEl('arcade-best-badge'),
    arcadeScoreVal: makeFakeEl('arcade-score-val'),
    arcadeTimeVal: makeFakeEl('arcade-time-val'),
    arcadeTargetsVal: makeFakeEl('arcade-targets-val'),
    pixelMazeBoard: makeFakeEl('pixel-maze-board'),
    mazeStatusBanner: makeFakeEl('maze-status-banner'),
    arcadeSummaryStage: makeFakeEl('arcade-summary-stage'),
    summaryStatusTitle: makeFakeEl('summary-status-title'),
    summaryStatusSub: makeFakeEl('summary-status-sub'),
    summaryFinalScore: makeFakeEl('summary-final-score'),
    summaryTargetsDestroyed: makeFakeEl('summary-targets-destroyed'),
    summaryMaxCombo: makeFakeEl('summary-max-combo'),
    summaryBestScore: makeFakeEl('summary-best-score'),
    btnClaimKey3: makeFakeEl('btn-claim-key-3')
  };

  const sandbox = {
    dom,
    console,
    isArcadeOpen: false,
    isEscapeSequenceActive: false,
    inSector02: false,
    arcadeIsPlaying: false,
    arcadeTimerInterval: null,
    arcadeSpawnerTimeout: null,
    arcadeCountdownInterval: null,
    arcadeCountdownToken: 0,
    activeTargets: new Set(),
    document: { createElement: (tag) => makeFakeEl(tag) },
    localStorage: {
      getItem: k => (k in storage ? storage[k] : null),
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: k => { delete storage[k]; }
    },
    setInterval() { intervalsCreated++; return intervalsCreated; },
    clearInterval() {},
    setTimeout() { return 1; },
    clearTimeout() {},
    lockBodyScroll() {},
    unlockBodyScroll() {},
    captureModalFocus() {},
    restoreModalTriggerFocus() {},
    gsap: undefined
  };
  sandbox.window = sandbox;
  sandbox.audioManager = {
    playModalOpen() { audioCalls.push('modal_open'); },
    playModalClose() { audioCalls.push('modal_close'); },
    playLockedSound() { audioCalls.push('locked'); },
    playTerminalKeystroke() { audioCalls.push('step'); },
    playBonusTargetHit() { audioCalls.push('dot'); },
    playArcadeVictory() { audioCalls.push('win'); }
  };

  vm.createContext(sandbox);
  vm.runInContext(puzzlesSrc, sandbox);
  vm.runInContext(gameSrc, sandbox);
  sandbox.gameManager.init();
  sandbox.puzzleManager.init();
  vm.runInContext(FN_NAMES.map(n => FN_SRC[n]).join('\n\n'), sandbox);

  return {
    sandbox,
    dom,
    audioCalls,
    getIntervalsCreated: () => intervalsCreated
  };
}

// 1) Guard: startArcadeGame refuses to run behind a closed modal
const h1 = createHarness();
h1.sandbox.startArcadeGame();
assert(h1.sandbox.arcadeIsPlaying === false && h1.sandbox.puzzleManager.getMazeState() === null, 'startArcadeGame() refuses to run behind closed modal');

// 2) Open modal launches Pixel Maze directly with ZERO countdown intervals
const h2 = createHarness();
h2.sandbox.openArcadeModal();
assert(h2.sandbox.isArcadeOpen === true && h2.sandbox.arcadeIsPlaying === true, 'openArcadeModal() starts Pixel Maze immediately');
assert(h2.getIntervalsCreated() === 0, 'Zero countdown or timer intervals created');
assert(h2.dom.arcadeScoreVal.textContent === '0 / 3' && h2.dom.arcadeTimeVal.textContent === 'LOCKED', 'HUD starts cleanly at 0 / 3 dots and LOCKED exit');
assert(h2.dom.pixelMazeBoard.children.length === 99, '11x9 Pixel Maze board renders 99 cells');

// 3) Wall collision does not advance player or increment moves
h2.sandbox.handleMazeMove(-1, 0);
assert(h2.sandbox.puzzleManager.getMazeState().moves === 0 && h2.audioCalls.includes('locked'), 'Wall collision blocked without incrementing moves');

// 4) Reach Exit before collecting 3 dots -> exit_locked (does not end or fail game)
// Path from (1,1) -> (1,2) -> (1,3) -> (2,3) -> (3,3 [dot1]) -> (3,4) -> (3,5) -> (3,6) -> (3,7) -> (4,7) -> (5,7) -> (5,8) -> (5,9) -> (6,9) -> (7,9 [Exit])
// First walk right avoiding (1,5) dot and (5,5) dot:
const skipToExitPath = [
  [0,1],[0,1],[1,0],[1,0], // collects dot1 at (3,3)
  [0,1],[0,1],[0,1],[0,1], // (3,4)->(3,7)
  [1,0],[1,0],             // (4,7)->(5,7)
  [0,1],[0,1],[1,0],[1,0]  // (5,8)->(5,9)->(6,9)->(7,9 E)
];
skipToExitPath.forEach(([dr, dc]) => h2.sandbox.handleMazeMove(dr, dc));
assert(h2.sandbox.puzzleManager.getMazeState().won === false && h2.sandbox.arcadeIsPlaying === true, 'Reaching Exit with <3 dots keeps game active (exit_locked)');
assert(h2.dom.mazeStatusBanner.textContent.includes('EXIT LOCKED'), 'Banner warns player to collect remaining dots before exiting');

// 5) Collect remaining 2 dots -> return to Exit -> wins and unlocks Key 03
const finishDotsAndExit = [
  [-1,0],[-1,0],             // back up (6,9)->(5,9)
  [-1,0],[-1,0],[-1,0],[-1,0], // (4,9)->(1,9)
  [0,-1],[0,-1],[0,-1],[0,-1], // (1,8)->(1,5 [dot2])
  [1,0],[1,0],[0,1],[0,1],[1,0],[1,0], // (2,5)->(3,5)->(3,6)->(3,7)->(4,7)->(5,7)
  [1,0],[1,0],[0,-1],[0,-1],[-1,0],[-1,0], // (6,7)->(7,7)->(7,6)->(7,5)->(6,5)->(5,5 [dot3])
  [1,0],[1,0],[0,1],[0,1],[-1,0],[-1,0],[0,1],[0,1],[1,0],[1,0] // -> (7,5)->(7,7)->(5,7)->(5,9)->(7,9 E)
];
finishDotsAndExit.forEach(([dr, dc]) => h2.sandbox.handleMazeMove(dr, dc));
const wonState = h2.sandbox.puzzleManager.getMazeState();
assert(wonState.won === true && wonState.dotsCollected.length === 3, 'Maze clears once all 3 dots are collected and Exit is reached');
assert(h2.dom.arcadeSummaryStage.classList.contains('active') && !h2.dom.btnClaimKey3.classList.contains('d-none'), 'Summary screen and Claim Key 03 button appear on clear');

// 6) Restart / Play Again resets cleanly
h2.sandbox.startArcadeGame();
const restarted = h2.sandbox.puzzleManager.getMazeState();
assert(restarted.moves === 0 && restarted.dotsCollected.length === 0 && restarted.player.r === 1 && restarted.player.c === 1, 'Restart resets maze position, moves, and dots cleanly');

// 7) Close modal cleans state safely
h2.sandbox.closeArcadeModal();
assert(h2.sandbox.isArcadeOpen === false && h2.sandbox.arcadeIsPlaying === false && h2.dom.pixelMazeBoard.innerHTML === '', 'closeArcadeModal() clears playfield and locks input');

// 8) Source wiring checks (controls, no-countdown, no boost pump decay)
assert(mainSrc.includes("e.key === 'ArrowUp' || key === 'w'") && mainSrc.includes('mazeDpad'), 'Keyboard (Arrows/WASD) and mobile D-Pad controls wired');
assert(mainSrc.includes('pixelMazeBoard') && htmlSrc.includes('id="maze-dpad"'), 'Monochrome Pixel Maze board and mobile D-Pad present in HTML & JS');
assert(!/arcadeTimeRemaining|20000/.test(FN_SRC.startArcadeGame), 'Pixel Maze has zero 20s timer/countdown');
assert(!/boostPressure\s*-\s*1\.15/.test(mainSrc), 'Room 04 Boost Pump no longer leaks pressure automatically');

console.log('==================================================');
console.log('TOTAL TESTS: ' + (passed + failed) + ' | PASSED: ' + passed + ' | FAILED: ' + failed);
console.log('==================================================');
if (failed > 0) process.exit(1);
