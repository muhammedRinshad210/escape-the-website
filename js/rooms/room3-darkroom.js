/**
 * Escape the Website v4 — Room 3: Dark Room
 * Mission: "Find the lock code."
 * Dragging finger/mouse moves torch beam (offset above finger on touch).
 * Clues (color + shape): Blue Circle 7, Red Triangle 4, Green Square 1.
 * Painting stripes top->bottom: Blue Circle, Red Triangle, Green Square => Code 741.
 * Alternating wrong code reactions: (a) bedsheet-on-broom "ghost" + light on; (b) lock sticks out tongue.
 * Win: lock breaks, lights come on in sequence, camera travels down corridor, Diary Page 3.
 */
(function (root) {
  'use strict';

  const TARGET_CODE = '741';

  const ROOM_3_DARKROOM = {
    id: 'room3',
    number: 'ROOM 3',
    title: 'The Dark Room',
    mission: 'Find the lock code.',
    introCaption: 'Pitch black. Drag across the room to shine your torch.',
    isDarkRoom: true,
    assets: [
      'assets/images/room3/darkroom-bg.svg',
      'assets/images/room3/painting.svg',
      'assets/images/room3/clue-blue.svg',
      'assets/images/room3/clue-red.svg',
      'assets/images/room3/clue-green.svg',
      'assets/images/room3/padlock.svg'
    ],
    targetCode: TARGET_CODE,
    items: {},
    wrongChoices: [
      'Wrong code!',
      'Not that code!'
    ],
    onInit(ctx) {
      if (ctx.getFlag('wrongToggle') === undefined) {
        ctx.setFlag('wrongToggle', 0);
      }
    },
    renderSceneHtml(roomState) {
      const flags = roomState.flags || {};
      const unlocked = Boolean(roomState.completed);

      return [
        '<img class="room-bg-img" src="assets/images/room3/darkroom-bg.svg" alt="" draggable="false">',
        // Painting (top-to-bottom: Blue Circle, Red Triangle, Green Square)
        '<div class="room-layer" style="left:23%; top:31%; width:19%;"><img src="assets/images/room3/painting.svg" alt="" draggable="false"></div>',
        // Hidden clues (color + shape + number)
        '<div class="room-layer" style="left:16%; top:64%; width:12%;"><img src="assets/images/room3/clue-blue.svg" alt="" draggable="false"></div>',
        '<div class="room-layer" style="left:41%; top:43%; width:12%;"><img src="assets/images/room3/clue-red.svg" alt="" draggable="false"></div>',
        '<div class="room-layer" style="left:36%; top:76%; width:12%;"><img src="assets/images/room3/clue-green.svg" alt="" draggable="false"></div>',
        // Corridor overhead lights (turn on in sequence on win)
        '<div class="room-layer corridor-bulb bulb-1" style="left:30%; top:11%;" aria-hidden="true"></div>',
        '<div class="room-layer corridor-bulb bulb-2" style="left:54%; top:11%;" aria-hidden="true"></div>',
        '<div class="room-layer corridor-bulb bulb-3" style="left:78%; top:11%;" aria-hidden="true"></div>',
        // Padlock on corridor door (hidden/broken when unlocked)
        unlocked
          ? '<div class="room-layer corridor-open-glow" style="left:75.5%; top:46%; width:24%; height:52%;" aria-hidden="true"></div>'
          : '<div class="room-layer" style="left:75.5%; top:50%; width:11%;"><img src="assets/images/room3/padlock.svg" alt="" draggable="false"></div>'
      ].join('\n');
    },
    hotspots: [
      {
        id: 'painting',
        label: 'Striped Painting',
        x: 23,
        y: 31,
        w: 20,
        h: 22,
        onInspect() {
          return {
            caption: 'Stripes top to bottom: Blue Circle, Red Triangle, Green Square.'
          };
        }
      },
      {
        id: 'clue_blue',
        label: 'Blue Circle Clue',
        x: 16,
        y: 64,
        w: 14,
        h: 14,
        onInspect() {
          return {
            caption: 'A blue circle painted on the wall with the number 7.'
          };
        }
      },
      {
        id: 'clue_red',
        label: 'Red Triangle Clue',
        x: 41,
        y: 43,
        w: 14,
        h: 14,
        onInspect() {
          return {
            caption: 'A red triangle chalked on the wall with the number 4.'
          };
        }
      },
      {
        id: 'clue_green',
        label: 'Green Square Clue',
        x: 36,
        y: 76,
        w: 14,
        h: 14,
        onInspect() {
          return {
            caption: 'A green square on the floorboards with the number 1.'
          };
        }
      },
      {
        id: 'padlock',
        label: 'Combination Padlock',
        x: 75.5,
        y: 50,
        w: 20,
        h: 26,
        onInspect() {
          return {
            openCodeLock: true,
            caption: 'A 3-digit lock seals the corridor door.'
          };
        }
      }
    ],
    submitCode(code, ctx) {
      if (String(code) === TARGET_CODE) {
        return {
          win: true,
          caption: 'Click! The lock snaps open and the corridor lights flare on!'
        };
      }

      const flags = ctx.roomState.flags;
      const toggle = Number(flags.wrongToggle || 0);
      flags.wrongToggle = (toggle + 1) % 2;

      if (toggle % 2 === 0) {
        return {
          wrong: true,
          reaction: 'ghost_broom',
          caption: 'A ghost! Wait... the light flickers on—just a sheet on a broom.'
        };
      }
      return {
        wrong: true,
        reaction: 'lock_tongue',
        caption: 'Bleh! The padlock sticks out its tongue at that code.'
      };
    },
    getHints() {
      return [
        { text: 'Move the light around to spot three shapes and a striped painting.' },
        { text: 'Match the painting stripes top-to-bottom: Blue Circle, Red Triangle, Green Square.' },
        { text: 'Enter 741 on the padlock!', targetHotspotId: 'padlock' }
      ];
    },
    winSequence: {
      resultHeading: 'Room 3 Escaped',
      transitionText: 'Walking down the lit corridor...',
      diaryPage: {
        number: 3,
        title: 'Page 3 — The Dark Room',
        body: 'After that, I made time stand still.'
      },
      nextRoomId: 'room4'
    }
  };

  if (root.EscapeV4 && root.EscapeV4.EscapeEngine) {
    root.V4_ROOMS = root.V4_ROOMS || [];
    root.V4_ROOMS.push(ROOM_3_DARKROOM);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ROOM_3_DARKROOM;
  }
})(typeof window !== 'undefined' ? window : globalThis);
