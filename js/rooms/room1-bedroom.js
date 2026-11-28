/**
 * Escape the Website v4 — Room 1: Bedroom
 * Flow:
 * 1. Intro caption + readable note ("Where time stands still, the truth is hidden.")
 * 2. Three wardrobes, each with a clock (2 ticking visually, 1 frozen, randomized per game)
 * 3. Frozen wardrobe holds the Torch; wrong wardrobes trigger Cat leap/scratch or Clothes pile
 * 4. Using Torch on the room reveals a glint under the rug corner; swipe/tap rug & pick up Key
 * 5. Use Key on the locked door -> warm doorway transition -> Room 1 Escaped + Diary Page 1
 */
(function (root) {
  'use strict';

  const TORCH_ICON = '<img src="assets/images/room1/torch.svg" alt="" width="24" height="30">';
  const KEY_ICON = '<img src="assets/images/room1/key.svg" alt="" width="30" height="16">';

  const WARDROBE_XS = [14, 37.5, 61];

  function pickNextVariation(pool, flags, key) {
    const prev = typeof flags[key] === 'number' ? flags[key] : -1;
    const next = (prev + 1) % pool.length;
    flags[key] = next;
    return pool[next];
  }

  function makeClockLayer(idx, isFrozen) {
    const x = WARDROBE_XS[idx];
    const clockSrc = `assets/images/room1/clock-${idx + 1}.svg`;
    const frozenClass = isFrozen ? 'clock-frozen' : 'clock-ticking';
    const handColor = isFrozen ? '#9bbbd0' : '#df6b57';
    const handAngle = isFrozen ? 140 : 0;
    const specs = [
      { vb: '0 0 80 80', cx: 40, cy: 40, r: 24, len: 19 },
      { vb: '0 0 84 110', cx: 42, cy: 48, r: 19, len: 15 },
      { vb: '0 0 80 92', cx: 40, cy: 46, r: 22, len: 18 }
    ];
    const s = specs[idx] || specs[0];

    return [
      `<div class="room-layer clock-layer ${frozenClass}" data-clock-idx="${idx}" style="left:${x}%; top:39.5%; width:11%;">`,
      `  <img src="${clockSrc}" alt="" draggable="false">`,
      `  <svg class="clock-hand-overlay" viewBox="${s.vb}" aria-hidden="true">`,
      `    <g class="clock-sec-hand" style="transform: rotate(${handAngle}deg); transform-origin: ${s.cx}px ${s.cy}px;">`,
      `      <line x1="${s.cx}" y1="${s.cy}" x2="${s.cx}" y2="${s.cy - s.len}" stroke="${handColor}" stroke-width="2.4" stroke-linecap="round"/>`,
      `      <circle cx="${s.cx}" cy="${s.cy}" r="3" fill="${handColor}"/>`,
      `    </g>`,
      isFrozen ? `    <circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="none" stroke="#9bbbd0" stroke-width="2" stroke-dasharray="4 4" opacity="0.65"/>` : '',
      `  </svg>`,
      `</div>`
    ].join('');
  }

  function makeWardrobeLayer(idx, isOpen) {
    const x = WARDROBE_XS[idx];
    const src = isOpen
      ? `assets/images/room1/wardrobe-${idx + 1}-open.svg`
      : `assets/images/room1/wardrobe-${idx + 1}-closed.svg`;
    const width = isOpen ? 24 : 20;

    return `<div class="room-layer wardrobe-layer" style="left:${x}%; top:59%; width:${width}%;"><img src="${src}" alt="" draggable="false"></div>`;
  }

  function handleWardrobeInspect(idx, ctx) {
    const flags = ctx.roomState.flags;
    const frozenIdx = Number(flags.frozenIndex);
    const catIdx = Number(flags.catIndex);
    const openKey = `wardrobeOpen_${idx}`;

    ctx.setFlag(openKey, true);

    if (idx === frozenIdx) {
      if (!flags.torchTaken) {
        ctx.setFlag('torchTaken', true);
        ctx.giveItem('torch');
        return {
          caption: 'Inside the still wardrobe, you find a lit Torch!',
          sound: 'collect'
        };
      }
      return {
        caption: 'The quiet wardrobe is empty now.'
      };
    }

    if (idx === catIdx) {
      const catLines = [
        'Mrrrow! A startled ginger cat leaps at the screen!',
        'The cat swipes the glass again and tumbles down.',
        'Just a dramatic house cat. No key in here!'
      ];
      const msg = pickNextVariation(catLines, flags, 'catLineIdx');
      return {
        wrong: true,
        reaction: 'cat',
        caption: msg
      };
    }

    // Clothes wardrobe
    const firstTime = !flags.clothesWipedOnce;
    if (firstTime) {
      ctx.setFlag('clothesWipedOnce', true);
      return {
        wrong: true,
        reaction: 'clothes_first',
        caption: 'Clothes spill everywhere! Wipe or tap to clear them.'
      };
    }

    const repeatLines = [
      'More laundry tumbles out, then settles down.',
      'Only cozy sweaters in here—still no key!'
    ];
    return {
      wrong: true,
      reaction: 'clothes_repeat',
      caption: pickNextVariation(repeatLines, flags, 'clothesLineIdx')
    };
  }

  function handleClockInspect(idx, ctx) {
    const frozenIdx = Number(ctx.roomState.flags.frozenIndex);
    if (idx === frozenIdx) {
      return {
        caption: 'This clock is frozen. Its hands do not move at all.'
      };
    }
    return {
      caption: 'Tick, tock... This clock is still running.',
      sound: 'tick'
    };
  }

  const ROOM_1_BEDROOM = {
    id: 'room1',
    number: 'ROOM 1',
    title: 'The Bedroom',
    mission: 'Find the key to the door.',
    introCaption: 'The door is locked. Someone left a note.',
    assets: [
      'assets/images/room1/bedroom-bg.webp',
      'assets/images/room1/door.svg',
      'assets/images/room1/note.svg',
      'assets/images/room1/clock-1.svg',
      'assets/images/room1/clock-2.svg',
      'assets/images/room1/clock-3.svg',
      'assets/images/room1/wardrobe-1-closed.svg',
      'assets/images/room1/wardrobe-2-closed.svg',
      'assets/images/room1/wardrobe-3-closed.svg',
      'assets/images/room1/rug-flat.svg'
    ],
    items: {
      torch: {
        id: 'torch',
        name: 'Torch',
        shortLabel: 'Torch',
        iconSvg: TORCH_ICON
      },
      brass_key: {
        id: 'brass_key',
        name: 'Brass Key',
        shortLabel: 'Key',
        iconSvg: KEY_ICON
      }
    },
    wrongChoices: [
      'That does not seem to fit there.',
      'Nothing happens. Keep looking.',
      'Try using that somewhere else.'
    ],
    onInit(ctx) {
      if (ctx.getFlag('frozenIndex') === undefined) {
        const frozenIdx = Math.floor(Math.random() * 3);
        const others = [0, 1, 2].filter((i) => i !== frozenIdx);
        if (Math.random() < 0.5) others.reverse();
        ctx.setFlag('frozenIndex', frozenIdx);
        ctx.setFlag('catIndex', others[0]);
        ctx.setFlag('clothesIndex', others[1]);
      }
    },
    renderSceneHtml(roomState) {
      const flags = roomState.flags || {};
      const frozenIdx = Number(flags.frozenIndex ?? 1);
      const roomLit = Boolean(flags.roomLit);
      const rugMoved = Boolean(flags.rugMoved);
      const keyTaken = Boolean(flags.keyTaken);
      const doorOpen = Boolean(roomState.completed);

      const layers = [
        '<img class="room-bg-img" src="assets/images/room1/bedroom-bg.webp" alt="" draggable="false">',
        roomLit ? '<div class="room-torch-glow" aria-hidden="true"></div>' : '',
        // 3 Clocks
        makeClockLayer(0, frozenIdx === 0),
        makeClockLayer(1, frozenIdx === 1),
        makeClockLayer(2, frozenIdx === 2),
        // 3 Wardrobes
        makeWardrobeLayer(0, Boolean(flags.wardrobeOpen_0)),
        makeWardrobeLayer(1, Boolean(flags.wardrobeOpen_1)),
        makeWardrobeLayer(2, Boolean(flags.wardrobeOpen_2)),
        // Door (closed or warm-light open doorway)
        doorOpen
          ? '<div class="room-layer door-layer door-is-open" style="left:85%; top:55.5%; width:22%;"><div class="door-open-light"></div><img src="assets/images/room1/door.svg" alt="" draggable="false" class="door-swung"></div>'
          : '<div class="room-layer door-layer" style="left:85%; top:55.5%; width:22%;"><img src="assets/images/room1/door.svg" alt="" draggable="false"></div>',
        // Pinned Note beside door
        '<div class="room-layer note-layer" style="left:73%; top:43%; width:7.5%;"><img src="assets/images/room1/note.svg" alt="" draggable="false"></div>',
        // Rug (flat or pulled back) + glint + key
        rugMoved
          ? '<div class="room-layer rug-layer" style="left:45%; top:87%; width:45%;"><img src="assets/images/room1/rug-pulled.svg" alt="" draggable="false"></div>'
          : '<div class="room-layer rug-layer" style="left:45%; top:87%; width:45%;"><img src="assets/images/room1/rug-flat.svg" alt="" draggable="false"></div>',
        (roomLit && !rugMoved)
          ? '<div class="room-layer rug-glint" style="left:60%; top:87.5%;" aria-hidden="true">✦</div>'
          : '',
        (rugMoved && !keyTaken)
          ? '<div class="room-layer key-floor-layer" style="left:59.5%; top:88.5%; width:10%;"><img src="assets/images/room1/key.svg" alt="" draggable="false"></div>'
          : ''
      ];

      return layers.join('\n');
    },
    hotspots: [
      {
        id: 'note',
        label: 'Pinned Note',
        x: 73,
        y: 43,
        w: 11,
        h: 12,
        onInspect(ctx) {
          ctx.setFlag('noteRead', true);
          return {
            caption: 'Note: "Where time stands still, the truth is hidden."'
          };
        },
        onUseItem(itemId, ctx) {
          if (itemId === 'torch') {
            ctx.consumeItem('torch');
            ctx.setFlag('roomLit', true);
            return {
              consumed: true,
              caption: 'Torchlight spills across the room! Something glints under the rug corner.'
            };
          }
          return { wrong: true };
        }
      },
      {
        id: 'clock_0',
        label: 'Left Clock',
        x: 14,
        y: 39.5,
        w: 13,
        h: 13,
        onInspect: (ctx) => handleClockInspect(0, ctx),
        onUseItem(itemId, ctx) {
          if (itemId === 'torch') {
            ctx.consumeItem('torch');
            ctx.setFlag('roomLit', true);
            return { consumed: true, caption: 'Torchlight brightens the room—something glints under the rug!' };
          }
          return { wrong: true };
        }
      },
      {
        id: 'clock_1',
        label: 'Middle Clock',
        x: 37.5,
        y: 39.5,
        w: 13,
        h: 13,
        onInspect: (ctx) => handleClockInspect(1, ctx),
        onUseItem(itemId, ctx) {
          if (itemId === 'torch') {
            ctx.consumeItem('torch');
            ctx.setFlag('roomLit', true);
            return { consumed: true, caption: 'Torchlight brightens the room—something glints under the rug!' };
          }
          return { wrong: true };
        }
      },
      {
        id: 'clock_2',
        label: 'Right Clock',
        x: 61,
        y: 39.5,
        w: 13,
        h: 13,
        onInspect: (ctx) => handleClockInspect(2, ctx),
        onUseItem(itemId, ctx) {
          if (itemId === 'torch') {
            ctx.consumeItem('torch');
            ctx.setFlag('roomLit', true);
            return { consumed: true, caption: 'Torchlight brightens the room—something glints under the rug!' };
          }
          return { wrong: true };
        }
      },
      {
        id: 'wardrobe_0',
        label: 'Left Wardrobe',
        x: 14,
        y: 59,
        w: 20,
        h: 28,
        onInspect: (ctx) => handleWardrobeInspect(0, ctx),
        onUseItem(itemId, ctx) {
          if (itemId === 'torch') {
            ctx.consumeItem('torch');
            ctx.setFlag('roomLit', true);
            return { consumed: true, caption: 'You shine the torch across the floor. A glint appears under the rug!' };
          }
          return { wrong: true };
        }
      },
      {
        id: 'wardrobe_1',
        label: 'Middle Wardrobe',
        x: 37.5,
        y: 59,
        w: 20,
        h: 28,
        onInspect: (ctx) => handleWardrobeInspect(1, ctx),
        onUseItem(itemId, ctx) {
          if (itemId === 'torch') {
            ctx.consumeItem('torch');
            ctx.setFlag('roomLit', true);
            return { consumed: true, caption: 'You shine the torch across the floor. A glint appears under the rug!' };
          }
          return { wrong: true };
        }
      },
      {
        id: 'wardrobe_2',
        label: 'Right Wardrobe',
        x: 61,
        y: 59,
        w: 20,
        h: 28,
        onInspect: (ctx) => handleWardrobeInspect(2, ctx),
        onUseItem(itemId, ctx) {
          if (itemId === 'torch') {
            ctx.consumeItem('torch');
            ctx.setFlag('roomLit', true);
            return { consumed: true, caption: 'You shine the torch across the floor. A glint appears under the rug!' };
          }
          return { wrong: true };
        }
      },
      {
        id: 'rug',
        label: 'Woven Rug',
        x: 45,
        y: 87,
        w: 44,
        h: 15,
        swipeable: true,
        wrongChoices: [
          'The key does not unlock the rug.',
          'Nothing on the rug needs a key.'
        ],
        onInspect(ctx) {
          if (!ctx.getFlag('roomLit')) {
            return {
              caption: 'A cozy woven rug. The floor corner is too dark to check.'
            };
          }
          if (!ctx.getFlag('rugMoved')) {
            ctx.setFlag('rugMoved', true);
            return {
              caption: 'You pull back the rug. A Brass Key is underneath!',
              sound: 'cloth'
            };
          }
          if (!ctx.getFlag('keyTaken')) {
            ctx.setFlag('keyTaken', true);
            ctx.giveItem('brass_key');
            return {
              caption: 'Picked up the Brass Key! Now unlock the door.',
              sound: 'collect'
            };
          }
          return {
            caption: 'Only the empty floor nook under the rug.'
          };
        },
        onUseItem(itemId, ctx) {
          if (itemId === 'torch') {
            ctx.consumeItem('torch');
            ctx.setFlag('roomLit', true);
            return {
              consumed: true,
              caption: 'Torchlight hits the floor—a bright glint shines under the rug corner!'
            };
          }
          return { wrong: true };
        }
      },
      {
        id: 'door',
        label: 'Locked Door',
        x: 85,
        y: 55.5,
        w: 21,
        h: 39,
        onInspect(ctx) {
          if (ctx.hasItem('brass_key')) {
            return {
              caption: 'It is locked. Use your Brass Key on the door!',
              sound: 'locked'
            };
          }
          return {
            caption: 'The door is locked. Check the note beside it.',
            sound: 'locked'
          };
        },
        onUseItem(itemId, ctx) {
          if (itemId === 'brass_key') {
            ctx.consumeItem('brass_key');
            return {
              win: true,
              consumed: true,
              caption: 'The brass key turns—warm light pours through the doorway!'
            };
          }
          if (itemId === 'torch') {
            ctx.consumeItem('torch');
            ctx.setFlag('roomLit', true);
            return {
              consumed: true,
              caption: 'The torch lights up the room! Look—something glints under the rug.'
            };
          }
          return { wrong: true };
        }
      }
    ],
    getHints(roomState) {
      const flags = roomState.flags || {};
      const frozenIdx = Number(flags.frozenIndex ?? 1);
      const wardrobeNames = ['left', 'middle', 'right'];
      const frozenSide = wardrobeNames[frozenIdx];
      const frozenWardrobeId = `wardrobe_${frozenIdx}`;

      if (!flags.torchTaken) {
        return [
          { text: 'Check the note by the door, then watch the three clocks.' },
          { text: 'Two clocks tick while one stays still. Check below the frozen clock.' },
          { text: `Open the ${frozenSide} wardrobe under the frozen clock!`, targetHotspotId: frozenWardrobeId }
        ];
      }

      if (!flags.roomLit) {
        return [
          { text: 'You have a Torch. Shine it into a dark area of the room.' },
          { text: 'Select the Torch in your bag, then check along the wooden floor.' },
          { text: 'Use the Torch on the rug!', targetHotspotId: 'rug', targetItemId: 'torch' }
        ];
      }

      if (!flags.rugMoved) {
        return [
          { text: 'Look at that bright glint on the floor!' },
          { text: 'Try pulling aside what covers the shiny glint on the floor.' },
          { text: 'Tap or swipe the rug now!', targetHotspotId: 'rug' }
        ];
      }

      if (!flags.keyTaken) {
        return [
          { text: 'Something shiny is waiting in the dark spot you uncovered.' },
          { text: 'Inspect the uncovered floor nook to pick up what gleams there.' },
          { text: 'Tap the rug nook to pick up the Brass Key!', targetHotspotId: 'rug' }
        ];
      }

      return [
        { text: 'You have what you need to leave this bedroom.' },
        { text: 'Select your key in the bag and try it on the bedroom exit.' },
        { text: 'Use the Brass Key on the locked door!', targetHotspotId: 'door', targetItemId: 'brass_key' }
      ];
    },
    winSequence: {
      resultHeading: 'Room 1 Escaped',
      transitionText: 'Stepping into the light...',
      diaryPage: {
        number: 1,
        title: 'Page 1 — The Bedroom',
        body: 'First, I needed light.'
      },
      nextRoomId: 'room2'
    }
  };

  if (root.EscapeV4 && root.EscapeV4.EscapeEngine) {
    root.V4_ROOMS = root.V4_ROOMS || [];
    root.V4_ROOMS.push(ROOM_1_BEDROOM);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ROOM_1_BEDROOM;
  }
})(typeof window !== 'undefined' ? window : globalThis);
