/**
 * Escape the Website v4 — Core Storybook Engine
 * Framework-free state, room registry, inventory, 3-level hints,
 * wrong-choice variations, star ratings, and safe localStorage persistence.
 */
(function (root) {
  'use strict';

  const STORAGE_KEY_V4 = 'escape_the_website_v4_save';

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function createEmptyRoomState() {
    return {
      inventory: [],
      usedItems: [],
      flags: {},
      hintsUsed: 0,
      hintLevel: 0,
      mistakes: 0,
      lastWrongIndex: -1,
      completed: false,
      stars: 0
    };
  }

  function getSafeStorage(targetRoot) {
    try {
      return typeof targetRoot.localStorage !== 'undefined' ? targetRoot.localStorage : null;
    } catch (err) {
      return null;
    }
  }

  class EscapeEngine {
    constructor(options) {
      const opts = options || {};
      this.storageKey = opts.storageKey || STORAGE_KEY_V4;
      this.storage = opts.storage !== undefined
        ? opts.storage
        : getSafeStorage(root);
      this.rooms = new Map();
      this.roomOrder = [];
      this.selectedItemId = null;
      this.listeners = new Set();

      this.state = this.createFreshState();

      if (Array.isArray(opts.rooms)) {
        opts.rooms.forEach((r) => this.registerRoom(r));
      }
    }

    createFreshState() {
      return {
        version: 4,
        started: false,
        startedAt: null,
        finishedAt: null,
        currentRoomId: this.roomOrder[0] || null,
        diaryPages: [],
        rooms: {}
      };
    }

    registerRoom(roomConfig) {
      if (!roomConfig || !roomConfig.id) {
        throw new Error('Room config must include an id.');
      }
      if (!this.rooms.has(roomConfig.id)) {
        this.roomOrder.push(roomConfig.id);
      }
      this.rooms.set(roomConfig.id, roomConfig);

      if (!this.state.currentRoomId) {
        this.state.currentRoomId = roomConfig.id;
      }
      if (!this.state.rooms[roomConfig.id]) {
        this.state.rooms[roomConfig.id] = createEmptyRoomState();
      }
      return roomConfig;
    }

    getRoom(roomId) {
      const id = roomId || this.state.currentRoomId;
      return this.rooms.get(id) || null;
    }

    getCurrentRoom() {
      return this.getRoom(this.state.currentRoomId);
    }

    getRoomState(roomId) {
      const id = roomId || this.state.currentRoomId;
      if (!id) return createEmptyRoomState();
      if (!this.state.rooms[id]) {
        this.state.rooms[id] = createEmptyRoomState();
      }
      return this.state.rooms[id];
    }

    subscribe(fn) {
      if (typeof fn === 'function') {
        this.listeners.add(fn);
      }
      return () => this.listeners.delete(fn);
    }

    emit(eventType, detail) {
      this.listeners.forEach((fn) => {
        try {
          fn(eventType, detail, this.getSnapshot());
        } catch (err) {
          // Listener errors should never break engine flow
        }
      });
    }

    getSnapshot() {
      return {
        state: clone(this.state),
        selectedItemId: this.selectedItemId,
        currentRoomId: this.state.currentRoomId
      };
    }

    init() {
      const loaded = this.loadState();
      if (!loaded) {
        this.state = this.createFreshState();
        this.roomOrder.forEach((id) => {
          this.state.rooms[id] = createEmptyRoomState();
        });
      }
      if (!this.state.currentRoomId || !this.rooms.has(this.state.currentRoomId)) {
        this.state.currentRoomId = this.roomOrder[0] || null;
      }
      this.ensureRoomInitialized(this.state.currentRoomId);
      this.selectedItemId = null;
      return this.getSnapshot();
    }

    ensureRoomInitialized(roomId) {
      const room = this.getRoom(roomId);
      if (!room) return;
      const roomState = this.getRoomState(room.id);
      if (typeof room.onInit === 'function') {
        const ctx = this.buildInteractionContext(room, roomState);
        room.onInit(ctx);
      }
    }

    startGame() {
      this.state.started = true;
      if (!this.state.startedAt) {
        this.state.startedAt = Date.now();
      }
      if (!this.state.currentRoomId && this.roomOrder.length) {
        this.state.currentRoomId = this.roomOrder[0];
      }
      this.ensureRoomInitialized(this.state.currentRoomId);
      this.saveState();
      this.emit('GAME_STARTED', { roomId: this.state.currentRoomId });
      return this.getSnapshot();
    }

    calculateStars(hintsUsed, mistakes) {
      const hints = Math.max(0, Number(hintsUsed) || 0);
      const errs = Math.max(0, Number(mistakes) || 0);
      if (hints === 0 && errs <= 1) return 3;
      if (hints <= 1) return 2;
      return 1;
    }

    hasItem(itemId, roomId) {
      const rs = this.getRoomState(roomId);
      return rs.inventory.includes(itemId);
    }

    hasUsedItem(itemId, roomId) {
      const rs = this.getRoomState(roomId);
      return rs.usedItems.includes(itemId);
    }

    selectItem(itemId) {
      const rs = this.getRoomState();
      if (!itemId || !rs.inventory.includes(itemId) || this.selectedItemId === itemId) {
        this.selectedItemId = null;
      } else {
        this.selectedItemId = itemId;
      }
      this.emit('ITEM_SELECTED', { itemId: this.selectedItemId });
      return this.selectedItemId;
    }

    clearSelectedItem() {
      this.selectedItemId = null;
      this.emit('ITEM_SELECTED', { itemId: null });
    }

    buildInteractionContext(room, roomState) {
      const collectedItems = [];
      let consumedItem = null;

      return {
        room,
        roomState,
        hasItem: (id) => roomState.inventory.includes(id),
        hasUsedItem: (id) => roomState.usedItems.includes(id),
        getFlag: (key) => roomState.flags[key],
        setFlag: (key, val) => {
          roomState.flags[key] = val;
        },
        giveItem: (itemId) => {
          if (!room.items || !room.items[itemId]) return false;
          if (!roomState.inventory.includes(itemId) && !roomState.usedItems.includes(itemId)) {
            roomState.inventory.push(itemId);
            roomState.hintLevel = 0;
            collectedItems.push(room.items[itemId]);
            return true;
          }
          return false;
        },
        consumeItem: (itemId) => {
          const idx = roomState.inventory.indexOf(itemId);
          if (idx >= 0) {
            roomState.inventory.splice(idx, 1);
          }
          if (!roomState.usedItems.includes(itemId)) {
            roomState.usedItems.push(itemId);
          }
          if (this.selectedItemId === itemId) {
            this.selectedItemId = null;
          }
          consumedItem = itemId;
        },
        getCollectedItems: () => collectedItems,
        getConsumedItem: () => consumedItem
      };
    }

    inspectHotspot(hotspotId) {
      const room = this.getCurrentRoom();
      if (!room) return null;
      const roomState = this.getRoomState(room.id);
      if (roomState.completed) {
        return { type: 'completed', caption: room.winSequence.transitionText || 'Room complete.' };
      }

      const hotspot = (room.hotspots || []).find((h) => h.id === hotspotId);
      if (!hotspot) return null;

      if (this.selectedItemId) {
        return this.useItemOnHotspot(this.selectedItemId, hotspotId);
      }

      const ctx = this.buildInteractionContext(room, roomState);
      const outcome = typeof hotspot.onInspect === 'function'
        ? (hotspot.onInspect(ctx) || {})
        : { caption: hotspot.inspectText || '' };

      if (outcome.wrong) {
        return this.recordWrongChoice(hotspot, outcome.caption, outcome.reaction || null);
      }

      if (outcome.win) {
        const winResult = this.completeCurrentRoom(outcome.caption);
        return winResult;
      }

      this.saveState();
      const collected = ctx.getCollectedItems();
      const result = {
        type: outcome.reaction ? 'reaction' : (collected.length > 0 ? 'collect' : 'inspect'),
        reaction: outcome.reaction || null,
        openCodeLock: Boolean(outcome.openCodeLock),
        openDiaryReader: Boolean(outcome.openDiaryReader),
        hotspotId: hotspot.id,
        caption: outcome.caption || '',
        collectedItems: collected,
        sound: outcome.sound || (collected.length > 0 ? 'collect' : 'inspect')
      };
      this.emit('ROOM_INTERACTION', result);
      return result;
    }

    submitRoomCode(code) {
      const room = this.getCurrentRoom();
      if (!room || typeof room.submitCode !== 'function') return null;
      const roomState = this.getRoomState(room.id);
      if (roomState.completed) return null;

      const ctx = this.buildInteractionContext(room, roomState);
      const outcome = room.submitCode(code, ctx) || {};

      if (outcome.win) {
        return this.completeCurrentRoom(outcome.caption);
      }

      if (outcome.wrong) {
        const padlockHs = (room.hotspots || []).find((h) => h.id === 'padlock') || null;
        return this.recordWrongChoice(padlockHs, outcome.caption, outcome.reaction || null);
      }

      return null;
    }

    useItemOnHotspot(itemId, hotspotId) {
      const room = this.getCurrentRoom();
      if (!room) return null;
      const roomState = this.getRoomState(room.id);
      if (roomState.completed) return null;
      if (!roomState.inventory.includes(itemId)) return null;

      const hotspot = (room.hotspots || []).find((h) => h.id === hotspotId);
      if (!hotspot) return null;

      const ctx = this.buildInteractionContext(room, roomState);
      const outcome = typeof hotspot.onUseItem === 'function'
        ? hotspot.onUseItem(itemId, ctx)
        : null;

      if (!outcome || outcome.wrong) {
        this.selectedItemId = null;
        return this.recordWrongChoice(hotspot, outcome && outcome.caption);
      }

      if (outcome.consumed) {
        ctx.consumeItem(itemId);
      }

      if (outcome.win) {
        return this.completeCurrentRoom(outcome.caption);
      }

      this.selectedItemId = null;
      this.saveState();
      const result = {
        type: 'item_used',
        hotspotId: hotspot.id,
        itemId,
        caption: outcome.caption || '',
        collectedItems: ctx.getCollectedItems(),
        sound: outcome.sound || 'collect'
      };
      this.emit('ROOM_INTERACTION', result);
      return result;
    }

    combineItems(itemA, itemB) {
      const room = this.getCurrentRoom();
      if (!room || !itemA || !itemB || itemA === itemB) return null;
      const roomState = this.getRoomState(room.id);
      if (roomState.completed) return null;
      if (!roomState.inventory.includes(itemA) || !roomState.inventory.includes(itemB)) return null;

      this.selectedItemId = null;

      if (typeof room.onCombineItems !== 'function') {
        return this.recordWrongChoice(null, 'Those two do not fit together.');
      }

      const ctx = this.buildInteractionContext(room, roomState);
      const outcome = room.onCombineItems(itemA, itemB, ctx) || {};

      if (outcome.wrong) {
        return this.recordWrongChoice(null, outcome.caption, outcome.reaction || null);
      }

      if (outcome.consumeBoth) {
        ctx.consumeItem(itemA);
        ctx.consumeItem(itemB);
      }

      this.saveState();
      const result = {
        type: 'craft',
        caption: outcome.caption || 'Combined!',
        collectedItems: ctx.getCollectedItems(),
        sound: outcome.sound || 'collect'
      };
      this.emit('ROOM_INTERACTION', result);
      return result;
    }

    recordWrongChoice(hotspot, customCaption, reaction) {
      const room = this.getCurrentRoom();
      const roomState = this.getRoomState(room.id);
      roomState.mistakes += 1;

      const pool = (hotspot && Array.isArray(hotspot.wrongChoices) && hotspot.wrongChoices.length)
        ? hotspot.wrongChoices
        : (Array.isArray(room.wrongChoices) && room.wrongChoices.length
          ? room.wrongChoices
          : ['That does not fit here.', 'Nothing happens.', 'Try another spot.']);

      let caption = customCaption;
      if (!caption) {
        let nextIdx = (roomState.lastWrongIndex + 1) % pool.length;
        if (pool.length > 1 && nextIdx === roomState.lastWrongIndex) {
          nextIdx = (nextIdx + 1) % pool.length;
        }
        roomState.lastWrongIndex = nextIdx;
        caption = pool[nextIdx];
      }

      this.saveState();
      const result = {
        type: 'wrong',
        reaction: reaction || null,
        hotspotId: hotspot ? hotspot.id : null,
        caption,
        mistakes: roomState.mistakes,
        sound: 'wrong'
      };
      this.emit('WRONG_CHOICE', result);
      return result;
    }

    requestHint() {
      const room = this.getCurrentRoom();
      if (!room) return null;
      const roomState = this.getRoomState(room.id);

      const hints = typeof room.getHints === 'function'
        ? room.getHints(roomState)
        : (room.hints || []);

      if (!hints.length) return null;

      if (roomState.hintLevel < 3) {
        roomState.hintLevel += 1;
        roomState.hintsUsed += 1;
      }

      const idx = Math.min(hints.length - 1, Math.max(0, roomState.hintLevel - 1));
      const entry = hints[idx];
      this.saveState();

      const result = {
        type: 'hint',
        level: roomState.hintLevel,
        hintsUsed: roomState.hintsUsed,
        text: entry.text,
        targetHotspotId: roomState.hintLevel >= 3 ? (entry.targetHotspotId || null) : null,
        targetItemId: roomState.hintLevel >= 3 ? (entry.targetItemId || null) : null
      };
      this.emit('HINT_SHOWN', result);
      return result;
    }

    completeCurrentRoom(captionOverride) {
      const room = this.getCurrentRoom();
      if (!room) return null;
      const roomState = this.getRoomState(room.id);

      roomState.completed = true;
      roomState.stars = this.calculateStars(roomState.hintsUsed, roomState.mistakes);
      this.selectedItemId = null;

      const diaryPage = room.winSequence && room.winSequence.diaryPage;
      if (diaryPage && !this.state.diaryPages.some((p) => p.number === diaryPage.number)) {
        this.state.diaryPages.push(clone(diaryPage));
      }

      const isFinale = Boolean(room.winSequence && room.winSequence.isFinale);
      if (isFinale && !this.state.finishedAt) {
        this.state.finishedAt = Date.now();
      }

      this.saveState();

      const result = {
        type: 'win',
        isFinale,
        roomId: room.id,
        stars: roomState.stars,
        hintsUsed: roomState.hintsUsed,
        mistakes: roomState.mistakes,
        caption: captionOverride || (room.winSequence && room.winSequence.transitionText) || 'The way opens.',
        transitionText: (room.winSequence && room.winSequence.transitionText) || 'Turning the page...',
        diaryPage: diaryPage ? clone(diaryPage) : null,
        nextRoomId: (room.winSequence && room.winSequence.nextRoomId) || null,
        stats: isFinale ? this.getTotalStats() : null,
        sound: 'win'
      };
      this.emit('ROOM_WON', result);
      return result;
    }

    getTotalStats() {
      const totalStars = this.roomOrder.reduce((sum, id) => {
        const rs = this.state.rooms[id];
        return sum + (rs && rs.stars ? rs.stars : 0);
      }, 0);
      const maxStars = this.roomOrder.length * 3;
      const start = this.state.startedAt || Date.now();
      const end = this.state.finishedAt || Date.now();
      const elapsedMs = Math.max(0, end - start);
      const totalSec = Math.floor(elapsedMs / 1000);
      const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
      const secs = String(totalSec % 60).padStart(2, '0');
      return {
        totalStars,
        maxStars,
        elapsedMs,
        formattedTime: `${mins}:${secs}`
      };
    }

    goToNextRoom() {
      const room = this.getCurrentRoom();
      if (!room) return { moved: false, reason: 'NO_ROOM' };

      const nextId = room.winSequence && room.winSequence.nextRoomId;
      if (nextId && this.rooms.has(nextId)) {
        this.state.currentRoomId = nextId;
        this.selectedItemId = null;
        this.ensureRoomInitialized(nextId);
        this.saveState();
        this.emit('ROOM_CHANGED', { roomId: nextId });
        return { moved: true, roomId: nextId };
      }

      return { moved: false, reason: 'END_OF_AVAILABLE_ROOMS' };
    }

    restartRoom(roomId) {
      const id = roomId || this.state.currentRoomId;
      if (!id || !this.rooms.has(id)) return null;
      this.state.rooms[id] = createEmptyRoomState();
      this.selectedItemId = null;
      this.ensureRoomInitialized(id);
      this.saveState();
      this.emit('ROOM_RESTARTED', { roomId: id });
      return this.getSnapshot();
    }

    restartGame() {
      this.state = this.createFreshState();
      this.state.started = true;
      this.state.startedAt = Date.now();
      this.roomOrder.forEach((id) => {
        this.state.rooms[id] = createEmptyRoomState();
      });
      this.selectedItemId = null;
      this.ensureRoomInitialized(this.state.currentRoomId);
      this.saveState();
      this.emit('GAME_RESTARTED', { roomId: this.state.currentRoomId });
      return this.getSnapshot();
    }

    saveState() {
      try {
        if (!this.storage || typeof this.storage.setItem !== 'function') return false;
        this.storage.setItem(this.storageKey, JSON.stringify(this.state));
        return true;
      } catch (err) {
        return false;
      }
    }

    loadState() {
      try {
        if (!this.storage || typeof this.storage.getItem !== 'function') return false;
        const raw = this.storage.getItem(this.storageKey);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== 4) return false;

        const restored = this.createFreshState();
        restored.started = Boolean(parsed.started);
        restored.startedAt = typeof parsed.startedAt === 'number' ? parsed.startedAt : null;
        restored.finishedAt = typeof parsed.finishedAt === 'number' ? parsed.finishedAt : null;
        restored.currentRoomId = typeof parsed.currentRoomId === 'string'
          ? parsed.currentRoomId
          : (this.roomOrder[0] || null);
        restored.diaryPages = Array.isArray(parsed.diaryPages) ? parsed.diaryPages : [];

        this.roomOrder.forEach((id) => {
          const savedRoom = parsed.rooms && parsed.rooms[id];
          if (savedRoom && typeof savedRoom === 'object') {
            restored.rooms[id] = {
              inventory: Array.isArray(savedRoom.inventory) ? [...savedRoom.inventory] : [],
              usedItems: Array.isArray(savedRoom.usedItems) ? [...savedRoom.usedItems] : [],
              flags: savedRoom.flags && typeof savedRoom.flags === 'object' ? { ...savedRoom.flags } : {},
              hintsUsed: Number(savedRoom.hintsUsed) || 0,
              hintLevel: Number(savedRoom.hintLevel) || 0,
              mistakes: Number(savedRoom.mistakes) || 0,
              lastWrongIndex: typeof savedRoom.lastWrongIndex === 'number' ? savedRoom.lastWrongIndex : -1,
              completed: Boolean(savedRoom.completed),
              stars: Number(savedRoom.stars) || 0
            };
          } else {
            restored.rooms[id] = createEmptyRoomState();
          }
        });

        this.state = restored;
        return true;
      } catch (err) {
        return false;
      }
    }
  }

  function isGsapReady() {
    return typeof root.gsap !== 'undefined'
      && root.gsap !== null
      && typeof root.gsap.to === 'function'
      && typeof root.gsap.timeline === 'function';
  }

  function prefersReducedMotion() {
    try {
      return typeof root.matchMedia === 'function'
        && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (err) {
      return false;
    }
  }

  const exported = {
    STORAGE_KEY_V4,
    EscapeEngine,
    isGsapReady,
    prefersReducedMotion
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
  root.EscapeV4 = exported;
})(typeof window !== 'undefined' ? window : globalThis);
