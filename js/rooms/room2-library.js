/**
 * Escape the Website v4 — Room 2: Library
 * Mission: "Open the secret passage."
 * 4 books (seed, sapling, tree, fruit). Wall carving: "Put life in its order."
 * Swap books into order; check ONLY when pulling the shelf lever.
 * Alternating wrong reactions: (a) books tumble toward screen & fly back;
 * (b) original owl with glasses pops up close: "Shhh!"
 * Win: bookshelf rotates to reveal glowing passage, camera moves in, Diary Page 2.
 */
(function (root) {
  'use strict';

  const TARGET_ORDER = ['seed', 'sapling', 'tree', 'fruit'];

  const BOOK_META = {
    seed: { label: 'Seed', src: 'assets/images/room2/book-seed.svg' },
    sapling: { label: 'Sapling', src: 'assets/images/room2/book-sapling.svg' },
    tree: { label: 'Tree', src: 'assets/images/room2/book-tree.svg' },
    fruit: { label: 'Fruit', src: 'assets/images/room2/book-fruit.svg' }
  };

  const BOOK_XS = [18, 33.5, 49, 64.5];

  function createShuffledOrder() {
    const arr = [...TARGET_ORDER];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    if (arr.every((v, idx) => v === TARGET_ORDER[idx])) {
      const tmp = arr[0];
      arr[0] = arr[3];
      arr[3] = tmp;
    }
    return arr;
  }

  function isOrderSolved(order) {
    return Array.isArray(order)
      && order.length === 4
      && order.every((v, i) => v === TARGET_ORDER[i]);
  }

  function handleBookTap(slotIdx, ctx) {
    const flags = ctx.roomState.flags;
    const order = flags.bookOrder || [...TARGET_ORDER];
    const selectedIdx = typeof flags.selectedBookSlot === 'number' ? flags.selectedBookSlot : -1;

    if (selectedIdx === -1) {
      ctx.setFlag('selectedBookSlot', slotIdx);
      const bookName = BOOK_META[order[slotIdx]].label;
      return {
        caption: `${bookName} book lifted. Tap another book to swap.`
      };
    }

    if (selectedIdx === slotIdx) {
      ctx.setFlag('selectedBookSlot', -1);
      return {
        caption: 'Book placed back on the shelf.'
      };
    }

    const nextOrder = [...order];
    const tmp = nextOrder[selectedIdx];
    nextOrder[selectedIdx] = nextOrder[slotIdx];
    nextOrder[slotIdx] = tmp;
    ctx.setFlag('bookOrder', nextOrder);
    ctx.setFlag('selectedBookSlot', -1);

    return {
      caption: 'Books swapped. Pull the shelf lever to test the order.',
      sound: 'cloth'
    };
  }

  const ROOM_2_LIBRARY = {
    id: 'room2',
    number: 'ROOM 2',
    title: 'The Library',
    mission: 'Open the secret passage.',
    introCaption: 'A tall bookcase blocks the way. Read the wall carving.',
    assets: [
      'assets/images/room2/library-bg.svg',
      'assets/images/room2/bookshelf.svg',
      'assets/images/room2/carving.svg',
      'assets/images/room2/book-seed.svg',
      'assets/images/room2/book-sapling.svg',
      'assets/images/room2/book-tree.svg',
      'assets/images/room2/book-fruit.svg',
      'assets/images/room2/lever.svg'
    ],
    items: {},
    wrongChoices: [
      'The lever clicks, but the shelf stays shut.',
      'Not quite the right order yet.'
    ],
    onInit(ctx) {
      if (!Array.isArray(ctx.getFlag('bookOrder'))) {
        ctx.setFlag('bookOrder', createShuffledOrder());
      }
      if (ctx.getFlag('selectedBookSlot') === undefined) {
        ctx.setFlag('selectedBookSlot', -1);
      }
      if (ctx.getFlag('wrongToggle') === undefined) {
        ctx.setFlag('wrongToggle', 0);
      }
    },
    renderSceneHtml(roomState) {
      const flags = roomState.flags || {};
      const order = Array.isArray(flags.bookOrder) ? flags.bookOrder : TARGET_ORDER;
      const selectedIdx = typeof flags.selectedBookSlot === 'number' ? flags.selectedBookSlot : -1;
      const passageOpen = Boolean(roomState.completed);

      const booksHtml = order.map((bookId, idx) => {
        const meta = BOOK_META[bookId] || BOOK_META.seed;
        const isSel = selectedIdx === idx;
        return `<div class="room-layer library-book-layer ${isSel ? 'is-book-selected' : ''}" style="left:${BOOK_XS[idx]}%; top:56%; width:12.2%;"><img src="${meta.src}" alt="" draggable="false"></div>`;
      }).join('');

      return [
        '<img class="room-bg-img" src="assets/images/room2/library-bg.svg" alt="" draggable="false">',
        // Wall Carving (top left above shelf)
        '<div class="room-layer" style="left:24%; top:17%; width:28%;"><img src="assets/images/room2/carving.svg" alt="" draggable="false"></div>',
        // Glowing Secret Passage behind bookshelf (visible when open)
        `<div class="room-layer secret-passage-arch ${passageOpen ? 'is-open' : ''}" style="left:41%; top:58%; width:62%; height:46%;" aria-hidden="true"></div>`,
        // Rotating Close-Up Bookshelf + 4 Spacious Interactive Books
        `<div class="library-shelf-group ${passageOpen ? 'is-rotated' : ''}">`,
        '  <div class="room-layer" style="left:41%; top:58%; width:74%;"><img src="assets/images/room2/bookshelf.svg" alt="" draggable="false"></div>',
        booksHtml,
        '</div>',
        // Shelf Lever (right of bookshelf)
        `<div class="room-layer library-lever-layer ${flags.leverPulled ? 'is-pulled' : ''}" style="left:88%; top:58%; width:12%;"><img src="assets/images/room2/lever.svg" alt="" draggable="false"></div>`
      ].join('\n');
    },
    hotspots: [
      {
        id: 'carving',
        label: 'Wall Carving',
        x: 24,
        y: 17,
        w: 28,
        h: 14,
        onInspect() {
          return {
            caption: 'Wall carving: "Put life in its order."'
          };
        }
      },
      {
        id: 'book_0',
        label: 'First Book',
        x: BOOK_XS[0],
        y: 56,
        w: 14,
        h: 29,
        onInspect: (ctx) => handleBookTap(0, ctx)
      },
      {
        id: 'book_1',
        label: 'Second Book',
        x: BOOK_XS[1],
        y: 56,
        w: 14,
        h: 29,
        onInspect: (ctx) => handleBookTap(1, ctx)
      },
      {
        id: 'book_2',
        label: 'Third Book',
        x: BOOK_XS[2],
        y: 56,
        w: 14,
        h: 29,
        onInspect: (ctx) => handleBookTap(2, ctx)
      },
      {
        id: 'book_3',
        label: 'Fourth Book',
        x: BOOK_XS[3],
        y: 56,
        w: 14,
        h: 29,
        onInspect: (ctx) => handleBookTap(3, ctx)
      },
      {
        id: 'lever',
        label: 'Shelf Lever',
        x: 88,
        y: 58,
        w: 14,
        h: 18,
        onInspect(ctx) {
          const flags = ctx.roomState.flags;
          const order = flags.bookOrder || [];
          ctx.setFlag('selectedBookSlot', -1);

          if (isOrderSolved(order)) {
            ctx.setFlag('leverPulled', true);
            return {
              win: true,
              caption: 'Click! The bookcase swings aside, revealing a glowing passage.'
            };
          }

          // Alternate between (a) books tumble and (b) owl pops up with "Shhh!"
          const toggle = Number(flags.wrongToggle || 0);
          ctx.setFlag('wrongToggle', (toggle + 1) % 2);

          if (toggle % 2 === 0) {
            return {
              wrong: true,
              reaction: 'books_tumble',
              caption: 'Whoosh! The books tumble out and snap back to the shelf!'
            };
          }

          return {
            wrong: true,
            reaction: 'owl_shhh',
            caption: 'Shhh! A sleepy owl with glasses glares at you!'
          };
        }
      }
    ],
    getHints(roomState) {
      const order = (roomState.flags && roomState.flags.bookOrder) || [];
      if (isOrderSolved(order)) {
        return [
          { text: 'The books are in order! Now test the shelf.' },
          { text: 'Look beside the right side of the bookcase for something that triggers the passage.' },
          { text: 'Pull the shelf lever on the right!', targetHotspotId: 'lever' }
        ];
      }

      const firstWrongIdx = TARGET_ORDER.findIndex((target, i) => order[i] !== target);
      return [
        { text: 'Tap the wall carving above the bookcase to read its clue.' },
        { text: 'Check the spine pictures—order life from start to harvest.' },
        { text: 'Tap two books to swap them into seed → sapling → tree → fruit!', targetHotspotId: `book_${Math.max(0, firstWrongIdx)}` }
      ];
    },
    winSequence: {
      resultHeading: 'Room 2 Escaped',
      transitionText: 'Entering the secret passage...',
      diaryPage: {
        number: 2,
        title: 'Page 2 — The Library',
        body: 'Then I pulled what I could not reach.'
      },
      nextRoomId: 'room3'
    }
  };

  if (root.EscapeV4 && root.EscapeV4.EscapeEngine) {
    root.V4_ROOMS = root.V4_ROOMS || [];
    root.V4_ROOMS.push(ROOM_2_LIBRARY);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ROOM_2_LIBRARY;
  }
})(typeof window !== 'undefined' ? window : globalThis);
