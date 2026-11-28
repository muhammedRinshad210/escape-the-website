/**
 * Escape the Website v4 — Room 5: Final Door
 * Mission: "Open the last door."
 * Four symbol buttons on the door: clock, fruit, torch, magnet.
 * Reread the 4 diary pages from the open diary book:
 *   1: "First, I needed light." (torch)
 *   2: "Then I pulled what I could not reach." (magnet)
 *   3: "After that, I made time stand still." (clock)
 *   4: "At last, I tasted freedom." (fruit)
 * Answer: torch, magnet, clock, fruit.
 * Alternating wrong reactions: (a) brick wall "Not that easy!"; (b) fake "YOU ESCAPED" banner falls off.
 * Finale: walls peel away like book pages, daylight appears, "YOU ESCAPED!", total stars, time, Play Again & Share.
 */
(function (root) {
  'use strict';

  const TARGET_SEQUENCE = ['torch', 'magnet', 'clock', 'fruit'];

  const SYMBOL_POSITIONS = {
    clock: { x: 49, y: 46, label: 'Clock Symbol', file: 'sym-clock.svg' },
    fruit: { x: 63, y: 46, label: 'Fruit Symbol', file: 'sym-fruit.svg' },
    torch: { x: 49, y: 58, label: 'Torch Symbol', file: 'sym-torch.svg' },
    magnet: { x: 63, y: 58, label: 'Magnet Symbol', file: 'sym-magnet.svg' }
  };

  function handleSymbolPress(symbolId, ctx) {
    const flags = ctx.roomState.flags;
    const entry = Array.isArray(flags.symbolEntry) ? [...flags.symbolEntry] : [];
    entry.push(symbolId);

    if (entry.length < 4) {
      ctx.setFlag('symbolEntry', entry);
      return {
        caption: `Pressed ${symbolId} (${entry.length} / 4).`
      };
    }

    ctx.setFlag('symbolEntry', []);
    const isCorrect = entry.every((val, idx) => val === TARGET_SEQUENCE[idx]);
    if (isCorrect) {
      return {
        win: true,
        caption: 'The final lock opens—daylight pours in as the walls peel away!'
      };
    }

    const toggle = Number(flags.wrongToggle || 0);
    ctx.setFlag('wrongToggle', (toggle + 1) % 2);

    if (toggle % 2 === 0) {
      return {
        wrong: true,
        reaction: 'brick_wall',
        caption: 'The door opens... onto a solid brick wall! Not that easy!'
      };
    }

    return {
      wrong: true,
      reaction: 'fake_escape',
      caption: 'Wait—that banner just fell right off!'
    };
  }

  const ROOM_5_DOOR = {
    id: 'room5',
    number: 'ROOM 5',
    title: 'The Final Door',
    mission: 'Open the last door.',
    introCaption: 'The last door. Reread the diary to find the four-symbol order.',
    assets: [
      'assets/images/room5/finalroom-bg.svg',
      'assets/images/room5/final-door.svg',
      'assets/images/room5/diary-book.svg',
      'assets/images/room5/sym-clock.svg',
      'assets/images/room5/sym-fruit.svg',
      'assets/images/room5/sym-torch.svg',
      'assets/images/room5/sym-magnet.svg',
      'assets/images/room5/daylight-sky.svg'
    ],
    items: {},
    wrongChoices: [
      'Not that order!',
      'The symbols reset. Check the diary again.'
    ],
    onInit(ctx) {
      if (!Array.isArray(ctx.getFlag('symbolEntry'))) {
        ctx.setFlag('symbolEntry', []);
      }
      if (ctx.getFlag('wrongToggle') === undefined) {
        ctx.setFlag('wrongToggle', 0);
      }
    },
    renderSceneHtml(roomState) {
      const flags = roomState.flags || {};
      const entry = Array.isArray(flags.symbolEntry) ? flags.symbolEntry : [];
      const escaped = Boolean(roomState.completed);

      const pips = [0, 1, 2, 3].map((i) =>
        `<span class="door-pip ${i < entry.length ? 'is-lit' : ''}"></span>`
      ).join('');

      const symbolsHtml = Object.entries(SYMBOL_POSITIONS).map(([id, pos]) =>
        `<div class="room-layer final-symbol-layer" style="left:${pos.x}%; top:${pos.y}%; width:9.5%;"><img src="assets/images/room5/${pos.file}" alt="" draggable="false"></div>`
      ).join('');

      return [
        '<img class="room-daylight-bg" src="assets/images/room5/daylight-sky.svg" alt="" draggable="false">',
        `<div class="room5-walls-wrap ${escaped ? 'is-peeled' : ''}">`,
        '  <img class="room-bg-img" src="assets/images/room5/finalroom-bg.svg" alt="" draggable="false">',
        '  <div class="room-layer" style="left:18%; top:56%; width:15%;"><img src="assets/images/room5/diary-book.svg" alt="" draggable="false"></div>',
        '  <div class="room-layer" style="left:56%; top:52%; width:38%;"><img src="assets/images/room5/final-door.svg" alt="" draggable="false"></div>',
        `  <div class="room-layer door-pips-row" style="left:56%; top:39.5%;" aria-hidden="true">${pips}</div>`,
        symbolsHtml,
        '</div>'
      ].join('\n');
    },
    hotspots: [
      {
        id: 'diary_book',
        label: 'Diary Pages',
        x: 18, y: 56, w: 18, h: 16,
        onInspect() {
          return {
            openDiaryReader: true,
            caption: 'Reading the four diary pages...'
          };
        }
      },
      {
        id: 'sym_clock',
        label: 'Clock Symbol',
        x: 49, y: 46, w: 11, h: 11,
        onInspect: (ctx) => handleSymbolPress('clock', ctx)
      },
      {
        id: 'sym_fruit',
        label: 'Fruit Symbol',
        x: 63, y: 46, w: 11, h: 11,
        onInspect: (ctx) => handleSymbolPress('fruit', ctx)
      },
      {
        id: 'sym_torch',
        label: 'Torch Symbol',
        x: 49, y: 58, w: 11, h: 11,
        onInspect: (ctx) => handleSymbolPress('torch', ctx)
      },
      {
        id: 'sym_magnet',
        label: 'Magnet Symbol',
        x: 63, y: 58, w: 11, h: 11,
        onInspect: (ctx) => handleSymbolPress('magnet', ctx)
      }
    ],
    getHints(roomState) {
      const entry = (roomState.flags && roomState.flags.symbolEntry) || [];
      const nextStep = Math.min(3, entry.length);
      const nextSym = TARGET_SEQUENCE[nextStep];
      return [
        { text: 'Tap the open Diary on the left to read all four lines together.' },
        { text: 'Match each diary line to a symbol: light → pull → time → freedom.' },
        { text: `Press in order: torch, magnet, clock, fruit! (Next: ${nextSym})`, targetHotspotId: `sym_${nextSym}` }
      ];
    },
    winSequence: {
      isFinale: true,
      resultHeading: 'YOU ESCAPED!',
      transitionText: 'Stepping back into daylight...',
      diaryPage: {
        number: 5,
        title: 'Page 5 — Freedom',
        body: 'The walls folded away like paper, and the sun was waiting outside.'
      },
      nextRoomId: null
    }
  };

  if (root.EscapeV4 && root.EscapeV4.EscapeEngine) {
    root.V4_ROOMS = root.V4_ROOMS || [];
    root.V4_ROOMS.push(ROOM_5_DOOR);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ROOM_5_DOOR;
  }
})(typeof window !== 'undefined' ? window : globalThis);
