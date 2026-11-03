const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('==================================================');
console.log('  ARCADE COUNTDOWN LIFECYCLE REGRESSION TESTS     ');
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

const mainSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');

// ---------------------------------------------------------------------------
// The functions below are extracted verbatim from js/main.js (no copies), so
// these tests fail if the shipped implementation regresses.
// ---------------------------------------------------------------------------
function extractFunction(src, name) {
    const start = src.indexOf('function ' + name + '(');
    if (start < 0) throw new Error('Function not found in js/main.js: ' + name);

    let depth = 0;
    for (let i = src.indexOf('{', start); i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    throw new Error('Unbalanced braces while extracting: ' + name);
}

const FN_NAMES = ['stopArcadeCountdown', 'startArcadeCountdown', 'closeArcadeModal'];
const FN_SRC = {};

FN_NAMES.forEach(name => {
    FN_SRC[name] = extractFunction(mainSrc, name);
    assert(FN_SRC[name].length > 20, 'Extracted real source for ' + name + '()');
});

function createHarness() {
    let clockNow = 0;
    let nextTimerId = 1;
    const timers = new Map();
    const tweenQueue = [];
    const calls = { gameStarts: 0, gameStops: 0, playfieldClears: 0, beeps: [] };

    const dom = {
        arcadeCountdownOverlay: { style: { display: '', opacity: '' } },
        countdownNum: { textContent: '' },
        countdownSub: { textContent: '' },
        arcadeModal: { classList: { add() {}, remove() {} }, setAttribute() {} },
        arcadeCard: { style: {} }
    };

    const gsap = {
        to(target, vars) { tweenQueue.push({ target, vars }); },
        fromTo() {},
        killTweensOf(target) {
            for (let i = tweenQueue.length - 1; i >= 0; i--) {
                if (tweenQueue[i].target === target) tweenQueue.splice(i, 1);
            }
        }
    };

    const sandbox = {
        dom,
        gsap,
        console,
        isArcadeOpen: false,
        window: {
            audioManager: {
                playModalOpen() {},
                playModalClose() {},
                playArcadeCountdown(n) { calls.beeps.push(n); },
                playArcadeStart() { calls.beeps.push('START'); }
            }
        },
        setInterval(fn, ms) { const id = nextTimerId++; timers.set(id, { fn, ms, at: clockNow + ms }); return id; },
        clearInterval(id) { timers.delete(id); },
        setTimeout(fn, ms) { const id = nextTimerId++; timers.set(id, { fn, ms, at: clockNow + ms, once: true }); return id; },
        clearTimeout(id) { timers.delete(id); },
        stopArcadeGame() { calls.gameStops++; },
        clearArcadePlayfield() { calls.playfieldClears++; },
        unlockBodyScroll() {},
        startArcadeGame() { calls.gameStarts++; },
        performance: { now: () => clockNow }
    };

    vm.createContext(sandbox);
    // Module-scoped countdown state, declared exactly as in js/main.js
    const prelude = 'let arcadeCountdownInterval = null;\nlet arcadeCountdownToken = 0;\n\n';
    vm.runInContext(prelude + FN_NAMES.map(n => FN_SRC[n]).join('\n\n'), sandbox);

    return {
        sandbox,
        dom,
        calls,
        open() { sandbox.isArcadeOpen = true; },
        start() { vm.runInContext('startArcadeCountdown();', sandbox); },
        close() { vm.runInContext('closeArcadeModal();', sandbox); },
        timersAlive() { return timers.size; },
        lastTick() { const all = Array.from(timers.values()); return all.length ? all[all.length - 1].fn : null; },
        lastTween() { return tweenQueue.length ? tweenQueue[tweenQueue.length - 1] : null; },
        flushTweens() { tweenQueue.splice(0).forEach(t => { if (t.vars.onComplete) t.vars.onComplete(); }); },
        advance(ms) {
            const end = clockNow + ms;
            for (;;) {
                let due = null;
                let dueId = null;
                for (const [id, t] of timers) {
                    if (t.at <= end && (due === null || t.at < due.at)) { due = t; dueId = id; }
                }
                if (!due) break;
                clockNow = due.at;
                if (due.once) timers.delete(dueId);
                else due.at = clockNow + due.ms;
                due.fn();
            }
            clockNow = end;
        }
    };
}

// ---------------------------------------------------------------------------
// 1. Closing the modal mid-countdown must kill the interval and start nothing.
// ---------------------------------------------------------------------------
const h1 = createHarness();
h1.open();
h1.start();
assert(h1.timersAlive() === 1, 'Close during countdown: exactly one interval after start');

h1.advance(800);
assert(h1.dom.countdownNum.textContent === 2, 'Close during countdown: countdown ticks 3 -> 2');

h1.close();
assert(h1.sandbox.isArcadeOpen === false, 'Close during countdown: modal state is closed');
assert(h1.timersAlive() === 0, 'Close during countdown: countdown interval cleared');

h1.advance(10000);
h1.flushTweens();
assert(h1.calls.gameStarts === 0, 'Close during countdown: no round starts after the modal is closed');

// ---------------------------------------------------------------------------
// 2. Reopening must produce a clean, single, fully working countdown.
// ---------------------------------------------------------------------------
const h2 = createHarness();
h2.open();
h2.start();
h2.advance(1600);
assert(h2.dom.countdownNum.textContent === 1, 'Reopen: countdown advanced before closing');

h2.close();
h2.open();
h2.start();

assert(h2.dom.countdownNum.textContent === 3, 'Reopen: countdown restarts at 3');
assert(h2.timersAlive() === 1, 'Reopen: exactly one countdown interval (old one discarded)');

const seq = [];
for (let i = 0; i < 4; i++) {
    h2.advance(800);
    seq.push(h2.dom.countdownNum.textContent);
}
assert(seq.join('|') === '2|1|SYSTEM ACTIVE|SYSTEM ACTIVE', 'Reopen: countdown UI sequence preserved (3 -> 2 -> 1 -> SYSTEM ACTIVE)');
assert(h2.dom.countdownSub.textContent === 'ENGAGE TARGETS IMMEDIATELY!', 'Reopen: countdown subtext animation preserved');

h2.flushTweens();
assert(h2.calls.gameStarts === 1, 'Reopen: round starts exactly once after a full countdown');

// ---------------------------------------------------------------------------
// 3. Retry while a countdown is already running must not stack intervals.
// ---------------------------------------------------------------------------
const h3 = createHarness();
h3.open();
h3.start();
h3.advance(800);
h3.start();

assert(h3.timersAlive() === 1, 'Retry during countdown: interval count stays at one');
assert(h3.dom.countdownNum.textContent === 3, 'Retry during countdown: countdown restarts at 3');

h3.advance(3200);
h3.flushTweens();
assert(h3.calls.gameStarts === 1, 'Retry during countdown: exactly one round starts');

// ---------------------------------------------------------------------------
// 4. Repeated start calls (double retry / reopen spam) stay single.
// ---------------------------------------------------------------------------
const h4 = createHarness();
h4.open();
h4.start();
h4.start();
h4.start();

assert(h4.timersAlive() === 1, 'Duplicate start: repeated starts keep a single interval');

h4.advance(3200);
h4.flushTweens();
assert(h4.calls.gameStarts === 1, 'Duplicate start: only one round starts');

// ---------------------------------------------------------------------------
// 5. Stale callbacks cannot start a game (defence in depth, not just timer kill).
// ---------------------------------------------------------------------------
const h5 = createHarness();
h5.open();
h5.start();
h5.advance(800);

const staleTick = h5.lastTick();
assert(typeof staleTick === 'function', 'Stale callbacks: live interval tick captured');

h5.close();
staleTick();
assert(h5.calls.gameStarts === 0, 'Stale callbacks: orphaned interval tick cannot start a round');

const h5b = createHarness();
h5b.open();
h5b.start();
h5b.advance(3200);
assert(h5b.timersAlive() === 0, 'Stale tick: interval self-clears when the countdown completes');

const staleTween = h5b.lastTween();
assert(typeof staleTween?.vars?.onComplete === 'function', 'Stale callbacks: fade onComplete captured');

h5b.close();
staleTween.vars.onComplete();
assert(h5b.calls.gameStarts === 0, 'Stale callbacks: orphaned onComplete cannot start a round');

// ---------------------------------------------------------------------------
// 6. Closing during the fade-out window (interval already done) starts nothing.
// ---------------------------------------------------------------------------
const h6 = createHarness();
h6.open();
h6.start();
h6.advance(3200);
h6.close();
h6.flushTweens();
assert(h6.calls.gameStarts === 0, 'Close during fade-out: no round starts');

// ---------------------------------------------------------------------------
// 7. Static wiring guards (catch refactors that silently drop the teardown).
// ---------------------------------------------------------------------------
assert(mainSrc.includes('let arcadeCountdownInterval = null;'), 'Wiring: countdown interval is module-scoped state');
assert(mainSrc.includes('let arcadeCountdownToken = 0;'), 'Wiring: countdown token is module-scoped state');

assert(FN_SRC.closeArcadeModal.includes('stopArcadeCountdown()'), 'Wiring: closeArcadeModal() cancels the countdown');

const startBody = FN_SRC.startArcadeCountdown;
assert(startBody.indexOf('stopArcadeCountdown()') > -1, 'Wiring: startArcadeCountdown() cancels a previous countdown');
assert(startBody.indexOf('stopArcadeCountdown()') < startBody.indexOf('setInterval('), 'Wiring: cancellation happens before the new interval is created');
assert(startBody.includes('if (isStale())'), 'Wiring: countdown tick checks staleness');

const startGameSrc = extractFunction(mainSrc, 'startArcadeGame');
assert(startGameSrc.includes('!isArcadeOpen'), 'Wiring: startArcadeGame() refuses to run behind a closed modal');

console.log('==================================================');
console.log('TOTAL TESTS: ' + (passed + failed) + ' | PASSED: ' + passed + ' | FAILED: ' + failed);
console.log('==================================================');
if (failed > 0) process.exit(1);
