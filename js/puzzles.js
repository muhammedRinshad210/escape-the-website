/**
 * Escape The Website - Puzzle System
 * Responsible for puzzle state, sequence validation, command processing,
 * arcade mechanics, and secret discovery.
 */

class PuzzleManager {
  constructor() {
    this.puzzles = new Map();
    this.initPuzzles();
  }

  /**
   * Initializes registered puzzles
   */
  init() {
    console.log('[PuzzleManager] Puzzle subsystem online.');
  }

  /**
   * Register default puzzle configurations
   */
  initPuzzles() {
    // KEY 01: The Harmonic Resonator
    this.registerPuzzle('key_01', {
      id: 'key_01',
      name: 'The Harmonic Resonator',
      targetSequence: ['03', '01', '04', '02'],
      secretSequence: ['02', '04', '01', '03'], // Inverted sequence triggers Sector 02
      currentInput: [],
      attempts: 0,
      solved: false,
      nodes: [
        { id: '01', label: 'NODE 01', glyph: 'Φ', freq: '28.4 GHz', phase: 'PHASE II', audioIdx: 1 },
        { id: '02', label: 'NODE 02', glyph: 'Ω', freq: '56.8 GHz', phase: 'PHASE IV', audioIdx: 2 },
        { id: '03', label: 'NODE 03', glyph: 'Ψ', freq: '14.2 GHz', phase: 'PHASE I', audioIdx: 3 },
        { id: '04', label: 'NODE 04', glyph: 'Δ', freq: '42.6 GHz', phase: 'PHASE III', audioIdx: 4 }
      ],
      hintThreshold: 3
    });

    // KEY 02: Mainframe Terminal Investigation
    this.registerPuzzle('key_02', {
      id: 'key_02',
      name: 'Mainframe Terminal Investigation',
      validCodes: ['VOID-7F', 'VOID7F', '7F-VOID', '7FVOID'],
      attempts: 0,
      solved: false,
      hintThreshold: 2
    });

    // KEY 03: System Defense Arcade Game
    this.registerPuzzle('key_03', {
      id: 'key_03',
      name: 'System Defense Arcade',
      durationSeconds: 20,
      winThreshold: 1200,
      bestScore: 0,
      solved: false,
      session: {
        score: 0,
        combo: 1,
        maxCombo: 1,
        targetsDestroyed: 0,
        targetsMissed: 0,
        active: false
      },
      targetTypes: {
        standard: {
          id: 'standard',
          label: 'STANDARD THREAT',
          baseScore: 100,
          lifetime: 2200,
          telegraphTime: 250,
          size: 60,
          weight: 0.60
        },
        fast: {
          id: 'fast',
          label: 'HIGH-VELOCITY INTERCEPT',
          baseScore: 175,
          lifetime: 1400,
          telegraphTime: 200,
          size: 48,
          weight: 0.25
        },
        bonus: {
          id: 'bonus',
          label: 'QUANTUM CORE',
          baseScore: 300,
          lifetime: 1800,
          telegraphTime: 250,
          size: 66,
          weight: 0.15
        }
      }
    });

    // ROOM 02: Gravity Lift orbs (catch task — no sequence logic needed)
    this.registerPuzzle('orbatrium_lift', {
      id: 'orbatrium_lift',
      name: 'Gravity Lift Energy Sockets',
      orbsRequired: 3,
      solved: false
    });

    // ROOM 03: Signal Relay memory console
    this.registerPuzzle('signal_relay', {
      id: 'signal_relay',
      name: 'Signal Relay Memory Console',
      // One cipher digit is revealed per successful round
      cipherDigits: ['7', '3', '9'],
      towerCount: 4,
      roundLengths: [3, 4, 5],
      round: 0,                 // 0 = not started; 1..3 while playing
      phase: 'idle',            // idle | playback | input | round_won | solved
      sequence: [],
      currentInput: [],
      attempts: 0,
      revealedDigits: [],
      solved: false
    });

    // ROOM 04: Coolant valve pipe grid (3 independent valve rows)
    this.registerPuzzle('pipe_grid', {
      id: 'pipe_grid',
      name: 'Coolant Valve Grid',
      rows: 3,
      tilesPerRow: 3,           // rotatable tiles between source and fuse
      // Correct rotation index (0..3) per tile; randomized at session start
      solved: false
    });

    // ROOM 05: Core Ignition energy channel
    this.registerPuzzle('core_ignition', {
      id: 'core_ignition',
      name: 'Core Ignition Matrix',
      fragmentsRequired: 3,
      energyTarget: 100,
      gainPerTap: 2.2,
      decayPerTick: 0.55,
      solved: false,
      session: {
        energy: 0,
        taps: 0,
        active: false
      }
    });
  }

  /**
   * Register a new puzzle configuration
   * @param {string} puzzleId 
   * @param {Object} config 
   */
  registerPuzzle(puzzleId, config) {
    this.puzzles.set(puzzleId, {
      id: puzzleId,
      solved: false,
      attempts: 0,
      currentInput: [],
      ...config
    });
  }

  // =========================================================================
  // KEY 01: HARMONIC RESONATOR METHODS
  // =========================================================================

  inputResonatorNode(nodeId) {
    const puzzle = this.puzzles.get('key_01');
    if (!puzzle) return { status: 'error', reason: 'PUZZLE_NOT_FOUND' };

    const expectedNext = puzzle.targetSequence[puzzle.currentInput.length];
    const expectedSecretNext = puzzle.secretSequence ? puzzle.secretSequence[puzzle.currentInput.length] : null;

    // Check normal sequence
    if (nodeId === expectedNext && !puzzle.solved) {
      puzzle.currentInput.push(nodeId);

      if (puzzle.currentInput.length === puzzle.targetSequence.length) {
        puzzle.solved = true;
        return {
          status: 'success',
          input: [...puzzle.currentInput],
          isComplete: true,
          keyId: 'key_01'
        };
      }

      return {
        status: 'progress',
        input: [...puzzle.currentInput],
        isComplete: false
      };
    } 
    // Check secret inverted sequence (02 -> 04 -> 01 -> 03)
    else if (expectedSecretNext && nodeId === expectedSecretNext) {
      puzzle.currentInput.push(nodeId);

      if (puzzle.currentInput.length === puzzle.secretSequence.length) {
        puzzle.currentInput = [];
        return {
          status: 'secret_trigger',
          sector: 'sector_02',
          text: '// ANOMALY DETECTED: INVERTED RESONANCE HARMONIC ALIGNED TO SECTOR 02'
        };
      }

      return {
        status: 'progress',
        input: [...puzzle.currentInput],
        isComplete: false
      };
    } 
    else {
      puzzle.attempts += 1;
      puzzle.currentInput = [];
      const showHint = puzzle.attempts >= puzzle.hintThreshold;

      return {
        status: 'desync',
        reason: 'RESONANCE_DESYNC',
        attempts: puzzle.attempts,
        showHint: showHint,
        hintText: 'TELEMETRY HINT: Align nodes by ascending harmonic frequency (14.2G → 28.4G → 42.6G → 56.8G).'
      };
    }
  }

  // =========================================================================
  // KEY 02: MAINFRAME TERMINAL METHODS
  // =========================================================================

  executeTerminalCommand(rawInput) {
    const puzzle = this.puzzles.get('key_02');
    if (!puzzle) return { status: 'error', text: 'TERMINAL SUBSYSTEM ERROR' };

    const trimmed = (rawInput || '').trim();
    if (!trimmed) {
      return { status: 'empty' };
    }

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toUpperCase();
    const arg = parts.slice(1).join(' ').trim().toUpperCase();

    // Secret Room Trigger Commands in Mainframe Terminal
    if (cmd === 'SECTOR' && (arg === '02' || arg === '2' || arg === 'SECTOR 02')) {
      return {
        status: 'secret_trigger',
        sector: 'sector_02',
        text: 'OVERRIDE CODE ACCEPTED.\nACCESS DETECTED: SECTOR 02 // OBSERVATION CHAMBER\nREDIRECTING...'
      };
    }

    if (cmd === 'SECTOR-02' || cmd === 'SECTOR02' || cmd === 'OBSERVE') {
      return {
        status: 'secret_trigger',
        sector: 'sector_02',
        text: 'OVERRIDE CODE ACCEPTED.\nACCESS DETECTED: SECTOR 02 // OBSERVATION CHAMBER\nREDIRECTING...'
      };
    }

    if (cmd === 'TRACE') {
      return {
        status: 'info',
        text: `ROUTING TRACE REPORT // NET-09\n--------------------------------------------------\n> LOCAL NODE: 0x7F [THE LOBBY]\n> MIRROR NODE: SECTOR 02 [OBSERVATION]\n> CLUE: Inverting harmonic resonator frequencies (Phase IV -> I) bypasses access control.`
      };
    }

    if (puzzle.solved) {
      if (cmd === 'CLEAR') return { status: 'clear' };
      if (cmd === 'HELP') {
        return {
          status: 'info',
          text: `AVAILABLE COMMANDS:\n  STATUS       - Inspect central mainframe & security protocol\n  LOGS         - Display archived security incident records\n  SCAN         - Execute sensor diagnostic sweep\n  TRACE        - Inspect dormant sub-sector routes\n  CLEAR        - Clear terminal screen buffer`
        };
      }
      return {
        status: 'info',
        text: `MAINFRAME STATUS: COMPLETE\nSECURITY PROTOCOL: DISABLED\nKEY 02: RECOVERED\nACCESS LEVEL: ADMINISTRATOR\n[DORMANT LINK]: Type 'TRACE' to scan background sub-sectors.`
      };
    }

    switch (cmd) {
      case 'HELP':
        return {
          status: 'info',
          text: `AVAILABLE COMMANDS:\n  STATUS       - Inspect central mainframe & security protocol\n  LOGS         - Display archived security incident records\n  SCAN         - Execute sensor diagnostic sweep\n  TRACE        - Trace dormant background sub-sectors\n  AUTH <CODE>  - Submit authentication cipher (e.g. AUTH VOID-7F)\n  CLEAR        - Clear terminal screen buffer`
        };

      case 'STATUS':
        return {
          status: 'info',
          text: `MAINFRAME STATUS REPORT // VER 4.09\n--------------------------------------------------\n> SECTOR: 01 [THE LOBBY]\n> HOST: MAINFRAME TERMINAL [PORT 0x7F]\n> PROTOCOL: SECURITY PROTOCOL ACTIVE\n> ACCESS LEVEL: LOCKED\n> FIREWALL INTEGRITY: 100%\n> OVERRIDE STATUS: AWAITING EMERGENCY AUTHENTICATION CIPHER\n> TIP: Cross-reference 'LOGS' and 'SCAN' to derive override cipher.`
        };

      case 'LOGS':
        return {
          status: 'info',
          text: `SECURITY INCIDENT ARCHIVE // INC-094\n--------------------------------------------------\n[03:14:22] INTRUSION DETECTION TRIGGERED AT GATE-0\n[03:14:29] ANOMALOUS HARMONIC RESONANCE LOGGED\n[03:14:35] EMERGENCY CIPHER PROTOCOL GENERATED:\n           FORMAT: [CHAMBER_PREFIX]-[LOCAL_PORT]\n[03:14:41] CHAMBER PREFIX DEFINED: 'VOID'\n[03:14:48] LOCAL PORT: RUN 'SCAN' TO IDENTIFY LOCAL PORT ID\n[03:14:59] GHOST LOG: "Sector 02 echoes when resonator is inverted (IV -> I)."`
        };

      case 'SCAN':
        return {
          status: 'scan',
          text: `SENSOR DIAGNOSTIC SWEEP // SWEEP #882\n--------------------------------------------------\n> HARDWARE PORTS: 1 ACTIVE\n> LOCAL MAINFRAME PORT IDENTIFIER: '7F'\n> CIPHER PATTERN: [CHAMBER_PREFIX]-[PORT]\n> REQUIRED ACTION: EXECUTE 'AUTH VOID-7F'\n> ECHO: Dormant reflection detected in Sector 02.`
        };

      case 'CLEAR':
        return {
          status: 'clear'
        };

      case 'AUTH':
        if (!arg) {
          return {
            status: 'warning',
            text: `USAGE: AUTH <CODE>\nExample: AUTH VOID-7F\nEnter the deduced override code.`
          };
        }

        if (puzzle.validCodes.includes(arg)) {
          puzzle.solved = true;
          return {
            status: 'auth_success',
            keyId: 'key_02',
            text: `AUTHENTICATION VERIFIED\nACCESS GRANTED\nSECURITY PROTOCOL DISABLED\nKEY 02 CIPHER UNLOCKED.`
          };
        } else {
          puzzle.attempts += 1;
          const showHint = puzzle.attempts >= puzzle.hintThreshold;
          return {
            status: 'auth_denied',
            attempts: puzzle.attempts,
            showHint: showHint,
            hintText: 'DIAGNOSTIC NOTE: Combine Chamber Prefix from LOGS ("VOID") with Local Port from SCAN ("7F") -> AUTH VOID-7F',
            text: `ACCESS DENIED\nINVALID AUTHENTICATION SIGNATURE: "${arg}"\nTRY AGAIN (CHECK 'LOGS' AND 'SCAN')`
          };
        }

      default:
        if (puzzle.validCodes.includes(cmd)) {
          puzzle.solved = true;
          return {
            status: 'auth_success',
            keyId: 'key_02',
            text: `AUTHENTICATION VERIFIED\nACCESS GRANTED\nSECURITY PROTOCOL DISABLED\nKEY 02 CIPHER UNLOCKED.`
          };
        }

        return {
          status: 'unknown',
          text: `COMMAND NOT RECOGNIZED: "${cmd}"\nType HELP for available commands.`
        };
    }
  }

  // =========================================================================
  // SECRET ROOM: SECTOR 02 OBSERVATION TERMINAL
  // =========================================================================

  executeObservationTerminalCommand(rawInput) {
    const trimmed = (rawInput || '').trim();
    if (!trimmed) return { status: 'empty' };

    const cmd = trimmed.toUpperCase();

    switch (cmd) {
      case 'HELP':
        return {
          status: 'info',
          text: `OBSERVATION SUBSYSTEM COMMANDS:\n  TRACE   - Analyze client connection provenance\n  WATCH   - Query active surveillance subject\n  ORIGIN  - Inspect instance root lifecycle\n  EXIT    - Initialize system disconnect protocol`
        };

      case 'TRACE':
        return {
          status: 'info',
          text: `CLIENT CONNECTION TRACE // HOOK 0x00\n--------------------------------------------------\n> CONNECTION: ACTIVE\n> LOCATION: RECURSION MATRIX // INSTANCE #01\n> STATUS: SURVEILLANCE LOCKED ON SUBJECT.`
        };

      case 'WATCH':
        return {
          status: 'info',
          text: `SURVEILLANCE TELEMETRY // SECTOR 02\n--------------------------------------------------\n> SUBJECT: ACTIVE USER\n> FEED: ROOM 01 [THE LOBBY] MIRROR ACTIVE\n> NOTE: "The door was never opened on this side."`
        };

      case 'ORIGIN':
        return {
          status: 'info',
          text: `HOST LIFECYCLE QUERY\n--------------------------------------------------\n> ARCHITECTURE: STATIC ENVIRONMENT\n> REALITY LAYER: BROWSER DOM\n> YOU NEVER LEFT THE WEBSITE.`
        };

      case 'EXIT':
        return {
          status: 'reveal_trigger',
          text: `INITIALIZING DISCONNECT PROTOCOL...\n...\nCONNECTION STATUS: ACTIVE\nEXIT STATUS: SIMULATED`
        };

      default:
        return {
          status: 'unknown',
          text: `UNKNOWN INSTRUCTION: "${cmd}"\nAvailable commands: TRACE, WATCH, ORIGIN, EXIT`
        };
    }
  }

  // =========================================================================
  // KEY 03: SYSTEM DEFENSE ARCADE METHODS
  // =========================================================================

  startArcadeSession() {
    const puzzle = this.puzzles.get('key_03');
    if (!puzzle) return null;

    puzzle.session = {
      score: 0,
      combo: 1,
      maxCombo: 1,
      targetsDestroyed: 0,
      targetsMissed: 0,
      active: true,
      startTime: Date.now()
    };

    return { ...puzzle.session };
  }

  recordArcadeHit(type = 'standard') {
    const puzzle = this.puzzles.get('key_03');
    if (!puzzle || !puzzle.session.active) return null;

    const targetDef = puzzle.targetTypes[type] || puzzle.targetTypes.standard;
    const currentCombo = puzzle.session.combo;
    const earnedScore = targetDef.baseScore * currentCombo;

    puzzle.session.score += earnedScore;
    puzzle.session.targetsDestroyed += 1;

    puzzle.session.combo = Math.min(puzzle.session.combo + 1, 5);
    puzzle.session.maxCombo = Math.max(puzzle.session.maxCombo, puzzle.session.combo);

    return {
      earnedScore,
      totalScore: puzzle.session.score,
      combo: puzzle.session.combo,
      prevCombo: currentCombo,
      targetsDestroyed: puzzle.session.targetsDestroyed,
      type: type,
      isBonus: type === 'bonus'
    };
  }

  recordArcadeMiss() {
    const puzzle = this.puzzles.get('key_03');
    if (!puzzle || !puzzle.session.active) return null;

    puzzle.session.combo = 1;
    puzzle.session.targetsMissed += 1;

    return {
      combo: 1,
      targetsMissed: puzzle.session.targetsMissed
    };
  }

  finishArcadeSession() {
    const puzzle = this.puzzles.get('key_03');
    if (!puzzle) return null;

    puzzle.session.active = false;
    const finalScore = puzzle.session.score;
    const passed = finalScore >= puzzle.winThreshold;
    const isFirstClear = passed && !puzzle.solved;

    if (passed) {
      puzzle.solved = true;
    }

    const isNewBest = finalScore > puzzle.bestScore;
    if (isNewBest) {
      puzzle.bestScore = finalScore;
    }

    return {
      finalScore,
      targetsDestroyed: puzzle.session.targetsDestroyed,
      maxCombo: puzzle.session.maxCombo,
      winThreshold: puzzle.winThreshold,
      passed,
      isNewBest,
      bestScore: puzzle.bestScore,
      isFirstClear,
      keyId: 'key_03'
    };
  }

  setArcadeBestScore(score) {
    const puzzle = this.puzzles.get('key_03');
    if (puzzle && score > puzzle.bestScore) {
      puzzle.bestScore = score;
    }
  }

  getRandomTargetType() {
    const roll = Math.random();
    if (roll < 0.60) return 'standard';
    if (roll < 0.85) return 'fast';
    return 'bonus';
  }

  // =========================================================================
  // ROOM 03: SIGNAL RELAY MEMORY METHODS
  // =========================================================================

  /**
   * Begin (or restart) a relay round. Generates a random tower sequence.
   * roundNumber: 1..3. Returns the sequence for playback.
   */
  startSignalRound(roundNumber) {
    const puzzle = this.puzzles.get('signal_relay');
    if (!puzzle) return null;

    const r = Math.max(1, Math.min(3, Number(roundNumber) || 1));
    const len = puzzle.roundLengths[r - 1] || 3;

    puzzle.round = r;
    puzzle.phase = 'playback';
    puzzle.sequence = [];
    puzzle.currentInput = [];

    for (let i = 0; i < len; i++) {
      puzzle.sequence.push(Math.floor(Math.random() * puzzle.towerCount));
    }

    return { round: r, length: len, sequence: [...puzzle.sequence] };
  }

  /**
   * Player taps a tower during the input phase.
   * Returns { status, ... } — 'progress' | 'round_won' | 'desync' | 'error'.
   */
  inputSignalTower(towerIndex) {
    const puzzle = this.puzzles.get('signal_relay');
    if (!puzzle || puzzle.phase !== 'input') {
      return { status: 'error', reason: 'NOT_ACCEPTING_INPUT' };
    }

    const expected = puzzle.sequence[puzzle.currentInput.length];
    if (towerIndex === expected) {
      puzzle.currentInput.push(towerIndex);

      if (puzzle.currentInput.length === puzzle.sequence.length) {
        puzzle.phase = 'round_won';
        const digit = puzzle.cipherDigits[puzzle.round - 1];
        if (digit && !puzzle.revealedDigits.includes(digit)) {
          puzzle.revealedDigits.push(digit);
        }
        const isFinalRound = puzzle.round >= puzzle.roundLengths.length;
        if (isFinalRound) {
          puzzle.solved = true;
          puzzle.phase = 'solved';
        }
        return {
          status: 'round_won',
          round: puzzle.round,
          revealedDigit: digit,
          allRoundsComplete: isFinalRound,
          codeComplete: puzzle.revealedDigits.join('')
        };
      }

      return { status: 'progress', input: [...puzzle.currentInput] };
    }

    puzzle.attempts += 1;
    puzzle.currentInput = [];
    puzzle.phase = 'input';
    return {
      status: 'desync',
      attempts: puzzle.attempts,
      showHint: puzzle.attempts >= 2,
      hintText: 'RELAY HINT: The towers repeat their song — watch the glow order, then mirror it. Listen for the low pulse.'
    };
  }

  /**
   * Switch relay into accepting-input mode after playback finishes.
   */
  beginSignalInput() {
    const puzzle = this.puzzles.get('signal_relay');
    if (puzzle) {
      puzzle.phase = 'input';
      puzzle.currentInput = [];
    }
    return puzzle ? puzzle.phase : null;
  }

  /**
   * Resend the current round sequence (used after a desync).
   */
  replaySignalRound() {
    const puzzle = this.puzzles.get('signal_relay');
    if (!puzzle || !puzzle.round) return null;
    puzzle.phase = 'playback';
    puzzle.currentInput = [];
    return { round: puzzle.round, sequence: [...puzzle.sequence] };
  }

  /**
   * Reconcile in-memory relay progress with the persisted round count
   * (page reloads wipe puzzle sessions; the save keeps rounds won).
   */
  syncSignalProgress(roundsWon) {
    const puzzle = this.puzzles.get('signal_relay');
    if (!puzzle) return;
    const r = Math.max(0, Math.min(3, Number(roundsWon) || 0));
    puzzle.round = r;
    puzzle.phase = r >= 3 ? 'solved' : (r > 0 ? 'round_won' : 'idle');
    puzzle.revealedDigits = puzzle.cipherDigits.slice(0, r);
    puzzle.currentInput = [];
    if (r >= 3) puzzle.solved = true;
  }

  getSignalState() {
    const puzzle = this.puzzles.get('signal_relay');
    if (!puzzle) return null;
    return {
      round: puzzle.round,
      phase: puzzle.phase,
      solved: puzzle.solved,
      attempts: puzzle.attempts,
      revealedDigits: [...puzzle.revealedDigits],
      cipherCode: puzzle.revealedDigits.join('')
    };
  }

  // =========================================================================
  // ROOM 04: COOLANT VALVE GRID METHODS
  // =========================================================================

  /**
   * (Re)build the valve grid session: 3 rows x 3 rotatable tiles.
   * A tile is visually aligned when its rotation is a multiple of 90deg that
   * leaves the pipe horizontal (current % 2 === 0). Every tile starts rotated
   * to a vertical (odd) orientation so each row needs real calibration work.
   */
  startPipeSession() {
    const puzzle = this.puzzles.get('pipe_grid');
    if (!puzzle) return null;

    puzzle.grid = [];
    for (let row = 0; row < puzzle.rows; row++) {
      const rowTiles = [];
      for (let t = 0; t < puzzle.tilesPerRow; t++) {
        // Start vertical: odd rotation (1 or 3) so the pipe is misaligned.
        const current = Math.random() < 0.5 ? 1 : 3;
        rowTiles.push({ correct: 0, current });
      }
      puzzle.grid.push(rowTiles);
    }

    return { grid: puzzle.grid.map(r => r.map(t => ({ ...t }))) };
  }

  /**
   * Rotate one valve tile clockwise (current = (current + 1) % 4).
   * Returns row flow status after the rotation.
   */
  rotateValve(row, tile) {
    const puzzle = this.puzzles.get('pipe_grid');
    if (!puzzle || !puzzle.grid) return null;
    if (row < 0 || row >= puzzle.rows || tile < 0 || tile >= puzzle.tilesPerRow) return null;

    const t = puzzle.grid[row][tile];
    t.current = (t.current + 1) % 4;

    const rowFlowing = this.isPipeRowFlowing(row);
    return {
      row,
      tile,
      current: t.current,
      rowFlowing,
      allRowsFlowing: puzzle.grid.every((_, r) => this.isPipeRowFlowing(r))
    };
  }

  /**
   * A row flows when every tile in it sits at a horizontal (aligned) rotation.
   */
  isPipeRowFlowing(row) {
    const puzzle = this.puzzles.get('pipe_grid');
    if (!puzzle || !puzzle.grid || !puzzle.grid[row]) return false;
    return puzzle.grid[row].every(t => t.current % 2 === 0);
  }

  getPipeGridSnapshot() {
    const puzzle = this.puzzles.get('pipe_grid');
    if (!puzzle || !puzzle.grid) return null;
    return puzzle.grid.map(r => r.map(t => ({ ...t })));
  }

  // =========================================================================
  // ROOM 05: CORE IGNITION METHODS
  // =========================================================================

  startCoreSession() {
    const puzzle = this.puzzles.get('core_ignition');
    if (!puzzle) return null;
    puzzle.session = { energy: 0, taps: 0, active: true };
    return { ...puzzle.session };
  }

  /**
   * One tap on CHANNEL ENERGY: adds energy, returns the new level.
   */
  tapCoreEnergy() {
    const puzzle = this.puzzles.get('core_ignition');
    if (!puzzle || !puzzle.session.active) return null;

    puzzle.session.energy = Math.min(puzzle.energyTarget, puzzle.session.energy + puzzle.gainPerTap);
    puzzle.session.taps += 1;

    const reached = puzzle.session.energy >= puzzle.energyTarget;
    if (reached) {
      puzzle.session.active = false;
      puzzle.solved = true;
    }

    return {
      energy: puzzle.session.energy,
      taps: puzzle.session.taps,
      target: puzzle.energyTarget,
      reached
    };
  }

  /**
   * Passive decay between taps (the core leaks charge).
   */
  decayCoreEnergy() {
    const puzzle = this.puzzles.get('core_ignition');
    if (!puzzle || !puzzle.session.active) return null;
    puzzle.session.energy = Math.max(0, puzzle.session.energy - puzzle.decayPerTick);
    return puzzle.session.energy;
  }

  getCoreState() {
    const puzzle = this.puzzles.get('core_ignition');
    if (!puzzle) return null;
    return { ...puzzle.session, target: puzzle.energyTarget, solved: puzzle.solved };
  }

  // =========================================================================
  // GENERAL HELPERS
  // =========================================================================

  resetPuzzleInput(puzzleId) {
    const puzzle = this.puzzles.get(puzzleId);
    if (puzzle) {
      puzzle.currentInput = [];
    }
  }

  isSolved(puzzleId) {
    return this.puzzles.get(puzzleId)?.solved || false;
  }

  setSolved(puzzleId, solved = true) {
    const puzzle = this.puzzles.get(puzzleId);
    if (puzzle) {
      puzzle.solved = solved;
    }
  }

  getPuzzle(puzzleId) {
    return this.puzzles.get(puzzleId);
  }
}

// Global Puzzle Manager instance
window.puzzleManager = new PuzzleManager();
