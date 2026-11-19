/**
 * Escape The Website - Game Engine & Multi-Room Transition Architecture (v3)
 * Manages the active session, persistent state, inventory, time tracking,
 * arcade scores, secret discovery, the FIVE sub-level room progression
 * (Lobby -> Orb Atrium -> Signal Vault -> Cooling Tunnels -> The Core),
 * gold token collectibles, rank records and room lifecycles.
 */

const STORAGE_KEY = 'escape_the_website_save_v2';
const BEST_TIME_STORAGE_KEY = 'escape_the_website_best_time_v1';
const RUNS_STORAGE_KEY = 'escape_the_website_runs_v1';

class GameManager {
  constructor() {
    // Sub-Level registry: five rooms + the hidden Sector 02 secret.
    // `collectible` describes what must be found in the room before its door opens.
    this.rooms = {
      lobby: {
        id: 'lobby',
        index: 0,
        number: 'ROOM 01',
        name: 'THE LOBBY',
        subtitle: 'Sub-Level 01 • Mainframe Terminal',
        description: 'An abandoned digital chamber humming with dormant power conduits. Multiple access ports lie dormant.',
        locked: false,
        ambientColor: '#00f0ff',
        collectibleLabel: 'KEYS',
        collectibleTotal: 3
      },
      orbatrium: {
        id: 'orbatrium',
        index: 1,
        number: 'ROOM 02',
        name: 'THE ORB ATRIUM',
        subtitle: 'Sub-Level 02 • Gravitational Garden',
        description: 'A suspended garden of drifting plasma orbs. The gravity lift refuses to engage without its three energy cores.',
        locked: true,
        ambientColor: '#00ff88',
        collectibleLabel: 'ORBS',
        collectibleTotal: 3
      },
      vault: {
        id: 'vault',
        index: 2,
        number: 'ROOM 03',
        name: 'THE SIGNAL VAULT',
        subtitle: 'Sub-Level 03 • Cipher Archive',
        description: 'A sound-proof archive vault. The relay console replays ghost signals — and hides the vault cipher.',
        locked: true,
        ambientColor: '#ffb800',
        collectibleLabel: 'SIGNALS',
        collectibleTotal: 3
      },
      tunnels: {
        id: 'tunnels',
        index: 3,
        number: 'ROOM 04',
        name: 'THE COOLING TUNNELS',
        subtitle: 'Sub-Level 04 • Hydraulic Sector',
        description: 'Steam-filled maintenance tunnels. Coolant valves have been misaligned for years — and the hydraulic gate is dead.',
        locked: true,
        ambientColor: '#ff3366',
        collectibleLabel: 'FUSES',
        collectibleTotal: 3
      },
      core: {
        id: 'core',
        index: 4,
        number: 'ROOM 05',
        name: 'THE CORE',
        subtitle: 'Sub-Level 05 • Reactor Terminus',
        description: 'The reactor heart of the website. Three shattered fragments power the final ignition. This is the real exit.',
        locked: true,
        ambientColor: '#a855f7',
        collectibleLabel: 'FRAGMENTS',
        collectibleTotal: 3
      },
      sector02: {
        id: 'sector02',
        index: -1,
        number: 'ROOM 02',
        name: 'THE OBSERVATION CHAMBER',
        subtitle: 'Sector 02 Surveillance Overlook',
        description: 'A cold, abandoned surveillance overlook staring through one-way glass back into the Lobby.',
        locked: false,
        ambientColor: '#a855f7',
        collectibleLabel: 'KEYS',
        collectibleTotal: 3
      }
    };

    const goldRooms = ['lobby', 'orbatrium', 'vault', 'tunnels', 'core'];
    this.goldRooms = goldRooms;

    this.initialState = {
      version: 2,
      // Room 01
      keysCollected: [],
      // Room 02
      orbsCollected: [],
      // Room 03
      signalRoundsWon: 0,
      goldChip: false,
      // Room 04
      fusesLit: [],
      boosterClaimed: false,
      // Room 05
      fragmentsCollected: [],
      // Cross-room collectible (one hidden token per room)
      goldTokens: [],
      goldRooms: goldRooms,
      // Session
      score: 0,
      currentRoom: 'lobby',
      currentRoomIndex: 0,
      unlockedRooms: ['lobby'],
      gameStarted: false,
      gameCompleted: false,
      gameStartTime: null,
      completionTime: null,
      finalTime: null,
      timestamp: null,
      // Meta (persists across resets)
      arcadeBestScore: 0,
      secretDiscovered: false,
      roomBestTimes: {},
      bestRank: null,
      bestGoldCount: 0
    };

    // Working state
    this.state = { ...this.initialState, keysCollected: [], orbsCollected: [], fusesLit: [], fragmentsCollected: [], goldTokens: [], roomBestTimes: {} };
    this.listeners = new Set();
  }

  /**
   * Initializes the game state, loads from storage, or creates initial state
   */
  init() {
    const hasSave = this.loadState();
    if (!hasSave) {
      this.state = this.freshState();
    }

    // Sync puzzle states from loaded keys
    if (window.puzzleManager) {
      if (this.state.keysCollected.includes('key_01')) {
        window.puzzleManager.setSolved('key_01', true);
      }
      if (this.state.keysCollected.includes('key_02')) {
        window.puzzleManager.setSolved('key_02', true);
      }
      if (this.state.keysCollected.includes('key_03')) {
        window.puzzleManager.setSolved('key_03', true);
      }
      if (this.state.arcadeBestScore) {
        window.puzzleManager.setArcadeBestScore(this.state.arcadeBestScore);
      }
    }

    return this.state;
  }

  /**
   * A pristine per-run state that preserves meta-progression values.
   */
  freshState() {
    const meta = {
      arcadeBestScore: this.state.arcadeBestScore || 0,
      secretDiscovered: Boolean(this.state.secretDiscovered),
      roomBestTimes: { ...(this.state.roomBestTimes || {}) },
      bestRank: this.state.bestRank || null,
      bestGoldCount: this.state.bestGoldCount || 0
    };

    return {
      ...this.initialState,
      ...meta,
      keysCollected: [],
      orbsCollected: [],
      fusesLit: [],
      fragmentsCollected: [],
      goldTokens: [],
      unlockedRooms: meta.secretDiscovered ? ['lobby', 'sector02'] : ['lobby'],
      currentRoom: 'lobby',
      currentRoomIndex: 0
    };
  }

  /**
   * Register a state change listener
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify subscribers of state mutations
   */
  notify(eventType, payload) {
    this.listeners.forEach(callback => {
      try {
        callback(eventType, payload, this.getState());
      } catch (e) {
        console.error('[GameManager] Error in listener callback:', e);
      }
    });
  }

  /**
   * Start or resume game session
   */
  startGame() {
    this.state.gameStarted = true;
    if (!this.state.gameStartTime) {
      this.state.gameStartTime = Date.now();
    }
    if (!this.state.timestamp) {
      this.state.timestamp = Date.now();
    }
    this.saveState();
    this.notify('GAME_STARTED', this.state);
  }

  /**
   * Complete game session on final escape (called only after Room 05)
   */
  completeGame() {
    if (!this.state.gameCompleted) {
      this.state.gameCompleted = true;
      this.state.completionTime = Date.now();

      const start = this.state.gameStartTime || (this.state.completionTime - 120000);
      this.state.finalTime = this.formatElapsedTime(start, this.state.completionTime);

      // Persist meta records: total best time + rank + gold count
      const finalMs = Math.max(0, this.state.completionTime - start);
      if (!this.state.roomBestTimes.total || finalMs < this.state.roomBestTimes.total) {
        this.state.roomBestTimes.total = finalMs;
      }
      const goldCount = (this.state.goldTokens || []).length;
      if (goldCount > (this.state.bestGoldCount || 0)) {
        this.state.bestGoldCount = goldCount;
      }
      const rank = this.computeRank(finalMs);
      if (rank) {
        const order = { C: 1, B: 2, A: 3, S: 4 };
        if (!this.state.bestRank || order[rank] > order[this.state.bestRank]) {
          this.state.bestRank = rank;
        }
      }

      this.saveState();
      this.notify('GAME_COMPLETED', this.state);
    }
    return this.state;
  }

  /**
   * Mark secret room as discovered (persists across resets)
   */
  discoverSecret() {
    this.state.secretDiscovered = true;
    if (!this.state.unlockedRooms.includes('sector02')) {
      this.state.unlockedRooms.push('sector02');
    }
    this.saveState();
    this.notify('SECRET_DISCOVERED', { secretDiscovered: true });
  }

  /**
   * Format milliseconds into MM:SS or HH:MM:SS
   */
  formatElapsedTime(startTime, endTime) {
    const elapsedMs = Math.max(0, endTime - startTime);
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }

  /**
   * Get formatted current run duration
   */
  getCurrentRunTime() {
    if (this.state.finalTime) return this.state.finalTime;
    if (!this.state.gameStartTime) return '00:00';
    return this.formatElapsedTime(this.state.gameStartTime, Date.now());
  }

  /**
   * Rank formula: S < 8:00, A < 14:00, B < 22:00, C otherwise.
   */
  computeRank(finalMs) {
    if (typeof finalMs !== 'number' || finalMs <= 0) return null;
    if (finalMs < 8 * 60 * 1000) return 'S';
    if (finalMs < 14 * 60 * 1000) return 'A';
    if (finalMs < 22 * 60 * 1000) return 'B';
    return 'C';
  }

  /**
   * Record a per-room best time (ms). Returns true if it was a record.
   */
  recordRoomTime(roomId, elapsedMs) {
    if (typeof elapsedMs !== 'number' || elapsedMs <= 0) return false;
    if (!this.state.roomBestTimes) this.state.roomBestTimes = {};
    const best = this.state.roomBestTimes[roomId];
    if (!best || elapsedMs < best) {
      this.state.roomBestTimes[roomId] = elapsedMs;
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Room Transition Engine
   */
  enterRoom(roomId) {
    if (!this.rooms[roomId]) return false;

    const previousRoom = this.state.currentRoom;
    this.state.currentRoom = roomId;
    const roomDef = this.rooms[roomId];
    if (roomDef.index >= 0) {
      this.state.currentRoomIndex = roomDef.index;
    }
    this.saveState();

    this.notify('ROOM_CHANGED', {
      from: previousRoom,
      to: roomId,
      roomData: roomDef
    });
    return true;
  }

  /**
   * Unlock a newly discovered room
   */
  unlockRoom(roomId) {
    if (!this.rooms[roomId]) return false;

    if (!this.state.unlockedRooms.includes(roomId)) {
      this.state.unlockedRooms.push(roomId);
      this.saveState();
      this.notify('ROOM_UNLOCKED', { roomId });
      return true;
    }
    return false;
  }

  // =========================================================================
  // ROOM COLLECTIBLE ENGINES
  // =========================================================================

  /**
   * Award a collected key (guards against duplicate points)
   */
  collectKey(keyId) {
    if (!this.state.keysCollected.includes(keyId)) {
      this.state.keysCollected.push(keyId);
      this.addScore(300);

      if (window.puzzleManager) {
        window.puzzleManager.setSolved(keyId, true);
      }

      this.saveState();
      this.notify('KEY_COLLECTED', { keyId, count: this.state.keysCollected.length });

      // Check if all 3 keys are collected
      if (this.state.keysCollected.length === 3) {
        this.notify('ALL_KEYS_COLLECTED', this.state);
      }

      return true;
    }
    return false;
  }

  /**
   * Room 02: catch a drifting plasma orb
   */
  collectOrb(orbId) {
    if (!this.state.orbsCollected.includes(orbId)) {
      this.state.orbsCollected.push(orbId);
      this.addScore(150);
      this.saveState();
      this.notify('ORB_COLLECTED', { orbId, count: this.state.orbsCollected.length });
      if (this.state.orbsCollected.length === 3) {
        this.notify('ROOM_COLLECTIBLES_COMPLETE', { roomId: 'orbatrium' });
      }
      return true;
    }
    return false;
  }

  /**
   * Room 03: win a signal relay memory round (rounds are 1-based: 1..3)
   */
  winSignalRound(roundNumber) {
    const r = Math.max(1, Math.min(3, Number(roundNumber) || 1));
    if (this.state.signalRoundsWon < r) {
      this.state.signalRoundsWon = r;
      this.addScore(250);
      this.saveState();
      this.notify('SIGNAL_ROUND_WON', { round: r, count: this.state.signalRoundsWon });
      if (this.state.signalRoundsWon >= 3) {
        this.notify('ROOM_COLLECTIBLES_COMPLETE', { roomId: 'vault' });
      }
      return true;
    }
    return false;
  }

  /**
   * Room 03: claim the GOLD DATACHIP after all relay rounds are won
   */
  claimGoldChip() {
    if (!this.state.goldChip && this.state.signalRoundsWon >= 3) {
      this.state.goldChip = true;
      this.addScore(200);
      this.saveState();
      this.notify('GOLD_CHIP_CLAIMED', { goldChip: true });
      return true;
    }
    return false;
  }

  /**
   * Room 04: light a coolant fuse by solving its valve row
   */
  lightFuse(fuseId) {
    if (!this.state.fusesLit.includes(fuseId)) {
      this.state.fusesLit.push(fuseId);
      this.addScore(200);
      this.saveState();
      this.notify('FUSE_LIT', { fuseId, count: this.state.fusesLit.length });
      if (this.state.fusesLit.length === 3) {
        this.notify('ROOM_COLLECTIBLES_COMPLETE', { roomId: 'tunnels' });
      }
      return true;
    }
    return false;
  }

  /**
   * Room 04: claim the PRESSURE BOOSTER once all fuses are lit
   */
  claimBooster() {
    if (!this.state.boosterClaimed && this.state.fusesLit.length >= 3) {
      this.state.boosterClaimed = true;
      this.addScore(200);
      this.saveState();
      this.notify('BOOSTER_CLAIMED', { boosterClaimed: true });
      return true;
    }
    return false;
  }

  /**
   * Room 05: collect a hidden core fragment
   */
  collectFragment(fragmentId) {
    if (!this.state.fragmentsCollected.includes(fragmentId)) {
      this.state.fragmentsCollected.push(fragmentId);
      this.addScore(200);
      this.saveState();
      this.notify('FRAGMENT_COLLECTED', { fragmentId, count: this.state.fragmentsCollected.length });
      if (this.state.fragmentsCollected.length === 3) {
        this.notify('ROOM_COLLECTIBLES_COMPLETE', { roomId: 'core' });
      }
      return true;
    }
    return false;
  }

  /**
   * Collect the hidden gold token of a room (+100 pts, one per room)
   */
  collectGoldToken(roomId) {
    if (this.goldRooms.includes(roomId) && !this.state.goldTokens.includes(roomId)) {
      this.state.goldTokens.push(roomId);
      this.addScore(100);
      this.saveState();
      this.notify('GOLD_TOKEN_COLLECTED', { roomId, count: this.state.goldTokens.length });
      return true;
    }
    return false;
  }

  /**
   * Room progress snapshot for HUD / objectives rendering.
   * have = number of collectibles found; total = required; label = HUD word.
   */
  getRoomProgress(roomId) {
    const room = this.rooms[roomId];
    if (!room) return { have: 0, total: 3, label: 'ITEMS' };
    const s = this.state;
    let have = 0;
    switch (roomId) {
      case 'lobby': have = s.keysCollected.length; break;
      case 'orbatrium': have = s.orbsCollected.length; break;
      case 'vault': have = s.signalRoundsWon; break;
      case 'tunnels': have = s.fusesLit.length; break;
      case 'core': have = s.fragmentsCollected.length; break;
      default: have = s.keysCollected.length;
    }
    return { have, total: room.collectibleTotal, label: room.collectibleLabel };
  }

  /**
   * True when the room's door may be opened (all collectibles found)
   */
  isRoomDoorReady(roomId) {
    const p = this.getRoomProgress(roomId);
    return p.have >= p.total;
  }

  /**
   * Reward item readiness used by door handlers (chip / booster)
   */
  hasReward(rewardId) {
    const s = this.state;
    if (rewardId === 'gold_chip') return Boolean(s.goldChip);
    if (rewardId === 'booster') return Boolean(s.boosterClaimed);
    return false;
  }

  /**
   * Update arcade high score
   */
  recordArcadeBestScore(score) {
    if (score > (this.state.arcadeBestScore || 0)) {
      this.state.arcadeBestScore = score;
      this.saveState();
      this.notify('ARCADE_BEST_UPDATED', { bestScore: score });
      return true;
    }
    return false;
  }

  /**
   * Add score points
   */
  addScore(points) {
    this.state.score += points;
    this.saveState();
    this.notify('SCORE_UPDATED', { score: this.state.score });
  }

  /**
   * Save game state to localStorage
   */
  saveState() {
    try {
      if (typeof localStorage === 'undefined') return false;
      const serialized = JSON.stringify(this.state);
      localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Load game state from localStorage (v2 schema; older saves are discarded)
   */
  loadState() {
    try {
      if (typeof localStorage === 'undefined') return false;
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed || parsed.version !== 2) {
          return false; // legacy v1 save — start clean
        }
        const arr = (v) => Array.isArray(v) ? [...v] : [];
        this.state = {
          ...this.initialState,
          ...parsed,
          keysCollected: arr(parsed.keysCollected),
          orbsCollected: arr(parsed.orbsCollected),
          fusesLit: arr(parsed.fusesLit),
          fragmentsCollected: arr(parsed.fragmentsCollected),
          goldTokens: arr(parsed.goldTokens),
          unlockedRooms: arr(parsed.unlockedRooms).length ? arr(parsed.unlockedRooms) : ['lobby'],
          roomBestTimes: (parsed.roomBestTimes && typeof parsed.roomBestTimes === 'object') ? { ...parsed.roomBestTimes } : {}
        };
        return true;
      }
    } catch (e) {
      this.state = this.freshState();
    }
    return false;
  }

  /**
   * Reset game state and clear localStorage while preserving meta-progression.
   * The in-memory reset always happens first so a storage failure can never
   * leave a stale run state behind.
   */
  resetState() {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      // Storage unavailable (private mode / quota) — continue with reset.
    }

    this.state = this.freshState();

    if (window.puzzleManager) {
      window.puzzleManager.initPuzzles();
    }

    this.saveState();
    this.notify('STATE_RESET', this.state);
    return true;
  }

  /**
   * Get active state clone
   */
  getState() {
    return {
      ...this.state,
      keysCollected: [...this.state.keysCollected],
      orbsCollected: [...this.state.orbsCollected],
      fusesLit: [...this.state.fusesLit],
      fragmentsCollected: [...this.state.fragmentsCollected],
      goldTokens: [...this.state.goldTokens],
      unlockedRooms: [...this.state.unlockedRooms],
      roomBestTimes: { ...(this.state.roomBestTimes || {}) }
    };
  }

  /**
   * Check if all 3 keys are recovered (Room 01 door)
   */
  hasAllKeys() {
    return this.state.keysCollected.length >= 3;
  }

  /**
   * Get current room information
   */
  getCurrentRoomInfo() {
    return this.rooms[this.state.currentRoom] || this.rooms.lobby;
  }
}

// Global Game Manager instance
window.gameManager = new GameManager();
