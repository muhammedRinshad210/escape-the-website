/**
 * Escape The Website - Main Game Controller & Orchestrator
 * High-performance, memory-safe controller handling the full gameplay loop,
 * interactive puzzles, arcade reaction game, multi-phase final escape,
 * hidden Sector 02 Observation Chamber, 1080x1350 canvas share card generator,
 * failure-proof Google Analytics 4 event tracking, and 60fps mobile ergonomics.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Subsystems
  const gameState = window.gameManager ? window.gameManager.init() : null;
  if (window.puzzleManager) window.puzzleManager.init();
  // Reconcile in-memory relay rounds with the persisted run state (resumes)
  if (window.puzzleManager && window.gameManager) {
    window.puzzleManager.syncSignalProgress(window.gameManager.getState().signalRoundsWon || 0);
  }

  // 2. DOM Elements Cache
  const dom = {
    introScreen: document.getElementById('intro-screen'),
    introEyebrow: document.getElementById('intro-eyebrow'),
    introTitle: document.getElementById('intro-title'),
    introSubtitle: document.getElementById('intro-subtitle'),
    introCta: document.getElementById('intro-cta'),
    btnEnter: document.getElementById('btn-enter'),
    gameWorld: document.getElementById('game-world'),
    canvas: document.getElementById('ambient-canvas'),
    cursorDot: document.getElementById('cursor-dot'),
    cursorRing: document.getElementById('cursor-ring'),
    // HUD
    mainGameHud: document.getElementById('main-game-hud'),
    hudRoomBadge: document.getElementById('hud-room-badge'),
    hudRoomName: document.getElementById('hud-room-name'),
    hudKeysCounter: document.getElementById('hud-keys-counter'),
    hudAllKeysBanner: document.getElementById('hud-all-keys-banner'),
    keySlots: [
      document.getElementById('key-slot-1'),
      document.getElementById('key-slot-2'),
      document.getElementById('key-slot-3')
    ],
    btnToggleAudio: document.getElementById('btn-toggle-audio'),
    audioStatusLabel: document.getElementById('audio-status-label'),
    // HUD Extras (timer, objectives, help, reset)
    hudTimerValue: document.getElementById('hud-timer'),
    hudTimerPanel: document.getElementById('hud-timer-panel'),
    btnHudObjectives: document.getElementById('btn-hud-objectives'),
    objectivesPanel: document.getElementById('objectives-panel'),
    btnObjectivesClose: document.getElementById('btn-objectives-close'),
    objKey1: document.getElementById('obj-key-1'),
    objKey1Status: document.getElementById('obj-key-1-status'),
    objKey2: document.getElementById('obj-key-2'),
    objKey2Status: document.getElementById('obj-key-2-status'),
    objKey3: document.getElementById('obj-key-3'),
    objKey3Status: document.getElementById('obj-key-3-status'),
    objEscape: document.getElementById('obj-escape'),
    objEscapeStatus: document.getElementById('obj-escape-status'),
    objSecret: document.getElementById('obj-secret'),
    objSecretName: document.querySelector('#obj-secret .objective-name'),
    objSecretStatus: document.getElementById('obj-secret-status'),
    btnHudHelp: document.getElementById('btn-hud-help'),
    btnHudReset: document.getElementById('btn-hud-reset'),
    briefingOverlay: document.getElementById('briefing-overlay'),
    btnBriefingStart: document.getElementById('btn-briefing-start'),
    briefingStartLabel: document.getElementById('briefing-start-label'),
    // Node tap hints
    terminalTapHint: document.getElementById('terminal-tap-hint'),
    resonatorTapHint: document.getElementById('resonator-tap-hint'),
    arcadeTapHint: document.getElementById('arcade-tap-hint'),
    doorTapHint: document.getElementById('door-tap-hint'),
    // Result screen extras
    resultRecordBadge: document.getElementById('result-record-badge'),
    resultBestLine: document.getElementById('result-best-line'),
    resultBestValue: document.getElementById('result-best-value'),
    // Parallax Layers & Stages
    layerBg: document.getElementById('layer-bg'),
    layerMg: document.getElementById('layer-mg'),
    stageLobby: document.getElementById('stage-lobby'),
    lobbyGrid: document.getElementById('lobby-grid'),
    stageSector02: document.getElementById('stage-sector02'),
    btnLeaveSector02: document.getElementById('btn-leave-sector02'),
    // Interactive Nodes in Lobby
    nodeDoor: document.getElementById('node-door'),
    doorNodeTitle: document.getElementById('door-node-title'),
    doorStatusIndicator: document.getElementById('door-status-indicator'),
    doorPortalVisual: document.getElementById('door-portal-visual'),
    doorFrameOuter: document.getElementById('door-frame-outer'),
    doorPanelLeft: document.getElementById('door-panel-left'),
    doorPanelRight: document.getElementById('door-panel-right'),
    doorRadiantAperture: document.getElementById('door-radiant-aperture'),
    doorLockRing: document.getElementById('door-lock-ring'),
    doorLockCore: document.getElementById('door-lock-core'),
    doorLockIcon: document.getElementById('door-lock-icon'),
    doorAccessLabel: document.getElementById('door-access-label'),
    doorAccessSub: document.getElementById('door-access-sub'),
    lockClamp1: document.getElementById('lock-clamp-1'),
    lockClamp2: document.getElementById('lock-clamp-2'),
    lockClamp3: document.getElementById('lock-clamp-3'),
    // Nodes 2, 3, 4
    nodeTerminal: document.getElementById('node-terminal'),
    terminalObjIndicator: document.getElementById('terminal-obj-indicator'),
    terminalPreviewStatus: document.getElementById('terminal-preview-status'),
    nodeStrangeObject: document.getElementById('node-strange-object'),
    resonatorObjIndicator: document.getElementById('resonator-obj-indicator'),
    resonatorObjHint: document.getElementById('resonator-obj-hint'),
    nodeArcade: document.getElementById('node-arcade'),
    arcadeObjIndicator: document.getElementById('arcade-obj-indicator'),
    arcadePreviewMarquee: document.getElementById('arcade-preview-marquee'),
    arcadePreviewFrame: document.getElementById('arcade-preview-frame'),
    arcadePreviewTag: document.getElementById('arcade-preview-tag'),
    arcadePreviewIcon: document.getElementById('arcade-preview-icon'),
    // Sector 02 Components
    obsWindowCard: document.getElementById('obs-window-card'),
    obsMonitorCard: document.getElementById('obs-monitor-card'),
    obsTerminalCard: document.getElementById('obs-terminal-card'),
    obsTerminalStream: document.getElementById('obs-terminal-stream'),
    obsInput: document.getElementById('obs-input'),
    obsChips: document.querySelectorAll('.obs-chip'),
    obsRevealStage: document.getElementById('obs-reveal-stage'),
    revealLine1: document.getElementById('reveal-line-1'),
    revealLine2: document.getElementById('reveal-line-2'),
    revealLine3: document.getElementById('reveal-line-3'),
    revealMainTitle: document.getElementById('reveal-main-title'),
    revealSubQuote: document.getElementById('reveal-sub-quote'),
    btnRevealReturnLobby: document.getElementById('btn-reveal-return-lobby'),
    btnRevealPlayAgain: document.getElementById('btn-reveal-play-again'),
    // Key 01 Resonator Modal
    resonatorModal: document.getElementById('resonator-modal'),
    resonatorCard: document.getElementById('resonator-card'),
    resStatusBadge: document.getElementById('res-status-badge'),
    btnResClose: document.getElementById('btn-res-close'),
    resClueText: document.getElementById('res-clue-text'),
    resStreamDisplay: document.getElementById('res-stream-display'),
    resHintBox: document.getElementById('res-hint-box'),
    resNodesGrid: document.getElementById('res-nodes-grid'),
    resNodeCards: document.querySelectorAll('.resonance-node-card'),
    keyExtractStage: document.getElementById('key-extract-stage'),
    btnClaimKey: document.getElementById('btn-claim-key'),
    // Key 02 Terminal Modal
    terminalModal: document.getElementById('terminal-modal'),
    terminalCard: document.getElementById('terminal-card'),
    termLedIndicator: document.getElementById('term-led-indicator'),
    btnTermClose: document.getElementById('btn-term-close'),
    termOutputStream: document.getElementById('term-output-stream'),
    termInput: document.getElementById('term-input'),
    btnTermSend: document.getElementById('btn-term-send'),
    termChips: document.querySelectorAll('.term-chip'),
    termKeyExtractStage: document.getElementById('term-key-extract-stage'),
    btnClaimKey2: document.getElementById('btn-claim-key-2'),
    // Key 03 Arcade Modal
    arcadeModal: document.getElementById('arcade-modal'),
    arcadeCard: document.getElementById('arcade-card'),
    arcadeBestBadge: document.getElementById('arcade-best-badge'),
    btnArcadeClose: document.getElementById('btn-arcade-close'),
    arcadeScoreVal: document.getElementById('arcade-score-val'),
    arcadeTimeVal: document.getElementById('arcade-time-val'),
    arcadeComboVal: document.getElementById('arcade-combo-val'),
    arcadeTargetsVal: document.getElementById('arcade-targets-val'),
    arcadePlayfield: document.getElementById('arcade-playfield'),
    arcadeCountdownOverlay: document.getElementById('arcade-countdown-overlay'),
    countdownNum: document.getElementById('countdown-num'),
    countdownSub: document.getElementById('countdown-sub'),
    arcadeSummaryStage: document.getElementById('arcade-summary-stage'),
    summaryStatusTitle: document.getElementById('summary-status-title'),
    summaryStatusSub: document.getElementById('summary-status-sub'),
    summaryFinalScore: document.getElementById('summary-final-score'),
    summaryTargetsDestroyed: document.getElementById('summary-targets-destroyed'),
    summaryMaxCombo: document.getElementById('summary-max-combo'),
    summaryBestScore: document.getElementById('summary-best-score'),
    btnClaimKey3: document.getElementById('btn-claim-key-3'),
    btnArcadeRetry: document.getElementById('btn-arcade-retry'),
    // Escape Sequence Banner & Transition
    escapeSequenceBanner: document.getElementById('escape-sequence-banner'),
    escapeBannerEyebrow: document.getElementById('escape-banner-eyebrow'),
    escapeBannerTitle: document.getElementById('escape-banner-title'),
    escapeWhiteWash: document.getElementById('escape-white-wash'),
    // Final Escape Results Screen
    escapeResultScreen: document.getElementById('escape-result-screen'),
    statTime: document.getElementById('stat-time'),
    statScore: document.getElementById('stat-score'),
    statKeys: document.getElementById('stat-keys'),
    statArcade: document.getElementById('stat-arcade'),
    btnPlayAgain: document.getElementById('btn-play-again'),
    btnShareScore: document.getElementById('btn-share-score'),
    btnExploreSecret: document.getElementById('btn-explore-secret'),
    escapeToast: document.getElementById('escape-toast'),
    // Standard Inspection Modal
    modalOverlay: document.getElementById('modal-overlay'),
    modalCard: document.getElementById('modal-card'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-content-body'),
    modalDiagLog: document.getElementById('modal-diag-log'),
    btnModalClose: document.getElementById('btn-modal-close'),
    btnModalAction: document.getElementById('btn-modal-action'),
    // v3 Multi-room HUD extras
    hudCollectibleLabel: document.getElementById('hud-collectible-label'),
    objectivesList: document.getElementById('objectives-list'),
    roomIntroBanner: document.getElementById('room-intro-banner'),
    roomIntroEyebrow: document.getElementById('room-intro-eyebrow'),
    roomIntroTitle: document.getElementById('room-intro-title'),
    roomIntroHint: document.getElementById('room-intro-hint'),
    // v3 Result screen extras
    resultRankBadge: document.getElementById('result-rank-badge'),
    resultRankValue: document.getElementById('result-rank-value'),
    statGold: document.getElementById('stat-gold'),
    resultRoomRecords: document.getElementById('result-room-records'),
    // v3 Room 02 — Orb Atrium
    stageOrbatrium: document.getElementById('stage-orbatrium'),
    goldTokenLobby: document.getElementById('gold-token-lobby'),
    orbNodes: [
      document.getElementById('orb-node-1'),
      document.getElementById('orb-node-2'),
      document.getElementById('orb-node-3')
    ],
    atriumOrbReadout: document.getElementById('atrium-orb-readout'),
    nodeAtriumConsole: document.getElementById('node-atrium-console'),
    goldTokenOrbatrium: document.getElementById('gold-token-orbatrium'),
    nodeLiftDoor: document.getElementById('node-lift-door'),
    liftNodeTitle: document.getElementById('lift-node-title'),
    liftStatusIndicator: document.getElementById('lift-status-indicator'),
    liftSockets: [
      document.getElementById('lift-socket-1'),
      document.getElementById('lift-socket-2'),
      document.getElementById('lift-socket-3')
    ],
    liftShaftFrame: document.getElementById('lift-shaft-frame'),
    liftDescentGlow: document.getElementById('lift-descent-glow'),
    liftIrisHatch: document.getElementById('lift-iris-hatch'),
    liftIrisIcon: document.getElementById('lift-iris-icon'),
    liftPlatform: document.getElementById('lift-platform'),
    liftAccessLabel: document.getElementById('lift-access-label'),
    liftAccessSub: document.getElementById('lift-access-sub'),
    liftTapHint: document.getElementById('lift-tap-hint'),
    // v3 Room 03 — Signal Vault
    stageVault: document.getElementById('stage-vault'),
    nodeSignalConsole: document.getElementById('node-signal-console'),
    signalObjIndicator: document.getElementById('signal-obj-indicator'),
    signalTapHint: document.getElementById('signal-tap-hint'),
    vaultRoundReadout: document.getElementById('vault-round-readout'),
    vaultDigitReadout: document.getElementById('vault-digit-readout'),
    nodeVaultArchive: document.getElementById('node-vault-archive'),
    goldTokenVault: document.getElementById('gold-token-vault'),
    nodeVaultDoor: document.getElementById('node-vault-door'),
    vaultNodeTitle: document.getElementById('vault-node-title'),
    vaultDoorStatusIndicator: document.getElementById('vault-door-status-indicator'),
    vaultWheel: document.getElementById('vault-wheel'),
    vaultWheelIcon: document.getElementById('vault-wheel-icon'),
    vaultBolts: [
      document.getElementById('vault-bolt-1'),
      document.getElementById('vault-bolt-2'),
      document.getElementById('vault-bolt-3')
    ],
    vaultDoorReadout: document.getElementById('vault-door-readout'),
    vaultAccessSub: document.getElementById('vault-access-sub'),
    vaultDoorTapHint: document.getElementById('vault-door-tap-hint'),
    signalModal: document.getElementById('signal-modal'),
    signalCard: document.getElementById('signal-card'),
    signalRoundBadge: document.getElementById('signal-round-badge'),
    btnSignalClose: document.getElementById('btn-signal-close'),
    signalInstruction: document.getElementById('signal-instruction'),
    signalTowerCards: document.querySelectorAll('#signal-towers-grid .signal-tower'),
    signalStatusText: document.getElementById('signal-status-text'),
    signalInputTracker: document.getElementById('signal-input-tracker'),
    signalHintBox: document.getElementById('signal-hint-box'),
    btnSignalPlay: document.getElementById('btn-signal-play'),
    btnSignalReplay: document.getElementById('btn-signal-replay'),
    signalDigitsValue: document.getElementById('signal-digits-value'),
    signalGoldStage: document.getElementById('signal-gold-stage'),
    btnClaimGoldChip: document.getElementById('btn-claim-gold-chip'),
    keypadModal: document.getElementById('vault-keypad-modal'),
    keypadCard: document.getElementById('keypad-card'),
    keypadStatusBadge: document.getElementById('keypad-status-badge'),
    btnKeypadClose: document.getElementById('btn-keypad-close'),
    keypadDisplay: document.getElementById('keypad-display'),
    keypadFeedback: document.getElementById('keypad-feedback'),
    keypadHintBox: document.getElementById('keypad-hint-box'),
    keypadKeys: document.querySelectorAll('#keypad-grid .keypad-key'),
    // v3 Room 04 — Cooling Tunnels
    stageTunnels: document.getElementById('stage-tunnels'),
    nodePipePanel: document.getElementById('node-pipe-panel'),
    pipeObjIndicator: document.getElementById('pipe-obj-indicator'),
    pipeTapHint: document.getElementById('pipe-tap-hint'),
    tunnelsFuseReadout: document.getElementById('tunnels-fuse-readout'),
    nodeTunnelsHatch: document.getElementById('node-tunnels-hatch'),
    goldTokenTunnels: document.getElementById('gold-token-tunnels'),
    nodePressureGate: document.getElementById('node-pressure-gate'),
    gateNodeTitle: document.getElementById('gate-node-title'),
    gateStatusIndicator: document.getElementById('gate-status-indicator'),
    gateSteamLeft: document.getElementById('gate-steam-left'),
    gateSteamRight: document.getElementById('gate-steam-right'),
    gatePanelLeft: document.getElementById('gate-panel-left'),
    gatePanelRight: document.getElementById('gate-panel-right'),
    gatePressureWrap: document.getElementById('gate-pressure-wrap'),
    gatePressureValue: document.getElementById('gate-pressure-value'),
    gatePressureFill: document.getElementById('gate-pressure-fill'),
    btnBoostPump: document.getElementById('btn-boost-pump'),
    gateAccessLabel: document.getElementById('gate-access-label'),
    gateAccessSub: document.getElementById('gate-access-sub'),
    gateTapHint: document.getElementById('gate-tap-hint'),
    pipeModal: document.getElementById('pipe-modal'),
    pipeCard: document.getElementById('pipe-card'),
    pipeStatusBadge: document.getElementById('pipe-status-badge'),
    btnPipeClose: document.getElementById('btn-pipe-close'),
    pipeRowsEl: document.getElementById('pipe-rows'),
    btnPipeRealign: document.getElementById('btn-pipe-realign'),
    pipeGoldStage: document.getElementById('pipe-gold-stage'),
    btnClaimBooster: document.getElementById('btn-claim-booster'),
    // v3 Room 05 — The Core
    stageCore: document.getElementById('stage-core'),
    fragmentNodes: [
      document.getElementById('fragment-node-1'),
      document.getElementById('fragment-node-2'),
      document.getElementById('fragment-node-3')
    ],
    nodeCoreLog: document.getElementById('node-core-log'),
    goldTokenCore: document.getElementById('gold-token-core'),
    nodeCoreConsole: document.getElementById('node-core-console'),
    coreNodeTitle: document.getElementById('core-node-title'),
    coreStatusIndicator: document.getElementById('core-status-indicator'),
    coreReactorRing: document.getElementById('core-reactor-ring'),
    coreReactorHeart: document.getElementById('core-reactor-heart'),
    coreHeartIcon: document.getElementById('core-heart-icon'),
    coreInventoryReadout: document.getElementById('core-inventory-readout'),
    coreAccessSub: document.getElementById('core-access-sub'),
    coreTapHint: document.getElementById('core-tap-hint'),
    coreModal: document.getElementById('core-modal'),
    coreCard: document.getElementById('core-card'),
    coreStatusBadge: document.getElementById('core-status-badge'),
    btnCoreClose: document.getElementById('btn-core-close'),
    coreInvFragments: document.getElementById('core-inv-fragments'),
    coreInvChip: document.getElementById('core-inv-chip'),
    coreInvKeys: document.getElementById('core-inv-keys'),
    coreEnergyValue: document.getElementById('core-energy-value'),
    coreEnergyFill: document.getElementById('core-energy-fill'),
    coreInstruction: document.getElementById('core-instruction'),
    btnChannelEnergy: document.getElementById('btn-channel-energy'),
    coreTapCounter: document.getElementById('core-tap-counter'),
    coreIgnitionStage: document.getElementById('core-ignition-stage'),
    btnTriggerLaunch: document.getElementById('btn-trigger-launch')
  };

  // =========================================================================
  // v3 ROOM CONSTANTS (declared before boot so auto-resume can use them)
  // =========================================================================

  const ROOM_SEQUENCE = ['lobby', 'orbatrium', 'vault', 'tunnels', 'core'];

  const ROOM_READY_BANNERS = {
    lobby: '• ALL 3 ACCESS KEYS RECOVERED •',
    orbatrium: '• ALL 3 PLASMA ORBS CAUGHT •',
    vault: '• ALL 3 RELAY SIGNALS MIRRORED •',
    tunnels: '• ALL 3 COOLANT FUSES LIT •',
    core: '• ALL 3 CORE FRAGMENTS RECOVERED •'
  };

  const ROOM_NUDGES = {
    lobby: '// HINT: INSPECT THE ANOMALY & TERMINAL NODES TO GET STARTED',
    orbatrium: '// HINT: TAP THE DRIFTING PLASMA ORBS TO CATCH THEM',
    vault: '// HINT: OPEN THE SIGNAL RELAY AND MIRROR THE GHOST SONGS',
    tunnels: '// HINT: OPEN THE COOLANT VALVES AND ALIGN EVERY ROW',
    core: '// HINT: TAP THE GLOWING SHARDS ON THE REACTOR FLOOR'
  };

  const ROOM_STAGE_ELEMENTS = {
    lobby: () => dom.stageLobby,
    orbatrium: () => dom.stageOrbatrium,
    vault: () => dom.stageVault,
    tunnels: () => dom.stageTunnels,
    core: () => dom.stageCore
  };

  const ROOM_INTRO_TEXT = {
    orbatrium: {
      eyebrow: '// SUB-LEVEL 01 CLEARED — DESCENDING',
      title: 'ROOM 02 • THE ORB ATRIUM',
      hint: 'Catch the 3 drifting plasma orbs to power the gravity lift.'
    },
    vault: {
      eyebrow: '// SUB-LEVEL 02 CLEARED — DESCENDING',
      title: 'ROOM 03 • THE SIGNAL VAULT',
      hint: 'Mirror the relay songs — each win reveals one vault cipher digit.'
    },
    tunnels: {
      eyebrow: '// SUB-LEVEL 03 CLEARED — DESCENDING',
      title: 'ROOM 04 • THE COOLING TUNNELS',
      hint: 'Align the coolant valves, then pump the hydraulic gate with BOOST.'
    },
    core: {
      eyebrow: '// SUB-LEVEL 04 CLEARED — DESCENDING',
      title: 'ROOM 05 • THE CORE',
      hint: 'Recover 3 core fragments, then channel energy for the final launch.'
    }
  };

  const DOOR_LOCKED_COPY = {
    orbatrium: {
      title: 'GRAVITY LIFT • POWER OFFLINE',
      body: 'A circular glass lift descends into the sub-levels. Its three energy sockets sit empty — the gravity engine cannot engage without plasma orbs.',
      diag: [
        '&gt; Lift Power: <span class="text-danger fw-bold">0 / 3</span>',
        '&gt; Gravity Engine: OFFLINE',
        '&gt; orbs required: 3 plasma orbs (catch them in the atrium)'
      ]
    },
    vault: {
      title: 'CIPHER VAULT • LOCK ENGAGED',
      body: 'A massive circular vault door with a spinning lock wheel. The keypad accepts a 3-digit code — each digit is revealed by winning a Signal Relay round.',
      diag: [
        '&gt; Vault Status: <span class="text-danger fw-bold">LOCKED</span>',
        '&gt; Cipher Fragments: WIN SIGNAL RELAY ROUNDS',
        '&gt; Code Format: [ROUND 1][ROUND 2][ROUND 3]'
      ]
    },
    tunnels: {
      title: 'HYDRAULIC GATE • NO PRESSURE',
      body: 'A towering hydraulic gate. Its pumps are dead — it can only be forced open by flooding the system with booster pressure. Hold the pump and do not let the gauge leak down.',
      diag: [
        '&gt; Hydraulics: <span class="text-danger fw-bold">DEAD</span>',
        '&gt; Pressure: 0%',
        '&gt; Required: PRESSURE BOOSTER (light all 3 fuses first)'
      ]
    },
    core: {
      title: 'CORE CONSOLE • REACTOR DORMANT',
      body: 'The reactor heart of the website. Its ignition matrix is empty — three shattered core fragments must be recovered from the reactor floor before energy can be channeled.',
      diag: [
        '&gt; Reactor: <span class="text-danger fw-bold">DORMANT</span>',
        '&gt; Fragments: 0 / 3',
        '&gt; Ignition: CHANNEL ENERGY to 100%'
      ]
    }
  };


  const GOLD_TOKEN_ELEMENTS = {
    lobby: () => dom.goldTokenLobby,
    orbatrium: () => dom.goldTokenOrbatrium,
    vault: () => dom.goldTokenVault,
    tunnels: () => dom.goldTokenTunnels,
    core: () => dom.goldTokenCore
  };


  let isTransitioning = false;
  let isModalOpen = false;
  let isResonatorOpen = false;
  let isTerminalOpen = false;
  let isArcadeOpen = false;
  let isNodeProcessing = false;
  let isEscapeSequenceActive = false;
  let inSector02 = false;
  let toastTimer = null;
  let isSharing = false;

  // v3 Multi-room state
  let isSignalOpen = false;
  let isKeypadOpen = false;
  let isPipeOpen = false;
  let isCoreOpen = false;
  let isRoomTransitionActive = false;
  let currentRoomId = 'lobby';
  let signalPlaybackTimers = [];
  let boostPumpInterval = null;
  let boostPumping = false;
  let boostPressure = 0;
  let coreDecayInterval = null;
  let keypadEntry = '';
  let keypadAttempts = 0;
  let roomEntryTimestamps = {};

  // Onboarding / Objectives / Timer state
  const ONBOARDING_STORAGE_KEY = 'escape_the_website_onboarding_v1';
  const BEST_TIME_STORAGE_KEY = 'escape_the_website_best_time_v1';
  const RUNS_STORAGE_KEY = 'escape_the_website_runs_v1';
  let isBriefingOpen = false;
  let isObjectivesOpen = false;
  let hudTimerInterval = null;
  let nudgeTimer = null;
  let nudgeShownThisRun = false;
  let pendingModalAction = null;

  // Touch device detection (mobile ergonomics: bigger arcade targets, TAP wording)
  const IS_TOUCH_DEVICE = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // Terminal Command History
  const cmdHistory = [];
  let historyIndex = -1;

  // Arcade Session Engine
  let arcadeTimerInterval = null;
  let arcadeSpawnerTimeout = null;
  let arcadeCountdownInterval = null;
  let arcadeCountdownToken = 0;
  const activeTargets = new Set();
  let arcadeTimeRemaining = 20;
  let arcadeIsPlaying = false;

  // Body Scroll Locking Helpers
  function lockBodyScroll() {
    document.body.classList.add('modal-open');
  }

  function unlockBodyScroll() {
    if (!isModalOpen && !isResonatorOpen && !isTerminalOpen && !isArcadeOpen) {
      document.body.classList.remove('modal-open');
    }
  }

  /**
   * Reveal a key-extraction (claim) overlay stage with the standard pop-in animation.
   * Shared by the puzzle-completion paths and by modal re-open when a puzzle was
   * solved but the key was never claimed.
   * @param {HTMLElement} stageEl
   */
  function revealKeyExtractStage(stageEl) {
    if (!stageEl) return;
    stageEl.classList.add('active');

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(stageEl,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.2)' }
      );
    } else {
      stageEl.style.opacity = '1';
    }
  }

  // =========================================================================
  // HUD MISSION TIMER
  // =========================================================================

  function startHudTimer() {
    stopHudTimer();
    if (!dom.hudTimerValue) return;
    updateHudTimerDisplay();
    hudTimerInterval = setInterval(updateHudTimerDisplay, 1000);
  }

  function stopHudTimer() {
    if (hudTimerInterval) {
      clearInterval(hudTimerInterval);
      hudTimerInterval = null;
    }
  }

  function updateHudTimerDisplay() {
    if (!dom.hudTimerValue || !window.gameManager) return;
    dom.hudTimerValue.textContent = window.gameManager.getCurrentRunTime();
  }

  // =========================================================================
  // MISSION OBJECTIVES PANEL (dynamic — re-rendered per sub-level)
  // =========================================================================

  /**
   * Per-room objective definitions. Each room renders its own checklist so
   * the objectives panel always matches the current sub-level.
   */
  const ROOM_OBJECTIVES = {
    lobby: [
      { id: 'key_01', name: 'KEY 01 • HARMONIC RESONATOR', desc: 'Calibrate the dormant anomaly node' },
      { id: 'key_02', name: 'KEY 02 • MAINFRAME TERMINAL', desc: 'Derive the override cipher (LOGS + SCAN)' },
      { id: 'key_03', name: 'KEY 03 • DEFENSE ARCADE', desc: 'Score 1200+ in System Defense' },
      { id: 'door', name: 'OPEN • SECURITY BARRIER', desc: 'Blast door: descend to Sub-Level 02', type: 'door' }
    ],
    orbatrium: [
      { id: 'orb_1', name: 'ORB 01 • DRIFTING PLASMA', desc: 'Catch the first drifting orb' },
      { id: 'orb_2', name: 'ORB 02 • DRIFTING PLASMA', desc: 'Catch the second drifting orb' },
      { id: 'orb_3', name: 'ORB 03 • DRIFTING PLASMA', desc: 'Catch the third drifting orb' },
      { id: 'door', name: 'OPEN • GRAVITY LIFT', desc: 'Socket all orbs, ride the lift down', type: 'door' }
    ],
    vault: [
      { id: 'round_1', name: 'SIGNAL 01 • RELAY SONG', desc: 'Mirror the first relay sequence' },
      { id: 'round_2', name: 'SIGNAL 02 • RELAY SONG', desc: 'Mirror the longer relay sequence' },
      { id: 'round_3', name: 'SIGNAL 03 • RELAY SONG', desc: 'Mirror the final relay sequence' },
      { id: 'door', name: 'OPEN • CIPHER VAULT', desc: 'Enter the 3-digit code on the keypad', type: 'door' }
    ],
    tunnels: [
      { id: 'fuse_1', name: 'FUSE 01 • COOLANT LINE', desc: 'Align row 1 valves to light the fuse' },
      { id: 'fuse_2', name: 'FUSE 02 • COOLANT LINE', desc: 'Align row 2 valves to light the fuse' },
      { id: 'fuse_3', name: 'FUSE 03 • COOLANT LINE', desc: 'Align row 3 valves to light the fuse' },
      { id: 'door', name: 'OPEN • HYDRAULIC GATE', desc: 'Pump the BOOST pressure to 100%', type: 'door' }
    ],
    core: [
      { id: 'frag_1', name: 'FRAGMENT 01 • CORE SHARD', desc: 'Recover the first glowing shard' },
      { id: 'frag_2', name: 'FRAGMENT 02 • CORE SHARD', desc: 'Recover the second glowing shard' },
      { id: 'frag_3', name: 'FRAGMENT 03 • CORE SHARD', desc: 'Recover the third glowing shard' },
      { id: 'door', name: 'IGNITE • THE CORE', desc: 'Channel energy to 100% and launch', type: 'door' }
    ]
  };

  function buildObjectiveRow(obj, done, statusLabel, statusClass, extraClass) {
    const li = document.createElement('li');
    li.className = 'objective-item' + (done ? ' done' : '') + (extraClass ? ' ' + extraClass : '');
    li.innerHTML =
      '<span class="objective-check" aria-hidden="true"></span>' +
      '<div class="objective-text">' +
        '<span class="objective-name">' + obj.name + '</span>' +
        '<span class="objective-desc">' + obj.desc + '</span>' +
      '</div>' +
      '<span class="objective-status ' + statusClass + '">' + statusLabel + '</span>';
    return li;
  }

  function renderObjectives() {
    if (!window.gameManager || !dom.objectivesList) return;
    const state = window.gameManager.getState();
    const roomId = inSector02 ? 'lobby' : currentRoomId;
    const objectives = ROOM_OBJECTIVES[roomId] || ROOM_OBJECTIVES.lobby;

    const frag = document.createDocumentFragment();
    let doorDone = false;

    objectives.forEach((obj) => {
      let done = false;
      let label = 'PENDING';
      let cls = 'pending';

      if (obj.type === 'door') {
        const ready = window.gameManager.isRoomDoorReady(roomId);
        doorDone = ready;
        if (ready) {
          done = true;
          label = roomId === 'core' ? 'IGNITED' : 'READY';
          cls = 'ready';
        } else {
          label = 'LOCKED';
          cls = 'locked';
        }
      } else if (roomId === 'lobby') {
        done = state.keysCollected.includes(obj.id);
        label = done ? 'SECURED' : 'PENDING';
        cls = done ? 'secured' : 'pending';
      } else if (roomId === 'orbatrium') {
        done = state.orbsCollected.includes(obj.id);
        label = done ? 'CAUGHT' : 'PENDING';
        cls = done ? 'secured' : 'pending';
      } else if (roomId === 'vault') {
        const roundNum = Number(obj.id.split('_')[1]);
        done = state.signalRoundsWon >= roundNum;
        label = done ? 'MIRRORED' : 'PENDING';
        cls = done ? 'secured' : 'pending';
      } else if (roomId === 'tunnels') {
        done = state.fusesLit.includes(obj.id);
        label = done ? 'LIT' : 'PENDING';
        cls = done ? 'secured' : 'pending';
      } else if (roomId === 'core') {
        done = state.fragmentsCollected.includes(obj.id);
        label = done ? 'RECOVERED' : 'PENDING';
        cls = done ? 'secured' : 'pending';
      }

      frag.appendChild(buildObjectiveRow(obj, done, label, cls, obj.type === 'door' ? 'final' : ''));
    });

    // Secret objective row (always last)
    const secretDone = Boolean(state.secretDiscovered);
    const secretRow = buildObjectiveRow(
      { name: 'SECRET • ???', desc: 'A hidden sub-sector exists. Listen closely.' },
      secretDone,
      secretDone ? 'DISCOVERED' : 'HIDDEN',
      secretDone ? 'discovered' : 'hidden-secret',
      'secret'
    );
    if (secretDone) {
      const nameEl = secretRow.querySelector('.objective-name');
      if (nameEl) nameEl.textContent = 'SECRET • SECTOR 02';
    }
    frag.appendChild(secretRow);

    dom.objectivesList.innerHTML = '';
    dom.objectivesList.appendChild(frag);
  }

  function setObjectiveState(itemEl, statusEl, done, pendingLabel, doneLabel) {
    if (!itemEl || !statusEl) return;
    if (done) {
      itemEl.classList.add('done');
      statusEl.textContent = doneLabel;
      statusEl.className = 'objective-status secured';
    } else {
      itemEl.classList.remove('done');
      statusEl.textContent = pendingLabel;
      statusEl.className = 'objective-status pending';
    }
  }

  function openObjectivesPanel() {
    if (!dom.objectivesPanel) return;
    renderObjectives();
    isObjectivesOpen = true;
    dom.objectivesPanel.classList.remove('d-none');
    dom.objectivesPanel.setAttribute('aria-hidden', 'false');
    if (dom.btnHudObjectives) {
      dom.btnHudObjectives.classList.add('open');
      dom.btnHudObjectives.setAttribute('aria-expanded', 'true');
    }
  }

  function closeObjectivesPanel() {
    if (!dom.objectivesPanel || !isObjectivesOpen) return;
    isObjectivesOpen = false;
    dom.objectivesPanel.classList.add('d-none');
    dom.objectivesPanel.setAttribute('aria-hidden', 'true');
    if (dom.btnHudObjectives) {
      dom.btnHudObjectives.classList.remove('open');
      dom.btnHudObjectives.setAttribute('aria-expanded', 'false');
    }
  }

  // =========================================================================
  // MISSION BRIEFING (HOW-TO-PLAY ONBOARDING)
  // =========================================================================

  function hasSeenOnboarding() {
    try {
      return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function markOnboardingSeen() {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (e) {}
  }

  function showMissionBriefing(context) {
    if (!dom.briefingOverlay) return;
    isBriefingOpen = true;
    lockBodyScroll();

    const ctx = context || 'resume';
    if (dom.briefingStartLabel) {
      dom.briefingStartLabel.textContent = ctx === 'first-run' ? 'START EXPLORING' : 'RESUME MISSION';
    }

    dom.briefingOverlay.classList.add('visible');
    dom.briefingOverlay.setAttribute('aria-hidden', 'false');

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(dom.briefingOverlay, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      const card = dom.briefingOverlay.querySelector('.briefing-card');
      if (card) {
        gsap.fromTo(card, { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' });
      }
    } else {
      dom.briefingOverlay.style.opacity = '1';
    }
  }

  function hideMissionBriefing(markSeen) {
    if (!dom.briefingOverlay || !isBriefingOpen) return;
    isBriefingOpen = false;
    if (markSeen) markOnboardingSeen();
    unlockBodyScroll();

    if (typeof gsap !== 'undefined') {
      gsap.to(dom.briefingOverlay, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          dom.briefingOverlay.classList.remove('visible');
          dom.briefingOverlay.setAttribute('aria-hidden', 'true');
        }
      });
    } else {
      dom.briefingOverlay.classList.remove('visible');
      dom.briefingOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  // =========================================================================
  // IDLE NUDGE (GENTLE ONBOARDING HINT)
  // =========================================================================

  function scheduleNudgeHint() {
    clearNudgeHint();
    nudgeShownThisRun = false;
    nudgeTimer = setTimeout(() => {
      if (nudgeShownThisRun || isEscapeSequenceActive || isBriefingOpen || isRoomTransitionActive) return;
      if (!window.gameManager) return;
      if (isModalOpen || isResonatorOpen || isTerminalOpen || isArcadeOpen ||
          isSignalOpen || isKeypadOpen || isPipeOpen || isCoreOpen) return;

      const progress = window.gameManager.getRoomProgress(currentRoomId);
      if (progress.have > 0) return;

      const nudgeText = ROOM_NUDGES[currentRoomId] || ROOM_NUDGES.lobby;
      nudgeShownThisRun = true;
      showToast(nudgeText);
    }, 75000);
  }

  function clearNudgeHint() {
    if (nudgeTimer) {
      clearTimeout(nudgeTimer);
      nudgeTimer = null;
    }
  }

  // =========================================================================
  // PERSONAL BEST / RUN RECORDS (localStorage meta-progression)
  // =========================================================================

  function parseClockToMs(clockText) {
    if (typeof clockText !== 'string') return null;
    const parts = clockText.split(':').map(p => parseInt(p, 10));
    if (parts.some(p => Number.isNaN(p))) return null;
    if (parts.length === 3) return ((parts[0] * 3600) + (parts[1] * 60) + parts[2]) * 1000;
    if (parts.length === 2) return ((parts[0] * 60) + parts[1]) * 1000;
    return null;
  }

  function formatMsToClock(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => n.toString().padStart(2, '0');
    if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    return `${pad(minutes)}:${pad(seconds)}`;
  }

  function getBestTimeMs() {
    try {
      const raw = localStorage.getItem(BEST_TIME_STORAGE_KEY);
      const parsed = raw ? parseInt(raw, 10) : NaN;
      return Number.isNaN(parsed) ? null : parsed;
    } catch (e) {
      return null;
    }
  }

  function saveBestTimeMs(ms) {
    try {
      localStorage.setItem(BEST_TIME_STORAGE_KEY, String(ms));
    } catch (e) {}
  }

  function incrementRunCounter() {
    try {
      const current = parseInt(localStorage.getItem(RUNS_STORAGE_KEY) || '0', 10);
      localStorage.setItem(RUNS_STORAGE_KEY, String((Number.isNaN(current) ? 0 : current) + 1));
    } catch (e) {}
  }

  // 3. Initialize Audio Label State
  if (window.audioManager && dom.audioStatusLabel) {
    dom.audioStatusLabel.textContent = window.audioManager.soundEnabled ? 'ON' : 'OFF';
  }

  // 4. Initialize Ambient Canvas, Custom Cursor & Parallax
  initAmbientCanvas(dom.canvas);
  initCustomCursor(dom.cursorDot, dom.cursorRing);
  initParallaxEngine(dom.layerBg, dom.layerMg);

  // 5. Save State Check: Completed game vs in-progress vs fresh
  if (gameState && gameState.gameCompleted) {
    if (dom.introScreen) dom.introScreen.style.display = 'none';
    // Completed save: show the final victory screen directly (the router
    // would otherwise treat the fresh closure as an unfinished run).
    showFinalVictoryScreen(false);
  } else if (gameState && gameState.gameStarted) {
    if (dom.introScreen) dom.introScreen.style.display = 'none';
    if (dom.gameWorld) {
      dom.gameWorld.classList.add('active');
      dom.gameWorld.setAttribute('aria-hidden', 'false');
      dom.gameWorld.style.opacity = '1';
    }
    restoreSavedRoomStage();
    updateHUD();
    updateLobbyVisuals();
    startHudTimer();
    scheduleNudgeHint();
  } else {
    playCinematicIntro();
  }

  // 6. Subscribe to Game Engine State Updates & GA4 Event Tracking
  if (window.gameManager) {
    window.gameManager.subscribe((event, data, state) => {
      updateHUD();
      updateLobbyVisuals();

      // Dispatch GA4 events safely
      if (window.trackEvent) {
        if (event === 'KEY_COLLECTED') {
          if (data.keyId === 'key_01') {
            window.trackEvent('key_01_collected');
          } else if (data.keyId === 'key_02') {
            window.trackEvent('key_02_collected');
          } else if (data.keyId === 'key_03') {
            window.trackEvent('key_03_collected');
          }
        } else if (event === 'ROOM_COLLECTIBLES_COMPLETE') {
          window.trackEvent('room_collectibles_complete', { room: data.roomId });
        } else if (event === 'GOLD_TOKEN_COLLECTED') {
          // tracked at collection site with room context
        } else if (event === 'ROOM_CHANGED') {
          window.trackEvent('room_changed', { room: data.to });
        } else if (event === 'GAME_COMPLETED') {
          const startTime = data.gameStartTime || Date.now();
          const endTime = data.completionTime || Date.now();
          const timeSec = Math.max(0, Math.floor((endTime - startTime) / 1000));

          window.trackEvent('game_completed', {
            time_seconds: timeSec,
            score: data.score || 0,
            arcade_best_score: data.arcadeBestScore || 0,
            keys_collected: (data.keysCollected || []).length
          });
        } else if (event === 'SECRET_DISCOVERED') {
          window.trackEvent('secret_discovered');
        } else if (event === 'STATE_RESET') {
          if (window.analyticsManager) {
            window.analyticsManager.resetRunEvents();
          }
        }
      }
    });
  }

  // 7. Setup Interaction Event Listeners
  // =========================================================================
  // v3 MULTI-ROOM ENGINE — sub-level progression, doors, cinematics
  // =========================================================================

  /**
   * Swap the visible room stage with a standard cross-fade.
   */
  function switchRoomStage(fromEl, toEl, onDone) {
    if (typeof gsap !== 'undefined' && fromEl && toEl) {
      gsap.to(fromEl, {
        opacity: 0,
        scale: 0.97,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => {
          fromEl.style.display = 'none';
          toEl.style.display = 'flex';
          toEl.classList.add('active');
          toEl.setAttribute('aria-hidden', 'false');
          toEl.scrollTop = 0;
          gsap.fromTo(toEl,
            { opacity: 0, scale: 1.02 },
            { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out', onComplete: onDone }
          );
        }
      });
    } else {
      if (fromEl) fromEl.style.display = 'none';
      if (toEl) {
        toEl.style.display = 'flex';
        toEl.classList.add('active');
        toEl.setAttribute('aria-hidden', 'false');
        toEl.style.opacity = '1';
        if (toEl.scrollTop !== undefined) toEl.scrollTop = 0;
      }
      if (typeof onDone === 'function') onDone();
    }
  }

  /**
   * Show the per-room onboarding banner (auto-hides).
   */
  function showRoomIntroBanner(roomId) {
    const intro = ROOM_INTRO_TEXT[roomId];
    if (!intro || !dom.roomIntroBanner) return;

    if (dom.roomIntroEyebrow) dom.roomIntroEyebrow.textContent = intro.eyebrow;
    if (dom.roomIntroTitle) dom.roomIntroTitle.textContent = intro.title;
    if (dom.roomIntroHint) dom.roomIntroHint.textContent = intro.hint;

    dom.roomIntroBanner.style.display = 'flex';

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(dom.roomIntroBanner,
        { opacity: 0, y: -18 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.2)' }
      );
      gsap.to(dom.roomIntroBanner, {
        opacity: 0,
        y: -14,
        duration: 0.7,
        delay: 3.8,
        ease: 'power2.in',
        onComplete: () => {
          dom.roomIntroBanner.style.display = 'none';
        }
      });
    } else {
      setTimeout(() => {
        dom.roomIntroBanner.style.display = 'none';
      }, 4200);
    }
  }

  /**
   * Enter a room: update state, swap stages, refresh HUD, arm onboarding.
   */
  function enterRoomById(roomId, viaWhiteWash = false) {
    if (!window.gameManager || !window.gameManager.rooms[roomId]) return;
    if (!roomEntryTimestamps[roomId]) {
      roomEntryTimestamps[roomId] = Date.now();
    }
    currentRoomId = roomId;
    window.gameManager.enterRoom(roomId);
    window.gameManager.unlockRoom(roomId);

    const fromEl = ROOM_STAGE_ELEMENTS[ROOM_SEQUENCE[Math.max(0, ROOM_SEQUENCE.indexOf(roomId) - 1)]]?.();
    const toEl = ROOM_STAGE_ELEMENTS[roomId]?.();

    const finish = () => {
      isRoomTransitionActive = false;
      isEscapeSequenceActive = false;
      updateHUD();
      refreshRoomVisuals();
      showRoomIntroBanner(roomId);
      scheduleNudgeHint();
    };

    const doSwap = () => {
      if (viaWhiteWash && dom.escapeWhiteWash) {
        // White wash is fully opaque: swap beneath it, then fade it out.
        const prevEl = fromEl && fromEl !== toEl ? fromEl : null;
        if (prevEl) {
          prevEl.style.display = 'none';
          prevEl.classList.remove('active');
        }
        if (toEl) {
          toEl.style.display = 'flex';
          toEl.classList.add('active');
          toEl.setAttribute('aria-hidden', 'false');
          toEl.scrollTop = 0;
        }
        if (dom.gameWorld) {
          dom.gameWorld.style.display = 'flex';
          dom.gameWorld.classList.add('active');
        }
        if (typeof gsap !== 'undefined') {
          gsap.to(dom.escapeWhiteWash, { opacity: 0, duration: 1.0, ease: 'power2.out' });
          gsap.fromTo(toEl, { opacity: 0, scale: 1.03 }, {
            opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out',
            onComplete: () => {
              if (dom.escapeWhiteWash) dom.escapeWhiteWash.style.opacity = '0';
              finish();
            }
          });
        } else {
          if (dom.escapeWhiteWash) dom.escapeWhiteWash.style.opacity = '0';
          finish();
        }
      } else {
        switchRoomStage(fromEl, toEl, finish);
      }
    };

    isRoomTransitionActive = true;
    setTimeout(doSwap, viaWhiteWash ? 150 : 0);
  }

  /**
   * Refresh all per-room door/node visuals from game state.
   */
  function refreshRoomVisuals() {
    updateOrbatriumVisuals();
    updateVaultVisuals();
    updateTunnelsVisuals();
    updateCoreVisuals();
    refreshGoldTokenVisuals();
  }

  // --------------------------------------------------------------------------
  // ROOM 02 — ORB ATRIUM
  // --------------------------------------------------------------------------

  function updateOrbatriumVisuals() {
    if (!window.gameManager) return;
    const state = window.gameManager.getState();
    const orbs = state.orbsCollected || [];
    const ready = orbs.length >= 3;
    const inspectWording = IS_TOUCH_DEVICE ? '// TAP TO CATCH' : '// CLICK TO CATCH';

    dom.orbNodes.forEach((orbEl, i) => {
      if (!orbEl) return;
      const orbId = `orb_${i + 1}`;
      if (orbs.includes(orbId)) {
        orbEl.classList.add('caught');
        orbEl.style.pointerEvents = 'none';
      }
    });

    dom.liftSockets.forEach((socket, i) => {
      if (!socket) return;
      if (i < orbs.length) {
        socket.classList.add('filled');
      } else {
        socket.classList.remove('filled');
      }
    });

    if (dom.atriumOrbReadout) dom.atriumOrbReadout.textContent = `${orbs.length} / 3`;

    if (dom.nodeLiftDoor) {
      if (ready) {
        dom.nodeLiftDoor.classList.add('door-ready');
        if (dom.liftNodeTitle) dom.liftNodeTitle.textContent = 'GRAVITY LIFT // READY';
        if (dom.liftStatusIndicator) dom.liftStatusIndicator.className = 'node-status-indicator emerald';
        if (dom.liftAccessLabel) {
          dom.liftAccessLabel.textContent = 'LIFT POWER: 3 / 3';
          dom.liftAccessLabel.style.color = 'var(--accent-emerald)';
        }
        if (dom.liftAccessSub) {
          dom.liftAccessSub.textContent = '// GRAVITY ENGINE ONLINE — DESCEND';
          dom.liftAccessSub.style.color = 'var(--accent-emerald)';
        }
        if (dom.liftTapHint) dom.liftTapHint.textContent = IS_TOUCH_DEVICE ? '// TAP TO DESCEND' : '// CLICK TO DESCEND';
      } else {
        dom.nodeLiftDoor.classList.remove('door-ready');
        if (dom.liftNodeTitle) dom.liftNodeTitle.textContent = 'GRAVITY LIFT';
        if (dom.liftStatusIndicator) dom.liftStatusIndicator.className = 'node-status-indicator red';
        if (dom.liftAccessLabel) {
          dom.liftAccessLabel.textContent = `LIFT POWER: ${orbs.length} / 3`;
          dom.liftAccessLabel.style.color = 'var(--text-secondary)';
        }
        if (dom.liftAccessSub) {
          dom.liftAccessSub.textContent = '// GRAVITY ENGINE OFFLINE';
          dom.liftAccessSub.style.color = 'var(--accent-red)';
        }
        if (dom.liftTapHint) dom.liftTapHint.textContent = `// REQUIRES ${3 - orbs.length} MORE ORB${3 - orbs.length === 1 ? '' : 'S'}`;
      }
    }

    if (dom.nodeAtriumConsole && dom.nodeAtriumConsole.querySelector('.node-tap-hint')) {
      dom.nodeAtriumConsole.querySelector('.node-tap-hint').textContent = IS_TOUCH_DEVICE ? '// TAP TO INSPECT' : '// CLICK TO INSPECT';
    }
  }

  function handleOrbCatch(orbIndex) {
    if (!window.gameManager) return;
    const orbId = `orb_${orbIndex + 1}`;
    const collected = window.gameManager.collectOrb(orbId);
    if (!collected) return;

    if (window.audioManager) window.audioManager.playBonusTargetHit();

    const orbEl = dom.orbNodes[orbIndex];
    if (orbEl) {
      orbEl.classList.add('caught');
      orbEl.style.pointerEvents = 'none';
    }

    const filledIndex = (window.gameManager.getState().orbsCollected || []).length - 1;
    if (dom.liftSockets[filledIndex]) dom.liftSockets[filledIndex].classList.add('filled');

    if (window.trackEvent) window.trackEvent('orb_collected', { count: filledIndex + 1 });

    showToast(`// PLASMA ORB SECURED • ${(filledIndex + 1)} / 3`);

    if (filledIndex + 1 >= 3) {
      setTimeout(() => {
        showToast('// ALL ORBS CAUGHT • GRAVITY LIFT ONLINE — DESCEND');
        updateOrbatriumVisuals();
        updateHUD();
      }, 900);
    }
    updateOrbatriumVisuals();
    updateHUD();
  }

  /**
   * Room 02 door cinematic: orbs socket in, iris hatch opens, lift descends.
   */
  function triggerLiftSequence() {
    if (isRoomTransitionActive || isEscapeSequenceActive) return;
    isRoomTransitionActive = true;
    isEscapeSequenceActive = true;

    [dom.nodeAtriumConsole, dom.nodeLiftDoor].forEach(el => {
      if (el) el.style.pointerEvents = 'none';
    });

    if (window.audioManager) {
      window.audioManager.playDoorPowerUp();
    }

    const gsapReady = isGsapReady() && dom.nodeLiftDoor;
    if (!gsapReady) {
      if (dom.nodeLiftDoor) dom.nodeLiftDoor.classList.add('opening');
      enterRoomById('vault', true);
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.call(() => {
      if (dom.liftIrisIcon) dom.liftIrisIcon.textContent = '◉';
      if (dom.liftAccessLabel) dom.liftAccessLabel.textContent = 'LIFT POWER: 3 / 3 • LOCKED';
      if (dom.liftAccessSub) dom.liftAccessSub.textContent = '// SOCKETS CHARGING';
    })
      .to(dom.liftSockets.filter(Boolean), {
        scale: 1.18,
        boxShadow: '0 0 26px rgba(0, 255, 136, 0.7)',
        duration: 0.4,
        stagger: 0.15
      })
      .to(dom.liftSockets.filter(Boolean), { scale: 1, duration: 0.3 })
      .call(() => {
        if (dom.liftAccessSub) dom.liftAccessSub.textContent = '// GRAVITY ENGINE ONLINE';
        if (window.audioManager) window.audioManager.playDoorUnlockResonance();
      })
      .to(dom.liftIrisHatch, { scale: 0.85, duration: 0.5, ease: 'power1.inOut' })
      .call(() => {
        if (dom.nodeLiftDoor) dom.nodeLiftDoor.classList.add('opening');
        if (window.audioManager) window.audioManager.playDoorSlideOpen();
        if (dom.liftAccessLabel) dom.liftAccessLabel.textContent = 'LIFT: DESCENDING';
        if (dom.liftAccessSub) dom.liftAccessSub.textContent = '// DEPARTING SUB-LEVEL 02';
      })
      .to(dom.liftPlatform, { y: 140, duration: 1.7, ease: 'power2.in' }, '+=0.25')
      .to(dom.stageOrbatrium, { opacity: 0.9, duration: 0.2 }, '<')
      .call(() => {
        enterRoomById('vault', true);
      });
  }

  // --------------------------------------------------------------------------
  // ROOM 03 — SIGNAL VAULT
  // --------------------------------------------------------------------------

  function updateVaultVisuals() {
    if (!window.gameManager) return;
    const state = window.gameManager.getState();
    const rounds = state.signalRoundsWon || 0;
    const chip = Boolean(state.goldChip);
    const ready = chip && rounds >= 3;
    const digits = ['7', '3', '9'];
    const revealed = digits.slice(0, rounds).join(' ');

    if (dom.vaultRoundReadout) dom.vaultRoundReadout.textContent = `${rounds} / 3`;
    if (dom.vaultDigitReadout) dom.vaultDigitReadout.textContent = revealed ? revealed.split('').join(' - ') : '- - -';
    if (dom.signalDigitsValue) dom.signalDigitsValue.textContent = revealed || '- - -';

    if (dom.nodeSignalConsole) {
      if (chip) {
        dom.nodeSignalConsole.classList.add('solved');
        if (dom.signalObjIndicator) dom.signalObjIndicator.className = 'node-status-indicator emerald';
        if (dom.signalTapHint) dom.signalTapHint.textContent = IS_TOUCH_DEVICE ? '// TAP TO REVIEW' : '// CLICK TO REVIEW';
      } else if (dom.signalObjIndicator) {
        dom.signalObjIndicator.className = 'node-status-indicator amber';
      }
    }

    if (dom.nodeVaultDoor) {
      if (ready) {
        dom.nodeVaultDoor.classList.add('door-ready');
        if (dom.vaultNodeTitle) dom.vaultNodeTitle.textContent = 'CIPHER VAULT // READY';
        if (dom.vaultDoorStatusIndicator) dom.vaultDoorStatusIndicator.className = 'node-status-indicator emerald';
        if (dom.vaultDoorReadout) dom.vaultDoorReadout.textContent = 'CODE: 7 3 9';
        if (dom.vaultAccessSub) {
          dom.vaultAccessSub.textContent = '// CIPHER VERIFIED — ENTER CODE';
          dom.vaultAccessSub.style.color = 'var(--accent-emerald)';
        }
        if (dom.vaultDoorTapHint) dom.vaultDoorTapHint.textContent = IS_TOUCH_DEVICE ? '// TAP TO OPEN' : '// CLICK TO OPEN';
      } else {
        dom.nodeVaultDoor.classList.remove('door-ready');
        if (dom.vaultNodeTitle) dom.vaultNodeTitle.textContent = 'CIPHER VAULT DOOR';
        if (dom.vaultDoorStatusIndicator) dom.vaultDoorStatusIndicator.className = 'node-status-indicator red';
        if (dom.vaultDoorReadout) dom.vaultDoorReadout.textContent = 'CODE: ? ? ?';
        if (dom.vaultAccessSub) {
          if (rounds > 0) {
            dom.vaultAccessSub.textContent = `// DIGITS REVEALED: ${revealed || '—'} (${rounds}/3)`;
          } else {
            dom.vaultAccessSub.textContent = '// WIN RELAY ROUNDS TO REVEAL DIGITS';
          }
          dom.vaultAccessSub.style.color = 'var(--accent-red)';
        }
        if (dom.vaultDoorTapHint) dom.vaultDoorTapHint.textContent = `// REQUIRES ${3 - rounds} MORE SIGNAL${3 - rounds === 1 ? '' : 'S'}`;
      }
    }
  }

  function openSignalModal() {
    if (isSignalOpen || isEscapeSequenceActive) return;
    isSignalOpen = true;
    lockBodyScroll();
    updateSignalModalUI();

    if (dom.signalModal) {
      dom.signalModal.classList.add('active');
      dom.signalModal.setAttribute('aria-hidden', 'false');
    }
    if (window.audioManager) window.audioManager.playModalOpen();

    if (typeof gsap !== 'undefined' && dom.signalCard) {
      gsap.fromTo(dom.signalCard,
        { opacity: 0, scale: 0.92, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out' }
      );
    }
  }

  function closeSignalModal() {
    if (!isSignalOpen) return;
    isSignalOpen = false;
    stopSignalPlayback();

    if (typeof gsap !== 'undefined' && dom.signalCard) {
      gsap.to(dom.signalCard, {
        opacity: 0, scale: 0.94, y: 16, duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          if (dom.signalModal) {
            dom.signalModal.classList.remove('active');
            dom.signalModal.setAttribute('aria-hidden', 'true');
          }
        }
      });
    } else {
      if (dom.signalModal) {
        dom.signalModal.classList.remove('active');
        dom.signalModal.setAttribute('aria-hidden', 'true');
      }
    }

    if (window.audioManager) window.audioManager.playModalClose();
    unlockBodyScroll();
    updateVaultVisuals();
    updateHUD();
  }

  function stopSignalPlayback() {
    signalPlaybackTimers.forEach(t => clearTimeout(t));
    signalPlaybackTimers = [];
  }

  function updateSignalModalUI() {
    if (!window.puzzleManager) return;
    const sig = window.puzzleManager.getSignalState();
    if (!sig) return;

    if (dom.signalRoundBadge) dom.signalRoundBadge.textContent = `ROUND ${Math.min(3, sig.round + (sig.phase === 'idle' ? 1 : 0))} / 3`;

    dom.signalTowerCards.forEach(t => { if (t) t.classList.remove('lit'); });
    if (dom.signalInputTracker) dom.signalInputTracker.textContent = '';
    if (dom.signalHintBox) {
      dom.signalHintBox.classList.add('d-none');
      dom.signalHintBox.textContent = '';
    }

    if (sig.solved || window.gameManager?.getState().goldChip) {
      if (dom.signalStatusText) {
        dom.signalStatusText.textContent = '// ALL RELAY SONGS MIRRORED — DATACHIP EARNED';
        dom.signalStatusText.className = 'signal-status-text win';
      }
      if (dom.signalGoldStage && !window.gameManager?.getState().goldChip) {
        dom.signalGoldStage.classList.remove('d-none');
      } else if (dom.signalGoldStage) {
        dom.signalGoldStage.classList.add('d-none');
      }
      if (dom.btnSignalPlay) dom.btnSignalPlay.disabled = true;
      return;
    }

    if (dom.signalGoldStage) dom.signalGoldStage.classList.add('d-none');

    if (sig.phase === 'idle' || !sig.round) {
      if (dom.signalStatusText) {
        dom.signalStatusText.textContent = '// RELAY IDLE — PRESS PLAY SEQUENCE';
        dom.signalStatusText.className = 'signal-status-text';
      }
      if (dom.btnSignalPlay) dom.btnSignalPlay.disabled = false;
    } else if (sig.phase === 'playback') {
      if (dom.signalStatusText) {
        dom.signalStatusText.textContent = '// WATCH THE GHOST SONG...';
        dom.signalStatusText.className = 'signal-status-text';
      }
      if (dom.btnSignalPlay) dom.btnSignalPlay.disabled = true;
    } else if (sig.phase === 'input') {
      if (dom.signalStatusText) {
        dom.signalStatusText.textContent = '// YOUR TURN — MIRROR THE PATTERN';
        dom.signalStatusText.className = 'signal-status-text';
      }
      if (dom.btnSignalPlay) dom.btnSignalPlay.disabled = true;
    }
  }

  function playSignalSequence(sequence, onPlaybackDone) {
    stopSignalPlayback();
    if (dom.signalStatusText) {
      dom.signalStatusText.textContent = '// WATCH THE GHOST SONG...';
      dom.signalStatusText.className = 'signal-status-text';
    }
    if (dom.btnSignalPlay) dom.btnSignalPlay.disabled = true;

    const stepMs = 620;
    sequence.forEach((towerIdx, i) => {
      signalPlaybackTimers.push(setTimeout(() => {
        flashSignalTower(towerIdx);
      }, 500 + i * stepMs));
    });

    signalPlaybackTimers.push(setTimeout(() => {
      if (typeof onPlaybackDone === 'function') onPlaybackDone();
    }, 500 + sequence.length * stepMs + 350));
  }

  function flashSignalTower(towerIdx) {
    const towerEl = dom.signalTowerCards[towerIdx];
    if (!towerEl) return;
    towerEl.classList.add('lit');
    if (window.audioManager) window.audioManager.playResonanceNodeTone((towerIdx % 4) + 1);
    setTimeout(() => towerEl.classList.remove('lit'), 380);
  }

  function handleSignalPlay() {
    if (!window.puzzleManager || !window.gameManager) return;
    if (window.gameManager.getState().goldChip) return;

    const state = window.puzzleManager.getSignalState();
    if (state && state.solved) return;

    // Decide which round to launch:
    //  - fresh console (idle / never started) -> round 1
    //  - just won a round (round_won) -> advance to the next round
    //  - mid-round (playback/input) -> restart the current round
    let nextRound;
    if (!state || !state.round || state.phase === 'idle') {
      nextRound = 1;
    } else if (state.phase === 'round_won') {
      nextRound = Math.min(3, state.round + 1);
    } else {
      nextRound = state.round;
    }

    const session = window.puzzleManager.startSignalRound(nextRound);
    if (!session) return;

    if (dom.signalRoundBadge) dom.signalRoundBadge.textContent = `ROUND ${session.round} / 3`;
    playSignalSequence(session.sequence, () => {
      window.puzzleManager.beginSignalInput();
      if (dom.signalStatusText) {
        dom.signalStatusText.textContent = '// YOUR TURN — MIRROR THE PATTERN';
        dom.signalStatusText.className = 'signal-status-text';
      }
      if (dom.btnSignalPlay) dom.btnSignalPlay.disabled = true;
    });
  }

  function handleSignalReplay() {
    if (!window.puzzleManager) return;
    const state = window.puzzleManager.getSignalState();
    if (!state || !state.round || state.phase === 'idle' || state.solved) return;
    const session = window.puzzleManager.replaySignalRound();
    if (!session) return;
    playSignalSequence(session.sequence, () => {
      window.puzzleManager.beginSignalInput();
      if (dom.signalStatusText) {
        dom.signalStatusText.textContent = '// YOUR TURN — MIRROR THE PATTERN';
        dom.signalStatusText.className = 'signal-status-text';
      }
    });
  }

  function handleSignalTowerClick(towerIdx) {
    if (!window.puzzleManager || !window.gameManager) return;
    const sig = window.puzzleManager.getSignalState();
    if (!sig || sig.phase !== 'input') return;

    flashSignalTower(towerIdx);
    const result = window.puzzleManager.inputSignalTower(towerIdx);
    if (!result || result.status === 'error') return;

    if (result.status === 'progress') {
      if (dom.signalInputTracker) dom.signalInputTracker.textContent = '●'.repeat(result.input.length);
      return;
    }

    if (result.status === 'desync') {
      if (window.audioManager) window.audioManager.playResonanceDesync();
      if (dom.signalStatusText) {
        dom.signalStatusText.textContent = '// SIGNAL DESYNC — MIRROR IT AGAIN';
        dom.signalStatusText.className = 'signal-status-text error';
      }
      if (dom.signalInputTracker) dom.signalInputTracker.textContent = '';
      if (result.showHint && dom.signalHintBox) {
        dom.signalHintBox.textContent = result.hintText;
        dom.signalHintBox.classList.remove('d-none');
      }
      setTimeout(() => handleSignalReplay(), 1100);
      return;
    }

    if (result.status === 'round_won') {
      window.gameManager.winSignalRound(result.round);
      if (window.audioManager) window.audioManager.playResonanceSuccess();
      if (window.trackEvent) window.trackEvent('signal_round_won', { round: result.round });

      if (result.allRoundsComplete) {
        if (dom.signalStatusText) {
          dom.signalStatusText.textContent = `// FULL CIPHER: ${result.codeComplete} — GOLD DATACHIP UNLOCKED`;
          dom.signalStatusText.className = 'signal-status-text win';
        }
        if (dom.signalGoldStage) dom.signalGoldStage.classList.remove('d-none');
        if (dom.btnSignalPlay) dom.btnSignalPlay.disabled = true;
        updateVaultVisuals();
        updateHUD();
      } else {
        if (dom.signalStatusText) {
          dom.signalStatusText.textContent = `// SONG MIRRORED — DIGIT "${result.revealedDigit}" REVEALED`;
          dom.signalStatusText.className = 'signal-status-text win';
        }
        if (dom.signalRoundBadge) dom.signalRoundBadge.textContent = `ROUND ${result.round} / 3`;
        if (dom.signalDigitsValue) {
          const revealed = ['7', '3', '9'].slice(0, result.round).join(' - ');
          dom.signalDigitsValue.textContent = revealed;
        }
        showToast(`// SIGNAL ${result.round}/3 MIRRORED • CIPHER DIGIT "${result.revealedDigit}" REVEALED`);
        if (dom.btnSignalPlay) dom.btnSignalPlay.disabled = false;
        updateVaultVisuals();
        updateHUD();
      }
    }
  }

  function handleClaimGoldChip() {
    if (!window.gameManager) return;
    const claimed = window.gameManager.claimGoldChip();
    if (!claimed) return;

    if (window.audioManager) window.audioManager.playKeyExtractChime();
    showToast('// GOLD DATACHIP SECURED • +200 PTS');
    if (window.trackEvent) window.trackEvent('gold_chip_claimed');

    if (dom.signalGoldStage) dom.signalGoldStage.classList.add('d-none');
    if (dom.signalStatusText) {
      dom.signalStatusText.textContent = '// GOLD DATACHIP CLAIMED — OPEN THE VAULT DOOR';
      dom.signalStatusText.className = 'signal-status-text win';
    }
    updateVaultVisuals();
    updateHUD();
    setTimeout(() => {
      closeSignalModal();
      openKeypadModal();
    }, 1200);
  }

  // --- Vault keypad ---

  function openKeypadModal() {
    if (isKeypadOpen || isEscapeSequenceActive) return;
    isKeypadOpen = true;
    keypadEntry = '';
    lockBodyScroll();
    renderKeypadDisplay();

    if (dom.keypadModal) {
      dom.keypadModal.classList.add('active');
      dom.keypadModal.setAttribute('aria-hidden', 'false');
    }
    if (dom.keypadHintBox) {
      if (keypadAttempts >= 2) {
        dom.keypadHintBox.textContent = '// CIPHER HINT: The digits are 7 - 3 - 9 (rounds 1, 2, 3 in order).';
        dom.keypadHintBox.classList.remove('d-none');
      } else {
        dom.keypadHintBox.classList.add('d-none');
      }
    }
    if (dom.keypadFeedback) {
      dom.keypadFeedback.textContent = '// ENTER THE 3 RELAY DIGITS';
      dom.keypadFeedback.className = 'keypad-feedback';
    }
    if (dom.keypadStatusBadge) dom.keypadStatusBadge.textContent = 'STATUS: LOCKED';
    if (window.audioManager) window.audioManager.playModalOpen();

    if (typeof gsap !== 'undefined' && dom.keypadCard) {
      gsap.fromTo(dom.keypadCard,
        { opacity: 0, scale: 0.92, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out' }
      );
    }
  }

  function closeKeypadModal() {
    if (!isKeypadOpen) return;
    isKeypadOpen = false;

    if (typeof gsap !== 'undefined' && dom.keypadCard) {
      gsap.to(dom.keypadCard, {
        opacity: 0, scale: 0.94, y: 16, duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          if (dom.keypadModal) {
            dom.keypadModal.classList.remove('active');
            dom.keypadModal.setAttribute('aria-hidden', 'true');
          }
        }
      });
    } else {
      if (dom.keypadModal) {
        dom.keypadModal.classList.remove('active');
        dom.keypadModal.setAttribute('aria-hidden', 'true');
      }
    }

    if (window.audioManager) window.audioManager.playModalClose();
    unlockBodyScroll();
  }

  function renderKeypadDisplay() {
    if (!dom.keypadDisplay) return;
    const padded = (keypadEntry + '___').slice(0, 3);
    dom.keypadDisplay.textContent = padded.split('').join(' ');
  }

  function handleKeypadPress(key) {
    if (!window.gameManager) return;
    const chip = window.gameManager.getState().goldChip;
    if (!chip) return;

    if (key === 'CLR') {
      keypadEntry = '';
      renderKeypadDisplay();
      if (dom.keypadFeedback) {
        dom.keypadFeedback.textContent = '// ENTER THE 3 RELAY DIGITS';
        dom.keypadFeedback.className = 'keypad-feedback';
      }
      if (window.audioManager) window.audioManager.playTerminalKeystroke();
      return;
    }

    if (key === 'OK') {
      if (keypadEntry.length < 3) {
        if (dom.keypadFeedback) {
          dom.keypadFeedback.textContent = '// INCOMPLETE CODE — 3 DIGITS REQUIRED';
          dom.keypadFeedback.className = 'keypad-feedback denied';
        }
        if (window.audioManager) window.audioManager.playLockedSound();
        return;
      }
      if (keypadEntry === '739') {
        if (window.audioManager) window.audioManager.playResonanceSuccess();
        if (dom.keypadFeedback) {
          dom.keypadFeedback.textContent = '// CIPHER VERIFIED — VAULT OPENING';
          dom.keypadFeedback.className = 'keypad-feedback granted';
        }
        if (dom.keypadStatusBadge) dom.keypadStatusBadge.textContent = 'STATUS: OPEN';
        if (window.trackEvent) window.trackEvent('vault_unlocked');
        setTimeout(() => {
          closeKeypadModal();
          triggerVaultSequence();
        }, 800);
      } else {
        keypadAttempts += 1;
        keypadEntry = '';
        renderKeypadDisplay();
        if (window.audioManager) window.audioManager.playLockedSound();
        if (dom.keypadFeedback) {
          dom.keypadFeedback.textContent = '// ACCESS DENIED — WRONG CIPHER';
          dom.keypadFeedback.className = 'keypad-feedback denied';
        }
        if (keypadAttempts >= 2 && dom.keypadHintBox) {
          dom.keypadHintBox.textContent = '// CIPHER HINT: The digits are 7 - 3 - 9 (rounds 1, 2, 3 in order).';
          dom.keypadHintBox.classList.remove('d-none');
        }
      }
      return;
    }

    if (keypadEntry.length < 3) {
      keypadEntry += key;
      renderKeypadDisplay();
      if (window.audioManager) window.audioManager.playTerminalKeystroke();
    }
  }

  /**
   * Room 03 door cinematic: wheel spins, bolts retract, vault opens.
   */
  function triggerVaultSequence() {
    if (isRoomTransitionActive || isEscapeSequenceActive) return;
    isRoomTransitionActive = true;
    isEscapeSequenceActive = true;

    [dom.nodeSignalConsole, dom.nodeVaultDoor, dom.nodeVaultArchive].forEach(el => {
      if (el) el.style.pointerEvents = 'none';
    });

    if (window.audioManager) window.audioManager.playDoorPowerUp();

    if (!isGsapReady() || !dom.nodeVaultDoor) {
      if (dom.vaultBolts) dom.vaultBolts.forEach(b => { if (b) b.classList.add('retracted'); });
      enterRoomById('tunnels', true);
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.call(() => {
      if (dom.vaultAccessSub) dom.vaultAccessSub.textContent = '// LOCK WHEEL DISENGAGING';
      if (window.audioManager) window.audioManager.playLockRelease(1);
    })
      .to(dom.vaultWheel, { rotate: 360, duration: 1.5, ease: 'power2.inOut' })
      .call(() => {
        if (dom.vaultBolts[0]) dom.vaultBolts[0].classList.add('retracted');
        if (window.audioManager) window.audioManager.playLockRelease(2);
      })
      .to(dom.vaultWheel, { rotate: 720, duration: 1.4, ease: 'power2.inOut' })
      .call(() => {
        if (dom.vaultBolts[1]) dom.vaultBolts[1].classList.add('retracted');
        if (dom.vaultBolts[2]) dom.vaultBolts[2].classList.add('retracted');
        if (window.audioManager) window.audioManager.playLockRelease(3);
      })
      .to(dom.vaultWheel, { rotate: 900, duration: 1.0, ease: 'power1.inOut' })
      .call(() => {
        if (dom.vaultAccessSub) dom.vaultAccessSub.textContent = '// BOLTS RETRACTED — VAULT OPEN';
        if (dom.vaultWheelIcon) dom.vaultWheelIcon.textContent = '⌾';
        if (window.audioManager) window.audioManager.playDoorSlideOpen();
      })
      .to(dom.nodeVaultDoor, { scale: 1.04, duration: 0.4 })
      .call(() => {
        enterRoomById('tunnels', true);
      });
  }

  // --------------------------------------------------------------------------
  // ROOM 04 — COOLING TUNNELS
  // --------------------------------------------------------------------------

  function updateTunnelsVisuals() {
    if (!window.gameManager) return;
    const state = window.gameManager.getState();
    const fuses = state.fusesLit || [];
    const booster = Boolean(state.boosterClaimed);
    const ready = booster;

    if (dom.tunnelsFuseReadout) dom.tunnelsFuseReadout.textContent = `${fuses.length} / 3`;

    if (dom.nodePipePanel) {
      if (booster) {
        dom.nodePipePanel.classList.add('solved');
        if (dom.pipeObjIndicator) dom.pipeObjIndicator.className = 'node-status-indicator emerald';
        if (dom.pipeTapHint) dom.pipeTapHint.textContent = IS_TOUCH_DEVICE ? '// TAP TO REVIEW' : '// CLICK TO REVIEW';
      } else if (dom.pipeObjIndicator) {
        dom.pipeObjIndicator.className = 'node-status-indicator red';
      }
    }

    if (dom.nodePressureGate) {
      if (ready) {
        dom.nodePressureGate.classList.add('door-ready');
        if (dom.gateNodeTitle) dom.gateNodeTitle.textContent = 'HYDRAULIC GATE // BOOST READY';
        if (dom.gateStatusIndicator) dom.gateStatusIndicator.className = 'node-status-indicator emerald';
        if (dom.gateAccessLabel) {
          dom.gateAccessLabel.textContent = 'GATE STATUS: PUMP REQUIRED';
          dom.gateAccessLabel.style.color = 'var(--accent-amber)';
        }
        if (dom.gateAccessSub) {
          dom.gateAccessSub.textContent = '// BOOSTER EQUIPPED — HOLD TO PUMP';
          dom.gateAccessSub.style.color = 'var(--accent-emerald)';
        }
        if (dom.gateTapHint) dom.gateTapHint.textContent = IS_TOUCH_DEVICE ? '// TAP TO START BOOST' : '// CLICK TO START BOOST';
      } else {
        dom.nodePressureGate.classList.remove('door-ready');
        if (dom.gateNodeTitle) dom.gateNodeTitle.textContent = 'HYDRAULIC GATE';
        if (dom.gateStatusIndicator) dom.gateStatusIndicator.className = 'node-status-indicator red';
        if (dom.gateAccessLabel) {
          dom.gateAccessLabel.textContent = 'GATE STATUS: SEALED';
          dom.gateAccessLabel.style.color = 'var(--text-secondary)';
        }
        if (dom.gateAccessSub) {
          dom.gateAccessSub.textContent = booster ? '// BOOSTER EMPTY — REBUILD PRESSURE' : '// HYDRAULICS DEAD — NEEDS PRESSURE BOOSTER';
          dom.gateAccessSub.style.color = 'var(--accent-red)';
        }
        if (dom.gateTapHint) {
          dom.gateTapHint.textContent = booster
            ? '// EQUIP THE BOOSTER AND PUMP'
            : `// LIGHT ${3 - fuses.length} MORE FUSE${3 - fuses.length === 1 ? '' : 'S'}`;
        }
      }
    }
  }

  function openPipeModal() {
    if (isPipeOpen || isEscapeSequenceActive) return;
    isPipeOpen = true;
    lockBodyScroll();

    const allFuses = window.gameManager?.getState().fusesLit.length >= 3;
    const booster = window.gameManager?.getState().boosterClaimed;
    renderPipeGrid();

    if (dom.pipeGoldStage) {
      if ((booster || allFuses) && !booster) {
        dom.pipeGoldStage.classList.remove('d-none');
      } else {
        dom.pipeGoldStage.classList.add('d-none');
      }
    }

    if (dom.pipeModal) {
      dom.pipeModal.classList.add('active');
      dom.pipeModal.setAttribute('aria-hidden', 'false');
    }
    if (window.audioManager) window.audioManager.playModalOpen();

    if (typeof gsap !== 'undefined' && dom.pipeCard) {
      gsap.fromTo(dom.pipeCard,
        { opacity: 0, scale: 0.92, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out' }
      );
    }
  }

  function closePipeModal() {
    if (!isPipeOpen) return;
    isPipeOpen = false;

    if (typeof gsap !== 'undefined' && dom.pipeCard) {
      gsap.to(dom.pipeCard, {
        opacity: 0, scale: 0.94, y: 16, duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          if (dom.pipeModal) {
            dom.pipeModal.classList.remove('active');
            dom.pipeModal.setAttribute('aria-hidden', 'true');
          }
        }
      });
    } else {
      if (dom.pipeModal) {
        dom.pipeModal.classList.remove('active');
        dom.pipeModal.setAttribute('aria-hidden', 'true');
      }
    }

    if (window.audioManager) window.audioManager.playModalClose();
    unlockBodyScroll();
    updateTunnelsVisuals();
    updateHUD();
  }

  function renderPipeGrid() {
    if (!window.puzzleManager || !dom.pipeRowsEl) return;
    const snapshot = window.puzzleManager.getPipeGridSnapshot();
    if (!snapshot) {
      window.puzzleManager.startPipeSession();
      return renderPipeGrid();
    }

    dom.pipeRowsEl.innerHTML = '';

    snapshot.forEach((rowTiles, rowIdx) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'pipe-row';
      rowEl.dataset.row = String(rowIdx);

      const source = document.createElement('div');
      source.className = 'pipe-endpoint source-hot';
      source.innerHTML = '<span class="endpoint-glyph">☢</span><span>SOURCE<br>' + (rowIdx + 1) + '</span>';
      rowEl.appendChild(source);

      const tileRow = document.createElement('div');
      tileRow.className = 'pipe-tile-row';

      rowTiles.forEach((tile, tileIdx) => {
        const tileBtn = document.createElement('button');
        tileBtn.type = 'button';
        tileBtn.className = 'pipe-tile';
        tileBtn.setAttribute('aria-label', `Valve row ${rowIdx + 1} position ${tileIdx + 1}`);
        tileBtn.dataset.row = String(rowIdx);
        tileBtn.dataset.tile = String(tileIdx);

        const body = document.createElement('span');
        body.className = 'valve-body';
        body.style.transform = `rotate(${tile.current * 90}deg)`;
        tileBtn.appendChild(body);

        if (tile.current % 2 === 0) tileBtn.classList.add('aligned');
        if (window.puzzleManager.isPipeRowFlowing(rowIdx)) {
          tileBtn.classList.add('flowing');
          rowEl.classList.add('flowing');
        }

        tileRow.appendChild(tileBtn);
      });

      rowEl.appendChild(tileRow);

      const fuse = document.createElement('div');
      fuse.className = 'pipe-endpoint fuse-endpoint' + (window.puzzleManager.isPipeRowFlowing(rowIdx) ? ' fuse-lit' : '');
      fuse.innerHTML = '<span class="endpoint-glyph">⚡</span><span>FUSE<br>' + (rowIdx + 1) + '</span>';
      rowEl.appendChild(fuse);

      dom.pipeRowsEl.appendChild(rowEl);
    });

    const flowingCount = [0, 1, 2].filter(r => window.puzzleManager.isPipeRowFlowing(r)).length;
    if (dom.pipeStatusBadge) dom.pipeStatusBadge.textContent = `FUSES: ${Math.max(flowingCount, window.gameManager?.getState().fusesLit.length || 0)} / 3`;
  }

  function handleValveRotate(row, tile) {
    if (!window.puzzleManager) return;
    const result = window.puzzleManager.rotateValve(row, tile);
    if (!result) return;

    if (window.audioManager) window.audioManager.playTerminalKeystroke();

    // Update the rotated tile inline (no full re-render → keeps animation smooth)
    const tileBtn = dom.pipeRowsEl?.querySelector(`.pipe-tile[data-row="${row}"][data-tile="${tile}"]`);
    if (tileBtn) {
      const body = tileBtn.querySelector('.valve-body');
      if (body) body.style.transform = `rotate(${result.current * 90}deg)`;
      if (result.current % 2 === 0) {
        tileBtn.classList.add('aligned');
      } else {
        tileBtn.classList.remove('aligned');
      }
    }

    if (result.rowFlowing) {
      const rowEl = dom.pipeRowsEl?.querySelector(`.pipe-row[data-row="${row}"]`);
      if (rowEl) {
        rowEl.classList.add('flowing');
        const fuseEl = rowEl.querySelector('.fuse-endpoint');
        if (fuseEl) fuseEl.classList.add('fuse-lit');
      }
      if (window.audioManager) window.audioManager.playTargetHit('standard', 1);

      const fuseId = `fuse_${row + 1}`;
      if (!window.gameManager.getState().fusesLit.includes(fuseId)) {
        window.gameManager.lightFuse(fuseId);
        if (window.trackEvent) window.trackEvent('fuse_lit', { count: window.gameManager.getState().fusesLit.length });
        showToast(`// COOLANT FUSE ${row + 1} LIT • ${window.gameManager.getState().fusesLit.length} / 3`);
      }
    }

    if (result.allRowsFlowing) {
      setTimeout(() => {
        if (dom.pipeGoldStage) dom.pipeGoldStage.classList.remove('d-none');
        if (dom.pipeStatusBadge) dom.pipeStatusBadge.textContent = 'FUSES: 3 / 3';
        if (window.audioManager) window.audioManager.playArcadeVictory();
        showToast('// ALL FUSES LIT • PRESSURE BOOSTER READY');
      }, 500);
    }

    updateTunnelsVisuals();
    updateHUD();
  }

  function handleClaimBooster() {
    if (!window.gameManager) return;
    const claimed = window.gameManager.claimBooster();
    if (!claimed) return;

    if (window.audioManager) window.audioManager.playKeyExtractChime();
    showToast('// PRESSURE BOOSTER SECURED • +200 PTS');
    if (window.trackEvent) window.trackEvent('booster_claimed');

    if (dom.pipeGoldStage) dom.pipeGoldStage.classList.add('d-none');
    updateTunnelsVisuals();
    updateHUD();
    setTimeout(() => {
      closePipeModal();
      showToast('// TAKE THE BOOSTER TO THE HYDRAULIC GATE');
    }, 1100);
  }

  /**
   * Room 04 door: boost pump interaction. First click equips the booster,
   * then holding the pump button fills the pressure gauge against leaks.
   */
  function handleGateClick() {
    if (!window.gameManager || isRoomTransitionActive || isEscapeSequenceActive) return;
    const state = window.gameManager.getState();

    if (!state.boosterClaimed) {
      if (window.audioManager) window.audioManager.playLockedSound();
      const copy = DOOR_LOCKED_COPY.tunnels;
      openModal(
        '// HYDRAULIC GATE // GATE-H',
        `<h4 class="h5 fw-bold text-light mb-2 font-monospace">${copy.title}</h4>
         <p class="text-secondary small mb-0">${copy.body}</p>`,
        `<div class="text-muted">// Gate Diagnostics:</div>` +
          copy.diag.map(d => `<div>${d}</div>`).join('') +
          `<div class="text-warning mt-2">&gt; "Light all 3 coolant fuses to rebuild the pressure booster."</div>`
      );
      return;
    }

    // Equip mode: reveal the pressure UI and start pumping
    if (dom.gatePressureWrap) dom.gatePressureWrap.classList.remove('d-none');
    if (dom.gateTapHint) dom.gateTapHint.textContent = IS_TOUCH_DEVICE ? '// HOLD TO PUMP — REACH 100%' : '// HOLD TO PUMP — REACH 100%';
    startBoostPumping();
  }

  function startBoostPumping() {
    if (boostPumpInterval) return;
    boostPressure = boostPressure || 0;
    boostPumping = false;

    if (dom.btnBoostPump) {
      dom.btnBoostPump.disabled = false;
    }

    const tick = () => {
      if (isRoomTransitionActive) return stopBoostPumping();
      if (boostPumping) {
        boostPressure = Math.min(100, boostPressure + 3.4);
      } else {
        boostPressure = Math.max(0, boostPressure - 1.15);
      }
      renderBoostGauge();
      if (boostPressure >= 100) {
        stopBoostPumping();
        triggerGateBlast();
      }
    };

    boostPumpInterval = setInterval(tick, 90);
  }

  function stopBoostPumping() {
    if (boostPumpInterval) {
      clearInterval(boostPumpInterval);
      boostPumpInterval = null;
    }
    boostPumping = false;
  }

  function renderBoostGauge() {
    if (dom.gatePressureFill) dom.gatePressureFill.style.width = `${boostPressure}%`;
    if (dom.gatePressureValue) {
      dom.gatePressureValue.textContent = `${Math.round(boostPressure)}%`;
      dom.gatePressureValue.style.color = boostPressure > 70 ? 'var(--accent-emerald)' : boostPressure > 35 ? 'var(--accent-amber)' : 'var(--accent-red)';
    }
    if (dom.gateAccessLabel) {
      dom.gateAccessLabel.textContent = boostPressure >= 100 ? 'GATE STATUS: OPENING' : `PRESSURE: ${Math.round(boostPressure)}%`;
    }
  }

  function bindBoostPumpEvents() {
    if (!dom.btnBoostPump) return;
    const start = (e) => {
      e.preventDefault();
      boostPumping = true;
      dom.btnBoostPump.classList.add('pumping');
    };
    const stop = () => {
      boostPumping = false;
      dom.btnBoostPump.classList.remove('pumping');
    };

    dom.btnBoostPump.addEventListener('pointerdown', start);
    dom.btnBoostPump.addEventListener('pointerup', stop);
    dom.btnBoostPump.addEventListener('pointerleave', stop);
    dom.btnBoostPump.addEventListener('pointercancel', stop);
  }

  /**
   * Room 04 door cinematic: steam blasts, gates fly open.
   */
  function triggerGateBlast() {
    if (isRoomTransitionActive || isEscapeSequenceActive) return;
    isRoomTransitionActive = true;
    isEscapeSequenceActive = true;

    stopBoostPumping();
    if (dom.btnBoostPump) dom.btnBoostPump.disabled = true;

    if (window.audioManager) window.audioManager.playDoorPowerUp();

    if (!isGsapReady() || !dom.nodePressureGate) {
      if (dom.nodePressureGate) dom.nodePressureGate.classList.add('blasting');
      enterRoomById('core', true);
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.call(() => {
      if (dom.gateAccessLabel) dom.gateAccessLabel.textContent = 'GATE STATUS: CRITICAL';
      if (dom.gateAccessSub) dom.gateAccessSub.textContent = '// OVERPRESSURE WARNING';
      if (window.audioManager) window.audioManager.playTimerWarning();
    })
      .to(dom.gatePressureFill, { backgroundColor: '#00ff88', duration: 0.3 })
      .call(() => {
        if (dom.nodePressureGate) dom.nodePressureGate.classList.add('blasting');
        if (dom.gateAccessLabel) dom.gateAccessLabel.textContent = 'GATE: BLASTING OPEN';
        if (dom.gateAccessSub) dom.gateAccessSub.textContent = '// STEAM VENTS ENGAGED';
        if (window.audioManager) window.audioManager.playDoorSlideOpen();
        if (window.trackEvent) window.trackEvent('gate_blasted');
      })
      .to(dom.gatePanelLeft, { x: '-104%', duration: 1.1, ease: 'power3.inOut' }, '+=0.35')
      .to(dom.gatePanelRight, { x: '104%', duration: 1.1, ease: 'power3.inOut' }, '<')
      .to(dom.nodePressureGate, {
        x: () => (Math.random() - 0.5) * 6,
        y: () => (Math.random() - 0.5) * 4,
        repeat: 8,
        yoyo: true,
        duration: 0.07,
        ease: 'none'
      }, '<')
      .set(dom.nodePressureGate, { x: 0, y: 0 })
      .call(() => {
        enterRoomById('core', true);
      });
  }

  // --------------------------------------------------------------------------
  // ROOM 05 — THE CORE
  // --------------------------------------------------------------------------

  function updateCoreVisuals() {
    if (!window.gameManager) return;
    const state = window.gameManager.getState();
    const frags = state.fragmentsCollected || [];
    const ready = frags.length >= 3;

    dom.fragmentNodes.forEach((fragEl, i) => {
      if (!fragEl) return;
      const fragId = `frag_${i + 1}`;
      if (frags.includes(fragId)) {
        fragEl.classList.add('recovered');
        fragEl.style.pointerEvents = 'none';
      }
    });

    if (dom.coreInventoryReadout) dom.coreInventoryReadout.textContent = `FRAGMENTS: ${frags.length} / 3`;

    if (dom.nodeCoreConsole) {
      if (ready) {
        dom.nodeCoreConsole.classList.add('door-ready');
        if (dom.coreNodeTitle) dom.coreNodeTitle.textContent = 'CORE CONSOLE // READY';
        if (dom.coreStatusIndicator) dom.coreStatusIndicator.className = 'node-status-indicator emerald';
        if (dom.coreAccessSub) {
          dom.coreAccessSub.textContent = '// FRAGMENTS SEATED — IGNITE THE CORE';
          dom.coreAccessSub.style.color = 'var(--accent-emerald)';
        }
        if (dom.coreTapHint) dom.coreTapHint.textContent = IS_TOUCH_DEVICE ? '// TAP TO IGNITE' : '// CLICK TO IGNITE';
      } else {
        dom.nodeCoreConsole.classList.remove('door-ready');
        if (dom.coreNodeTitle) dom.coreNodeTitle.textContent = 'CORE IGNITION CONSOLE';
        if (dom.coreStatusIndicator) dom.coreStatusIndicator.className = 'node-status-indicator red';
        if (dom.coreAccessSub) {
          dom.coreAccessSub.textContent = '// REACTOR DORMANT — INSERT FRAGMENTS';
          dom.coreAccessSub.style.color = 'var(--accent-red)';
        }
        if (dom.coreTapHint) dom.coreTapHint.textContent = `// REQUIRES ${3 - frags.length} MORE FRAGMENT${3 - frags.length === 1 ? '' : 'S'}`;
      }
    }
  }

  function handleFragmentCollect(fragIndex) {
    if (!window.gameManager) return;
    const fragId = `frag_${fragIndex + 1}`;
    const collected = window.gameManager.collectFragment(fragId);
    if (!collected) return;

    if (window.audioManager) window.audioManager.playBonusTargetHit();

    const fragEl = dom.fragmentNodes[fragIndex];
    if (fragEl) {
      fragEl.classList.add('recovered');
      fragEl.style.pointerEvents = 'none';
    }

    if (window.trackEvent) window.trackEvent('fragment_collected', { count: (window.gameManager.getState().fragmentsCollected || []).length });
    showToast(`// CORE FRAGMENT RECOVERED • ${(window.gameManager.getState().fragmentsCollected || []).length} / 3`);

    updateCoreVisuals();
    updateHUD();
  }

  function openCoreModal() {
    if (isCoreOpen || isEscapeSequenceActive) return;
    isCoreOpen = true;
    lockBodyScroll();

    const state = window.gameManager ? window.gameManager.getState() : { fragmentsCollected: [], goldChip: false, keysCollected: [] };
    const frags = (state.fragmentsCollected || []).length;

    if (dom.coreInvFragments) {
      dom.coreInvFragments.textContent = `◆ FRAGMENTS ${frags}/3`;
      dom.coreInvFragments.classList.toggle('ready', frags >= 3);
    }
    if (dom.coreInvChip) {
      dom.coreInvChip.classList.toggle('ready', Boolean(state.goldChip));
    }
    if (dom.coreInvKeys) {
      const keys = (state.keysCollected || []).length;
      dom.coreInvKeys.textContent = `⚿ CIPHER KEYS ${keys}/3`;
      dom.coreInvKeys.classList.toggle('ready', keys >= 3);
    }

    if (dom.coreModal) {
      dom.coreModal.classList.add('active');
      dom.coreModal.setAttribute('aria-hidden', 'false');
    }
    if (window.audioManager) window.audioManager.playModalOpen();

    if (typeof gsap !== 'undefined' && dom.coreCard) {
      gsap.fromTo(dom.coreCard,
        { opacity: 0, scale: 0.92, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out' }
      );
    }
  }

  function closeCoreModal() {
    if (!isCoreOpen) return;
    isCoreOpen = false;
    stopCoreDecay();

    if (typeof gsap !== 'undefined' && dom.coreCard) {
      gsap.to(dom.coreCard, {
        opacity: 0, scale: 0.94, y: 16, duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          if (dom.coreModal) {
            dom.coreModal.classList.remove('active');
            dom.coreModal.setAttribute('aria-hidden', 'true');
          }
        }
      });
    } else {
      if (dom.coreModal) {
        dom.coreModal.classList.remove('active');
        dom.coreModal.setAttribute('aria-hidden', 'true');
      }
    }

    if (window.audioManager) window.audioManager.playModalClose();
    unlockBodyScroll();
    updateCoreVisuals();
    updateHUD();
  }

  function startCoreSession() {
    if (!window.puzzleManager) return;
    window.puzzleManager.startCoreSession();
    renderCoreEnergy();
    if (dom.coreStatusBadge) dom.coreStatusBadge.textContent = 'STATUS: CHARGING';
    if (dom.coreInstruction) {
      dom.coreInstruction.textContent = 'Fragments seated. Charge decays fast — TAP the button as hard as you can to reach 100%.';
    }
    if (dom.btnChannelEnergy) dom.btnChannelEnergy.disabled = false;

    stopCoreDecay();
    coreDecayInterval = setInterval(() => {
      if (!isCoreOpen) return stopCoreDecay();
      const energy = window.puzzleManager.decayCoreEnergy();
      if (energy !== null) renderCoreEnergy();
    }, 100);
  }

  function stopCoreDecay() {
    if (coreDecayInterval) {
      clearInterval(coreDecayInterval);
      coreDecayInterval = null;
    }
  }

  function renderCoreEnergy() {
    if (!window.puzzleManager) return;
    const core = window.puzzleManager.getCoreState();
    if (!core) return;

    if (dom.coreEnergyFill) dom.coreEnergyFill.style.width = `${Math.round(core.energy)}%`;
    if (dom.coreEnergyValue) dom.coreEnergyValue.textContent = `${Math.round(core.energy)}%`;
    if (dom.coreTapCounter) dom.coreTapCounter.textContent = `TAPS: ${core.taps}`;

    if (core.reached || core.solved) {
      if (dom.coreStatusBadge) dom.coreStatusBadge.textContent = 'STATUS: CRITICAL MASS';
      if (dom.btnChannelEnergy) dom.btnChannelEnergy.disabled = true;
      stopCoreDecay();
      if (dom.coreIgnitionStage && dom.coreIgnitionStage.classList.contains('d-none')) {
        dom.coreIgnitionStage.classList.remove('d-none');
        if (window.audioManager) window.audioManager.playArcadeVictory();
      }
    }
  }

  function handleChannelEnergy() {
    if (!window.puzzleManager) return;
    const core = window.puzzleManager.getCoreState();
    if (!core) return;

    if (!core.active && !core.solved) {
      startCoreSession();
      return;
    }
    if (!core.active) return;

    const result = window.puzzleManager.tapCoreEnergy();
    if (!result) return;

    if (dom.btnChannelEnergy) {
      dom.btnChannelEnergy.classList.add('zap');
      setTimeout(() => {
        if (dom.btnChannelEnergy) dom.btnChannelEnergy.classList.remove('zap');
      }, 110);
    }
    if (window.audioManager) window.audioManager.playTargetTelegraph();

    renderCoreEnergy();
  }

  /**
   * Room 05 finale: core overload + launch cinematic, then the result
   * screen router shows the final victory (last room).
   */
  function triggerCoreLaunch() {
    if (isRoomTransitionActive || isEscapeSequenceActive) return;
    isRoomTransitionActive = true;
    isEscapeSequenceActive = true;

    if (!window.gameManager) { finishCoreLaunchFallback(); return; }

    window.gameManager.addScore(500);
    if (window.trackEvent) window.trackEvent('core_ignited');

    closeCoreModal();

    [dom.nodeCoreLog, dom.nodeCoreConsole].forEach(el => {
      if (el) el.style.pointerEvents = 'none';
    });

    if (window.audioManager) window.audioManager.playEscapeInit();

    if (!isGsapReady() || !dom.stageCore) {
      finishCoreLaunchFallback();
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.call(() => {
      if (dom.coreAccessSub) dom.coreAccessSub.textContent = '// CRITICAL MASS — IGNITION SEQUENCE';
      if (dom.coreHeartIcon) dom.coreHeartIcon.style.color = '#ffffff';
    })
      .to(dom.coreReactorHeart, { scale: 1.5, duration: 0.5, ease: 'power2.in' })
      .to(dom.coreReactorHeart, { scale: 1, duration: 0.35 })
      .to(dom.coreReactorHeart, { scale: 1.8, duration: 0.5, ease: 'power2.in' })
      .call(() => {
        if (dom.coreAccessSub) dom.coreAccessSub.textContent = '// CORE OVERLOAD — LAUNCH IMMINENT';
        if (window.audioManager) window.audioManager.playDoorPowerUp();
      })
      .to(dom.nodeCoreConsole, {
        x: () => (Math.random() - 0.5) * 8,
        y: () => (Math.random() - 0.5) * 6,
        repeat: 10,
        yoyo: true,
        duration: 0.08,
        ease: 'none'
      })
      .set(dom.nodeCoreConsole, { x: 0, y: 0 })
      .to(dom.coreReactorHeart, { scale: 3.2, opacity: 0.9, duration: 0.8, ease: 'power3.in' })
      .to(dom.stageCore, { scale: 1.25, opacity: 0.85, duration: 1.6, ease: 'power3.in' }, '<')
      .to(dom.escapeWhiteWash, { opacity: 1, duration: 0.8, ease: 'power2.in' }, '-=0.7')
      .call(() => {
        showEscapeResultScreen(true);
      });
  }

  function finishCoreLaunchFallback() {
    if (dom.stageCore) dom.stageCore.style.opacity = '0.85';
    if (dom.escapeWhiteWash) dom.escapeWhiteWash.style.opacity = '1';
    if (window.audioManager) window.audioManager.stopAmbientDrone();
    showEscapeResultScreen(true);
  }

  // --------------------------------------------------------------------------
  // GOLD TOKENS
  // --------------------------------------------------------------------------

  /**
   * Restore gold token collected states from the save (mid-run reloads).
   */
  function refreshGoldTokenVisuals() {
    if (!window.gameManager) return;
    const tokens = window.gameManager.getState().goldTokens || [];
    Object.entries(GOLD_TOKEN_ELEMENTS).forEach(([roomId, getter]) => {
      const el = getter();
      if (!el) return;
      if (tokens.includes(roomId)) {
        el.classList.add('collected');
        el.style.pointerEvents = 'none';
        const label = el.querySelector('.gold-token-label');
        if (label) label.textContent = '◉ GOLD';
      } else {
        el.classList.remove('collected');
        el.style.pointerEvents = 'auto';
        const label = el.querySelector('.gold-token-label');
        if (label) label.textContent = '?';
      }
    });
  }

  function handleGoldTokenCollect(roomId, el) {
    if (!window.gameManager) return;
    const collected = window.gameManager.collectGoldToken(roomId);
    if (!collected) return;

    if (window.audioManager) window.audioManager.playKeyExtractChime();
    if (el) el.classList.add('collected');
    if (el) {
      const label = el.querySelector('.gold-token-label');
      if (label) label.textContent = '◉ GOLD';
    }

    const total = (window.gameManager.getState().goldTokens || []).length;
    if (window.trackEvent) window.trackEvent('gold_token_collected', { room: roomId, count: total });
    showToast(`// GOLD TOKEN SECURED • ${total}/5 • +100 PTS`);
    updateHUD();
  }

  // --------------------------------------------------------------------------
  // SHOW ESCAPE RESULT SCREEN — routes between room transition and victory
  // --------------------------------------------------------------------------

  function isFinalRoomComplete() {
    if (!window.gameManager) return false;
    const roomId = currentRoomId;
    const idx = ROOM_SEQUENCE.indexOf(roomId);
    return idx >= ROOM_SEQUENCE.length - 1;
  }

  function beginNextRoomTransition() {
    const nextIdx = Math.min(ROOM_SEQUENCE.length - 1, ROOM_SEQUENCE.indexOf(currentRoomId) + 1);
    const nextRoom = ROOM_SEQUENCE[nextIdx];

    // Record the finished room's time
    const startedAt = roomEntryTimestamps[currentRoomId];
    if (startedAt && window.gameManager) {
      window.gameManager.recordRoomTime(currentRoomId, Date.now() - startedAt);
    }

    // Story beat: the first door does NOT escape — it descends.
    setTimeout(() => {
      enterRoomById(nextRoom, true);
      if (nextRoom === 'orbatrium') {
        setTimeout(() => {
          showToast('// TWIST: THAT DOOR WAS NOT THE EXIT — DESCENDING TO SUB-LEVEL 02');
        }, 2600);
      }
    }, 650);
  }

  setupEventListeners();

  /**
   * GSAP Cinematic Intro Sequence
   */
  function playCinematicIntro() {
    if (!isGsapReady()) {
      // Mirror the gsap.set() pre-state below: the intro screen has to be put back
      // on screen (Play Again leaves it at display:none) and the world hidden.
      if (dom.introScreen) {
        dom.introScreen.style.display = 'flex';
        dom.introScreen.style.opacity = '1';
      }
      if (dom.gameWorld) dom.gameWorld.style.opacity = '0';
      if (dom.introEyebrow) dom.introEyebrow.style.opacity = '1';
      if (dom.introTitle) dom.introTitle.style.opacity = '1';
      if (dom.introSubtitle) dom.introSubtitle.style.opacity = '1';
      if (dom.introCta) dom.introCta.style.opacity = '1';
      return;
    }

    gsap.set([dom.introEyebrow, dom.introTitle, dom.introSubtitle, dom.introCta], {
      opacity: 0,
      y: 18
    });
    gsap.set(dom.introScreen, { opacity: 1, scale: 1, display: 'flex' });
    gsap.set(dom.gameWorld, { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(dom.introEyebrow, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      delay: 0.2
    })
      .to(dom.introTitle, {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: 'power4.out'
      }, '-=0.4')
      .to(dom.introSubtitle, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power2.out'
      }, '-=0.7')
      .to(dom.introCta, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'back.out(1.3)'
      }, '-=0.4');
  }

  /**
   * Transition into the Game World (Fires GA4 game_start)
   */
  function transitionToGameWorld() {
    if (isTransitioning) return;
    isTransitioning = true;

    // Fire GA4 game_start event once per gameplay run
    if (window.analyticsManager) {
      window.analyticsManager.trackUniqueEvent('run_game_start', 'game_start');
    } else if (window.trackEvent) {
      window.trackEvent('game_start');
    }

    if (window.audioManager) {
      window.audioManager.playEnterSound();
    }

    if (window.gameManager) {
      window.gameManager.startGame();
      updateHUD();
      updateLobbyVisuals();
    }

    if (isGsapReady()) {
      const tl = gsap.timeline({
        onComplete: () => {
          if (dom.introScreen) dom.introScreen.style.display = 'none';
          if (dom.gameWorld) {
            dom.gameWorld.classList.add('active');
            dom.gameWorld.setAttribute('aria-hidden', 'false');
          }
          isTransitioning = false;
          // Post-entry onboarding/timer hook. Optional so the cinematic stays
          // runnable in isolated environments (regression harnesses) as well.
          if (typeof afterEnterGameWorld === 'function') {
            afterEnterGameWorld();
          }
        }
      });

      tl.to(dom.introTitle, {
        scale: 1.12,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.8,
        ease: 'power3.in'
      }, 0)
        .to(dom.introSubtitle, {
          opacity: 0,
          y: -12,
          duration: 0.5
        }, 0.1)
        .to(dom.introCta, {
          scale: 0.92,
          opacity: 0,
          duration: 0.4
        }, 0.1)
        .to(dom.introScreen, {
          opacity: 0,
          duration: 0.9,
          ease: 'power2.inOut'
        }, 0.25)
        .to(dom.gameWorld, {
          opacity: 1,
          duration: 1.0,
          ease: 'power2.out'
        }, 0.5);
    } else {
      // Degraded transition: swap the screens instantly, same end state as the tween
      if (dom.introScreen) dom.introScreen.style.display = 'none';
      if (dom.gameWorld) {
        dom.gameWorld.classList.add('active');
        dom.gameWorld.setAttribute('aria-hidden', 'false');
        dom.gameWorld.style.opacity = '1';
      }
      isTransitioning = false;
      if (typeof afterEnterGameWorld === 'function') {
        afterEnterGameWorld();
      }
    }
  }

  /**
   * Runs once the player lands in the game world (fresh entry).
   * Starts the HUD timer, arms the idle nudge and opens the mission
   * briefing automatically for first-time players.
   */
  function afterEnterGameWorld() {
    startHudTimer();
    scheduleNudgeHint();
    restoreSavedRoomStage();

    if (!hasSeenOnboarding()) {
      setTimeout(() => {
        if (!isEscapeSequenceActive) showMissionBriefing('first-run');
      }, 450);
    }
  }

  /**
   * v3: resume a saved run in the room the player actually reached.
   * The DOM always boots on the Lobby stage, so a mid-run reload must swap
   * the visible stage to match the persisted currentRoom.
   */
  function restoreSavedRoomStage() {
    if (!window.gameManager) return;
    const st = window.gameManager.getState();
    if (!st.gameStarted || st.gameCompleted) return;

    const savedRoom = ROOM_SEQUENCE.includes(st.currentRoom) ? st.currentRoom : 'lobby';
    currentRoomId = savedRoom;

    if (savedRoom !== 'lobby') {
      roomEntryTimestamps[savedRoom] = roomEntryTimestamps[savedRoom] || Date.now();
      window.gameManager.enterRoom(savedRoom);

      ROOM_SEQUENCE.forEach((rid) => {
        const el = ROOM_STAGE_ELEMENTS[rid]?.();
        if (el) {
          el.style.display = 'none';
          el.classList.remove('active');
          el.setAttribute('aria-hidden', 'true');
        }
      });

      const toEl = ROOM_STAGE_ELEMENTS[savedRoom]?.();
      if (toEl) {
        toEl.style.display = 'flex';
        toEl.classList.add('active');
        toEl.setAttribute('aria-hidden', 'false');
      }

      showToast(`// SESSION RESTORED • RESUMING ${window.gameManager.rooms[savedRoom]?.number || ''}`);
    }

    refreshRoomVisuals();
    updateHUD();
  }

  /**
   * Update HUD indicators
   */
  function updateHUD() {
    if (!window.gameManager) return;
    const state = window.gameManager.getState();
    const roomInfo = inSector02 ? window.gameManager.rooms.sector02 : window.gameManager.getCurrentRoomInfo();
    const progress = inSector02
      ? { have: state.keysCollected.length, total: 3, label: 'KEYS' }
      : window.gameManager.getRoomProgress(currentRoomId);

    if (dom.hudRoomBadge) dom.hudRoomBadge.textContent = roomInfo.number;
    if (dom.hudRoomName) dom.hudRoomName.textContent = roomInfo.name;
    if (dom.hudKeysCounter) dom.hudKeysCounter.textContent = `${progress.have} / ${progress.total}`;
    if (dom.hudCollectibleLabel) dom.hudCollectibleLabel.textContent = progress.label;
    updateHudTimerDisplay();
    renderObjectives();

    if (dom.keySlots) {
      dom.keySlots.forEach((slot, index) => {
        if (slot) {
          if (index < progress.have) {
            slot.classList.add('collected');
          } else {
            slot.classList.remove('collected');
          }
        }
      });
    }

    if (dom.hudAllKeysBanner) {
      const readyText = ROOM_READY_BANNERS[currentRoomId] || '• ALL 3 ACCESS KEYS RECOVERED •';
      if (progress.have >= progress.total && !inSector02) {
        if (dom.hudAllKeysBanner.textContent !== readyText) {
          dom.hudAllKeysBanner.textContent = readyText;
        }
        dom.hudAllKeysBanner.classList.remove('d-none');
      } else {
        dom.hudAllKeysBanner.classList.add('d-none');
      }
    }
  }

  /**
   * Update Lobby elements based on puzzle completion
   */
  function updateLobbyVisuals() {
    if (!window.gameManager) return;
    const state = window.gameManager.getState();
    const key1Found = state.keysCollected.includes('key_01');
    const key2Found = state.keysCollected.includes('key_02');
    const key3Found = state.keysCollected.includes('key_03');
    const allKeysFound = state.keysCollected.length >= 3;
    const inspectWording = IS_TOUCH_DEVICE ? '// TAP TO INSPECT' : '// CLICK TO INSPECT';

    // Resonator (Key 01)
    if (dom.nodeStrangeObject) {
      if (key1Found) {
        dom.nodeStrangeObject.classList.add('solved');
        if (dom.resonatorObjIndicator) dom.resonatorObjIndicator.className = 'node-status-indicator emerald';
        if (dom.resonatorObjHint) {
          dom.resonatorObjHint.textContent = '// RESONANCE CALIBRATED';
          dom.resonatorObjHint.style.color = 'var(--accent-emerald)';
        }
      } else {
        dom.nodeStrangeObject.classList.remove('solved');
        if (dom.resonatorObjIndicator) dom.resonatorObjIndicator.className = 'node-status-indicator amber';
        if (dom.resonatorObjHint) {
          dom.resonatorObjHint.textContent = '// DORMANT FLUX DETECTED';
          dom.resonatorObjHint.style.color = 'var(--text-muted)';
        }
      }
    }

    if (dom.resonatorTapHint) dom.resonatorTapHint.textContent = inspectWording;
    if (dom.terminalTapHint) dom.terminalTapHint.textContent = inspectWording;
    if (dom.arcadeTapHint) dom.arcadeTapHint.textContent = inspectWording;
    if (dom.doorTapHint) {
      dom.doorTapHint.textContent = allKeysFound
        ? (IS_TOUCH_DEVICE ? '// TAP TO ESCAPE' : '// CLICK TO ESCAPE')
        : `// REQUIRES ${3 - state.keysCollected.length} MORE KEY${3 - state.keysCollected.length === 1 ? '' : 'S'}`;
    }

    // Terminal (Key 02)
    if (dom.nodeTerminal) {
      if (key2Found) {
        dom.nodeTerminal.classList.add('solved');
        if (dom.terminalObjIndicator) dom.terminalObjIndicator.className = 'node-status-indicator emerald';
        if (dom.terminalPreviewStatus) {
          dom.terminalPreviewStatus.textContent = '> [✓] PROTOCOL DEACTIVATED';
          dom.terminalPreviewStatus.className = 'terminal-code-line text-success';
        }
      } else {
        dom.nodeTerminal.classList.remove('solved');
        if (dom.terminalObjIndicator) dom.terminalObjIndicator.className = 'node-status-indicator active';
        if (dom.terminalPreviewStatus) {
          dom.terminalPreviewStatus.textContent = '> [!] ACCESS RESTRICTED';
          dom.terminalPreviewStatus.className = 'terminal-code-line text-warning';
        }
      }
    }

    // Arcade (Key 03)
    if (dom.nodeArcade) {
      if (key3Found) {
        dom.nodeArcade.classList.add('solved');
        if (dom.arcadeObjIndicator) dom.arcadeObjIndicator.className = 'node-status-indicator emerald';
        if (dom.arcadePreviewTag) {
          dom.arcadePreviewTag.textContent = 'STATUS: DEFEATED';
          dom.arcadePreviewTag.className = 'arcade-status-tag text-success';
        }
      } else {
        dom.nodeArcade.classList.remove('solved');
        if (dom.arcadeObjIndicator) dom.arcadeObjIndicator.className = 'node-status-indicator amber';
        if (dom.arcadePreviewTag) {
          dom.arcadePreviewTag.textContent = 'STATUS: READY';
          dom.arcadePreviewTag.className = 'arcade-status-tag';
        }
      }
    }

    // Central Blast Door Reaction when all 3 keys are collected
    if (dom.nodeDoor) {
      if (allKeysFound) {
        dom.nodeDoor.classList.add('door-ready');
        if (dom.doorNodeTitle) dom.doorNodeTitle.textContent = 'SECURITY BARRIER // READY';
        if (dom.doorStatusIndicator) dom.doorStatusIndicator.className = 'node-status-indicator emerald';
        if (dom.doorAccessLabel) {
          dom.doorAccessLabel.textContent = 'OVERRIDE ACCESS: READY';
          dom.doorAccessLabel.style.color = 'var(--accent-emerald)';
        }
        if (dom.doorAccessSub) {
          dom.doorAccessSub.textContent = '// ALL 3 CIPHER KEYS ACCEPTED';
          dom.doorAccessSub.style.color = 'var(--accent-cyan)';
        }
        if (dom.doorLockIcon) {
          dom.doorLockIcon.textContent = '🔓';
        }
      } else {
        dom.nodeDoor.classList.remove('door-ready');
        if (dom.doorNodeTitle) dom.doorNodeTitle.textContent = 'SECURITY BARRIER';
        if (dom.doorStatusIndicator) dom.doorStatusIndicator.className = 'node-status-indicator red';
        if (dom.doorAccessLabel) {
          dom.doorAccessLabel.textContent = 'ACCESS LEVEL: UNKNOWN';
          dom.doorAccessLabel.style.color = 'var(--text-secondary)';
        }
        if (dom.doorAccessSub) {
          dom.doorAccessSub.textContent = '// SEALED BY PROTOCOL';
          dom.doorAccessSub.style.color = 'var(--accent-red)';
        }
        if (dom.doorLockIcon) {
          dom.doorLockIcon.textContent = '✕';
        }
      }
    }
  }

  // =========================================================================
  // SECRET ROOM: SECTOR 02 (THE OBSERVATION CHAMBER)
  // =========================================================================

  function enterSector02() {
    inSector02 = true;

    if (isTerminalOpen) closeTerminalModal();
    if (isResonatorOpen) closeResonatorModal();
    if (isArcadeOpen) closeArcadeModal();
    if (isModalOpen) closeModal();

    if (dom.escapeResultScreen) {
      dom.escapeResultScreen.classList.remove('active');
      dom.escapeResultScreen.setAttribute('aria-hidden', 'true');
    }

    if (dom.gameWorld) {
      dom.gameWorld.style.display = 'flex';
      dom.gameWorld.classList.add('active');
      dom.gameWorld.style.opacity = '1';
    }

    if (window.audioManager) {
      window.audioManager.playSectorAnomaly();
      window.audioManager.playObservationRoomAmbience();
    }

    // GSAP Transition into Sector 02
    if (typeof gsap !== 'undefined') {
      gsap.to(dom.stageLobby, {
        opacity: 0,
        scale: 0.96,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          dom.stageLobby.style.display = 'none';
          dom.stageSector02.style.display = 'flex';
          dom.stageSector02.classList.add('active');
          dom.stageSector02.setAttribute('aria-hidden', 'false');

          gsap.fromTo(dom.stageSector02,
            { opacity: 0, scale: 1.03 },
            { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' }
          );
        }
      });
    } else {
      dom.stageLobby.style.display = 'none';
      dom.stageSector02.style.display = 'flex';
      dom.stageSector02.classList.add('active');
      dom.stageSector02.style.opacity = '1';
    }

    updateHUD();
    showToast('// SECTOR 02 DETECTED • OBSERVATION CHAMBER ONLINE');
  }

  function leaveSector02() {
    inSector02 = false;

    if (window.audioManager) {
      window.audioManager.playModalClose();
      window.audioManager.startAmbientDrone();
    }

    if (typeof gsap !== 'undefined') {
      gsap.to(dom.stageSector02, {
        opacity: 0,
        scale: 0.96,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          dom.stageSector02.style.display = 'none';
          dom.stageSector02.classList.remove('active');
          dom.stageSector02.setAttribute('aria-hidden', 'true');

          dom.stageLobby.style.display = 'flex';
          gsap.fromTo(dom.stageLobby,
            { opacity: 0, scale: 1.02 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
          );
        }
      });
    } else {
      dom.stageSector02.style.display = 'none';
      dom.stageSector02.classList.remove('active');
      dom.stageLobby.style.display = 'flex';
      dom.stageLobby.style.opacity = '1';
    }

    updateHUD();
    updateLobbyVisuals();
  }

  function handleObservationTerminalCommand(cmdText) {
    const input = cmdText !== undefined ? cmdText : (dom.obsInput?.value || '');
    if (!input.trim() || !window.puzzleManager) return;

    if (dom.obsInput) dom.obsInput.value = '';

    if (window.audioManager) {
      window.audioManager.playTerminalCommandExec();
    }

    const log = document.createElement('div');
    log.className = 'text-light fw-bold';
    log.textContent = `> ${input}`;
    dom.obsTerminalStream.appendChild(log);

    const res = window.puzzleManager.executeObservationTerminalCommand(input);

    if (res.status === 'reveal_trigger') {
      const resp = document.createElement('div');
      resp.className = 'text-warning';
      resp.textContent = res.text;
      dom.obsTerminalStream.appendChild(resp);
      dom.obsTerminalStream.scrollTop = dom.obsTerminalStream.scrollHeight;

      setTimeout(() => {
        triggerSecretReveal();
      }, 1000);
    } else {
      const resp = document.createElement('div');
      resp.className = 'text-info';
      resp.textContent = res.text;
      dom.obsTerminalStream.appendChild(resp);
      dom.obsTerminalStream.scrollTop = dom.obsTerminalStream.scrollHeight;
    }
  }

  /**
   * True only when the animation library is present AND usable.
   * A missing global and a partially initialised one (object without the
   * animation API) both have to fall back, otherwise the cinematic throws
   * after the run has already been locked into the escape state.
   */
  function isGsapReady() {
    return typeof gsap !== 'undefined' && gsap !== null &&
      typeof gsap.timeline === 'function' && typeof gsap.set === 'function';
  }

  function triggerSecretReveal() {
    if (window.gameManager) {
      window.gameManager.discoverSecret();
    }

    if (window.audioManager) {
      window.audioManager.playSectorAnomaly();
    }

    // Nothing can be revealed without the overlay
    if (!dom.obsRevealStage) return;

    dom.obsRevealStage.classList.add('active');
    dom.obsRevealStage.setAttribute('aria-hidden', 'false');

    const revealLines = [dom.revealLine1, dom.revealLine2, dom.revealLine3, dom.revealMainTitle, dom.revealSubQuote];

    if (!isGsapReady()) {
      // Fallback: present the reveal in its final state without animation
      dom.obsRevealStage.style.opacity = '1';
      revealLines.forEach(el => {
        if (!el) return;
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.set(revealLines.filter(Boolean), {
      opacity: 0,
      y: 12
    });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(dom.obsRevealStage, { opacity: 1, duration: 0.5 });

    // Optional reveal lines: each step is skipped when its element is absent
    if (dom.revealLine1) tl.to(dom.revealLine1, { opacity: 1, y: 0, duration: 0.7 }, '+=0.2');
    if (dom.revealLine2) tl.to(dom.revealLine2, { opacity: 1, y: 0, duration: 0.7 }, '+=0.4');
    if (dom.revealLine3) tl.to(dom.revealLine3, { opacity: 1, y: 0, duration: 0.5 }, '+=0.3');
    if (dom.revealMainTitle) tl.to(dom.revealMainTitle, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'back.out(1.2)'
    }, '+=0.5');
    if (dom.revealSubQuote) tl.to(dom.revealSubQuote, { opacity: 1, y: 0, duration: 1.0 }, '+=0.3');
  }

  // =========================================================================
  // FINAL ESCAPE SEQUENCE ORCHESTRATION & RESPONSIVE CAMERA PUSH
  // =========================================================================

  function triggerFinalEscapeSequence() {
    if (isEscapeSequenceActive) return;
    isEscapeSequenceActive = true;

    // 1. Disable all other interactive nodes
    [dom.nodeTerminal, dom.nodeStrangeObject, dom.nodeArcade, dom.nodeDoor].forEach(el => {
      if (el) el.style.pointerEvents = 'none';
    });

    if (window.audioManager) {
      window.audioManager.playEscapeInit();
    }

    // The cinematic needs GSAP plus its two anchor targets. Without them there is
    // nothing to animate, so complete the run instantly instead of stalling.
    if (!isGsapReady() || !dom.escapeSequenceBanner || !dom.stageLobby) {
      finishEscapeSequenceWithoutAnimation();
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    // PHASE 1 — Recognition & Sequence Banner
    dom.escapeSequenceBanner.style.display = 'flex';
    tl.fromTo(dom.escapeSequenceBanner,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.7 }
    )
      .to(dom.escapeBannerTitle, {
        textContent: 'ESCAPE PROTOCOL INITIALIZING...',
        duration: 1.0,
        delay: 0.6
      })

      // PHASE 2 — Ambient Power Shutdown
      .to([dom.layerBg, dom.terminalPreviewStatus, dom.arcadePreviewFrame, dom.mainGameHud].filter(Boolean), {
        opacity: 0.2,
        duration: 1.2,
        ease: 'power1.inOut'
      }, '-=0.4')

      // PHASE 3 — Sequential Lock Releases (Locks 1, 2, 3)
      .call(() => {
        if (dom.lockClamp1) dom.lockClamp1.classList.add('released');
        if (dom.escapeBannerTitle) dom.escapeBannerTitle.textContent = 'LOCK 01 // RELEASED';
        if (window.audioManager) window.audioManager.playLockRelease(1);
      })
      .to(dom.doorLockRing, { rotate: 60, scale: 1.05, duration: 0.4 }, '+=0.2')

      .call(() => {
        if (dom.lockClamp2) dom.lockClamp2.classList.add('released');
        if (dom.escapeBannerTitle) dom.escapeBannerTitle.textContent = 'LOCK 02 // RELEASED';
        if (window.audioManager) window.audioManager.playLockRelease(2);
      }, null, '+=0.6')
      .to(dom.doorLockRing, { rotate: 140, scale: 1.1, duration: 0.4 })

      .call(() => {
        if (dom.lockClamp3) dom.lockClamp3.classList.add('released');
        if (dom.escapeBannerTitle) dom.escapeBannerTitle.textContent = 'LOCK 03 // RELEASED';
        if (window.audioManager) window.audioManager.playLockRelease(3);
      }, null, '+=0.6')
      .to(dom.doorLockRing, { rotate: 240, scale: 1.2, duration: 0.5 })

      // PHASE 4 — Door Power-Up & Energy Conduits Surge
      .call(() => {
        if (dom.escapeBannerTitle) dom.escapeBannerTitle.textContent = 'SECURITY BARRIER // OVERRIDE ACCEPTED';
        if (dom.doorAccessLabel) dom.doorAccessLabel.textContent = 'OVERRIDE: ACCEPTED';
        if (dom.doorAccessSub) dom.doorAccessSub.textContent = '// DISENGAGING HYDRAULICS';
        if (window.audioManager) window.audioManager.playDoorPowerUp();
      }, null, '+=0.5')
      .to(dom.doorFrameOuter, {
        boxShadow: '0 0 60px rgba(0, 255, 136, 0.8), inset 0 0 40px rgba(0, 240, 255, 0.6)',
        borderColor: '#00ff88',
        duration: 1.0
      })
      .to(dom.nodeDoor, {
        x: () => (Math.random() - 0.5) * 5,
        y: () => (Math.random() - 0.5) * 3,
        repeat: 6,
        yoyo: true,
        duration: 0.08,
        ease: 'none'
      }, '-=0.7')
      .set(dom.nodeDoor, { x: 0, y: 0 })

      // PHASE 5 — Door Opening (Panels Retract Horizontally)
      .call(() => {
        if (dom.doorRadiantAperture) dom.doorRadiantAperture.style.opacity = '1';
        if (dom.doorLockRing) dom.doorLockRing.style.opacity = '0';
        if (window.audioManager) window.audioManager.playDoorSlideOpen();
      }, null, '+=0.3')
      .to(dom.doorPanelLeft, { x: '-105%', duration: 2.0, ease: 'power3.inOut' })
      .to(dom.doorPanelRight, { x: '105%', duration: 2.0, ease: 'power3.inOut' }, '<')
      .to(dom.escapeSequenceBanner, { opacity: 0, duration: 0.7 }, '<')

      // PHASE 6 — Silence
      .call(() => {
        if (window.audioManager) window.audioManager.stopAmbientDrone();
      }, null, '+=0.2')

      // PHASE 7 — Responsive Escape Camera Push (Focus on Radiant Aperture)
      .call(() => {
        if (dom.stageLobby && dom.doorFrameOuter) {
          const stageRect = dom.stageLobby.getBoundingClientRect();
          const doorRect = dom.doorFrameOuter.getBoundingClientRect();
          const originX = ((doorRect.left + doorRect.width / 2 - stageRect.left) / stageRect.width) * 100;
          const originY = ((doorRect.top + doorRect.height / 2 - stageRect.top) / stageRect.height) * 100;

          gsap.set(dom.stageLobby, {
            transformOrigin: `${originX.toFixed(2)}% ${originY.toFixed(2)}%`
          });
        }
      })
      .to(dom.stageLobby, {
        scale: 5.5,
        opacity: 0.08,
        duration: 2.4,
        ease: 'power3.in',
        delay: 0.4
      })
      .to(dom.escapeWhiteWash, {
        opacity: 1,
        duration: 1.1,
        ease: 'power2.in'
      }, '-=1.0')
      .call(() => {
        showEscapeResultScreen(true);
      });
  }

  /**
   * Degraded escape path: used when GSAP is unavailable or a core animation target is
   * missing. Applies the final cinematic state instantly so the run still completes
   * instead of leaving the player locked inside the lobby.
   */
  function finishEscapeSequenceWithoutAnimation() {
    if (window.audioManager) {
      window.audioManager.stopAmbientDrone();
    }

    if (dom.escapeSequenceBanner) dom.escapeSequenceBanner.style.display = 'none';

    [dom.lockClamp1, dom.lockClamp2, dom.lockClamp3].forEach(clamp => {
      if (clamp) clamp.classList.add('released');
    });

    if (dom.doorAccessLabel) dom.doorAccessLabel.textContent = 'OVERRIDE: ACCEPTED';
    if (dom.doorAccessSub) dom.doorAccessSub.textContent = '// HYDRAULICS DISENGAGED';
    if (dom.doorRadiantAperture) dom.doorRadiantAperture.style.opacity = '1';
    if (dom.doorLockRing) dom.doorLockRing.style.opacity = '0';
    if (dom.doorPanelLeft) dom.doorPanelLeft.style.transform = 'translateX(-105%)';
    if (dom.doorPanelRight) dom.doorPanelRight.style.transform = 'translateX(105%)';

    showEscapeResultScreen(true);
  }

  function showEscapeResultScreen(playFinalChord = true) {
    // v3 ROUTER: in the five sub-level structure the Security Barrier is NOT
    // the final exit. Rooms 01-04 door openings route into the next sub-level;
    // only the Core launch (last room) reaches the victory screen.
    if (!isFinalRoomComplete()) {
      beginNextRoomTransition();
      return;
    }
    showFinalVictoryScreen(playFinalChord);
  }

  function showFinalVictoryScreen(playFinalChord = true) {
    if (!window.gameManager) return;
    const finalState = window.gameManager.completeGame();

    if (dom.gameWorld) dom.gameWorld.style.display = 'none';
    if (dom.escapeSequenceBanner) dom.escapeSequenceBanner.style.display = 'none';
    if (dom.roomIntroBanner) dom.roomIntroBanner.style.display = 'none';

    stopHudTimer();
    stopBoostPumping();
    stopCoreDecay();
    stopSignalPlayback();
    clearNudgeHint();
    closeObjectivesPanel();

    // Personal best time record (persists across resets)
    let isNewRecord = false;
    let bestMs = getBestTimeMs();
    const finalMs = parseClockToMs(finalState.finalTime);
    if (finalMs !== null && finalMs > 0) {
      incrementRunCounter();
      if (bestMs === null || finalMs < bestMs) {
        bestMs = finalMs;
        saveBestTimeMs(bestMs);
        isNewRecord = true;
      }
    }

    // Rank (S/A/B/C) from total completion time
    const rank = window.gameManager.computeRank(finalMs);

    // Populate Results safely
    if (dom.statTime) {
      dom.statTime.textContent = finalState.finalTime || window.gameManager.getCurrentRunTime() || '02:30';
    }
    if (dom.statScore) {
      dom.statScore.textContent = typeof finalState.score === 'number' ? finalState.score : 900;
    }
    if (dom.statGold) {
      const goldCount = Array.isArray(finalState.goldTokens) ? finalState.goldTokens.length : 0;
      dom.statGold.textContent = `${goldCount} / 5`;
    }
    if (dom.statArcade) {
      dom.statArcade.textContent = typeof finalState.arcadeBestScore === 'number' ? finalState.arcadeBestScore : 0;
    }

    // Rank badge
    if (dom.resultRankBadge && dom.resultRankValue) {
      if (rank) {
        dom.resultRankValue.textContent = rank;
        dom.resultRankBadge.dataset.rank = rank;
        dom.resultRankBadge.classList.remove('rank-badge-hidden');
      } else {
        dom.resultRankBadge.classList.add('rank-badge-hidden');
      }
    }

    // Per-room records line
    if (dom.resultRoomRecords) {
      const rooms = window.gameManager.rooms;
      const lines = [];
      ROOM_SEQUENCE.forEach((roomId) => {
        const ms = finalState.roomBestTimes?.[roomId];
        if (ms) {
          lines.push(`${rooms[roomId]?.number || roomId}: ${formatMsToClock(ms)}`);
        }
      });
      if (finalState.bestRank) {
        lines.unshift(`BEST RANK: ${finalState.bestRank}`);
      }
      dom.resultRoomRecords.textContent = lines.length ? lines.join('  •  ') : '';
    }

    // New Record badge + Personal Best line
    if (dom.resultRecordBadge) {
      if (isNewRecord) {
        dom.resultRecordBadge.classList.remove('d-none');
      } else {
        dom.resultRecordBadge.classList.add('d-none');
      }
    }
    if (dom.resultBestLine && dom.resultBestValue) {
      if (bestMs !== null) {
        dom.resultBestValue.textContent = formatMsToClock(bestMs);
        dom.resultBestLine.classList.remove('d-none');
      } else {
        dom.resultBestLine.classList.add('d-none');
      }
    }

    // Adapt Secret Button state on result screen
    if (dom.btnExploreSecret) {
      if (finalState.secretDiscovered) {
        dom.btnExploreSecret.textContent = 'SECTOR 02 // REVISIT';
        dom.btnExploreSecret.style.borderColor = 'var(--accent-violet)';
        dom.btnExploreSecret.style.color = 'var(--accent-violet)';
        dom.btnExploreSecret.title = 'Re-enter Observation Chamber';
      } else {
        dom.btnExploreSecret.textContent = 'EXPLORE SECRET';
        dom.btnExploreSecret.style.borderColor = 'var(--border-glass)';
        dom.btnExploreSecret.style.color = 'var(--text-primary)';
        dom.btnExploreSecret.title = 'Investigate hidden Sector';
      }
    }

    if (dom.escapeResultScreen) {
      dom.escapeResultScreen.classList.add('active');
      dom.escapeResultScreen.setAttribute('aria-hidden', 'false');
    }

    if (typeof gsap !== 'undefined') {
      gsap.to(dom.escapeWhiteWash, { opacity: 0, duration: 1.2, ease: 'power2.out' });
      gsap.fromTo(dom.escapeResultScreen,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 1.0, ease: 'power3.out' }
      );
    } else {
      if (dom.escapeWhiteWash) dom.escapeWhiteWash.style.opacity = '0';
      if (dom.escapeResultScreen) dom.escapeResultScreen.style.opacity = '1';
    }

    if (playFinalChord && window.audioManager) {
      window.audioManager.playEscapeFinalChord();
    }
  }

  function handlePlayAgain() {
    isEscapeSequenceActive = false;
    inSector02 = false;
    isRoomTransitionActive = false;
    isSignalOpen = false;
    isKeypadOpen = false;
    isPipeOpen = false;
    isCoreOpen = false;
    unlockBodyScroll();

    stopHudTimer();
    stopBoostPumping();
    stopCoreDecay();
    stopSignalPlayback();
    clearNudgeHint();
    closeObjectivesPanel();
    hideMissionBriefing(false);

    if (window.gameManager) {
      window.gameManager.resetState();
    }

    // Reset v3 room runtime
    currentRoomId = 'lobby';
    roomEntryTimestamps = {};
    keypadEntry = '';
    keypadAttempts = 0;
    boostPressure = 0;

    // Reset Door DOM state (Room 01 blast door)
    if (dom.doorPanelLeft) dom.doorPanelLeft.style.transform = 'none';
    if (dom.doorPanelRight) dom.doorPanelRight.style.transform = 'none';
    if (dom.doorRadiantAperture) dom.doorRadiantAperture.style.opacity = '0';
    if (dom.doorLockRing) {
      dom.doorLockRing.style.opacity = '1';
      dom.doorLockRing.style.transform = 'none';
    }
    if (dom.lockClamp1) dom.lockClamp1.classList.remove('released');
    if (dom.lockClamp2) dom.lockClamp2.classList.remove('released');
    if (dom.lockClamp3) dom.lockClamp3.classList.remove('released');

    // Reset Interactive Nodes Pointer Events (Room 01)
    [dom.nodeTerminal, dom.nodeStrangeObject, dom.nodeArcade, dom.nodeDoor].forEach(el => {
      if (el) el.style.pointerEvents = 'auto';
    });

    // ---- Reset Room 02 (Orb Atrium) ----
    dom.orbNodes.forEach(orbEl => {
      if (!orbEl) return;
      orbEl.classList.remove('caught');
      orbEl.style.pointerEvents = 'auto';
    });
    if (dom.nodeLiftDoor) {
      dom.nodeLiftDoor.classList.remove('door-ready', 'opening');
      dom.nodeLiftDoor.style.pointerEvents = 'auto';
    }
    dom.liftSockets.forEach(s => { if (s) s.classList.remove('filled'); });
    if (dom.liftIrisIcon) dom.liftIrisIcon.textContent = '◇';
    if (dom.liftPlatform) dom.liftPlatform.style.transform = 'none';
    if (dom.nodeAtriumConsole) dom.nodeAtriumConsole.style.pointerEvents = 'auto';

    // ---- Reset Room 03 (Signal Vault) ----
    if (dom.nodeSignalConsole) {
      dom.nodeSignalConsole.classList.remove('solved');
      dom.nodeSignalConsole.style.pointerEvents = 'auto';
    }
    if (dom.nodeVaultDoor) {
      dom.nodeVaultDoor.classList.remove('door-ready');
      dom.nodeVaultDoor.style.pointerEvents = 'auto';
    }
    if (dom.nodeVaultArchive) dom.nodeVaultArchive.style.pointerEvents = 'auto';
    dom.vaultBolts.forEach(b => { if (b) b.classList.remove('retracted'); });
    if (dom.vaultWheel) dom.vaultWheel.style.transform = 'none';
    if (dom.vaultWheelIcon) dom.vaultWheelIcon.textContent = '☸';
    if (dom.signalGoldStage) dom.signalGoldStage.classList.add('d-none');
    if (dom.keypadModal) {
      dom.keypadModal.classList.remove('active');
      dom.keypadModal.setAttribute('aria-hidden', 'true');
    }

    // ---- Reset Room 04 (Cooling Tunnels) ----
    if (dom.nodePipePanel) {
      dom.nodePipePanel.classList.remove('solved');
      dom.nodePipePanel.style.pointerEvents = 'auto';
    }
    if (dom.nodePressureGate) {
      dom.nodePressureGate.classList.remove('door-ready', 'blasting');
      dom.nodePressureGate.style.pointerEvents = 'auto';
    }
    if (dom.nodeTunnelsHatch) dom.nodeTunnelsHatch.style.pointerEvents = 'auto';
    if (dom.gatePanelLeft) dom.gatePanelLeft.style.transform = 'none';
    if (dom.gatePanelRight) dom.gatePanelRight.style.transform = 'none';
    if (dom.gatePressureWrap) dom.gatePressureWrap.classList.add('d-none');
    if (dom.gatePressureFill) {
      dom.gatePressureFill.style.width = '0%';
      dom.gatePressureFill.style.backgroundColor = '';
    }
    if (dom.gatePressureValue) dom.gatePressureValue.textContent = '0%';
    if (dom.btnBoostPump) {
      dom.btnBoostPump.disabled = false;
      dom.btnBoostPump.classList.remove('pumping');
    }
    if (dom.pipeModal) {
      dom.pipeModal.classList.remove('active');
      dom.pipeModal.setAttribute('aria-hidden', 'true');
    }
    if (dom.pipeRowsEl) dom.pipeRowsEl.innerHTML = '';
    if (dom.pipeGoldStage) dom.pipeGoldStage.classList.add('d-none');

    // ---- Reset Room 05 (The Core) ----
    dom.fragmentNodes.forEach(fragEl => {
      if (!fragEl) return;
      fragEl.classList.remove('recovered');
      fragEl.style.pointerEvents = 'auto';
    });
    if (dom.nodeCoreConsole) {
      dom.nodeCoreConsole.classList.remove('door-ready');
      dom.nodeCoreConsole.style.pointerEvents = 'auto';
    }
    if (dom.nodeCoreLog) dom.nodeCoreLog.style.pointerEvents = 'auto';
    if (dom.coreReactorHeart) dom.coreReactorHeart.style.transform = 'none';
    if (dom.coreHeartIcon) dom.coreHeartIcon.style.color = '';
    if (dom.coreEnergyFill) dom.coreEnergyFill.style.width = '0%';
    if (dom.coreEnergyValue) dom.coreEnergyValue.textContent = '0%';
    if (dom.coreTapCounter) dom.coreTapCounter.textContent = 'TAPS: 0';
    if (dom.coreIgnitionStage) dom.coreIgnitionStage.classList.add('d-none');
    if (dom.btnChannelEnergy) dom.btnChannelEnergy.disabled = false;
    if (dom.coreModal) {
      dom.coreModal.classList.remove('active');
      dom.coreModal.setAttribute('aria-hidden', 'true');
    }

    // ---- Reset gold tokens ----
    [dom.goldTokenLobby, dom.goldTokenOrbatrium, dom.goldTokenVault, dom.goldTokenTunnels, dom.goldTokenCore].forEach(tokenEl => {
      if (!tokenEl) return;
      tokenEl.classList.remove('collected');
      tokenEl.style.pointerEvents = 'auto';
      const label = tokenEl.querySelector('.gold-token-label');
      if (label) label.textContent = '?';
    });

    // Reset signal modal
    if (dom.signalModal) {
      dom.signalModal.classList.remove('active');
      dom.signalModal.setAttribute('aria-hidden', 'true');
    }

    // Reset Stage Lobby Scale / Opacity
    if (dom.stageLobby) {
      dom.stageLobby.style.display = 'flex';
      dom.stageLobby.style.transform = 'none';
      dom.stageLobby.style.opacity = '1';
    }
    [dom.stageOrbatrium, dom.stageVault, dom.stageTunnels, dom.stageCore].forEach(stageEl => {
      if (!stageEl) return;
      stageEl.style.display = 'none';
      stageEl.classList.remove('active');
      stageEl.setAttribute('aria-hidden', 'true');
      stageEl.style.opacity = '';
    });
    if (dom.stageSector02) {
      dom.stageSector02.style.display = 'none';
      dom.stageSector02.classList.remove('active');
    }
    if (dom.obsRevealStage) {
      dom.obsRevealStage.classList.remove('active');
      dom.obsRevealStage.style.opacity = '0';
    }
    if (dom.roomIntroBanner) dom.roomIntroBanner.style.display = 'none';
    if (dom.layerBg) dom.layerBg.style.opacity = '1';
    if (dom.mainGameHud) dom.mainGameHud.style.opacity = '1';

    // Hide result screen, show intro
    if (dom.escapeResultScreen) {
      dom.escapeResultScreen.classList.remove('active');
      dom.escapeResultScreen.setAttribute('aria-hidden', 'true');
      dom.escapeResultScreen.style.opacity = '0';
    }

    if (dom.gameWorld) {
      dom.gameWorld.classList.remove('active');
      dom.gameWorld.setAttribute('aria-hidden', 'true');
      dom.gameWorld.style.display = 'flex';
      dom.gameWorld.style.opacity = '0';
    }

    playCinematicIntro();
  }

  // =========================================================================
  // PREMIUM 1080x1350 SHARE CARD CANVAS GENERATOR & NATIVE SHARE
  // =========================================================================

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  async function renderShareCardCanvas(state, time, score, keys, arcade) {
    const width = 1080;
    const height = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Deep Space Dark Gradient Background
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.75);
    bgGrad.addColorStop(0, '#0a1630');
    bgGrad.addColorStop(0.5, '#050c1c');
    bgGrad.addColorStop(1, '#020408');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Atmospheric Perspective Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
    ctx.lineWidth = 1;
    for (let x = 60; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 60; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Scanline Texture Overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let y = 0; y < height; y += 6) {
      ctx.fillRect(0, y, width, 3);
    }
    ctx.restore();

    // 4. Subtle Outer Border & Futuristic Corner Accents
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Corner Brackets
    const bracketSize = 35;
    ctx.strokeStyle = state.secretDiscovered ? '#a855f7' : '#00f0ff';
    ctx.lineWidth = 4;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(40, 40 + bracketSize);
    ctx.lineTo(40, 40);
    ctx.lineTo(40 + bracketSize, 40);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(width - 40 - bracketSize, 40);
    ctx.lineTo(width - 40, 40);
    ctx.lineTo(width - 40, 40 + bracketSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(40, height - 40 - bracketSize);
    ctx.lineTo(40, height - 40);
    ctx.lineTo(40 + bracketSize, height - 40);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(width - 40 - bracketSize, height - 40);
    ctx.lineTo(width - 40, height - 40);
    ctx.lineTo(width - 40, height - 40 - bracketSize);
    ctx.stroke();
    ctx.restore();

    // 5. Header Branding
    ctx.save();
    ctx.textAlign = 'center';

    // Eyebrow
    ctx.font = '600 22px "JetBrains Mono", monospace';
    ctx.fillStyle = state.secretDiscovered ? '#a855f7' : '#00f0ff';
    ctx.letterSpacing = '6px';
    ctx.fillText('MISSION DEBRIEF // PROTOCOL 0x7F', width / 2, 130);

    // Main Game Title
    ctx.font = '900 58px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
    ctx.shadowBlur = 20;
    ctx.fillText('ESCAPE THE WEBSITE', width / 2, 205);
    ctx.shadowBlur = 0;

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(140, 250);
    ctx.lineTo(width - 140, 250);
    ctx.stroke();

    // 6. Central Victory Banner
    ctx.font = '900 50px "Orbitron", sans-serif';
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = 'rgba(0, 255, 136, 0.6)';
    ctx.shadowBlur = 25;
    ctx.fillText('YOU ESCAPED.', width / 2, 340);
    ctx.shadowBlur = 0;

    // Sub Status
    ctx.font = '500 22px "JetBrains Mono", monospace';
    ctx.fillStyle = state.secretDiscovered ? '#c084fc' : '#94a3b8';
    const subStatusText = state.secretDiscovered
      ? '// ANOMALY DETECTED • SECTOR 02 DISCOVERED'
      : '// SECURITY BARRIER OVERRIDDEN • ACCESS RESTORED';
    ctx.fillText(subStatusText, width / 2, 390);

    ctx.restore();

    // Helper to draw rounded cards
    function drawStatCard(x, y, w, h, label, val, valColor) {
      ctx.save();
      ctx.fillStyle = 'rgba(8, 16, 32, 0.88)';
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 1.5;

      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 14);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      }

      // Card Header / Label
      ctx.font = '600 20px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + w / 2, y + 48);

      // Card Value
      ctx.font = '900 46px "Orbitron", sans-serif';
      ctx.fillStyle = valColor;
      ctx.shadowColor = valColor;
      ctx.shadowBlur = 12;
      ctx.fillText(val, x + w / 2, y + 115);
      ctx.restore();
    }

    // 7. 4 Statistics Cards
    const cardW = 410;
    const cardH = 175;
    const startX1 = 110;
    const startX2 = width - 110 - cardW;
    const row1Y = 460;
    const row2Y = 675;

    drawStatCard(startX1, row1Y, cardW, cardH, 'ESCAPE TIME', time, '#00f0ff');
    drawStatCard(startX2, row1Y, cardW, cardH, 'TOTAL SCORE', `${score} PTS`, '#00ff88');
    drawStatCard(startX1, row2Y, cardW, cardH, 'CIPHER KEYS', `◆ ◆ ◆  ${keys}`, '#00ff88');
    drawStatCard(startX2, row2Y, cardW, cardH, 'ARCADE BEST', `${arcade} PTS`, '#ffb800');

    // 8. Sector 02 Secret Banner (if unlocked) or Standard Encryption Stamp
    ctx.save();
    const bannerY = 900;
    const bannerW = width - 220;
    const bannerH = 160;
    const bannerX = 110;

    ctx.fillStyle = state.secretDiscovered ? 'rgba(30, 15, 55, 0.75)' : 'rgba(6, 14, 28, 0.75)';
    ctx.strokeStyle = state.secretDiscovered ? 'rgba(168, 85, 247, 0.5)' : 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 1.5;

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 12);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
      ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);
    }

    ctx.textAlign = 'center';
    if (state.secretDiscovered) {
      ctx.font = '800 24px "Orbitron", sans-serif';
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
      ctx.shadowBlur = 15;
      ctx.fillText('SECRET ROOM // SECTOR 02 OVERLOOK DISCOVERED', width / 2, bannerY + 60);
      ctx.shadowBlur = 0;

      ctx.font = '400 20px "JetBrains Mono", monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('"The website does not let you leave. It builds another room."', width / 2, bannerY + 105);
    } else {
      ctx.font = '700 22px "Orbitron", sans-serif';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('SECURITY OVERRIDE COMPLETE // ALL 3 SECTORS SOLVED', width / 2, bannerY + 60);

      ctx.font = '400 20px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Master cipher validated • Clearance Level: ADMINISTRATOR', width / 2, bannerY + 105);
    }
    ctx.restore();

    // 9. Footer Watermark & Branding
    ctx.save();
    ctx.font = '500 20px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText('ESCAPE THE WEBSITE // TERMINAL 0x7F', 110, height - 90);

    ctx.textAlign = 'right';
    ctx.fillStyle = state.secretDiscovered ? '#a855f7' : '#00f0ff';
    ctx.fillText('AUTHENTICATED ACHIEVEMENT', width - 110, height - 90);
    ctx.restore();

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas blob generation failed'));
        }
      }, 'image/png');
    });
  }

  async function handleShareScore() {
    if (isSharing || !window.gameManager) return;
    isSharing = true;

    // Track GA4 share_clicked event
    if (window.trackEvent) {
      window.trackEvent('share_clicked');
    }

    const originalText = dom.btnShareScore ? dom.btnShareScore.textContent : 'SHARE MY SCORE';
    if (dom.btnShareScore) {
      dom.btnShareScore.textContent = 'GENERATING RESULT...';
      dom.btnShareScore.disabled = true;
      dom.btnShareScore.setAttribute('aria-busy', 'true');
    }

    try {
      const state = window.gameManager.getState();
      const time = state.finalTime || window.gameManager.getCurrentRunTime() || '02:30';
      const score = typeof state.score === 'number' ? state.score : 900;
      const arcade = typeof state.arcadeBestScore === 'number' ? state.arcadeBestScore : 0;
      const keys = `${Array.isArray(state.keysCollected) ? state.keysCollected.length : 3} / 3`;

      // Wait for fonts to be ready
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const imageBlob = await renderShareCardCanvas(state, time, score, keys, arcade);
      const fileName = `escape-the-website-result.png`;
      const imageFile = new File([imageBlob], fileName, { type: 'image/png' });

      const gameUrl = 'https://escape-the-website.onrender.com/';
      const keysCount = Array.isArray(state.keysCollected) ? state.keysCollected.length : 3;
      const shareTitle = 'ESCAPE THE WEBSITE';
      const shareText = `I escaped ESCAPE THE WEBSITE.\n\nTIME: ${time}\nSCORE: ${score}\nKEYS: ${keysCount}/3\n\nCan you escape too?\n${gameUrl}`;

      // 1. Native Web Share with File Support
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          files: [imageFile]
        });
        if (window.trackEvent) {
          window.trackEvent('share_completed', { share_method: 'native_file' });
        }
        showToast('// RESULT SHARED');
      } else if (navigator.share && navigator.canShare && navigator.canShare({ title: shareTitle, text: shareText })) {
        // 2. Web share text fallback + auto-download image
        downloadBlob(imageBlob, fileName);
        await navigator.share({
          title: shareTitle,
          text: shareText
        });
        if (window.trackEvent) {
          window.trackEvent('share_completed', { share_method: 'native_text' });
        }
        showToast('// RESULT IMAGE DOWNLOADED');
      } else {
        // 3. Desktop / Unsupported browser fallback: Download PNG & Copy Text
        downloadBlob(imageBlob, fileName);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareText);
          showToast('// RESULT IMAGE SAVED • TEXT COPIED');
        } else {
          showToast('// RESULT IMAGE READY');
        }
        if (window.trackEvent) {
          window.trackEvent('share_completed', { share_method: 'download' });
        }
      }
    } catch (err) {
      if (err && err.name !== 'AbortError') {
        showToast('// RESULT IMAGE READY');
      }
    } finally {
      isSharing = false;
      if (dom.btnShareScore) {
        dom.btnShareScore.textContent = originalText;
        dom.btnShareScore.disabled = false;
        dom.btnShareScore.removeAttribute('aria-busy');
      }
    }
  }

  function showToast(msg) {
    if (!dom.escapeToast) return;
    const safeText = typeof msg === 'string' && msg.trim() ? msg : '// ACCESS RESTRICTED • SECTOR 02 LOCKED';
    dom.escapeToast.textContent = safeText;
    dom.escapeToast.classList.add('active');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      dom.escapeToast.classList.remove('active');
    }, 2500);
  }

  // =========================================================================
  // KEY 03: ARCADE SYSTEM DEFENSE REACTION GAME
  // =========================================================================

  function openArcadeModal() {
    if (!dom.arcadeModal || !dom.arcadeCard || isEscapeSequenceActive || inSector02) return;
    isArcadeOpen = true;
    lockBodyScroll();

    stopArcadeGame();
    clearArcadePlayfield();

    const state = window.gameManager?.getState();
    const bestScore = state?.arcadeBestScore || 0;
    if (dom.arcadeBestBadge) dom.arcadeBestBadge.textContent = `BEST: ${bestScore}`;

    if (dom.arcadeScoreVal) dom.arcadeScoreVal.textContent = '0000';
    if (dom.arcadeTimeVal) {
      dom.arcadeTimeVal.textContent = '20s';
      dom.arcadeTimeVal.className = 'arcade-stat-val';
    }
    if (dom.arcadeComboVal) dom.arcadeComboVal.textContent = 'x1';
    if (dom.arcadeTargetsVal) dom.arcadeTargetsVal.textContent = '0';

    hideArcadeSummaryStage();

    if (window.audioManager) {
      window.audioManager.playModalOpen();
    }

    dom.arcadeModal.classList.add('active');
    dom.arcadeModal.setAttribute('aria-hidden', 'false');

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(dom.arcadeModal, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(dom.arcadeCard,
        { opacity: 0, scale: 0.94, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      );
    } else {
      dom.arcadeModal.style.opacity = '1';
    }

    startArcadeCountdown();
  }

  function closeArcadeModal() {
    if (!dom.arcadeModal || !isArcadeOpen) return;
    isArcadeOpen = false;

    // Invalidate any pending countdown so it cannot start a round behind the closed modal
    stopArcadeCountdown();

    stopArcadeGame();
    clearArcadePlayfield();

    if (window.audioManager) {
      window.audioManager.playModalClose();
    }

    if (typeof gsap !== 'undefined') {
      gsap.to(dom.arcadeCard, {
        opacity: 0,
        scale: 0.94,
        y: 10,
        duration: 0.2,
        ease: 'power2.in'
      });
      gsap.to(dom.arcadeModal, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          dom.arcadeModal.classList.remove('active');
          dom.arcadeModal.setAttribute('aria-hidden', 'true');
          unlockBodyScroll();
        }
      });
    } else {
      dom.arcadeModal.classList.remove('active');
      dom.arcadeModal.setAttribute('aria-hidden', 'true');
      unlockBodyScroll();
    }
  }

  /**
   * Cancel any in-flight arcade countdown.
   * Bumping the token invalidates callbacks that are already scheduled (interval
   * ticks and the fade-out onComplete), so a countdown can never start a round
   * after the modal has been closed or after a newer countdown took over.
   */
  function stopArcadeCountdown() {
    if (arcadeCountdownInterval) {
      clearInterval(arcadeCountdownInterval);
      arcadeCountdownInterval = null;
    }

    arcadeCountdownToken += 1;

    if (typeof gsap !== 'undefined' && dom.arcadeCountdownOverlay) {
      gsap.killTweensOf(dom.arcadeCountdownOverlay);
    }
  }

  function startArcadeCountdown() {
    if (!dom.arcadeCountdownOverlay) return;

    // A retry or reopen always supersedes the previous countdown (no duplicates)
    stopArcadeCountdown();
    const token = arcadeCountdownToken;
    const isStale = () => token !== arcadeCountdownToken || !isArcadeOpen;

    dom.arcadeCountdownOverlay.style.display = 'flex';
    dom.arcadeCountdownOverlay.style.opacity = '1';

    let count = 3;
    dom.countdownNum.textContent = count;
    dom.countdownSub.textContent = 'CALIBRATING TARGETING GRID...';

    if (window.audioManager) {
      window.audioManager.playArcadeCountdown(count);
    }

    arcadeCountdownInterval = setInterval(() => {
      if (isStale()) {
        stopArcadeCountdown();
        return;
      }

      count--;
      if (count > 0) {
        dom.countdownNum.textContent = count;
        if (window.audioManager) window.audioManager.playArcadeCountdown(count);
      } else if (count === 0) {
        dom.countdownNum.textContent = 'SYSTEM ACTIVE';
        dom.countdownSub.textContent = 'ENGAGE TARGETS IMMEDIATELY!';
        if (window.audioManager) window.audioManager.playArcadeStart();
      } else {
        clearInterval(arcadeCountdownInterval);
        arcadeCountdownInterval = null;
        if (typeof gsap !== 'undefined') {
          gsap.to(dom.arcadeCountdownOverlay, {
            opacity: 0,
            duration: 0.25,
            onComplete: () => {
              if (isStale()) return;
              dom.arcadeCountdownOverlay.style.display = 'none';
              startArcadeGame();
            }
          });
        } else {
          dom.arcadeCountdownOverlay.style.display = 'none';
          startArcadeGame();
        }
      }
    }, 800);
  }

  function startArcadeGame() {
    if (!window.puzzleManager || !isArcadeOpen) return;
    arcadeIsPlaying = true;
    arcadeTimeRemaining = 20;

    window.puzzleManager.startArcadeSession();

    const startTime = performance.now();
    const durationMs = 20000;

    if (arcadeTimerInterval) clearInterval(arcadeTimerInterval);
    arcadeTimerInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remainingMs = Math.max(0, durationMs - elapsed);
      arcadeTimeRemaining = Math.ceil(remainingMs / 1000);

      if (dom.arcadeTimeVal) {
        dom.arcadeTimeVal.textContent = `${arcadeTimeRemaining}s`;

        if (arcadeTimeRemaining <= 3) {
          dom.arcadeTimeVal.className = 'arcade-stat-val urgent';
          if (window.audioManager) window.audioManager.playTimerWarning();
        } else if (arcadeTimeRemaining <= 10) {
          dom.arcadeTimeVal.className = 'arcade-stat-val amber';
        }
      }

      if (remainingMs <= 0) {
        endArcadeGame();
      }
    }, 250);

    scheduleNextSpawn();
  }

  function scheduleNextSpawn() {
    if (!arcadeIsPlaying) return;

    if (activeTargets.size < 4) {
      spawnTarget();
    }

    const delay = Math.random() * 380 + 520;
    arcadeSpawnerTimeout = setTimeout(scheduleNextSpawn, delay);
  }

  function spawnTarget() {
    if (!dom.arcadePlayfield || !arcadeIsPlaying || !window.puzzleManager) return;

    const playfieldRect = dom.arcadePlayfield.getBoundingClientRect();
    const width = playfieldRect.width || 700;
    const height = playfieldRect.height || 420;

    const type = window.puzzleManager.getRandomTargetType();
    const targetDef = window.puzzleManager.getPuzzle('key_03')?.targetTypes[type];
    // Touch targets get a generous size boost for mobile ergonomics
    const size = (targetDef?.size || 55) * (IS_TOUCH_DEVICE ? 1.3 : 1);

    const margin = size + 20;
    const posX = Math.random() * (width - margin * 2) + margin;
    const posY = Math.random() * (height - margin * 2) + margin;

    const targetEl = document.createElement('div');
    targetEl.className = `arcade-target ${type} telegraphing`;
    targetEl.style.left = `${posX}px`;
    targetEl.style.top = `${posY}px`;
    targetEl.style.width = `${size}px`;
    targetEl.style.height = `${size}px`;
    targetEl.dataset.type = type;
    targetEl.setAttribute('role', 'button');
    targetEl.setAttribute('aria-label', `Target ${type}`);

    targetEl.innerHTML = `
      <div class="target-reticle-ring"></div>
      <div class="target-core-dot"></div>
    `;

    // Ambient cursor hover feedback for dynamically spawned targets (desktop)
    if (!IS_TOUCH_DEVICE) {
      targetEl.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      targetEl.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    }

    dom.arcadePlayfield.appendChild(targetEl);
    activeTargets.add(targetEl);

    if (window.audioManager) {
      window.audioManager.playTargetTelegraph();
    }

    setTimeout(() => {
      if (!targetEl.parentNode || !arcadeIsPlaying) return;
      targetEl.classList.remove('telegraphing');

      targetEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTargetHit(targetEl, posX, posY);
      });
    }, targetDef.telegraphTime || 250);

    const expireTimer = setTimeout(() => {
      if (!activeTargets.has(targetEl)) return;
      handleTargetMiss(targetEl);
    }, targetDef.lifetime || 2000);

    targetEl._expireTimer = expireTimer;
  }

  function handleTargetHit(targetEl, posX, posY) {
    if (!activeTargets.has(targetEl) || targetEl.dataset.hit === 'true') return;
    targetEl.dataset.hit = 'true';
    clearTimeout(targetEl._expireTimer);
    activeTargets.delete(targetEl);

    const type = targetEl.dataset.type || 'standard';
    const hitData = window.puzzleManager.recordArcadeHit(type);
    if (!hitData) return;

    if (window.audioManager) {
      if (hitData.isBonus) {
        window.audioManager.playBonusTargetHit();
      } else {
        window.audioManager.playTargetHit(type, hitData.combo);
      }
    }

    if (dom.arcadeScoreVal) dom.arcadeScoreVal.textContent = hitData.totalScore.toString().padStart(4, '0');
    if (dom.arcadeComboVal) dom.arcadeComboVal.textContent = `x${hitData.combo}`;
    if (dom.arcadeTargetsVal) dom.arcadeTargetsVal.textContent = hitData.targetsDestroyed;

    showScoreFloatTag(posX, posY, `+${hitData.earnedScore}${hitData.combo > 1 ? ` (x${hitData.combo})` : ''}`, hitData.isBonus);

    if (typeof gsap !== 'undefined') {
      gsap.to(targetEl, {
        scale: 1.35,
        opacity: 0,
        duration: 0.16,
        onComplete: () => {
          if (targetEl.parentNode) targetEl.parentNode.removeChild(targetEl);
        }
      });
    } else {
      if (targetEl.parentNode) targetEl.parentNode.removeChild(targetEl);
    }
  }

  function handleTargetMiss(targetEl) {
    activeTargets.delete(targetEl);
    clearTimeout(targetEl._expireTimer);

    if (window.puzzleManager) {
      window.puzzleManager.recordArcadeMiss();
    }

    if (window.audioManager) {
      window.audioManager.playTargetMiss();
    }

    if (dom.arcadeComboVal) dom.arcadeComboVal.textContent = 'x1';

    if (typeof gsap !== 'undefined') {
      gsap.to(targetEl, {
        opacity: 0,
        scale: 0.5,
        duration: 0.18,
        onComplete: () => {
          if (targetEl.parentNode) targetEl.parentNode.removeChild(targetEl);
        }
      });
    } else {
      if (targetEl.parentNode) targetEl.parentNode.removeChild(targetEl);
    }
  }

  function showScoreFloatTag(x, y, text, isBonus) {
    if (!dom.arcadePlayfield) return;
    const tag = document.createElement('div');
    tag.className = `score-float-tag ${isBonus ? 'bonus' : ''}`;
    tag.textContent = text;
    tag.style.left = `${x}px`;
    tag.style.top = `${y}px`;

    dom.arcadePlayfield.appendChild(tag);

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(tag,
        { opacity: 1, y: 0, scale: 0.8 },
        {
          opacity: 0, y: -30, scale: 1.1, duration: 0.6, ease: 'power2.out', onComplete: () => {
            if (tag.parentNode) tag.parentNode.removeChild(tag);
          }
        }
      );
    } else {
      setTimeout(() => {
        if (tag.parentNode) tag.parentNode.removeChild(tag);
      }, 500);
    }
  }

  function stopArcadeGame() {
    arcadeIsPlaying = false;
    if (arcadeTimerInterval) clearInterval(arcadeTimerInterval);
    if (arcadeSpawnerTimeout) clearTimeout(arcadeSpawnerTimeout);
    arcadeTimerInterval = null;
    arcadeSpawnerTimeout = null;
  }

  function clearArcadePlayfield() {
    activeTargets.forEach(targetEl => {
      clearTimeout(targetEl._expireTimer);
      if (targetEl.parentNode) targetEl.parentNode.removeChild(targetEl);
    });
    activeTargets.clear();
  }

  /**
   * Hide the arcade summary panel and clear any leftover inline opacity
   * from the reveal tween so the next countdown/round is never covered.
   */
  function hideArcadeSummaryStage() {
    if (!dom.arcadeSummaryStage) return;
    dom.arcadeSummaryStage.classList.remove('active');

    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(dom.arcadeSummaryStage);
      gsap.set(dom.arcadeSummaryStage, { opacity: 0 });
    } else {
      dom.arcadeSummaryStage.style.opacity = '0';
    }
  }

  function endArcadeGame() {
    stopArcadeGame();
    clearArcadePlayfield();

    if (!window.puzzleManager) return;
    const result = window.puzzleManager.finishArcadeSession();

    if (window.gameManager && result.finalScore > 0) {
      window.gameManager.recordArcadeBestScore(result.finalScore);
    }

    if (dom.summaryFinalScore) dom.summaryFinalScore.textContent = result.finalScore;
    if (dom.summaryTargetsDestroyed) dom.summaryTargetsDestroyed.textContent = result.targetsDestroyed;
    if (dom.summaryMaxCombo) dom.summaryMaxCombo.textContent = `x${result.maxCombo}`;
    if (dom.summaryBestScore) dom.summaryBestScore.textContent = result.bestScore;
    if (dom.arcadeBestBadge) dom.arcadeBestBadge.textContent = `BEST: ${result.bestScore}`;

    const alreadySolved = window.gameManager?.getState().keysCollected.includes('key_03');

    if (result.passed) {
      if (window.audioManager) {
        window.audioManager.playArcadeVictory();
      }
      dom.summaryStatusTitle.textContent = 'SYSTEM DEFENSE DEFEATED';
      dom.summaryStatusTitle.className = 'h4 fw-bold text-success mb-2 font-monospace';
      dom.summaryStatusSub.textContent = 'Simulation passed (Score >= 1200). Defense protocol permanently deactivated.';

      if (!alreadySolved) {
        dom.btnClaimKey3.classList.remove('d-none');
      } else {
        dom.btnClaimKey3.classList.add('d-none');
      }
    } else {
      if (window.audioManager) {
        window.audioManager.playLockedSound();
      }
      dom.summaryStatusTitle.textContent = 'INSUFFICIENT SCORE';
      dom.summaryStatusTitle.className = 'h4 fw-bold text-warning mb-2 font-monospace';
      dom.summaryStatusSub.textContent = `Score was below target threshold (1200 pts required). Retry to claim Key 03.`;
      dom.btnClaimKey3.classList.add('d-none');
    }

    dom.arcadeSummaryStage.classList.add('active');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(dom.arcadeSummaryStage, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    } else {
      dom.arcadeSummaryStage.style.opacity = '1';
    }
  }

  function handleClaimKey3() {
    if (!window.gameManager) return;
    const gained = window.gameManager.collectKey('key_03');
    if (gained) showToast('// KEY 03 SECURED • +300 PTS');

    if (window.audioManager) {
      window.audioManager.playDoorUnlockResonance();
    }

    closeArcadeModal();
    updateHUD();
    updateLobbyVisuals();
  }

  // =========================================================================
  // KEY 02: MAINFRAME TERMINAL LOGIC
  // =========================================================================

  function openTerminalModal() {
    if (!dom.terminalModal || !dom.terminalCard || isEscapeSequenceActive || inSector02) return;
    isTerminalOpen = true;
    lockBodyScroll();

    const isSolved = window.puzzleManager ? window.puzzleManager.isSolved('key_02') : false;
    const isClaimed = Boolean(window.gameManager && window.gameManager.getState().keysCollected.includes('key_02'));

    dom.termKeyExtractStage.classList.remove('active');
    dom.termKeyExtractStage.style.opacity = '0';

    if (isSolved) {
      dom.termLedIndicator.className = 'term-led-indicator online';
      dom.termOutputStream.innerHTML = `
<div class="terminal-entry-log success-msg">MAINFRAME TERMINAL // 0x7F</div>
<div class="terminal-entry-log system-msg">--------------------------------------------------</div>
<div class="terminal-entry-log success-msg">&gt; SECURITY PROTOCOL: DISABLED</div>
<div class="terminal-entry-log success-msg">&gt; AUTHENTICATION: VERIFIED</div>
<div class="terminal-entry-log success-msg">&gt; KEY 02: RECOVERED [CIPHER STORED IN HUD]</div>
<div class="terminal-entry-log system-msg">&gt; ARCHIVE STATUS: COMPLETE</div>
<div class="terminal-entry-log system-msg">&gt; SYSTEM ACCESS LEVEL: ADMINISTRATOR</div>
<div class="terminal-entry-log text-info">&gt; Type <span class="text-warning fw-bold">TRACE</span> to scan dormant sub-sectors.</div>
<div class="terminal-entry-log system-msg">--------------------------------------------------</div>
`;
    } else {
      dom.termLedIndicator.className = 'term-led-indicator';
      dom.termOutputStream.innerHTML = `
<div class="terminal-entry-log error-msg">SYSTEM // SECURITY PROTOCOL ACTIVE</div>
<div class="terminal-entry-log error-msg">ACCESS: LOCKED &bull; AUTHENTICATION REQUIRED</div>
<div class="terminal-entry-log system-msg">--------------------------------------------------</div>
<div class="terminal-entry-log">&gt; SYSTEM READY</div>
<div class="terminal-entry-log">&gt; AUTHENTICATION CHANNEL OPEN</div>
<div class="terminal-entry-log text-info">&gt; Type <span class="text-warning fw-bold">HELP</span> to view diagnostic commands.</div>
`;
    }

    if (window.audioManager) {
      window.audioManager.playTerminalBeep();
      window.audioManager.playModalOpen();
    }

    dom.terminalModal.classList.add('active');
    dom.terminalModal.setAttribute('aria-hidden', 'false');

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(dom.terminalModal, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(dom.terminalCard,
        { opacity: 0, scale: 0.94, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      );
    } else {
      dom.terminalModal.style.opacity = '1';
    }

    // Puzzle solved but key never claimed (modal was closed before claiming): re-offer the claim
    if (isSolved && !isClaimed) {
      revealKeyExtractStage(dom.termKeyExtractStage);
    }

    setTimeout(() => {
      if (dom.termInput) dom.termInput.focus();
    }, 120);
  }

  function closeTerminalModal() {
    if (!dom.terminalModal || !isTerminalOpen) return;
    isTerminalOpen = false;

    if (window.audioManager) {
      window.audioManager.playModalClose();
    }

    if (typeof gsap !== 'undefined') {
      gsap.to(dom.terminalCard, {
        opacity: 0,
        scale: 0.94,
        y: 10,
        duration: 0.2,
        ease: 'power2.in'
      });
      gsap.to(dom.terminalModal, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          dom.terminalModal.classList.remove('active');
          dom.terminalModal.setAttribute('aria-hidden', 'true');
          unlockBodyScroll();
        }
      });
    } else {
      dom.terminalModal.classList.remove('active');
      dom.terminalModal.setAttribute('aria-hidden', 'true');
      unlockBodyScroll();
    }
  }

  function handleTerminalSubmit(commandText) {
    if (!window.puzzleManager) return;
    const inputStr = commandText !== undefined ? commandText : (dom.termInput?.value || '');
    if (!inputStr.trim()) return;

    cmdHistory.push(inputStr);
    historyIndex = cmdHistory.length;

    const userLog = document.createElement('div');
    userLog.className = 'terminal-entry-log user-cmd';
    userLog.textContent = `0x7F:> ${inputStr}`;
    dom.termOutputStream.appendChild(userLog);

    if (dom.termInput) dom.termInput.value = '';

    if (window.audioManager) {
      window.audioManager.playTerminalCommandExec();
    }

    const res = window.puzzleManager.executeTerminalCommand(inputStr);

    if (res.status === 'clear') {
      dom.termOutputStream.innerHTML = '';
      return;
    }

    if (res.status === 'secret_trigger') {
      const sysLog = document.createElement('div');
      sysLog.className = 'terminal-entry-log success-msg';
      sysLog.textContent = res.text || '';
      dom.termOutputStream.appendChild(sysLog);
      dom.termOutputStream.scrollTop = dom.termOutputStream.scrollHeight;

      setTimeout(() => {
        closeTerminalModal();
        enterSector02();
      }, 900);
      return;
    }

    if (res.status === 'scan' && window.audioManager) {
      window.audioManager.playTerminalScan();
    }

    const sysLog = document.createElement('div');
    sysLog.className = `terminal-entry-log ${res.status === 'auth_success' ? 'success-msg' :
      res.status === 'auth_denied' ? 'error-msg' :
        res.status === 'warning' ? 'hint-msg' : 'system-msg'
      }`;
    sysLog.textContent = res.text || '';
    dom.termOutputStream.appendChild(sysLog);

    if (res.showHint && res.hintText) {
      const hintLog = document.createElement('div');
      hintLog.className = 'terminal-entry-log hint-msg';
      hintLog.textContent = res.hintText;
      dom.termOutputStream.appendChild(hintLog);
    }

    dom.termOutputStream.scrollTop = dom.termOutputStream.scrollHeight;

    if (res.status === 'auth_success') {
      dom.termLedIndicator.className = 'term-led-indicator online';

      if (window.audioManager) {
        window.audioManager.playResonanceSuccess();
      }

      setTimeout(() => {
        if (window.audioManager) {
          window.audioManager.playKeyExtractChime();
        }
        revealKeyExtractStage(dom.termKeyExtractStage);
      }, 600);
    } else if (res.status === 'auth_denied') {
      if (window.audioManager) {
        window.audioManager.playLockedSound();
      }
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(dom.terminalCard,
          { x: -4 },
          { x: 4, duration: 0.08, repeat: 3, yoyo: true, ease: 'none', onComplete: () => { gsap.set(dom.terminalCard, { x: 0 }); } }
        );
      }
    }
  }

  function handleClaimKey2() {
    if (!window.gameManager || !window.puzzleManager) return;
    // The claim overlay is only hidden visually (opacity + pointer-events), so the
    // button stays focusable while the cipher is unsolved. Gate on the puzzle state.
    const key02Puzzle = window.puzzleManager.getPuzzle('key_02');
    if (!key02Puzzle || !key02Puzzle.solved) return;
    const gained = window.gameManager.collectKey('key_02');
    if (gained) showToast('// KEY 02 SECURED • +300 PTS');

    closeTerminalModal();
    updateHUD();
    updateLobbyVisuals();
  }

  // =========================================================================
  // KEY 01: HARMONIC RESONATOR LOGIC
  // =========================================================================

  function openResonatorModal() {
    if (!dom.resonatorModal || !dom.resonatorCard || isEscapeSequenceActive || inSector02) return;
    isResonatorOpen = true;
    lockBodyScroll();

    const isSolved = window.puzzleManager ? window.puzzleManager.isSolved('key_01') : false;
    const isClaimed = Boolean(window.gameManager && window.gameManager.getState().keysCollected.includes('key_01'));

    dom.resNodeCards.forEach(card => card.classList.remove('active-step', 'desync-flash'));
    dom.keyExtractStage.classList.remove('active');
    dom.keyExtractStage.style.opacity = '0';

    if (isSolved) {
      dom.resStatusBadge.textContent = 'STATUS: STABLE // COMPLETE';
      dom.resStatusBadge.classList.add('stable');
      dom.resClueText.innerHTML = '<span class="text-success fw-bold">RESONANCE STABLE.</span> Master Cipher Key 01 has been recovered.';
      dom.resStreamDisplay.innerHTML = '<span class="text-success">ARCHIVE STATUS: CALIBRATED (03 &rarr; 01 &rarr; 04 &rarr; 02)</span>';
      if (dom.resHintBox) dom.resHintBox.classList.add('d-none');
    } else {
      dom.resStatusBadge.textContent = 'STATUS: UNCALIBRATED';
      dom.resStatusBadge.classList.remove('stable');
      dom.resClueText.innerHTML = 'Telemetry signature: Harmonize nodes in order of <span class="text-info fw-bold">ascending harmonic frequency</span> (Phase I &rarr; IV).';
      dom.resStreamDisplay.textContent = 'WAITING FOR SEQUENCE...';

      const puzzle = window.puzzleManager?.getPuzzle('key_01');
      if (puzzle && puzzle.attempts >= puzzle.hintThreshold && dom.resHintBox) {
        dom.resHintBox.textContent = 'TELEMETRY HINT: Align nodes by ascending harmonic frequency (14.2G → 28.4G → 42.6G → 56.8G).';
        dom.resHintBox.classList.remove('d-none');
      } else if (dom.resHintBox) {
        dom.resHintBox.classList.add('d-none');
      }
    }

    if (window.audioManager) {
      window.audioManager.playModalOpen();
    }

    dom.resonatorModal.classList.add('active');
    dom.resonatorModal.setAttribute('aria-hidden', 'false');

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(dom.resonatorModal, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(dom.resonatorCard,
        { opacity: 0, scale: 0.94, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      );
    } else {
      dom.resonatorModal.style.opacity = '1';
    }

    // Puzzle solved but key never claimed (modal was closed before claiming): re-offer the claim
    if (isSolved && !isClaimed) {
      revealKeyExtractStage(dom.keyExtractStage);
    }
  }

  function closeResonatorModal() {
    if (!dom.resonatorModal || !isResonatorOpen) return;
    isResonatorOpen = false;

    if (window.audioManager) {
      window.audioManager.playModalClose();
    }

    if (window.puzzleManager) {
      window.puzzleManager.resetPuzzleInput('key_01');
    }

    if (typeof gsap !== 'undefined') {
      gsap.to(dom.resonatorCard, {
        opacity: 0,
        scale: 0.94,
        y: 10,
        duration: 0.2,
        ease: 'power2.in'
      });
      gsap.to(dom.resonatorModal, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          dom.resonatorModal.classList.remove('active');
          dom.resonatorModal.setAttribute('aria-hidden', 'true');
          unlockBodyScroll();
        }
      });
    } else {
      dom.resonatorModal.classList.remove('active');
      dom.resonatorModal.setAttribute('aria-hidden', 'true');
      unlockBodyScroll();
    }
  }

  function handleResonatorNodeClick(nodeCard) {
    if (isNodeProcessing || !window.puzzleManager) return;
    const nodeId = nodeCard.dataset.nodeId;
    const audioIdx = parseInt(nodeId, 10);

    if (window.audioManager) {
      window.audioManager.playResonanceNodeTone(audioIdx);
    }

    const result = window.puzzleManager.inputResonatorNode(nodeId);

    // Secret Room Trigger via Inverted Resonance
    if (result.status === 'secret_trigger') {
      isNodeProcessing = true;
      nodeCard.classList.add('active-step');

      dom.resStreamDisplay.innerHTML = '<span class="text-warning fw-bold">// ANOMALY: SECTOR 02 LINK DETECTED</span>';

      setTimeout(() => {
        closeResonatorModal();
        isNodeProcessing = false;
        enterSector02();
      }, 750);
      return;
    }

    if (result.status === 'progress') {
      nodeCard.classList.add('active-step');
      dom.resStreamDisplay.textContent = `INPUT: ${result.input.join(' → ')}`;
    } else if (result.status === 'desync') {
      isNodeProcessing = true;
      nodeCard.classList.add('active-step');

      if (window.audioManager) {
        window.audioManager.playResonanceDesync();
      }

      dom.resStreamDisplay.innerHTML = '<span class="text-danger fw-bold">RESONANCE DESYNC &bull; CALIBRATION RESET</span>';
      dom.resNodeCards.forEach(c => c.classList.add('desync-flash'));

      if (result.showHint && dom.resHintBox) {
        dom.resHintBox.textContent = result.hintText;
        dom.resHintBox.classList.remove('d-none');
      }

      setTimeout(() => {
        dom.resNodeCards.forEach(c => c.classList.remove('desync-flash', 'active-step'));
        dom.resStreamDisplay.textContent = 'WAITING FOR SEQUENCE...';
        isNodeProcessing = false;
      }, 500);
    } else if (result.status === 'success') {
      isNodeProcessing = true;
      nodeCard.classList.add('active-step');
      dom.resStreamDisplay.innerHTML = '<span class="text-success fw-bold">RESONANCE STABLE &bull; ACCESS GRANTED</span>';

      dom.resStatusBadge.textContent = 'STATUS: STABLE';
      dom.resStatusBadge.classList.add('stable');

      if (window.audioManager) {
        window.audioManager.playResonanceSuccess();
      }

      setTimeout(() => {
        if (window.audioManager) {
          window.audioManager.playKeyExtractChime();
        }
        revealKeyExtractStage(dom.keyExtractStage);
        isNodeProcessing = false;
      }, 600);
    }
  }

  function handleClaimKey() {
    if (!window.gameManager || !window.puzzleManager) return;
    // See handleClaimKey2: the hidden claim button must not bypass the resonance puzzle.
    const key01Puzzle = window.puzzleManager.getPuzzle('key_01');
    if (!key01Puzzle || !key01Puzzle.solved) return;
    const gained = window.gameManager.collectKey('key_01');
    if (gained) showToast('// KEY 01 SECURED • +300 PTS');

    closeResonatorModal();
    updateHUD();
    updateLobbyVisuals();
  }

  // =========================================================================
  // STANDARD INSPECTION MODAL (FOR OBJECT DIAGNOSTICS)
  // =========================================================================

  function openModal(title, bodyHtml, diagHtml, actionLabel, onAction) {
    if (!dom.modalOverlay || !dom.modalCard || isEscapeSequenceActive) return;
    isModalOpen = true;
    lockBodyScroll();

    dom.modalTitle.textContent = title;
    dom.modalBody.innerHTML = bodyHtml;
    dom.modalDiagLog.innerHTML = diagHtml;

    // Optional custom action button (e.g. RESET MISSION confirmation)
    pendingModalAction = typeof onAction === 'function' ? onAction : null;
    if (dom.btnModalAction) {
      dom.btnModalAction.textContent = actionLabel || 'DISMISS';
      dom.btnModalAction.classList.toggle('modal-action-danger', Boolean(actionLabel && actionLabel !== 'DISMISS'));
    }

    dom.modalOverlay.classList.add('active');
    dom.modalOverlay.setAttribute('aria-hidden', 'false');

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(dom.modalOverlay, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(dom.modalCard,
        { opacity: 0, scale: 0.94, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      );
    } else {
      dom.modalOverlay.style.opacity = '1';
    }
  }

  function closeModal() {
    if (!dom.modalOverlay || !isModalOpen) return;
    isModalOpen = false;
    pendingModalAction = null;

    if (window.audioManager) {
      window.audioManager.playModalClose();
    }

    if (typeof gsap !== 'undefined') {
      gsap.to(dom.modalCard, {
        opacity: 0,
        scale: 0.94,
        y: 10,
        duration: 0.2,
        ease: 'power2.in'
      });
      gsap.to(dom.modalOverlay, {
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          dom.modalOverlay.classList.remove('active');
          dom.modalOverlay.setAttribute('aria-hidden', 'true');
          unlockBodyScroll();
        }
      });
    } else {
      dom.modalOverlay.classList.remove('active');
      dom.modalOverlay.setAttribute('aria-hidden', 'true');
      unlockBodyScroll();
    }
  }

  /**
   * Aborts the current run and returns to the intro screen, with a
   * cyber-styled confirmation instead of a native browser dialog.
   */
  function handleHudResetRequest() {
    if (isEscapeSequenceActive || isBriefingOpen) return;
    const state = window.gameManager ? window.gameManager.getState() : null;
    const keysCount = state ? state.keysCollected.length : 0;

    openModal(
      '// MISSION RESET // CONFIRM',
      `<h4 class="h5 fw-bold text-light mb-2 font-monospace">ABORT CURRENT RUN?</h4>
       <p class="text-secondary small mb-0">This will erase all progress for this run — keys recovered: <b class="text-warning">${keysCount} / 3</b> and your elapsed time. Your arcade high score and secret discoveries are kept.</p>`,
      `<div class="text-muted">// Reset Diagnostics:</div>
       <div>&gt; Run Progress: <span class="text-danger fw-bold">WILL BE ERASED</span></div>
       <div>&gt; Arcade Best Score: PRESERVED</div>
       <div>&gt; Sector 02 Clearance: PRESERVED`,
      'RESET MISSION',
      () => {
        showToast('// MISSION RESET • RETURNING TO ENTRY POINT');
        handlePlayAgain();
      }
    );
  }

  /**
   * Setup UI Event Listeners (Bound once for complete lifecycle safety)
   */
  function setupEventListeners() {
    // 1. Cinematic Intro Button
    if (dom.btnEnter) {
      dom.btnEnter.addEventListener('click', transitionToGameWorld);
      dom.btnEnter.addEventListener('mouseenter', () => {
        if (window.audioManager) window.audioManager.playHoverSound();
      });
    }

    // 2. HUD Audio Toggle
    if (dom.btnToggleAudio) {
      dom.btnToggleAudio.addEventListener('click', () => {
        if (window.audioManager) {
          const soundOn = window.audioManager.toggleGlobalAudio();
          if (dom.audioStatusLabel) {
            dom.audioStatusLabel.textContent = soundOn ? 'ON' : 'OFF';
          }
        }
      });
    }

    // 2b. HUD Objectives / Help / Reset buttons
    if (dom.btnHudObjectives) {
      dom.btnHudObjectives.addEventListener('click', () => {
        if (isObjectivesOpen) {
          closeObjectivesPanel();
        } else {
          openObjectivesPanel();
        }
      });
    }

    if (dom.btnObjectivesClose) {
      dom.btnObjectivesClose.addEventListener('click', closeObjectivesPanel);
    }

    if (dom.btnHudHelp) {
      dom.btnHudHelp.addEventListener('click', () => {
        if (!isBriefingOpen) showMissionBriefing('resume');
      });
    }

    if (dom.btnHudReset) {
      dom.btnHudReset.addEventListener('click', handleHudResetRequest);
    }

    if (dom.btnBriefingStart) {
      dom.btnBriefingStart.addEventListener('click', () => {
        hideMissionBriefing(true);
      });
    }

    // Close the objectives panel when clicking outside of it
    document.addEventListener('click', (e) => {
      if (!isObjectivesOpen || !dom.objectivesPanel) return;
      if (dom.objectivesPanel.contains(e.target) || dom.btnHudObjectives.contains(e.target)) return;
      closeObjectivesPanel();
    });

    // 3. Central Door Click (Escape Sequence Trigger when 3/3 keys recovered)
    if (dom.nodeDoor) {
      dom.nodeDoor.addEventListener('mouseenter', () => {
        if (window.audioManager) window.audioManager.playHoverSound();
      });
      dom.nodeDoor.addEventListener('click', () => {
        const state = window.gameManager?.getState();
        const hasAllKeys = state && state.keysCollected.length >= 3;

        if (hasAllKeys) {
          triggerFinalEscapeSequence();
        } else {
          if (window.audioManager) window.audioManager.playLockedSound();
          openModal(
            '// SECURITY BARRIER // GATE-0',
            `<h4 class="h5 fw-bold text-light mb-2 font-monospace">ACCESS LEVEL: UNKNOWN</h4>
             <p class="text-secondary small mb-0">A massive reinforced blast door seals the chamber threshold. The multi-lock biometric ring refuses your clearance.</p>`,
            `<div class="text-muted">// Gate Diagnostics:</div>
             <div>&gt; Barrier Status: <span class="text-danger fw-bold">LOCKED</span></div>
             <div>&gt; Encryption Integrity: 100%</div>
             <div>&gt; Keys Synchronized: ${state.keysCollected.length} / 3</div>
             <div class="text-warning mt-2">&gt; "Collect all 3 cipher keys to override the barrier."</div>`
          );
        }
      });
      dom.nodeDoor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dom.nodeDoor.click();
        }
      });
    }

    // 4. Mainframe Terminal Click
    if (dom.nodeTerminal) {
      dom.nodeTerminal.addEventListener('mouseenter', () => {
        if (window.audioManager) window.audioManager.playHoverSound();
      });
      dom.nodeTerminal.addEventListener('click', openTerminalModal);
      dom.nodeTerminal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dom.nodeTerminal.click();
        }
      });
    }

    // Terminal Input & Quick Chip controls
    if (dom.termInput) {
      dom.termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleTerminalSubmit();
        } else if (e.key === 'ArrowUp') {
          if (cmdHistory.length > 0 && historyIndex > 0) {
            historyIndex--;
            dom.termInput.value = cmdHistory[historyIndex] || '';
          }
        } else if (e.key === 'ArrowDown') {
          if (historyIndex < cmdHistory.length - 1) {
            historyIndex++;
            dom.termInput.value = cmdHistory[historyIndex] || '';
          } else {
            historyIndex = cmdHistory.length;
            dom.termInput.value = '';
          }
        } else {
          if (window.audioManager && e.key.length === 1) {
            window.audioManager.playTerminalKeystroke();
          }
        }
      });
    }

    if (dom.btnTermSend) {
      dom.btnTermSend.addEventListener('click', () => handleTerminalSubmit());
    }

    if (dom.termChips) {
      dom.termChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const cmd = chip.dataset.cmd;
          if (cmd) handleTerminalSubmit(cmd);
        });
      });
    }

    if (dom.btnTermClose) dom.btnTermClose.addEventListener('click', closeTerminalModal);
    if (dom.btnClaimKey2) dom.btnClaimKey2.addEventListener('click', handleClaimKey2);

    // 5. Strange Resonator Click
    if (dom.nodeStrangeObject) {
      dom.nodeStrangeObject.addEventListener('mouseenter', () => {
        if (window.audioManager) window.audioManager.playHoverSound();
      });
      dom.nodeStrangeObject.addEventListener('click', openResonatorModal);
      dom.nodeStrangeObject.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dom.nodeStrangeObject.click();
        }
      });
    }

    dom.resNodeCards.forEach(nodeCard => {
      nodeCard.addEventListener('mouseenter', () => {
        if (window.audioManager) window.audioManager.playHoverSound();
      });
      nodeCard.addEventListener('click', () => {
        handleResonatorNodeClick(nodeCard);
      });
      nodeCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleResonatorNodeClick(nodeCard);
        }
      });
    });

    if (dom.btnResClose) dom.btnResClose.addEventListener('click', closeResonatorModal);
    if (dom.btnClaimKey) dom.btnClaimKey.addEventListener('click', handleClaimKey);

    // 6. Arcade Console Click
    if (dom.nodeArcade) {
      dom.nodeArcade.addEventListener('mouseenter', () => {
        if (window.audioManager) window.audioManager.playHoverSound();
      });
      dom.nodeArcade.addEventListener('click', openArcadeModal);
      dom.nodeArcade.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dom.nodeArcade.click();
        }
      });
    }

    if (dom.btnArcadeClose) dom.btnArcadeClose.addEventListener('click', closeArcadeModal);
    if (dom.btnClaimKey3) dom.btnClaimKey3.addEventListener('click', handleClaimKey3);
    if (dom.btnArcadeRetry) dom.btnArcadeRetry.addEventListener('click', () => {
      hideArcadeSummaryStage();
      startArcadeCountdown();
    });

    // 7. Sector 02 Interactions
    if (dom.btnLeaveSector02) {
      dom.btnLeaveSector02.addEventListener('click', leaveSector02);
    }

    if (dom.obsWindowCard) {
      dom.obsWindowCard.addEventListener('mouseenter', () => {
        if (window.audioManager) window.audioManager.playHoverSound();
      });
      dom.obsWindowCard.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playMonitorGlitch();
        openModal(
          '// OBSERVATION WINDOW // FEED 0x00',
          `<h4 class="h5 fw-bold text-info mb-2 font-monospace">SURVEILLANCE FEED: ROOM 01 [LOBBY]</h4>
           <p class="text-secondary small mb-0">You are staring directly through one-way glass into the Lobby chamber you supposedly escaped. The blast door is sealed tight. A ghostly silhouette sits frozen at the terminal.</p>`,
          `<div class="text-muted">// Telemetry Mismatch:</div>
           <div>&gt; Subject Position: <span class="text-warning fw-bold">SIMULTANEOUS</span></div>
           <div>&gt; Chamber Integrity: LOCKED</div>
           <div class="text-info mt-2">&gt; "Who is looking at whom?"</div>`
        );
      });
    }

    if (dom.obsMonitorCard) {
      dom.obsMonitorCard.addEventListener('mouseenter', () => {
        if (window.audioManager) window.audioManager.playHoverSound();
      });
      dom.obsMonitorCard.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playMonitorGlitch();
        openModal(
          '// OBSERVATION RECORD // LOG #0x88F',
          `<h4 class="h5 fw-bold text-warning mb-2 font-monospace">SUBJECT ARCHIVE: ACTIVE</h4>
           <p class="text-secondary small mb-0">The observation logs record infinite recursive escape attempts.</p>`,
          `<div class="text-muted">// Archive Log:</div>
           <div>&gt; Subject: <span class="text-light">PLAYER</span></div>
           <div>&gt; Exit Status: <span class="text-danger fw-bold">SIMULATED</span></div>
           <div>&gt; Iteration: CURRENT INSTANCE</div>
           <div class="text-warning mt-2">&gt; "The website does not let you leave. It just builds another room."</div>`
        );
      });
    }

    if (dom.obsInput) {
      dom.obsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleObservationTerminalCommand();
        } else {
          if (window.audioManager && e.key.length === 1) {
            window.audioManager.playTerminalKeystroke();
          }
        }
      });
    }

    if (dom.obsChips) {
      dom.obsChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const cmd = chip.dataset.cmd;
          if (cmd) handleObservationTerminalCommand(cmd);
        });
      });
    }

    if (dom.btnRevealReturnLobby) {
      dom.btnRevealReturnLobby.addEventListener('click', () => {
        dom.obsRevealStage.classList.remove('active');
        leaveSector02();
      });
    }

    if (dom.btnRevealPlayAgain) {
      dom.btnRevealPlayAgain.addEventListener('click', handlePlayAgain);
    }

    // 8. Results Screen Buttons & Explore Secret Handler
    if (dom.btnPlayAgain) dom.btnPlayAgain.addEventListener('click', handlePlayAgain);
    if (dom.btnShareScore) dom.btnShareScore.addEventListener('click', handleShareScore);
    if (dom.btnExploreSecret) {
      dom.btnExploreSecret.addEventListener('click', () => {
        const state = window.gameManager ? window.gameManager.getState() : null;
        if (state && state.secretDiscovered) {
          enterSector02();
        } else {
          showToast('// ACCESS RESTRICTED • SECTOR 02 LOCKED');
        }
      });
    }

    // 9. Standard Modal Close Controls
    if (dom.btnModalClose) dom.btnModalClose.addEventListener('click', closeModal);
    if (dom.btnModalAction) {
      dom.btnModalAction.addEventListener('click', () => {
        const action = pendingModalAction;
        closeModal();
        if (typeof action === 'function') action();
      });
    }
    if (dom.modalOverlay) {
      dom.modalOverlay.addEventListener('click', (e) => {
        if (e.target === dom.modalOverlay) closeModal();
      });
    }

    // 10. v3 MULTI-ROOM INTERACTIONS
    // Room 02: orb catching + lift door + lore + gold token
    dom.orbNodes.forEach((orbEl, i) => {
      if (!orbEl) return;
      orbEl.addEventListener('click', () => handleOrbCatch(i));
      orbEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOrbCatch(i);
        }
      });
    });

    if (dom.nodeLiftDoor) {
      dom.nodeLiftDoor.addEventListener('click', () => {
        const ready = window.gameManager?.isRoomDoorReady('orbatrium');
        if (ready) {
          triggerLiftSequence();
        } else {
          if (window.audioManager) window.audioManager.playLockedSound();
          const copy = DOOR_LOCKED_COPY.orbatrium;
          openModal(
            '// GRAVITY LIFT // SUB-LEVEL 02',
            `<h4 class="h5 fw-bold text-light mb-2 font-monospace">${copy.title}</h4>
             <p class="text-secondary small mb-0">${copy.body}</p>`,
            `<div class="text-muted">// Lift Diagnostics:</div>` +
              copy.diag.map(d => `<div>${d}</div>`).join('') +
              `<div class="text-success mt-2">&gt; "Catch the drifting plasma orbs in the atrium."</div>`
          );
        }
      });
      dom.nodeLiftDoor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dom.nodeLiftDoor.click();
        }
      });
    }

    if (dom.nodeAtriumConsole) {
      dom.nodeAtriumConsole.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playTerminalBeep();
        openModal(
          '// GRAVITY CONSOLE // ATRIUM',
          `<h4 class="h5 fw-bold text-success mb-2 font-monospace">LIFT POWER SYSTEM</h4>
           <p class="text-secondary small mb-0">The gravity lift converts raw plasma orbs into counter-gravitational charge. The previous keeper left three orbs drifting in the atrium garden.</p>`,
          `<div class="text-muted">// Console Readout:</div>
           <div>&gt; Orbs Detected: <span class="text-warning fw-bold">${(window.gameManager?.getState().orbsCollected || []).length} / 3</span></div>
           <div>&gt; Lift Status: ${(window.gameManager?.isRoomDoorReady('orbatrium')) ? '<span class="text-success fw-bold">READY</span>' : '<span class="text-danger fw-bold">NO POWER</span>'}</div>
           <div class="text-success mt-2">&gt; "Catch all 3 orbs and the lift will engage."</div>`
        );
      });
    }

    // Room 03: signal relay + vault door + lore + gold token
    if (dom.nodeSignalConsole) {
      dom.nodeSignalConsole.addEventListener('click', openSignalModal);
      dom.nodeSignalConsole.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openSignalModal();
        }
      });
    }

    if (dom.btnSignalClose) dom.btnSignalClose.addEventListener('click', closeSignalModal);
    if (dom.signalModal) {
      dom.signalModal.addEventListener('click', (e) => {
        if (e.target === dom.signalModal) closeSignalModal();
      });
    }
    if (dom.btnSignalPlay) dom.btnSignalPlay.addEventListener('click', handleSignalPlay);
    if (dom.btnSignalReplay) dom.btnSignalReplay.addEventListener('click', handleSignalReplay);
    if (dom.btnClaimGoldChip) dom.btnClaimGoldChip.addEventListener('click', handleClaimGoldChip);

    dom.signalTowerCards.forEach((towerEl) => {
      if (!towerEl) return;
      towerEl.addEventListener('click', () => {
        const idx = parseInt(towerEl.dataset.tower, 10);
        if (!Number.isNaN(idx)) handleSignalTowerClick(idx);
      });
    });

    if (dom.nodeVaultDoor) {
      dom.nodeVaultDoor.addEventListener('click', () => {
        const state = window.gameManager?.getState();
        if (!state) return;
        if (state.goldChip && state.signalRoundsWon >= 3) {
          openKeypadModal();
        } else {
          if (window.audioManager) window.audioManager.playLockedSound();
          const copy = DOOR_LOCKED_COPY.vault;
          openModal(
            '// CIPHER VAULT // ARCHIVE 9',
            `<h4 class="h5 fw-bold text-light mb-2 font-monospace">${copy.title}</h4>
             <p class="text-secondary small mb-0">${copy.body}</p>`,
            `<div class="text-muted">// Vault Diagnostics:</div>` +
              copy.diag.map(d => `<div>${d}</div>`).join('') +
              `<div class="text-warning mt-2">&gt; "Open the Signal Relay console and mirror the ghost songs."</div>`
          );
        }
      });
      dom.nodeVaultDoor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dom.nodeVaultDoor.click();
        }
      });
    }

    if (dom.btnKeypadClose) dom.btnKeypadClose.addEventListener('click', closeKeypadModal);
    if (dom.keypadModal) {
      dom.keypadModal.addEventListener('click', (e) => {
        if (e.target === dom.keypadModal) closeKeypadModal();
      });
    }
    dom.keypadKeys.forEach((keyBtn) => {
      if (!keyBtn) return;
      keyBtn.addEventListener('click', () => {
        handleKeypadPress(keyBtn.dataset.key);
      });
    });

    // Room 04: pipe panel + gate + lore + gold token
    if (dom.nodePipePanel) {
      dom.nodePipePanel.addEventListener('click', openPipeModal);
      dom.nodePipePanel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPipeModal();
        }
      });
    }

    if (dom.btnPipeClose) dom.btnPipeClose.addEventListener('click', closePipeModal);
    if (dom.pipeModal) {
      dom.pipeModal.addEventListener('click', (e) => {
        if (e.target === dom.pipeModal) closePipeModal();
      });
    }
    if (dom.btnPipeRealign) {
      dom.btnPipeRealign.addEventListener('click', () => {
        if (!window.puzzleManager) return;
        window.puzzleManager.startPipeSession();
        renderPipeGrid();
        if (window.audioManager) window.audioManager.playTerminalScan();
      });
    }
    if (dom.btnClaimBooster) dom.btnClaimBooster.addEventListener('click', handleClaimBooster);

    if (dom.pipeRowsEl) {
      dom.pipeRowsEl.addEventListener('click', (e) => {
        const tileBtn = e.target.closest('.pipe-tile');
        if (!tileBtn) return;
        const row = parseInt(tileBtn.dataset.row, 10);
        const tile = parseInt(tileBtn.dataset.tile, 10);
        if (!Number.isNaN(row) && !Number.isNaN(tile)) handleValveRotate(row, tile);
      });
    }

    if (dom.nodePressureGate) {
      dom.nodePressureGate.addEventListener('click', handleGateClick);
      dom.nodePressureGate.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleGateClick();
        }
      });
    }
    bindBoostPumpEvents();

    // Room 05: fragments + core console + lore + gold token
    dom.fragmentNodes.forEach((fragEl, i) => {
      if (!fragEl) return;
      fragEl.addEventListener('click', () => handleFragmentCollect(i));
      fragEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleFragmentCollect(i);
        }
      });
    });

    if (dom.nodeCoreConsole) {
      dom.nodeCoreConsole.addEventListener('click', () => {
        const ready = window.gameManager?.isRoomDoorReady('core');
        if (ready) {
          openCoreModal();
          startCoreSession();
        } else {
          if (window.audioManager) window.audioManager.playLockedSound();
          const copy = DOOR_LOCKED_COPY.core;
          openModal(
            '// CORE IGNITION // REACTOR TERMINUS',
            `<h4 class="h5 fw-bold text-light mb-2 font-monospace">${copy.title}</h4>
             <p class="text-secondary small mb-0">${copy.body}</p>`,
            `<div class="text-muted">// Reactor Diagnostics:</div>` +
              copy.diag.map(d => `<div>${d}</div>`).join('') +
              `<div class="text-info mt-2">&gt; "Tap the glowing shards scattered on the reactor floor."</div>`
          );
        }
      });
      dom.nodeCoreConsole.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dom.nodeCoreConsole.click();
        }
      });
    }

    if (dom.btnCoreClose) dom.btnCoreClose.addEventListener('click', closeCoreModal);
    if (dom.coreModal) {
      dom.coreModal.addEventListener('click', (e) => {
        if (e.target === dom.coreModal) closeCoreModal();
      });
    }
    if (dom.btnChannelEnergy) dom.btnChannelEnergy.addEventListener('click', handleChannelEnergy);
    if (dom.btnTriggerLaunch) dom.btnTriggerLaunch.addEventListener('click', triggerCoreLaunch);

    // Lore nodes (vault archive / tunnels hatch / core log)
    if (dom.nodeVaultArchive) {
      dom.nodeVaultArchive.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playTerminalBeep();
        openModal(
          '// ARCHIVE SHELF 9-C // MAINTENANCE',
          `<h4 class="h5 fw-bold text-warning mb-2 font-monospace">ARCHIVE RECORD 9-C</h4>
           <p class="text-secondary small mb-0">Dusty maintenance binders. A margin note reads: "The relay console replays the same ghost songs every night. Someone wrote the digits down — then the archive was sealed."</p>`,
          `<div class="text-muted">// Shelf Inventory:</div>
           <div>&gt; Binder: RELAY TUNING 1978-1994</div>
           <div>&gt; Binder: <span class="text-warning fw-bold">VAULT CIPHER FRAGMENTS</span></div>
           <div class="text-warning mt-2">&gt; "Win the relay rounds — the digits are the price of the vault."</div>`
        );
      });
    }

    if (dom.nodeTunnelsHatch) {
      dom.nodeTunnelsHatch.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playTerminalBeep();
        openModal(
          '// MAINTENANCE HATCH // TUNNEL 4',
          `<h4 class="h5 fw-bold text-warning mb-2 font-monospace">TUNNEL 4 SERVICE LOG</h4>
           <p class="text-secondary small mb-0">A rusted service cart sits half-in the hatch. The hydraulic gate has been sealed since the last pressure test failed — the pumps were never reconnected.</p>`,
          `<div class="text-muted">// Service Log:</div>
           <div>&gt; Last Pressure Test: <span class="text-danger fw-bold">FAILED</span></div>
           <div>&gt; Coolant Valves: MISALIGNED</div>
           <div class="text-danger mt-2">&gt; "Align the valves. Build the pressure. Do not stop pumping."</div>`
        );
      });
    }

    if (dom.nodeCoreLog) {
      dom.nodeCoreLog.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playMonitorGlitch();
        openModal(
          '// REACTOR LOG // FINAL ENTRY',
          `<h4 class="h5 fw-bold text-violet mb-2 font-monospace">REACTOR LOG 0x05</h4>
           <p class="text-secondary small mb-0">"If you are reading this, you made it further than the others. The core does not destroy the website — it launches you out of it. Three fragments. One ignition. No second attempt."</p>`,
          `<div class="text-muted">// Core Telemetry:</div>
           <div>&gt; Fragments: <span class="text-warning fw-bold">${(window.gameManager?.getState().fragmentsCollected || []).length} / 3</span></div>
           <div>&gt; Ignition Status: <span class="text-danger fw-bold">DORMANT</span></div>
           <div class="text-violet mt-2">&gt; "Channel every spark. The core remembers hesitation."</div>`
        );
      });
    }

    // Gold tokens (all five rooms)
    const goldTokenBindings = [
      ['lobby', dom.goldTokenLobby],
      ['orbatrium', dom.goldTokenOrbatrium],
      ['vault', dom.goldTokenVault],
      ['tunnels', dom.goldTokenTunnels],
      ['core', dom.goldTokenCore]
    ];
    goldTokenBindings.forEach(([roomId, tokenEl]) => {
      if (!tokenEl) return;
      tokenEl.addEventListener('click', () => handleGoldTokenCollect(roomId, tokenEl));
      tokenEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleGoldTokenCollect(roomId, tokenEl);
        }
      });
    });

    // Escape Key Handler — closes only the TOP-MOST visible layer
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || isEscapeSequenceActive) return;

      if (isBriefingOpen) {
        hideMissionBriefing(true);
        return;
      }
      if (isObjectivesOpen) {
        closeObjectivesPanel();
        return;
      }
      if (inSector02 && dom.obsRevealStage && dom.obsRevealStage.classList.contains('active')) {
        dom.obsRevealStage.classList.remove('active');
        return;
      }
      if (isCoreOpen) {
        closeCoreModal();
        return;
      }
      if (isPipeOpen) {
        closePipeModal();
        return;
      }
      if (isKeypadOpen) {
        closeKeypadModal();
        return;
      }
      if (isSignalOpen) {
        closeSignalModal();
        return;
      }
      if (isModalOpen) {
        closeModal();
        return;
      }
      if (isArcadeOpen) {
        closeArcadeModal();
        return;
      }
      if (isTerminalOpen) {
        closeTerminalModal();
        return;
      }
      if (isResonatorOpen) {
        closeResonatorModal();
        return;
      }
      if (inSector02) leaveSector02();
    });
  }

  /**
   * Environmental Parallax Engine
   */
  function initParallaxEngine(bgLayer, mgLayer) {
    if (!bgLayer || !mgLayer) return;
    if (window.matchMedia('(hover: none) or (pointer: coarse) or (prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentBgX = 0;
    let currentBgY = 0;
    let currentMgX = 0;
    let currentMgY = 0;

    window.addEventListener('mousemove', (e) => {
      if (isEscapeSequenceActive || inSector02) return;
      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;
      targetX = normX;
      targetY = normY;
    }, { passive: true });

    function renderParallax() {
      if (!isEscapeSequenceActive && !inSector02) {
        currentBgX += (targetX * 8 - currentBgX) * 0.08;
        currentBgY += (targetY * 8 - currentBgY) * 0.08;
        bgLayer.style.transform = `translate3d(${currentBgX.toFixed(2)}px, ${currentBgY.toFixed(2)}px, 0)`;

        currentMgX += (targetX * -14 - currentMgX) * 0.08;
        currentMgY += (targetY * -14 - currentMgY) * 0.08;
        mgLayer.style.transform = `translate3d(${currentMgX.toFixed(2)}px, ${currentMgY.toFixed(2)}px, 0)`;
      }

      requestAnimationFrame(renderParallax);
    }

    renderParallax();
  }

  /**
   * Ambient Particle Canvas Background
   */
  function initAmbientCanvas(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    ctx.scale(dpr, dpr);

    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 18 : Math.min(Math.floor((window.innerWidth * window.innerHeight) / 22000), 45);
    const particles = [];

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.22;
        this.vy = (Math.random() - 0.5) * 0.22 - 0.05;
        this.alpha = Math.random() * 0.35 + 0.1;
        this.color = Math.random() > 0.35 ? '0, 240, 255' : '0, 255, 136';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = window.innerWidth;
        if (this.x > window.innerWidth) this.x = 0;
        if (this.y < 0) this.y = window.innerHeight;
        if (this.y > window.innerHeight) this.y = 0;
      }

      draw() {
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function render() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        if (!isMobile) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 85) {
              ctx.strokeStyle = `rgba(0, 240, 255, ${0.07 * (1 - dist / 85)})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      requestAnimationFrame(render);
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        width = canvas.width = window.innerWidth * dpr;
        height = canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
      }, 150);
    }, { passive: true });

    render();
  }

  /**
   * Custom Desktop Cursor Glow
   */
  function initCustomCursor(dot, ring) {
    if (!dot || !ring || window.matchMedia('(hover: none) or (pointer: coarse)').matches) {
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let active = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;

      if (!active) {
        active = true;
        document.body.classList.add('cursor-active');
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-active');
      active = false;
    });

    function updateCursorRing() {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;

      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;

      requestAnimationFrame(updateCursorRing);
    }
    updateCursorRing();

    function bindHoverListeners() {
      const interactives = document.querySelectorAll('button, a, [role="button"], input, .interactive-node, .resonance-node-card, .term-chip, .obs-chip');
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });
    }
    bindHoverListeners();
  }
});
