const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('==================================================');
console.log('   GSAP GUARD REGRESSION TESTS (ESCAPE / REVEAL)   ');
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
// Functions are extracted verbatim from js/main.js so these tests track the
// shipped implementation rather than a copy of it.
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

const FNS = ['isGsapReady', 'triggerSecretReveal', 'triggerFinalEscapeSequence', 'finishEscapeSequenceWithoutAnimation', 'playCinematicIntro', 'transitionToGameWorld'];
const FN_SRC = {};
FNS.forEach(name => {
    FN_SRC[name] = extractFunction(mainSrc, name);
    assert(FN_SRC[name].length > 20, 'Extracted real source for ' + name + '()');
});

const DOM_IDS = [
    'obsRevealStage', 'revealLine1', 'revealLine2', 'revealLine3', 'revealMainTitle', 'revealSubQuote',
    'nodeTerminal', 'nodeStrangeObject', 'nodeArcade', 'nodeDoor',
    'escapeSequenceBanner', 'escapeBannerTitle', 'layerBg', 'terminalPreviewStatus', 'arcadePreviewFrame',
    'mainGameHud', 'lockClamp1', 'lockClamp2', 'lockClamp3', 'doorLockRing', 'doorFrameOuter',
    'doorAccessLabel', 'doorAccessSub', 'doorRadiantAperture', 'doorPanelLeft', 'doorPanelRight',
    'stageLobby', 'escapeWhiteWash',
    'introEyebrow', 'introTitle', 'introSubtitle', 'introCta', 'introScreen', 'gameWorld'
];

function makeEl(id) {
    const classes = new Set();
    return {
        id,
        style: {},
        textContent: '',
        attrs: {},
        classList: {
            add(c) { classes.add(c); },
            remove(c) { classes.delete(c); },
            contains(c) { return classes.has(c); }
        },
        setAttribute(k, v) { this.attrs[k] = v; },
        getBoundingClientRect() { return { left: 10, top: 20, width: 200, height: 100 }; }
    };
}

function createHarness(opts) {
    opts = opts || {};
    const record = {
        timelines: [],
        sets: [],
        calls: { resultScreen: 0, resultArg: null, droneStops: 0, lockReleases: [], escapeInit: 0, sectorAnomaly: 0, discoverSecret: 0, startGame: 0, analytics: 0 }
    };

    const dom = {};
    DOM_IDS.forEach(id => { dom[id] = makeEl(id); });
    (opts.missing || []).forEach(id => { dom[id] = null; });

    const gsapStub = {
        version: 'stub',
        timeline(cfg) {
            const tl = {
                cfg: cfg,
                defaults: cfg && cfg.defaults,
                steps: [],
                to(target, vars, pos) { tl.steps.push({ type: 'to', target, vars, pos }); return tl; },
                fromTo(target, from, to, pos) { tl.steps.push({ type: 'fromTo', target, from, to, pos }); return tl; },
                set(target, vars, pos) { tl.steps.push({ type: 'set', target, vars, pos }); return tl; },
                call(fn, params, pos) { tl.steps.push({ type: 'call', fn, pos }); return tl; }
            };
            record.timelines.push(tl);
            return tl;
        },
        set(target, vars) { record.sets.push({ target, vars }); },
        to(target, vars) { record.sets.push({ target, vars }); },
        fromTo() {}
    };

    const sandbox = {
        dom,
        console,
        record,
        window: {
            gameManager: {
                discoverSecret() { record.calls.discoverSecret++; },
                startGame() { record.calls.startGame++; }
            },
            analyticsManager: { trackUniqueEvent() { record.calls.analytics++; } },
            audioManager: {
                playSectorAnomaly() { record.calls.sectorAnomaly++; },
                playEscapeInit() { record.calls.escapeInit++; },
                stopAmbientDrone() { record.calls.droneStops++; },
                playLockRelease(n) { record.calls.lockReleases.push(n); },
                playDoorPowerUp() {},
                playDoorSlideOpen() {},
                playEscapeFinalChord() {},
                playEnterSound() {}
            }
        },
        showEscapeResultScreen(arg) { record.calls.resultScreen++; record.calls.resultArg = arg; }
    };
    if (opts.gsap === 'undefined') sandbox.gsap = undefined;
    else if (opts.gsap === 'partial') sandbox.gsap = { version: 'partial' }; // loaded, but no animation API
    else if (opts.gsap === 'timeline-only') sandbox.gsap = { timeline() {} };
    else if (opts.gsap !== false) sandbox.gsap = gsapStub;

    vm.createContext(sandbox);
    const prelude = 'let isEscapeSequenceActive = false;\nlet isTransitioning = false;\nfunction updateHUD() {}\nfunction updateLobbyVisuals() {}\n\n';
    vm.runInContext(prelude + FNS.map(n => FN_SRC[n]).join('\n\n'), sandbox);

    return {
        dom,
        record,
        run(code) { return vm.runInContext(code, sandbox); },
        read(expr) { return vm.runInContext(expr, sandbox); },
        invokeCalls(tl) {
            tl.steps.filter(s => s.type === 'call' && typeof s.fn === 'function').forEach(s => s.fn());
        }
    };
}

// ---------------------------------------------------------------------------
// 1. Normal operation — secret reveal keeps its exact tween chain.
// ---------------------------------------------------------------------------
const h1 = createHarness();
h1.run('triggerSecretReveal();');

assert(h1.record.timelines.length === 1, 'Reveal/normal: one timeline created');
assert(h1.record.timelines[0].defaults.ease === 'power3.out', 'Reveal/normal: timeline ease preserved');
assert(h1.dom.obsRevealStage.classList.contains('active'), 'Reveal/normal: overlay activated');
assert(h1.dom.obsRevealStage.attrs['aria-hidden'] === 'false', 'Reveal/normal: overlay aria-hidden cleared');

const revealSet = h1.record.sets[0];
assert(h1.record.sets.length === 1 && Array.isArray(revealSet.target), 'Reveal/normal: one gsap.set with an array of targets');
assert(revealSet.target.length === 5 && revealSet.target.every(Boolean), 'Reveal/normal: all five reveal lines targeted');
assert(revealSet.vars.opacity === 0 && revealSet.vars.y === 12, 'Reveal/normal: pre-state (opacity 0, y 12) preserved');

const revealSteps = h1.record.timelines[0].steps;
const expectedReveal = [
    { idx: 0, target: 'obsRevealStage', duration: 0.5, pos: undefined },
    { idx: 1, target: 'revealLine1', duration: 0.7, pos: '+=0.2' },
    { idx: 2, target: 'revealLine2', duration: 0.7, pos: '+=0.4' },
    { idx: 3, target: 'revealLine3', duration: 0.5, pos: '+=0.3' },
    { idx: 4, target: 'revealMainTitle', duration: 1.2, pos: '+=0.5' },
    { idx: 5, target: 'revealSubQuote', duration: 1.0, pos: '+=0.3' }
];
assert(revealSteps.length === 6, 'Reveal/normal: six timeline steps (stage + five lines)');

let revealTimingOk = true;
expectedReveal.forEach(e => {
    const step = revealSteps[e.idx];
    if (!step || step.target !== h1.dom[e.target] || step.vars.duration !== e.duration || step.pos !== e.pos) {
        revealTimingOk = false;
    }
});
assert(revealTimingOk, 'Reveal/normal: every tween target, duration and offset is unchanged');
assert(revealSteps[4].vars.ease === 'back.out(1.2)', 'Reveal/normal: title ease preserved');

// ---------------------------------------------------------------------------
// 2. GSAP unavailable — secret reveal degrades to an instant, visible reveal.
// ---------------------------------------------------------------------------
const h2 = createHarness({ gsap: false });
let h2Threw = null;
try { h2.run('triggerSecretReveal();'); } catch (e) { h2Threw = e; }

assert(h2Threw === null, 'Reveal/no-GSAP: does not throw');
assert(h2.record.timelines.length === 0, 'Reveal/no-GSAP: no timeline attempted');
assert(h2.record.calls.discoverSecret === 1, 'Reveal/no-GSAP: secret progression still recorded');
assert(h2.dom.obsRevealStage.style.opacity === '1', 'Reveal/no-GSAP: overlay made visible');
assert(h2.dom.obsRevealStage.classList.contains('active'), 'Reveal/no-GSAP: overlay activated');

const allLinesVisible = ['revealLine1', 'revealLine2', 'revealLine3', 'revealMainTitle', 'revealSubQuote']
    .every(id => h2.dom[id].style.opacity === '1' && h2.dom[id].style.transform === 'none');
assert(allLinesVisible, 'Reveal/no-GSAP: all reveal lines shown in their final state');

// ---------------------------------------------------------------------------
// 3. Missing optional targets — secret reveal skips only the absent lines.
// ---------------------------------------------------------------------------
const h3 = createHarness({ missing: ['revealLine2', 'revealMainTitle'] });
let h3Threw = null;
try { h3.run('triggerSecretReveal();'); } catch (e) { h3Threw = e; }

assert(h3Threw === null, 'Reveal/missing-targets: does not throw');
assert(h3.record.sets[0].target.length === 3, 'Reveal/missing-targets: null targets filtered out of gsap.set');
assert(h3.record.sets[0].target.every(Boolean), 'Reveal/missing-targets: no null passed to gsap.set');
const h3Steps = h3.record.timelines[0].steps;
assert(h3Steps.length === 4, 'Reveal/missing-targets: only the present lines are tweened');
assert(h3Steps.every(s => s.target !== null && s.target !== undefined), 'Reveal/missing-targets: no null tween targets');

// ---------------------------------------------------------------------------
// 4. Missing overlay — nothing to animate, but progression must still happen.
// ---------------------------------------------------------------------------
const h4 = createHarness({ missing: ['obsRevealStage'] });
let h4Threw = null;
try { h4.run('triggerSecretReveal();'); } catch (e) { h4Threw = e; }

assert(h4Threw === null, 'Reveal/missing-overlay: does not throw');
assert(h4.record.calls.discoverSecret === 1, 'Reveal/missing-overlay: secret progression still recorded');
assert(h4.record.timelines.length === 0 && h4.record.sets.length === 0, 'Reveal/missing-overlay: no animation attempted');

// ---------------------------------------------------------------------------
// 5. Normal operation — escape sequence keeps its full cinematic chain.
// ---------------------------------------------------------------------------
const h5 = createHarness();
h5.run('triggerFinalEscapeSequence();');

assert(h5.record.timelines.length === 1, 'Escape/normal: one timeline created');
assert(h5.record.timelines[0].defaults.ease === 'power2.out', 'Escape/normal: timeline ease preserved');
assert(h5.dom.escapeSequenceBanner.style.display === 'flex', 'Escape/normal: banner shown');
assert(h5.read('isEscapeSequenceActive') === true, 'Escape/normal: sequence marked active');
assert(h5.record.calls.resultScreen === 0, 'Escape/normal: result screen not shown early');
assert(h5.record.calls.escapeInit === 1, 'Escape/normal: init audio fired once');

const nodesLocked = ['nodeTerminal', 'nodeStrangeObject', 'nodeArcade', 'nodeDoor']
    .every(id => h5.dom[id].style.pointerEvents === 'none');
assert(nodesLocked, 'Escape/normal: lobby nodes disabled');

const escSteps = h5.record.timelines[0].steps;
assert(escSteps.length === 22, 'Escape/normal: full 22-step cinematic chain intact');
assert(escSteps[0].type === 'fromTo' && escSteps[0].target === h5.dom.escapeSequenceBanner, 'Escape/normal: phase 1 banner reveal first');
assert(escSteps[0].vars === undefined && escSteps[0].to.duration === 0.7, 'Escape/normal: banner reveal timing preserved');
assert(escSteps[1].vars.textContent === 'ESCAPE PROTOCOL INITIALIZING...' && escSteps[1].vars.duration === 1.0, 'Escape/normal: banner text tween preserved');
assert(Array.isArray(escSteps[2].target) && escSteps[2].target.length === 4, 'Escape/normal: phase 2 dims four targets');
assert(escSteps[2].vars.opacity === 0.2 && escSteps[2].vars.duration === 1.2, 'Escape/normal: phase 2 timing preserved');
assert(escSteps[21].type === 'call', 'Escape/normal: sequence ends with the results callback');
assert(escSteps[20].target === h5.dom.escapeWhiteWash && escSteps[20].vars.duration === 1.1, 'Escape/normal: white wash finish preserved');

let callsThrew = null;
try { h5.invokeCalls(h5.record.timelines[0]); } catch (e) { callsThrew = e; }
assert(callsThrew === null, 'Escape/normal: every timeline callback runs without throwing');
assert(h5.record.calls.lockReleases.join(',') === '1,2,3', 'Escape/normal: three lock releases fired');
assert(h5.record.calls.droneStops === 1, 'Escape/normal: ambient drone stopped in phase 6');
assert(h5.record.sets.some(s => s.vars && s.vars.transformOrigin), 'Escape/normal: camera origin computed in phase 7');
assert(h5.record.calls.resultScreen === 1 && h5.record.calls.resultArg === true, 'Escape/normal: results screen shown once at the end');

// ---------------------------------------------------------------------------
// 6. GSAP unavailable — the escape still completes (no soft-lock).
// ---------------------------------------------------------------------------
const h6 = createHarness({ gsap: false });
let h6Threw = null;
try { h6.run('triggerFinalEscapeSequence();'); } catch (e) { h6Threw = e; }

assert(h6Threw === null, 'Escape/no-GSAP: does not throw');
assert(h6.record.timelines.length === 0, 'Escape/no-GSAP: no timeline attempted');
assert(h6.record.calls.resultScreen === 1 && h6.record.calls.resultArg === true, 'Escape/no-GSAP: results screen still reached');
assert(h6.read('isEscapeSequenceActive') === true, 'Escape/no-GSAP: sequence marked active (re-entrancy guard intact)');
assert(h6.dom.escapeSequenceBanner.style.display === 'none', 'Escape/no-GSAP: banner hidden');
assert(['lockClamp1', 'lockClamp2', 'lockClamp3'].every(id => h6.dom[id].classList.contains('released')), 'Escape/no-GSAP: lock clamps released');
assert(h6.dom.doorPanelLeft.style.transform === 'translateX(-105%)', 'Escape/no-GSAP: left panel opened');
assert(h6.dom.doorPanelRight.style.transform === 'translateX(105%)', 'Escape/no-GSAP: right panel opened');
assert(h6.dom.doorRadiantAperture.style.opacity === '1', 'Escape/no-GSAP: aperture lit');
assert(h6.dom.doorAccessLabel.textContent === 'OVERRIDE: ACCEPTED', 'Escape/no-GSAP: door labels updated');
assert(h6.record.calls.droneStops === 1, 'Escape/no-GSAP: ambient drone stopped');
assert(['nodeTerminal', 'nodeStrangeObject', 'nodeArcade', 'nodeDoor'].every(id => h6.dom[id].style.pointerEvents === 'none'), 'Escape/no-GSAP: lobby nodes stay disabled');

// ---------------------------------------------------------------------------
// 7. Missing optional target — GSAP warns and skips, the sequence still builds.
//    (Verified against GSAP 3.12.5 in a real browser: null targets never throw.)
// ---------------------------------------------------------------------------
const h7 = createHarness({ missing: ['doorPanelLeft'] });
let h7Threw = null;
try { h7.run('triggerFinalEscapeSequence();'); } catch (e) { h7Threw = e; }

assert(h7Threw === null, 'Escape/missing-optional-target: does not throw');
assert(h7.record.timelines.length === 1, 'Escape/missing-optional-target: cinematic still runs');
assert(h7.record.calls.resultScreen === 0, 'Escape/missing-optional-target: does not skip to the results screen');

// ---------------------------------------------------------------------------
// 8. Missing core anchor — falls back instead of stalling.
// ---------------------------------------------------------------------------
const h8 = createHarness({ missing: ['escapeSequenceBanner'] });
let h8Threw = null;
try { h8.run('triggerFinalEscapeSequence();'); } catch (e) { h8Threw = e; }

assert(h8Threw === null, 'Escape/missing-core-target: does not throw');
assert(h8.record.timelines.length === 0, 'Escape/missing-core-target: no timeline attempted');
assert(h8.record.calls.resultScreen === 1, 'Escape/missing-core-target: results screen reached via fallback');

// ---------------------------------------------------------------------------
// 9. Re-entrancy preserved (second call ignored).
// ---------------------------------------------------------------------------
const h9 = createHarness();
h9.run('triggerFinalEscapeSequence(); triggerFinalEscapeSequence();');
assert(h9.record.timelines.length === 1, 'Escape/re-entrancy: duplicate trigger ignored');

const h9b = createHarness({ gsap: false });
h9b.run('triggerFinalEscapeSequence(); triggerFinalEscapeSequence();');
assert(h9b.record.calls.resultScreen === 1, 'Escape/re-entrancy (no GSAP): fallback runs once');

// ---------------------------------------------------------------------------
// 10. Partially initialised GSAP — global exists but its API does not.
// ---------------------------------------------------------------------------
const h10 = createHarness({ gsap: 'partial' });
let h10Threw = null;
try { h10.run('triggerSecretReveal();'); } catch (e) { h10Threw = e; }

assert(h10Threw === null, 'Reveal/partial-GSAP: does not throw');
assert(h10.record.timelines.length === 0, 'Reveal/partial-GSAP: no timeline attempted');
assert(h10.dom.obsRevealStage.style.opacity === '1', 'Reveal/partial-GSAP: overlay shown in its final state');
assert(h10.record.calls.discoverSecret === 1, 'Reveal/partial-GSAP: secret progression still recorded');

const h11 = createHarness({ gsap: 'partial' });
let h11Threw = null;
try { h11.run('triggerFinalEscapeSequence();'); } catch (e) { h11Threw = e; }

assert(h11Threw === null, 'Escape/partial-GSAP: does not throw');
assert(h11.record.timelines.length === 0, 'Escape/partial-GSAP: no timeline attempted');
assert(h11.record.calls.resultScreen === 1 && h11.record.calls.resultArg === true, 'Escape/partial-GSAP: results screen still reached');
assert(h11.dom.doorPanelRight.style.transform === 'translateX(105%)', 'Escape/partial-GSAP: door opened via the fallback');
assert(h11.read('isEscapeSequenceActive') === true, 'Escape/partial-GSAP: sequence marked active (re-entrancy guard intact)');

// ---------------------------------------------------------------------------
// 11. isGsapReady() decision table.
// ---------------------------------------------------------------------------
assert(createHarness().read('isGsapReady()') === true, 'isGsapReady: full library is ready');
assert(createHarness({ gsap: false }).read('isGsapReady()') === false, 'isGsapReady: missing global is not ready');
assert(createHarness({ gsap: 'undefined' }).read('isGsapReady()') === false, 'isGsapReady: undefined global is not ready');
assert(createHarness({ gsap: 'partial' }).read('isGsapReady()') === false, 'isGsapReady: object without timeline/set is not ready');
assert(createHarness({ gsap: 'timeline-only' }).read('isGsapReady()') === false, 'isGsapReady: object without set is not ready');

// ---------------------------------------------------------------------------
// 12. Cinematic intro — guarded without changing its tween chain.
// ---------------------------------------------------------------------------
const i1 = createHarness();
i1.run('playCinematicIntro();');
assert(i1.record.timelines.length === 1, 'Intro/normal: one timeline created');
assert(i1.record.timelines[0].defaults.ease === 'power3.out', 'Intro/normal: timeline ease preserved');
assert(i1.record.timelines[0].steps.length === 4, 'Intro/normal: four intro tween steps preserved');
assert(i1.record.sets.length === 3, 'Intro/normal: three gsap.set pre-states preserved');
assert(i1.dom.introTitle.style.opacity === undefined, 'Intro/normal: no inline fallback applied');

const i2 = createHarness({ gsap: false });
let i2Threw = null;
try { i2.run('playCinematicIntro();'); } catch (e) { i2Threw = e; }
assert(i2Threw === null, 'Intro/no-GSAP: does not throw');
assert(i2.record.timelines.length === 0 && i2.record.sets.length === 0, 'Intro/no-GSAP: no animation attempted');
assert(['introEyebrow', 'introTitle', 'introSubtitle', 'introCta'].every(id => i2.dom[id].style.opacity === '1'), 'Intro/no-GSAP: intro copy shown in final state');
assert(i2.dom.introScreen.style.display === 'flex' && i2.dom.introScreen.style.opacity === '1', 'Intro/no-GSAP: intro screen put back on screen (Play Again recovery)');
assert(i2.dom.gameWorld.style.opacity === '0', 'Intro/no-GSAP: game world hidden like the tweened pre-state');

const i3 = createHarness({ gsap: 'partial' });
let i3Threw = null;
try { i3.run('playCinematicIntro();'); } catch (e) { i3Threw = e; }
assert(i3Threw === null && i3.record.timelines.length === 0, 'Intro/partial-GSAP: falls back without throwing');
assert(['introEyebrow', 'introTitle', 'introSubtitle', 'introCta'].every(id => i3.dom[id].style.opacity === '1'), 'Intro/partial-GSAP: intro copy still visible');
assert(i3.dom.introScreen.style.display === 'flex', 'Intro/partial-GSAP: intro screen still restored');

// ---------------------------------------------------------------------------
// 13. Intro → game-world transition — guarded, and its degraded path now sets
//     the same accessibility state as the tweened one.
// ---------------------------------------------------------------------------
const t1 = createHarness();
t1.run('transitionToGameWorld();');
assert(t1.record.timelines.length === 1, 'Transition/normal: one timeline created');
assert(t1.read('isTransitioning') === true, 'Transition/normal: transition flagged in flight');
assert(t1.record.timelines[0].steps.length === 5, 'Transition/normal: five tween steps preserved');
t1.record.timelines[0].cfg.onComplete();
assert(t1.dom.introScreen.style.display === 'none', 'Transition/normal: intro hidden on completion');
assert(t1.dom.gameWorld.classList.contains('active'), 'Transition/normal: game world activated on completion');
assert(t1.dom.gameWorld.attrs['aria-hidden'] === 'false', 'Transition/normal: game world exposed to AT on completion');
assert(t1.read('isTransitioning') === false, 'Transition/normal: transition flag cleared');
assert(t1.record.calls.startGame === 1, 'Transition/normal: game session started once');

const t2 = createHarness({ gsap: false });
let t2Threw = null;
try { t2.run('transitionToGameWorld();'); } catch (e) { t2Threw = e; }
assert(t2Threw === null, 'Transition/no-GSAP: does not throw');
assert(t2.dom.introScreen.style.display === 'none', 'Transition/no-GSAP: intro hidden');
assert(t2.dom.gameWorld.classList.contains('active') && t2.dom.gameWorld.style.opacity === '1', 'Transition/no-GSAP: game world shown');
assert(t2.dom.gameWorld.attrs['aria-hidden'] === 'false', 'Transition/no-GSAP: game world exposed to AT');
assert(t2.read('isTransitioning') === false, 'Transition/no-GSAP: flag cleared');

const t3 = createHarness({ gsap: 'partial' });
let t3Threw = null;
try { t3.run('transitionToGameWorld();'); } catch (e) { t3Threw = e; }
assert(t3Threw === null && t3.record.timelines.length === 0, 'Transition/partial-GSAP: falls back without throwing');
assert(t3.dom.gameWorld.classList.contains('active'), 'Transition/partial-GSAP: game world still shown');

const t4 = createHarness({ gsap: false, missing: ['introScreen'] });
let t4Threw = null;
try { t4.run('transitionToGameWorld();'); } catch (e) { t4Threw = e; }
assert(t4Threw === null && t4.dom.gameWorld.classList.contains('active'), 'Transition/missing intro screen: no throw, game world shown');

const t5 = createHarness();
t5.run('transitionToGameWorld(); transitionToGameWorld();');
assert(t5.record.timelines.length === 1, 'Transition/re-entrancy: duplicate call ignored');

// ---------------------------------------------------------------------------
// 14. Source-level guards (catch refactors that drop them).
// ---------------------------------------------------------------------------
assert(FN_SRC.isGsapReady.includes("typeof gsap !== 'undefined'"), 'Source: readiness predicate checks the global');
assert(FN_SRC.isGsapReady.includes("typeof gsap.timeline === 'function'"), 'Source: readiness predicate checks the timeline API');
assert(FN_SRC.triggerSecretReveal.includes('!isGsapReady()'), 'Source: secret reveal guards GSAP');
assert(FN_SRC.triggerFinalEscapeSequence.includes('!isGsapReady()'), 'Source: escape sequence guards GSAP');
assert(FN_SRC.playCinematicIntro.includes('!isGsapReady()'), 'Source: cinematic intro guards GSAP readiness');
assert(FN_SRC.playCinematicIntro.includes("dom.introScreen.style.display = 'flex'"), 'Source: degraded intro restores the intro screen');
assert(FN_SRC.transitionToGameWorld.includes('if (isGsapReady())'), 'Source: game-world transition guards GSAP readiness');
assert(FN_SRC.transitionToGameWorld.includes("aria-hidden', 'false'"), 'Source: degraded transition keeps the a11y attribute');
assert(FN_SRC.triggerFinalEscapeSequence.includes('finishEscapeSequenceWithoutAnimation()'), 'Source: escape sequence has a fallback path');
assert(!/try\s*\{/.test(FN_SRC.triggerSecretReveal + FN_SRC.triggerFinalEscapeSequence), 'Source: no try/catch swallowing errors');
assert(mainSrc.includes('function finishEscapeSequenceWithoutAnimation()'), 'Source: fallback helper is defined');

console.log('==================================================');
console.log('TOTAL TESTS: ' + (passed + failed) + ' | PASSED: ' + passed + ' | FAILED: ' + failed);
console.log('==================================================');
if (failed > 0) process.exit(1);
