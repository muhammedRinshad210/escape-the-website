/**
 * Escape the Website v4 — Room 4: Workshop
 * Mission: "Get the key out of the drain."
 * Hidden items: stick, string, magnet + decoys: duck, spring, balloon.
 * Craft: stick + string -> stick_string; stick_string + magnet -> fishing_rod.
 * Use fishing_rod on drain -> hatch_key. Use hatch_key on floor hatch -> win!
 * Decoy gags: duck = giant squeak; spring = boings into screen; balloon = pops with soot.
 * Win: floor hatch opens, camera drops down a ladder, Diary Page 4.
 */
(function (root) {
  'use strict';

  const icon = (file, w = 26, h = 26) => `<img src="assets/images/room4/${file}" alt="" width="${w}" height="${h}">`;

  function pickDecoyGag(itemA, itemB) {
    const pair = [itemA, itemB];
    if (pair.includes('duck')) {
      return {
        wrong: true,
        reaction: 'duck_squeak',
        caption: 'SQUEEEAK! The rubber duck lets out a giant squeak!'
      };
    }
    if (pair.includes('spring')) {
      return {
        wrong: true,
        reaction: 'spring_boing',
        caption: 'BOING! The spring launches straight at the screen!'
      };
    }
    if (pair.includes('balloon')) {
      return {
        wrong: true,
        reaction: 'balloon_soot',
        caption: 'POP! The balloon bursts and covers everything in soot!'
      };
    }
    return null;
  }

  const ROOM_4_WORKSHOP = {
    id: 'room4',
    number: 'ROOM 4',
    title: 'The Workshop',
    mission: 'Get the key out of the drain.',
    introCaption: 'A key fell down the drain. Gather tools to reach it.',
    assets: [
      'assets/images/room4/workshop-bg.svg',
      'assets/images/room4/drain.svg',
      'assets/images/room4/hatch.svg',
      'assets/images/room4/stick.svg',
      'assets/images/room4/string.svg',
      'assets/images/room4/magnet.svg',
      'assets/images/room4/duck.svg',
      'assets/images/room4/spring.svg',
      'assets/images/room4/balloon.svg'
    ],
    items: {
      stick: { id: 'stick', name: 'Wooden Stick', shortLabel: 'Stick', iconSvg: icon('stick.svg', 30, 14) },
      string: { id: 'string', name: 'Ball of String', shortLabel: 'String', iconSvg: icon('string.svg', 26, 26) },
      magnet: { id: 'magnet', name: 'Magnet', shortLabel: 'Magnet', iconSvg: icon('magnet.svg', 26, 26) },
      duck: { id: 'duck', name: 'Rubber Duck', shortLabel: 'Duck', iconSvg: icon('duck.svg', 26, 26) },
      spring: { id: 'spring', name: 'Metal Spring', shortLabel: 'Spring', iconSvg: icon('spring.svg', 24, 26) },
      balloon: { id: 'balloon', name: 'Red Balloon', shortLabel: 'Balloon', iconSvg: icon('balloon.svg', 22, 28) },
      stick_string: { id: 'stick_string', name: 'Stick & String', shortLabel: 'Pole', iconSvg: icon('stick-string.svg', 28, 28) },
      fishing_rod: { id: 'fishing_rod', name: 'Magnet Rod', shortLabel: 'Rod', iconSvg: icon('fishing-rod.svg', 28, 28) },
      hatch_key: { id: 'hatch_key', name: 'Brass Key', shortLabel: 'Key', iconSvg: '<img src="assets/images/room1/key.svg" alt="" width="30" height="16">' }
    },
    wrongChoices: [
      'That does not reach the key.',
      'Not quite! Try combining tools in your bag.'
    ],
    onCombineItems(itemA, itemB, ctx) {
      const decoy = pickDecoyGag(itemA, itemB);
      if (decoy) return decoy;

      const pair = [itemA, itemB].sort().join('+');
      if (pair === 'stick+string') {
        ctx.consumeItem('stick');
        ctx.consumeItem('string');
        ctx.giveItem('stick_string');
        return {
          caption: 'Tied the string to the stick! Now add something magnetic.'
        };
      }

      if (pair === 'magnet+stick_string') {
        ctx.consumeItem('magnet');
        ctx.consumeItem('stick_string');
        ctx.giveItem('fishing_rod');
        return {
          caption: 'Made a Magnet Fishing Rod! Use it on the drain.'
        };
      }

      if (pair === 'magnet+stick') {
        return {
          wrong: true,
          caption: 'The magnet needs string first so it can dangle down!'
        };
      }

      return { wrong: true, caption: 'Those two do not work together.' };
    },
    renderSceneHtml(roomState) {
      const flags = roomState.flags || {};
      const hatchOpen = Boolean(roomState.completed);

      return [
        '<img class="room-bg-img" src="assets/images/room4/workshop-bg.svg" alt="" draggable="false">',
        // Drain & Floor Hatch
        '<div class="room-layer" style="left:32%; top:84%; width:20%;"><img src="assets/images/room4/drain.svg" alt="" draggable="false"></div>',
        hatchOpen
          ? '<div class="room-layer hatch-open-ladder" style="left:72%; top:82%; width:24%; height:16%;" aria-hidden="true"></div>'
          : '<div class="room-layer" style="left:72%; top:82%; width:24%;"><img src="assets/images/room4/hatch.svg" alt="" draggable="false"></div>',
        // Collectibles (hidden once taken)
        !flags.taken_string ? '<div class="room-layer" style="left:16%; top:24%; width:9%;"><img src="assets/images/room4/string.svg" alt="" draggable="false"></div>' : '',
        !flags.taken_duck ? '<div class="room-layer" style="left:34%; top:24%; width:10%;"><img src="assets/images/room4/duck.svg" alt="" draggable="false"></div>' : '',
        !flags.taken_magnet ? '<div class="room-layer" style="left:74%; top:27%; width:10%;"><img src="assets/images/room4/magnet.svg" alt="" draggable="false"></div>' : '',
        !flags.taken_stick ? '<div class="room-layer" style="left:21%; top:51%; width:15%;"><img src="assets/images/room4/stick.svg" alt="" draggable="false"></div>' : '',
        !flags.taken_spring ? '<div class="room-layer" style="left:43%; top:51%; width:9%;"><img src="assets/images/room4/spring.svg" alt="" draggable="false"></div>' : '',
        !flags.taken_balloon ? '<div class="room-layer" style="left:60%; top:47%; width:10%;"><img src="assets/images/room4/balloon.svg" alt="" draggable="false"></div>' : ''
      ].join('\n');
    },
    hotspots: [
      {
        id: 'item_string',
        label: 'Ball of String',
        x: 16, y: 24, w: 12, h: 12,
        onInspect(ctx) {
          if (ctx.getFlag('taken_string')) return { caption: 'Empty shelf spot.' };
          ctx.setFlag('taken_string', true);
          ctx.giveItem('string');
          return { caption: 'Picked up a Ball of String.', sound: 'collect' };
        }
      },
      {
        id: 'item_duck',
        label: 'Rubber Duck',
        x: 34, y: 24, w: 12, h: 12,
        onInspect(ctx) {
          if (ctx.getFlag('taken_duck')) return { caption: 'Just dust on the shelf.' };
          ctx.setFlag('taken_duck', true);
          ctx.giveItem('duck');
          return { caption: 'Picked up a squeaky Rubber Duck.', sound: 'collect' };
        }
      },
      {
        id: 'item_magnet',
        label: 'Horseshoe Magnet',
        x: 74, y: 27, w: 14, h: 14,
        onInspect(ctx) {
          if (ctx.getFlag('taken_magnet')) return { caption: 'An empty peg on the board.' };
          ctx.setFlag('taken_magnet', true);
          ctx.giveItem('magnet');
          return { caption: 'Picked up a strong Magnet!', sound: 'collect' };
        }
      },
      {
        id: 'item_stick',
        label: 'Wooden Stick',
        x: 21, y: 51, w: 17, h: 12,
        onInspect(ctx) {
          if (ctx.getFlag('taken_stick')) return { caption: 'Smooth workbench top.' };
          ctx.setFlag('taken_stick', true);
          ctx.giveItem('stick');
          return { caption: 'Picked up a Wooden Stick.', sound: 'collect' };
        }
      },
      {
        id: 'item_spring',
        label: 'Metal Spring',
        x: 43, y: 51, w: 12, h: 12,
        onInspect(ctx) {
          if (ctx.getFlag('taken_spring')) return { caption: 'Nothing else on the bench.' };
          ctx.setFlag('taken_spring', true);
          ctx.giveItem('spring');
          return { caption: 'Picked up a bouncy Metal Spring.', sound: 'collect' };
        }
      },
      {
        id: 'item_balloon',
        label: 'Red Balloon',
        x: 60, y: 47, w: 12, h: 14,
        onInspect(ctx) {
          if (ctx.getFlag('taken_balloon')) return { caption: 'Empty floor spot.' };
          ctx.setFlag('taken_balloon', true);
          ctx.giveItem('balloon');
          return { caption: 'Picked up a Red Balloon.', sound: 'collect' };
        }
      },
      {
        id: 'drain',
        label: 'Floor Drain',
        x: 32, y: 84, w: 22, h: 14,
        onInspect(ctx) {
          if (ctx.getFlag('keyFished')) {
            return { caption: 'The drain is empty now.' };
          }
          return { caption: 'A brass key glints deep inside the drain! Too far to reach.' };
        },
        onUseItem(itemId, ctx) {
          const decoy = pickDecoyGag(itemId, 'drain');
          if (decoy) return decoy;

          if (itemId === 'fishing_rod') {
            ctx.consumeItem('fishing_rod');
            ctx.setFlag('keyFished', true);
            ctx.giveItem('hatch_key');
            return {
              consumed: true,
              caption: 'Got it! The magnet pulls the Brass Key out of the drain!',
              sound: 'collect'
            };
          }
          if (itemId === 'stick_string') {
            return { wrong: true, caption: 'No hook or magnet! The key slips away.' };
          }
          return { wrong: true };
        }
      },
      {
        id: 'hatch',
        label: 'Floor Hatch',
        x: 72, y: 82, w: 24, h: 16,
        onInspect(ctx) {
          if (ctx.hasItem('hatch_key')) {
            return { caption: 'The floor hatch is locked. Use your Brass Key on it!', sound: 'locked' };
          }
          return { caption: 'A heavy floor hatch with a brass keyhole.', sound: 'locked' };
        },
        onUseItem(itemId, ctx) {
          const decoy = pickDecoyGag(itemId, 'hatch');
          if (decoy) return decoy;

          if (itemId === 'hatch_key') {
            ctx.consumeItem('hatch_key');
            return {
              win: true,
              consumed: true,
              caption: 'Click! The floor hatch swings open to a ladder below!'
            };
          }
          return { wrong: true };
        }
      }
    ],
    getHints(roomState) {
      const hasRod = roomState.inventory.includes('fishing_rod') || roomState.usedItems.includes('fishing_rod');
      const hasKey = roomState.inventory.includes('hatch_key') || roomState.usedItems.includes('hatch_key');

      if (!hasRod) {
        return [
          { text: 'Look around the shelf, pegboard, and workbench for real tools.' },
          { text: 'Combine Stick + String in your bag, then add the Magnet.' },
          { text: 'Craft Stick + String + Magnet into a Magnet Rod!', targetHotspotId: 'drain' }
        ];
      }
      if (!hasKey) {
        return [
          { text: 'Your Magnet Rod is ready!' },
          { text: 'Select the Magnet Rod and tap the floor drain.' },
          { text: 'Use the Magnet Rod on the drain!', targetHotspotId: 'drain', targetItemId: 'fishing_rod' }
        ];
      }
      return [
        { text: 'You have the Brass Key! Where does it fit?' },
        { text: 'Select the Key and tap the floor hatch on the right.' },
        { text: 'Use the Brass Key on the floor hatch!', targetHotspotId: 'hatch', targetItemId: 'hatch_key' }
      ];
    },
    winSequence: {
      resultHeading: 'Room 4 Escaped',
      transitionText: 'Climbing down the ladder...',
      diaryPage: {
        number: 4,
        title: 'Page 4 — The Workshop',
        body: 'At last, I tasted freedom.'
      },
      nextRoomId: 'room5'
    }
  };

  if (root.EscapeV4 && root.EscapeV4.EscapeEngine) {
    root.V4_ROOMS = root.V4_ROOMS || [];
    root.V4_ROOMS.push(ROOM_4_WORKSHOP);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ROOM_4_WORKSHOP;
  }
})(typeof window !== 'undefined' ? window : globalThis);
