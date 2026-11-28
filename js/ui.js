/**
 * Escape the Website v4 — UI Controller
 * Direct entry into Room 1 (no instruction screen), pointer tap/drag/swipe,
 * visual clock ticks, Room 1 Cat & Clothes reactions, 3-level firefly hints,
 * GSAP/fallback transitions, and audio on first user tap.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const v4 = window.EscapeV4;
    if (!v4 || !v4.EscapeEngine) return;

    const engine = new v4.EscapeEngine({
      rooms: Array.isArray(window.V4_ROOMS) ? window.V4_ROOMS : []
    });
    window.escapeEngine = engine;
    engine.init();

    const dom = {
      coverScreen: document.getElementById('cover-screen'),
      coverBookCard: document.getElementById('cover-book-card'),
      btnCoverStart: document.getElementById('btn-cover-start'),
      btnAboutStart: document.getElementById('btn-about-start'),
      coverLoading: document.getElementById('cover-loading'),
      appShell: document.getElementById('app-shell'),
      roomNumber: document.getElementById('hud-room-number'),
      mission: document.getElementById('hud-mission'),
      btnMute: document.getElementById('btn-mute'),
      iconSoundWaves: document.getElementById('icon-sound-waves'),
      iconSoundMute: document.getElementById('icon-sound-mute'),
      btnPause: document.getElementById('btn-pause'),
      sceneFrame: document.getElementById('scene-frame'),
      sceneWingBackdrop: document.getElementById('scene-wing-backdrop'),
      sceneArt: document.getElementById('scene-art'),
      sceneHotspots: document.getElementById('scene-hotspots'),
      darkroomMask: document.getElementById('darkroom-mask'),
      firefly: document.getElementById('firefly'),
      catReactionLayer: document.getElementById('cat-reaction-layer'),
      catLeapImg: document.getElementById('cat-leap-img'),
      catPawsImg: document.getElementById('cat-paws-img'),
      catClawMarks: document.getElementById('cat-claw-marks'),
      clothesReactionLayer: document.getElementById('clothes-reaction-layer'),
      clothesWipePrompt: document.getElementById('clothes-wipe-prompt'),
      booksTumbleLayer: document.getElementById('books-tumble-layer'),
      owlReactionLayer: document.getElementById('owl-reaction-layer'),
      owlPopImg: document.getElementById('owl-pop-img'),
      ghostReactionLayer: document.getElementById('ghost-reaction-layer'),
      ghostBroomImg: document.getElementById('ghost-broom-img'),
      lockTongueLayer: document.getElementById('lock-tongue-layer'),
      lockTongueImg: document.getElementById('lock-tongue-img'),
      duckSqueakLayer: document.getElementById('duck-squeak-layer'),
      duckGagImg: document.getElementById('duck-gag-img'),
      springBoingLayer: document.getElementById('spring-boing-layer'),
      springGagImg: document.getElementById('spring-gag-img'),
      balloonSootLayer: document.getElementById('balloon-soot-layer'),
      sootGagImg: document.getElementById('soot-gag-img'),
      brickWallLayer: document.getElementById('brick-wall-layer'),
      fakeEscapeLayer: document.getElementById('fake-escape-layer'),
      fakeEscapeBanner: document.getElementById('fake-escape-banner'),
      diaryModal: document.getElementById('diary-modal'),
      diaryReaderList: document.getElementById('diary-reader-list'),
      btnDiaryClose: document.getElementById('btn-diary-close'),
      finaleModal: document.getElementById('finale-modal'),
      finaleStars: document.getElementById('finale-stars'),
      finaleTime: document.getElementById('finale-time'),
      btnPlayAgain: document.getElementById('btn-play-again'),
      btnShareResult: document.getElementById('btn-share-result'),
      shareFeedback: document.getElementById('share-feedback'),
      codelockModal: document.getElementById('codelock-modal'),
      codelockDisplay: document.getElementById('codelock-display'),
      codelockGrid: document.getElementById('codelock-grid'),
      btnCodelockCancel: document.getElementById('btn-codelock-cancel'),
      wrongOverlay: document.getElementById('wrong-reaction-overlay'),
      doorLightWash: document.getElementById('door-light-wash'),
      captionBar: document.getElementById('caption-bar'),
      captionText: document.getElementById('caption-text'),
      inventoryBag: document.getElementById('inventory-bag'),
      btnHint: document.getElementById('btn-hint'),
      hintLevelBadge: document.getElementById('hint-level-badge'),
      dragGhost: document.getElementById('drag-ghost'),
      pauseModal: document.getElementById('pause-modal'),
      btnResume: document.getElementById('btn-resume'),
      btnRestartRoom: document.getElementById('btn-restart-room'),
      btnRestartAll: document.getElementById('btn-restart-all'),
      transitionOverlay: document.getElementById('transition-overlay'),
      transitionPageCard: document.getElementById('transition-page-card'),
      transitionChapter: document.getElementById('transition-chapter'),
      transitionLabel: document.getElementById('transition-label'),
      loadingPill: document.getElementById('loading-pill'),
      winModal: document.getElementById('win-modal'),
      winTitle: document.getElementById('win-title'),
      winStars: document.getElementById('win-stars'),
      diaryPageLabel: document.getElementById('diary-page-label'),
      diaryPageTitle: document.getElementById('diary-page-title'),
      diaryPageBody: document.getElementById('diary-page-body'),
      btnNextRoom: document.getElementById('btn-next-room')
    };

    let activeHintTarget = { hotspotId: null, itemId: null };
    let wrongTimer = null;
    let catTimeline = null;
    let isReactionActive = false;
    let isClothesBlocking = false;
    let clothesSwipeStart = null;
    let isTransitioning = false;
    let dragState = null;
    let clockTickStep = 0;
    let codeEntry = '';
    let beamPos = { x: 26, y: 35 };
    const preloadedRooms = new Map();

    function getRoomNumber(roomId) {
      const idx = engine && Array.isArray(engine.roomOrder) ? engine.roomOrder.indexOf(roomId) : -1;
      if (idx >= 0) return idx + 1;
      const m = String(roomId || '').match(/\d+/);
      return m ? Number(m[0]) : 1;
    }

    function trackAnalytics(eventName, params) {
      try {
        if (window.analyticsManager && typeof window.analyticsManager.trackEvent === 'function') {
          window.analyticsManager.trackEvent(eventName, params);
        } else if (typeof window.trackEvent === 'function') {
          window.trackEvent(eventName, params);
        }
      } catch (err) {
        // Never allow analytics errors to disrupt gameplay
      }
    }

    function trackUniqueAnalytics(key, eventName, params) {
      try {
        if (window.analyticsManager && typeof window.analyticsManager.trackUniqueEvent === 'function') {
          window.analyticsManager.trackUniqueEvent(key, eventName, params);
        } else {
          trackAnalytics(eventName, params);
        }
      } catch (err) {
        // Never allow analytics errors to disrupt gameplay
      }
    }

    function hydrateRoomReactionImages(roomId) {
      if (!dom.sceneFrame || !roomId) return;
      dom.sceneFrame.querySelectorAll(`img[data-room="${roomId}"][data-src]`).forEach((img) => {
        if (!img.getAttribute('src')) {
          img.setAttribute('src', img.dataset.src);
        }
      });
    }

    function preloadRoomAssets(roomId) {
      if (!roomId) return Promise.resolve();
      if (preloadedRooms.has(roomId)) return preloadedRooms.get(roomId);
      const room = engine.getRoom(roomId);
      const list = room && Array.isArray(room.assets) ? room.assets : [];
      if (!list.length || typeof Image === 'undefined') {
        const p = Promise.resolve();
        preloadedRooms.set(roomId, p);
        return p;
      }

      const loadOne = (src) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });

      const safetyTimeout = new Promise((resolve) => setTimeout(resolve, 2500));
      const p = Promise.race([Promise.all(list.map(loadOne)), safetyTimeout]);
      preloadedRooms.set(roomId, p);
      return p;
    }

    function hasSavedProgress() {
      const st = engine.state;
      if (!st || !st.started) return false;
      if (st.currentRoomId && st.currentRoomId !== 'room1') return true;
      const r1 = engine.getRoomState('room1');
      return Boolean(
        r1.completed
        || (r1.inventory && r1.inventory.length > 0)
        || (r1.usedItems && r1.usedItems.length > 0)
        || (r1.flags && (r1.flags.torchTaken || r1.flags.roomLit || r1.flags.rugMoved || r1.flags.noteRead))
      );
    }

    function playSound(kind) {
      const am = window.audioManager;
      if (!am) return;
      am.init();
      switch (kind) {
        case 'collect':
          if (typeof am.playKeyExtractChime === 'function') am.playKeyExtractChime();
          break;
        case 'cat':
          if (typeof am.playCatMeow === 'function') am.playCatMeow();
          break;
        case 'cloth':
          if (typeof am.playClothWhoosh === 'function') am.playClothWhoosh();
          break;
        case 'tick':
          if (typeof am.playClockTick === 'function') am.playClockTick();
          break;
        case 'owl':
          if (typeof am.playOwlShhh === 'function') am.playOwlShhh();
          break;
        case 'duck':
          if (typeof am.playDuckSqueak === 'function') am.playDuckSqueak();
          break;
        case 'spring':
          if (typeof am.playSpringBoing === 'function') am.playSpringBoing();
          break;
        case 'pop':
          if (typeof am.playBalloonPop === 'function') am.playBalloonPop();
          break;
        case 'wrong':
        case 'locked':
          if (typeof am.playLockedSound === 'function') am.playLockedSound();
          break;
        case 'win':
          if (typeof am.playDoorSlideOpen === 'function') am.playDoorSlideOpen();
          break;
        case 'hint':
          if (typeof am.playModalOpen === 'function') am.playModalOpen();
          break;
        case 'page':
          if (typeof am.playPageTurn === 'function') am.playPageTurn();
          break;
        case 'tap':
          if (typeof am.playUiTap === 'function') am.playUiTap();
          break;
        default:
          if (typeof am.playTerminalKeystroke === 'function') am.playTerminalKeystroke();
          break;
      }
    }

    function syncMuteUi() {
      const am = window.audioManager;
      const enabled = am ? am.soundEnabled : true;
      if (dom.btnMute) {
        dom.btnMute.setAttribute('aria-pressed', String(!enabled));
        dom.btnMute.setAttribute('aria-label', enabled ? 'Mute sound' : 'Unmute sound');
      }
      if (dom.iconSoundWaves) dom.iconSoundWaves.classList.toggle('hidden', !enabled);
      if (dom.iconSoundMute) dom.iconSoundMute.classList.toggle('hidden', enabled);
    }

    function setCaption(text, tone) {
      if (dom.captionText) dom.captionText.textContent = text || '';
      if (dom.captionBar) {
        dom.captionBar.classList.toggle('is-hint', tone === 'hint');
        dom.captionBar.classList.toggle('is-wrong', tone === 'wrong');
      }
    }

    function clearAllReactions() {
      if (wrongTimer) {
        clearTimeout(wrongTimer);
        wrongTimer = null;
      }
      if (catTimeline && typeof catTimeline.kill === 'function') {
        catTimeline.kill();
        catTimeline = null;
      }
      isReactionActive = false;
      isClothesBlocking = false;
      clothesSwipeStart = null;

      if (dom.sceneFrame) dom.sceneFrame.classList.remove('is-cat-shaking');
      [
        dom.wrongOverlay, dom.catReactionLayer, dom.clothesReactionLayer,
        dom.booksTumbleLayer, dom.owlReactionLayer, dom.ghostReactionLayer,
        dom.lockTongueLayer, dom.duckSqueakLayer, dom.springBoingLayer,
        dom.balloonSootLayer, dom.brickWallLayer, dom.fakeEscapeLayer
      ].forEach((layer) => {
        if (layer) {
          layer.classList.add('hidden');
          layer.style.opacity = '';
          layer.style.transform = '';
        }
      });
      [
        dom.catLeapImg, dom.catPawsImg, dom.catClawMarks, dom.owlPopImg,
        dom.ghostBroomImg, dom.lockTongueImg, dom.duckGagImg, dom.springGagImg,
        dom.sootGagImg, dom.fakeEscapeBanner
      ].forEach((el) => {
        if (el) {
          el.style.opacity = '';
          el.style.transform = '';
        }
      });
      const mask = document.getElementById('darkroom-mask');
      if (mask) mask.classList.remove('is-lights-on');
      if (dom.sceneHotspots) {
        dom.sceneHotspots.querySelectorAll('.is-wrong-shake').forEach((el) => {
          el.classList.remove('is-wrong-shake');
        });
      }
    }

    function playCatReaction(caption) {
      clearAllReactions();
      isReactionActive = true;
      setCaption(caption, 'wrong');
      playSound('cat');

      if (!dom.catReactionLayer) return;
      dom.catReactionLayer.classList.remove('hidden');

      const reduced = v4.prefersReducedMotion();
      if (v4.isGsapReady() && !reduced && dom.catLeapImg && dom.catPawsImg && dom.catClawMarks) {
        const gsap = window.gsap;
        gsap.set(dom.catLeapImg, { opacity: 1, scale: 0.3, y: 20 });
        gsap.set(dom.catPawsImg, { opacity: 0, scale: 0.75, y: 0 });
        gsap.set(dom.catClawMarks, { opacity: 0, scale: 0.85 });

        catTimeline = gsap.timeline({
          onComplete: () => clearAllReactions()
        });
        catTimeline
          .to(dom.catLeapImg, { scale: 1.2, y: -10, duration: 0.32, ease: 'power2.out' })
          .to(dom.catLeapImg, { opacity: 0, duration: 0.12 }, '-=0.05')
          .to(dom.catPawsImg, { opacity: 1, scale: 1.15, duration: 0.16, ease: 'back.out(1.4)' }, '-=0.1')
          .call(() => {
            if (dom.sceneFrame) dom.sceneFrame.classList.add('is-cat-shaking');
          })
          .to(dom.catClawMarks, { opacity: 1, scale: 1, duration: 0.18 })
          .to(dom.catPawsImg, { y: 240, opacity: 0, duration: 0.55, delay: 0.45, ease: 'power2.in' })
          .to(dom.catClawMarks, { opacity: 0, duration: 0.4 }, '-=0.35');
        return;
      }

      // Non-GSAP or reduced-motion fallback (max 1.8s)
      if (dom.catLeapImg) dom.catLeapImg.style.opacity = '0';
      if (dom.catPawsImg) {
        dom.catPawsImg.style.opacity = '1';
        dom.catPawsImg.style.transform = 'none';
      }
      if (dom.catClawMarks) dom.catClawMarks.style.opacity = '1';
      if (!reduced && dom.sceneFrame) dom.sceneFrame.classList.add('is-cat-shaking');

      wrongTimer = setTimeout(() => {
        clearAllReactions();
      }, reduced ? 1200 : 1800);
    }

    function playClothesReaction(caption, requireWipe) {
      clearAllReactions();
      isReactionActive = true;
      isClothesBlocking = requireWipe;
      setCaption(caption, 'wrong');
      playSound('cloth');

      if (!dom.clothesReactionLayer) return;
      if (dom.clothesWipePrompt) {
        dom.clothesWipePrompt.textContent = requireWipe ? 'Wipe or tap to clear!' : 'Tap to clear';
      }
      dom.clothesReactionLayer.classList.remove('hidden');

      if (v4.isGsapReady() && !v4.prefersReducedMotion()) {
        window.gsap.fromTo(dom.clothesReactionLayer, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.25 });
      } else {
        dom.clothesReactionLayer.style.opacity = '1';
      }

      if (!requireWipe) {
        wrongTimer = setTimeout(() => {
          clearAllReactions();
        }, 1500);
      }
    }

    function playBooksTumbleReaction(caption) {
      clearAllReactions();
      isReactionActive = true;
      setCaption(caption, 'wrong');
      playSound('cloth');

      if (!dom.booksTumbleLayer) return;
      dom.booksTumbleLayer.classList.remove('hidden');

      const books = dom.booksTumbleLayer.querySelectorAll('.tumble-book');
      const reduced = v4.prefersReducedMotion();

      if (v4.isGsapReady() && !reduced && books.length) {
        const gsap = window.gsap;
        gsap.set(books, { scale: 0.7, y: 0, rotation: 0, opacity: 1 });
        catTimeline = gsap.timeline({ onComplete: () => clearAllReactions() });
        catTimeline
          .to(books, {
            scale: 1.75,
            y: 45,
            rotation: (i) => (i % 2 === 0 ? -18 : 18),
            stagger: 0.05,
            duration: 0.45,
            ease: 'power2.out'
          })
          .to(books, {
            scale: 0.65,
            y: -15,
            rotation: 0,
            opacity: 0,
            stagger: 0.04,
            duration: 0.45,
            delay: 0.45,
            ease: 'power2.in'
          });
        return;
      }

      wrongTimer = setTimeout(() => clearAllReactions(), reduced ? 1000 : 1600);
    }

    function playOwlShhhReaction(caption) {
      clearAllReactions();
      isReactionActive = true;
      setCaption(caption, 'wrong');
      playSound('owl');

      if (!dom.owlReactionLayer) return;
      dom.owlReactionLayer.classList.remove('hidden');

      const reduced = v4.prefersReducedMotion();
      if (v4.isGsapReady() && !reduced && dom.owlPopImg) {
        const gsap = window.gsap;
        gsap.set(dom.owlPopImg, { scale: 0.4, y: 60, opacity: 0 });
        catTimeline = gsap.timeline({ onComplete: () => clearAllReactions() });
        catTimeline
          .to(dom.owlPopImg, { scale: 1.12, y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.6)' })
          .to(dom.owlPopImg, { scale: 0.85, y: 80, opacity: 0, duration: 0.35, delay: 0.9, ease: 'power2.in' });
        return;
      }

      wrongTimer = setTimeout(() => clearAllReactions(), reduced ? 1000 : 1600);
    }

    function playGhostBroomReaction(caption) {
      clearAllReactions();
      isReactionActive = true;
      setCaption(caption, 'wrong');
      playSound('cloth');

      const mask = document.getElementById('darkroom-mask');
      if (mask) mask.classList.add('is-lights-on');
      if (!dom.ghostReactionLayer) return;
      dom.ghostReactionLayer.classList.remove('hidden');

      const reduced = v4.prefersReducedMotion();
      if (v4.isGsapReady() && !reduced && dom.ghostBroomImg) {
        const gsap = window.gsap;
        gsap.set(dom.ghostBroomImg, { y: 90, scale: 0.7, opacity: 0 });
        catTimeline = gsap.timeline({ onComplete: () => clearAllReactions() });
        catTimeline
          .to(dom.ghostBroomImg, { y: -12, scale: 1.05, opacity: 1, duration: 0.5, ease: 'power2.out' })
          .to(dom.ghostBroomImg, { y: 120, opacity: 0, duration: 0.45, delay: 0.75, ease: 'power2.in' });
        return;
      }

      wrongTimer = setTimeout(() => clearAllReactions(), reduced ? 1000 : 1600);
    }

    function playLockTongueReaction(caption) {
      clearAllReactions();
      isReactionActive = true;
      setCaption(caption, 'wrong');
      playSound('wrong');

      if (!dom.lockTongueLayer) return;
      dom.lockTongueLayer.classList.remove('hidden');

      const reduced = v4.prefersReducedMotion();
      if (v4.isGsapReady() && !reduced && dom.lockTongueImg) {
        const gsap = window.gsap;
        gsap.set(dom.lockTongueImg, { scale: 0.4, rotation: -8, opacity: 0 });
        catTimeline = gsap.timeline({ onComplete: () => clearAllReactions() });
        catTimeline
          .to(dom.lockTongueImg, { scale: 1.15, rotation: 6, opacity: 1, duration: 0.28, ease: 'back.out(1.7)' })
          .to(dom.lockTongueImg, { rotation: -6, duration: 0.16 })
          .to(dom.lockTongueImg, { scale: 0.5, opacity: 0, duration: 0.3, delay: 0.7 });
        return;
      }

      wrongTimer = setTimeout(() => clearAllReactions(), reduced ? 1000 : 1600);
    }

    function playWorkshopGag(kind, caption) {
      clearAllReactions();
      isReactionActive = true;
      setCaption(caption, 'wrong');

      const map = {
        duck_squeak: { layer: dom.duckSqueakLayer, img: dom.duckGagImg, sfx: 'duck' },
        spring_boing: { layer: dom.springBoingLayer, img: dom.springGagImg, sfx: 'spring' },
        balloon_soot: { layer: dom.balloonSootLayer, img: dom.sootGagImg, sfx: 'pop' }
      };
      const cfg = map[kind];
      if (!cfg || !cfg.layer) return;

      playSound(cfg.sfx);
      cfg.layer.classList.remove('hidden');

      const reduced = v4.prefersReducedMotion();
      if (v4.isGsapReady() && !reduced && cfg.img) {
        const gsap = window.gsap;
        gsap.set(cfg.img, { scale: 0.45, opacity: 0, y: 20 });
        catTimeline = gsap.timeline({ onComplete: () => clearAllReactions() });
        if (kind === 'spring_boing') {
          catTimeline
            .to(cfg.img, { scale: 1.55, y: -10, opacity: 1, duration: 0.35, ease: 'elastic.out(1, 0.4)' })
            .to(cfg.img, { scale: 0.6, opacity: 0, duration: 0.35, delay: 0.65 });
        } else if (kind === 'balloon_soot') {
          catTimeline
            .to(cfg.img, { scale: 1.15, opacity: 1, duration: 0.2 })
            .to(cfg.layer, { opacity: 0, duration: 0.6, delay: 0.85, onComplete: () => { cfg.layer.style.opacity = ''; } });
        } else {
          catTimeline
            .to(cfg.img, { scale: 1.35, opacity: 1, duration: 0.25, ease: 'back.out(1.7)' })
            .to(cfg.img, { scale: 0.85, opacity: 0, duration: 0.35, delay: 0.7 });
        }
        return;
      }

      wrongTimer = setTimeout(() => clearAllReactions(), reduced ? 1000 : 1600);
    }

    function playRoom5WrongReaction(kind, caption) {
      clearAllReactions();
      isReactionActive = true;
      setCaption(caption, 'wrong');
      playSound('wrong');

      if (kind === 'brick_wall' && dom.brickWallLayer) {
        dom.brickWallLayer.classList.remove('hidden');
        if (v4.isGsapReady() && !v4.prefersReducedMotion()) {
          window.gsap.fromTo(dom.brickWallLayer, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25 });
        }
        wrongTimer = setTimeout(() => clearAllReactions(), 1600);
        return;
      }

      if (kind === 'fake_escape' && dom.fakeEscapeLayer && dom.fakeEscapeBanner) {
        dom.fakeEscapeLayer.classList.remove('hidden');
        const reduced = v4.prefersReducedMotion();
        if (v4.isGsapReady() && !reduced) {
          const gsap = window.gsap;
          gsap.set(dom.fakeEscapeBanner, { y: -120, rotation: -3, opacity: 1 });
          catTimeline = gsap.timeline({ onComplete: () => clearAllReactions() });
          catTimeline
            .to(dom.fakeEscapeBanner, { y: 0, duration: 0.35, ease: 'bounce.out' })
            .to(dom.fakeEscapeBanner, { y: 340, rotation: 18, opacity: 0, duration: 0.55, delay: 0.65, ease: 'power2.in' });
          return;
        }
        wrongTimer = setTimeout(() => clearAllReactions(), reduced ? 1000 : 1600);
      }
    }

    function openDiaryReaderModal() {
      if (!dom.diaryModal || !dom.diaryReaderList) return;
      const pages = (engine.state.diaryPages && engine.state.diaryPages.length)
        ? engine.state.diaryPages.filter((p) => p.number <= 4)
        : [
          { number: 1, body: 'First, I needed light.' },
          { number: 2, body: 'Then I pulled what I could not reach.' },
          { number: 3, body: 'After that, I made time stand still.' },
          { number: 4, body: 'At last, I tasted freedom.' }
        ];
      dom.diaryReaderList.innerHTML = pages.map((p) =>
        `<div class="diary-entry-row"><span class="diary-entry-num">Page ${p.number}</span><p class="diary-entry-text">${p.body}</p></div>`
      ).join('');
      dom.diaryModal.classList.remove('hidden');
    }

    function closeDiaryReaderModal() {
      if (dom.diaryModal) dom.diaryModal.classList.add('hidden');
    }

    function showFinaleModal(stats) {
      if (!dom.finaleModal) return;
      const s = stats || engine.getTotalStats();
      if (dom.finaleStars) dom.finaleStars.textContent = `${s.totalStars} / ${s.maxStars} ★`;
      if (dom.finaleTime) dom.finaleTime.textContent = s.formattedTime;
      if (dom.shareFeedback) dom.shareFeedback.classList.add('hidden');
      dom.finaleModal.classList.remove('hidden');
      if (dom.btnPlayAgain) dom.btnPlayAgain.focus();
    }

    function applyBeamPosition() {
      const mask = document.getElementById('darkroom-mask');
      if (!mask) return;
      mask.style.setProperty('--beam-x', `${beamPos.x}%`);
      mask.style.setProperty('--beam-y', `${beamPos.y}%`);
    }

    function updateBeamFromPointer(e) {
      const room = engine.getCurrentRoom();
      if (!room || !room.isDarkRoom || !dom.sceneFrame) return;
      const rect = dom.sceneFrame.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const xPct = Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100));
      const rawYPct = ((e.clientY - rect.top) / rect.height) * 100;
      // Keep the lit circle visible above the finger on touch devices
      const offsetY = e.pointerType === 'touch' ? rawYPct - 14 : rawYPct;
      const yPct = Math.max(6, Math.min(94, offsetY));
      beamPos = { x: xPct, y: yPct };
      applyBeamPosition();
    }

    function updateCodeLockDisplay() {
      if (!dom.codelockDisplay) return;
      const chars = [0, 1, 2].map((i) => codeEntry[i] || '_');
      dom.codelockDisplay.textContent = chars.join(' ');
    }

    function openCodeLockModal() {
      codeEntry = '';
      updateCodeLockDisplay();
      if (dom.codelockModal) dom.codelockModal.classList.remove('hidden');
    }

    function closeCodeLockModal() {
      if (dom.codelockModal) dom.codelockModal.classList.add('hidden');
    }

    function handleCodeKey(digit) {
      if (isTransitioning) return;
      if (digit === 'CLR') {
        codeEntry = '';
        updateCodeLockDisplay();
        playSound('inspect');
        return;
      }
      if (digit === 'OK') {
        if (codeEntry.length < 3) {
          playSound('locked');
          return;
        }
        closeCodeLockModal();
        const res = engine.submitRoomCode(codeEntry);
        handleInteractionResult(res);
        return;
      }
      if (/^[0-9]$/.test(digit) && codeEntry.length < 3) {
        codeEntry += digit;
        updateCodeLockDisplay();
        playSound('inspect');
      }
    }

    function triggerGenericWrongReaction(hotspotId, caption) {
      clearAllReactions();
      isReactionActive = true;
      setCaption(caption, 'wrong');
      playSound('wrong');

      if (hotspotId) {
        const btn = dom.sceneHotspots.querySelector(`[data-hotspot-id="${hotspotId}"]`);
        if (btn) btn.classList.add('is-wrong-shake');
      }
      if (dom.wrongOverlay) dom.wrongOverlay.classList.remove('hidden');

      wrongTimer = setTimeout(() => {
        clearAllReactions();
      }, 2000);
    }

    function positionFirefly(hotspotId) {
      if (!dom.firefly) return;
      const room = engine.getCurrentRoom();
      if (!room) return;
      const hs = hotspotId ? room.hotspots.find((h) => h.id === hotspotId) : null;

      if (hs) {
        dom.firefly.style.left = `${Math.min(88, hs.x + 8)}%`;
        dom.firefly.style.top = `${Math.max(12, hs.y - 10)}%`;
      } else {
        dom.firefly.style.left = '84%';
        dom.firefly.style.top = '16%';
      }
      dom.firefly.classList.remove('hidden');

      if (v4.isGsapReady() && !v4.prefersReducedMotion()) {
        window.gsap.fromTo(dom.firefly, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.6)' });
      }
    }

    function hideFirefly() {
      if (dom.firefly) dom.firefly.classList.add('hidden');
      activeHintTarget = { hotspotId: null, itemId: null };
    }

    function updateClockHands() {
      if (!dom.sceneArt) return;
      const angle = (clockTickStep * 6) % 360;
      dom.sceneArt.querySelectorAll('.clock-ticking .clock-sec-hand').forEach((hand) => {
        hand.style.transform = `rotate(${angle}deg)`;
      });
    }

    function syncDesktopWings() {
      if (!dom.sceneWingBackdrop || !dom.sceneFrame) return;
      const desktop = window.EscapeV4Desktop;
      const isWide = Boolean(desktop && desktop.isWideDesktop());
      const room = engine.getCurrentRoom();
      if (!isWide || !room) {
        dom.sceneWingBackdrop.innerHTML = '';
        dom.sceneFrame.classList.remove('is-room1-wing', 'is-svg-wing-room');
        return;
      }
      const rs = engine.getRoomState(room.id);
      dom.sceneWingBackdrop.innerHTML = desktop.renderWings(room.id, rs);
      dom.sceneFrame.classList.toggle('is-room1-wing', room.id === 'room1');
      dom.sceneFrame.classList.toggle('is-svg-wing-room', room.id !== 'room1');
    }

    function renderScene() {
      const room = engine.getCurrentRoom();
      if (!room) return;
      const rs = engine.getRoomState(room.id);

      if (dom.roomNumber) dom.roomNumber.textContent = room.number;
      if (dom.mission) dom.mission.textContent = room.mission;
      if (dom.hintLevelBadge) dom.hintLevelBadge.textContent = `${rs.hintLevel}/3`;

      if (dom.sceneArt) {
        if (typeof room.renderSceneHtml === 'function') {
          dom.sceneArt.innerHTML = room.renderSceneHtml(rs);
        } else if (typeof room.renderSceneSvg === 'function') {
          dom.sceneArt.innerHTML = room.renderSceneSvg(rs);
        }
        updateClockHands();
      }

      const darkActive = Boolean(room.isDarkRoom && !rs.completed);
      if (dom.darkroomMask) {
        dom.darkroomMask.classList.toggle('hidden', !darkActive);
      }
      if (dom.sceneFrame) {
        dom.sceneFrame.classList.toggle('is-darkroom-active', darkActive);
      }
      applyBeamPosition();
      syncDesktopWings();

      if (dom.sceneHotspots) {
        dom.sceneHotspots.innerHTML = '';
        (room.hotspots || []).forEach((hs) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'hotspot-btn';
          if (activeHintTarget.hotspotId === hs.id) {
            btn.classList.add('is-hint-glow');
          }
          btn.dataset.hotspotId = hs.id;
          btn.setAttribute('aria-label', hs.label);
          btn.style.left = `${hs.x}%`;
          btn.style.top = `${hs.y}%`;
          btn.style.width = `${hs.w}%`;
          btn.style.height = `${hs.h}%`;

          let swipeHandled = false;
          let swipeOrigin = null;

          if (hs.swipeable) {
            btn.addEventListener('pointerdown', (e) => {
              swipeHandled = false;
              swipeOrigin = { x: e.clientX, y: e.clientY };
            });
            btn.addEventListener('pointermove', (e) => {
              if (!swipeOrigin || swipeHandled || isTransitioning || isClothesBlocking) return;
              if (Math.hypot(e.clientX - swipeOrigin.x, e.clientY - swipeOrigin.y) > 22) {
                swipeHandled = true;
                swipeOrigin = null;
                clearAllReactions();
                const res = engine.inspectHotspot(hs.id);
                handleInteractionResult(res);
              }
            });
            btn.addEventListener('pointerup', () => {
              swipeOrigin = null;
            });
          }

          btn.addEventListener('click', () => {
            if (swipeHandled) {
              swipeHandled = false;
              return;
            }
            if (isTransitioning || isClothesBlocking) return;
            clearAllReactions();
            btn.classList.add('is-tapped');
            setTimeout(() => btn.classList.remove('is-tapped'), 180);

            const res = engine.inspectHotspot(hs.id);
            handleInteractionResult(res);
          });

          dom.sceneHotspots.appendChild(btn);
        });
      }
    }

    function renderInventory() {
      const room = engine.getCurrentRoom();
      if (!room || !dom.inventoryBag) return;
      const rs = engine.getRoomState(room.id);
      const selectedId = engine.selectedItemId;

      dom.inventoryBag.innerHTML = '';
      dom.inventoryBag.classList.toggle('is-compact', rs.inventory.length > 3);
      const slotCount = Math.max(3, rs.inventory.length);

      for (let i = 0; i < slotCount; i++) {
        const itemId = rs.inventory[i];
        const itemDef = itemId && room.items ? room.items[itemId] : null;
        const slot = document.createElement('button');
        slot.type = 'button';
        slot.setAttribute('role', 'listitem');

        if (!itemDef) {
          slot.className = 'inv-slot is-empty';
          slot.disabled = true;
          slot.setAttribute('aria-label', 'Empty bag slot');
          dom.inventoryBag.appendChild(slot);
          continue;
        }

        slot.className = 'inv-slot is-filled'
          + (selectedId === itemId ? ' is-selected' : '')
          + (activeHintTarget.itemId === itemId ? ' is-hint-glow' : '');
        slot.dataset.itemId = itemId;
        slot.setAttribute('aria-label', `${itemDef.name}${selectedId === itemId ? ' (selected)' : ''}`);
        slot.setAttribute('aria-pressed', String(selectedId === itemId));
        slot.innerHTML = `${itemDef.iconSvg}<span class="inv-label">${itemDef.shortLabel}</span>`;

        attachInventoryInteractions(slot, itemDef);
        dom.inventoryBag.appendChild(slot);
      }
    }

    function attachInventoryInteractions(slot, itemDef) {
      slot.addEventListener('pointerdown', (e) => {
        if (isTransitioning || isClothesBlocking || e.button > 0) return;
        dragState = {
          itemDef,
          startX: e.clientX,
          startY: e.clientY,
          dragging: false
        };
      });

      slot.addEventListener('click', () => {
        if (isTransitioning || isClothesBlocking) return;
        clearAllReactions();

        if (engine.selectedItemId && engine.selectedItemId !== itemDef.id) {
          const craftRes = engine.combineItems(engine.selectedItemId, itemDef.id);
          handleInteractionResult(craftRes);
          return;
        }

        const nextSelected = engine.selectItem(itemDef.id);
        playSound('inspect');
        if (nextSelected) {
          setCaption(`${itemDef.name} selected. Tap target or another item.`, 'normal');
        } else {
          setCaption('Item put back in bag.', 'normal');
        }
        renderInventory();
      });
    }

    function getHotspotAtPoint(x, y) {
      const buttons = dom.sceneHotspots.querySelectorAll('.hotspot-btn');
      for (let i = 0; i < buttons.length; i++) {
        const rect = buttons[i].getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return buttons[i];
        }
      }
      return null;
    }

    window.addEventListener('pointermove', (e) => {
      if (!dragState) return;
      const dist = Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY);
      if (!dragState.dragging && dist > 10) {
        dragState.dragging = true;
        if (dom.dragGhost) {
          dom.dragGhost.innerHTML = dragState.itemDef.iconSvg;
          dom.dragGhost.classList.remove('hidden');
        }
      }
      if (dragState.dragging && dom.dragGhost) {
        dom.dragGhost.style.left = `${e.clientX}px`;
        dom.dragGhost.style.top = `${e.clientY}px`;
        dom.sceneHotspots.querySelectorAll('.is-drop-hover').forEach((el) => el.classList.remove('is-drop-hover'));
        const hit = getHotspotAtPoint(e.clientX, e.clientY);
        if (hit) hit.classList.add('is-drop-hover');
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (!dragState) return;
      const wasDragging = dragState.dragging;
      const itemDef = dragState.itemDef;
      dragState = null;

      if (dom.dragGhost) dom.dragGhost.classList.add('hidden');
      dom.sceneHotspots.querySelectorAll('.is-drop-hover').forEach((el) => el.classList.remove('is-drop-hover'));

      if (wasDragging) {
        const hit = getHotspotAtPoint(e.clientX, e.clientY);
        if (hit) {
          clearAllReactions();
          const res = engine.useItemOnHotspot(itemDef.id, hit.dataset.hotspotId);
          handleInteractionResult(res);
          return;
        }
        const invSlots = dom.inventoryBag ? dom.inventoryBag.querySelectorAll('.inv-slot.is-filled') : [];
        for (let i = 0; i < invSlots.length; i++) {
          const r = invSlots[i].getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            const targetId = invSlots[i].dataset.itemId;
            if (targetId && targetId !== itemDef.id) {
              clearAllReactions();
              const craftRes = engine.combineItems(itemDef.id, targetId);
              handleInteractionResult(craftRes);
            }
            break;
          }
        }
      }
    });

    function handleInteractionResult(res) {
      if (!res) return;

      if (res.type === 'wrong') {
        trackAnalytics('wrong_choice', {
          room_number: getRoomNumber(engine.state.currentRoomId),
          reaction: res.reaction || 'generic'
        });
        renderScene();
        renderInventory();
        if (res.reaction === 'cat') {
          playCatReaction(res.caption);
        } else if (res.reaction === 'clothes_first') {
          playClothesReaction(res.caption, true);
        } else if (res.reaction === 'clothes_repeat') {
          playClothesReaction(res.caption, false);
        } else if (res.reaction === 'books_tumble') {
          playBooksTumbleReaction(res.caption);
        } else if (res.reaction === 'owl_shhh') {
          playOwlShhhReaction(res.caption);
        } else if (res.reaction === 'ghost_broom') {
          playGhostBroomReaction(res.caption);
        } else if (res.reaction === 'lock_tongue') {
          playLockTongueReaction(res.caption);
        } else if (res.reaction === 'duck_squeak' || res.reaction === 'spring_boing' || res.reaction === 'balloon_soot') {
          playWorkshopGag(res.reaction, res.caption);
        } else if (res.reaction === 'brick_wall' || res.reaction === 'fake_escape') {
          playRoom5WrongReaction(res.reaction, res.caption);
        } else {
          triggerGenericWrongReaction(res.hotspotId, res.caption);
        }
        return;
      }

      if (res.openCodeLock) {
        playSound('hint');
        setCaption(res.caption, 'normal');
        openCodeLockModal();
        return;
      }

      if (res.openDiaryReader) {
        playSound('hint');
        setCaption(res.caption, 'normal');
        openDiaryReaderModal();
        return;
      }

      if (res.type === 'win') {
        hideFirefly();
        clearAllReactions();
        playSound('win');
        setCaption(res.caption, 'normal');
        renderScene();
        renderInventory();
        runWinSequence(res);
        return;
      }

      if (res.type === 'collect' || res.type === 'item_used') {
        hideFirefly();
      }

      playSound(res.sound);
      setCaption(res.caption, 'normal');
      renderScene();
      renderInventory();
    }

    function runWinSequence(winRes) {
      isTransitioning = true;
      const roomNum = getRoomNumber(winRes.roomId);
      trackAnalytics('room_complete', {
        room_number: roomNum,
        stars: winRes.stars
      });
      if (winRes.isFinale && winRes.stats) {
        trackUniqueAnalytics('game_completed', 'game_completed', {
          room_number: roomNum,
          total_stars: winRes.stats.totalStars,
          max_stars: winRes.stats.maxStars,
          total_time_sec: Math.round((winRes.stats.elapsedMs || 0) / 1000)
        });
      }

      if (dom.transitionChapter) {
        dom.transitionChapter.textContent = '';
      }
      if (dom.transitionLabel) {
        dom.transitionLabel.textContent = winRes.transitionText || 'Stepping into the light...';
      }

      const showCard = () => {
        if (dom.doorLightWash) {
          dom.doorLightWash.classList.add('hidden');
          dom.doorLightWash.style.opacity = '0';
        }
        if (dom.sceneFrame) {
          dom.sceneFrame.style.transform = '';
        }
        if (dom.transitionOverlay) dom.transitionOverlay.classList.add('hidden');
        if (winRes.isFinale) {
          showFinaleModal(winRes.stats);
        } else {
          showWinModal(winRes);
        }
        isTransitioning = false;
      };

      const reduced = v4.prefersReducedMotion();
      if (winRes.isFinale) {
        const walls = dom.sceneArt ? dom.sceneArt.querySelector('.room5-walls-wrap') : null;
        const wingWalls = dom.sceneWingBackdrop ? dom.sceneWingBackdrop.querySelector('.wing-room5-walls') : null;
        const peelTargets = [walls, wingWalls].filter(Boolean);
        if (v4.isGsapReady() && !reduced && peelTargets.length) {
          window.gsap.to(peelTargets, {
            rotationY: -92,
            x: -180,
            opacity: 0,
            duration: 0.95,
            ease: 'power2.inOut',
            onComplete: () => setTimeout(showCard, 450)
          });
          return;
        }
        peelTargets.forEach((el) => el.classList.add('is-peeled'));
        setTimeout(showCard, reduced ? 200 : 750);
        return;
      }
      if (winRes.roomId === 'room3') {
        if (dom.darkroomMask) dom.darkroomMask.classList.add('hidden');
        if (dom.sceneFrame) dom.sceneFrame.classList.remove('is-darkroom-active');
        if (dom.sceneArt) {
          const bulbs = dom.sceneArt.querySelectorAll('.corridor-bulb');
          bulbs.forEach((b, idx) => {
            setTimeout(() => b.classList.add('is-lit'), reduced ? 40 : idx * 220);
          });
        }
      }

      if (v4.isGsapReady() && !reduced && dom.doorLightWash && dom.sceneFrame) {
        const gsap = window.gsap;
        const isWide = Boolean(window.EscapeV4Desktop && window.EscapeV4Desktop.isWideDesktop());
        const baseX = winRes.roomId === 'room2' ? 41 : (winRes.roomId === 'room3' ? 75.5 : (winRes.roomId === 'room4' ? 72 : 84));
        const baseY = winRes.roomId === 'room2' ? 58 : (winRes.roomId === 'room3' ? 48 : (winRes.roomId === 'room4' ? 82 : 55));
        const originX = isWide ? (21.875 + baseX * 0.5625).toFixed(1) : String(baseX);
        const origin = `${originX}% ${baseY}%`;
        const zoomDelay = (winRes.roomId === 'room2' || winRes.roomId === 'room3') ? 0.5 : 0.2;
        dom.doorLightWash.classList.remove('hidden');
        gsap.set(dom.doorLightWash, { opacity: 0 });
        const tl = gsap.timeline({ onComplete: showCard });
        tl.to(dom.sceneFrame, { scale: 1.28, transformOrigin: origin, duration: 0.75, delay: zoomDelay, ease: 'power2.in' })
          .to(dom.doorLightWash, { opacity: 1, duration: 0.55 }, '-=0.4')
          .call(() => {
            if (dom.transitionOverlay) {
              dom.transitionOverlay.classList.remove('hidden');
              gsap.fromTo(dom.transitionOverlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            }
          })
          .to({}, { duration: 0.45 })
          .to(dom.transitionOverlay, { opacity: 0, duration: 0.3 });
        return;
      }

      // Non-GSAP or reduced-motion fallback
      if (dom.doorLightWash) {
        dom.doorLightWash.classList.remove('hidden');
        dom.doorLightWash.style.opacity = '0.85';
      }
      setTimeout(showCard, reduced ? 200 : 700);
    }

    function showWinModal(winRes) {
      if (!dom.winModal) return;
      const room = engine.getRoom(winRes.roomId);
      const resultHeading = (room && room.winSequence && room.winSequence.resultHeading) || 'Room Escaped';
      if (dom.winTitle) dom.winTitle.textContent = resultHeading;

      if (dom.winStars) {
        let starsHtml = '';
        for (let i = 1; i <= 3; i++) {
          starsHtml += i <= winRes.stars
            ? '<span class="star-earned" aria-hidden="true">&#9733;</span>'
            : '<span class="star-empty" aria-hidden="true">&#9734;</span>';
        }
        dom.winStars.innerHTML = starsHtml;
        dom.winStars.setAttribute('aria-label', `${winRes.stars} out of 3 stars`);
      }

      if (winRes.diaryPage) {
        if (dom.diaryPageLabel) dom.diaryPageLabel.textContent = `Diary Page ${winRes.diaryPage.number}`;
        if (dom.diaryPageTitle) dom.diaryPageTitle.textContent = winRes.diaryPage.title;
        if (dom.diaryPageBody) dom.diaryPageBody.innerHTML = winRes.diaryPage.body.replace(/\n/g, '<br>');
      }

      dom.winModal.classList.remove('hidden');
      if (dom.btnNextRoom) dom.btnNextRoom.focus();
    }

    function bootIntoRoom(isResume) {
      const room = engine.getCurrentRoom();
      const rs = engine.getRoomState();
      hideFirefly();
      clearAllReactions();
      if (room) hydrateRoomReactionImages(room.id);
      renderScene();
      renderInventory();
      setCaption(isResume ? 'Welcome back. Keep looking.' : (room ? room.introCaption : ''), 'normal');

      if (room && !(rs && rs.completed)) {
        trackAnalytics('room_start', {
          room_number: getRoomNumber(room.id),
          resumed: Boolean(isResume)
        });
      }

      // Preload ONLY the next room's art while playing this room
      if (room && room.winSequence && room.winSequence.nextRoomId) {
        preloadRoomAssets(room.winSequence.nextRoomId);
      }

      if (rs && rs.completed) {
        const diaryPage = room && room.winSequence && room.winSequence.diaryPage;
        const isFinale = Boolean(room && room.winSequence && room.winSequence.isFinale);
        if (isFinale) {
          showFinaleModal(engine.getTotalStats());
        } else {
          showWinModal({
            roomId: room.id,
            stars: rs.stars || engine.calculateStars(rs.hintsUsed, rs.mistakes),
            diaryPage,
            nextRoomId: room && room.winSequence ? room.winSequence.nextRoomId : null
          });
        }
      }
    }

    async function openBookFromCover() {
      if (isTransitioning) return;
      isTransitioning = true;
      playSound('page');

      const isContinue = hasSavedProgress();
      const targetId = isContinue ? engine.state.currentRoomId : 'room1';
      if (dom.coverLoading) dom.coverLoading.classList.remove('hidden');
      await preloadRoomAssets(targetId);
      if (dom.coverLoading) dom.coverLoading.classList.add('hidden');

      if (!isContinue) {
        if (window.analyticsManager && typeof window.analyticsManager.resetRunEvents === 'function') {
          window.analyticsManager.resetRunEvents();
        }
        engine.restartGame();
      } else if (!engine.state.started) {
        engine.startGame();
      }
      trackUniqueAnalytics('game_start', 'game_start', {
        room_number: getRoomNumber(targetId),
        resumed: Boolean(isContinue)
      });

      const bookWrap = dom.coverBookCard ? dom.coverBookCard.querySelector('.cover-book-wrap') : null;
      const infoCol = dom.coverBookCard ? dom.coverBookCard.querySelector('.cover-info-col') : null;

      const finishOpen = () => {
        if (dom.coverScreen) {
          dom.coverScreen.classList.add('hidden');
          dom.coverScreen.style.opacity = '';
        }
        if (dom.coverBookCard) {
          dom.coverBookCard.style.transform = '';
          dom.coverBookCard.style.opacity = '';
        }
        if (bookWrap) {
          bookWrap.style.transform = '';
          bookWrap.style.opacity = '';
        }
        if (infoCol) {
          infoCol.style.transform = '';
          infoCol.style.opacity = '';
        }
        if (dom.appShell) {
          dom.appShell.classList.remove('hidden');
          dom.appShell.setAttribute('aria-hidden', 'false');
        }
        bootIntoRoom(isContinue);
        isTransitioning = false;
      };

      const reduced = v4.prefersReducedMotion();
      if (v4.isGsapReady() && !reduced && dom.coverBookCard && dom.coverScreen) {
        const gsap = window.gsap;
        const tl = gsap.timeline({ onComplete: finishOpen });
        if (bookWrap && infoCol) {
          tl.to(infoCol, { opacity: 0, y: 10, duration: 0.34, ease: 'power2.in' }, 0)
            .to(bookWrap, { rotationY: -86, x: -24, scale: 1.12, duration: 0.72, ease: 'power2.inOut' }, 0.08)
            .to(dom.coverScreen, { opacity: 0, duration: 0.32, ease: 'power1.out' }, 0.66);
        } else {
          tl.to(dom.coverBookCard, { rotationY: -78, x: -40, opacity: 0, duration: 0.65, ease: 'power2.inOut' })
            .to(dom.coverScreen, { opacity: 0, duration: 0.3 }, '-=0.15');
        }
        return;
      }

      finishOpen();
    }

    async function runPageTurnTransition(nextRoomId, onComplete) {
      isTransitioning = true;
      playSound('page');

      const nextRoom = engine.getRoom(nextRoomId);
      if (dom.transitionChapter && nextRoom) dom.transitionChapter.textContent = nextRoom.number;
      if (dom.transitionLabel && nextRoom) dom.transitionLabel.textContent = nextRoom.title;
      if (dom.loadingPill) dom.loadingPill.classList.remove('hidden');

      if (dom.transitionOverlay) dom.transitionOverlay.classList.remove('hidden');
      await preloadRoomAssets(nextRoomId);
      if (dom.loadingPill) dom.loadingPill.classList.add('hidden');

      const finish = () => {
        if (dom.transitionOverlay) {
          dom.transitionOverlay.classList.add('hidden');
          dom.transitionOverlay.style.opacity = '';
        }
        if (dom.transitionPageCard) {
          dom.transitionPageCard.style.transform = '';
          dom.transitionPageCard.style.opacity = '';
        }
        onComplete();
        isTransitioning = false;
      };

      const reduced = v4.prefersReducedMotion();
      if (v4.isGsapReady() && !reduced && dom.transitionOverlay && dom.transitionPageCard) {
        const gsap = window.gsap;
        gsap.set(dom.transitionOverlay, { opacity: 0 });
        gsap.set(dom.transitionPageCard, { rotationY: 0, opacity: 1 });
        const tl = gsap.timeline({ onComplete: finish });
        tl.to(dom.transitionOverlay, { opacity: 1, duration: 0.22 })
          .to(dom.transitionPageCard, { rotationY: -86, opacity: 0, duration: 0.45, delay: 0.22, ease: 'power2.in' })
          .to(dom.transitionOverlay, { opacity: 0, duration: 0.18 }, '-=0.1');
        return;
      }

      setTimeout(finish, reduced ? 150 : 450);
    }

    // Visual 1-second clock tick for non-frozen clocks
    setInterval(() => {
      clockTickStep = (clockTickStep + 1) % 60;
      updateClockHands();
    }, 1000);

    // Event Bindings
    if (dom.btnMute) {
      dom.btnMute.addEventListener('click', () => {
        if (window.audioManager) {
          window.audioManager.init();
          window.audioManager.toggleGlobalAudio();
        }
        syncMuteUi();
      });
    }

    if (dom.btnHint) {
      dom.btnHint.addEventListener('click', () => {
        if (isTransitioning || isClothesBlocking) return;
        clearAllReactions();
        const hint = engine.requestHint();
        if (!hint) return;

        trackAnalytics('hint_used', {
          room_number: getRoomNumber(engine.state.currentRoomId),
          hint_level: hint.level
        });
        playSound('hint');
        activeHintTarget = {
          hotspotId: hint.targetHotspotId,
          itemId: hint.targetItemId
        };
        setCaption(hint.text, 'hint');
        positionFirefly(hint.targetHotspotId);
        renderScene();
        renderInventory();
      });
    }

    if (dom.wrongOverlay) {
      dom.wrongOverlay.addEventListener('click', () => clearAllReactions());
    }

    if (dom.catReactionLayer) {
      dom.catReactionLayer.addEventListener('click', () => clearAllReactions());
    }

    if (dom.booksTumbleLayer) {
      dom.booksTumbleLayer.addEventListener('click', () => clearAllReactions());
    }

    if (dom.owlReactionLayer) {
      dom.owlReactionLayer.addEventListener('click', () => clearAllReactions());
    }

    if (dom.ghostReactionLayer) {
      dom.ghostReactionLayer.addEventListener('click', () => clearAllReactions());
    }

    if (dom.lockTongueLayer) {
      dom.lockTongueLayer.addEventListener('click', () => clearAllReactions());
    }

    [dom.duckSqueakLayer, dom.springBoingLayer, dom.balloonSootLayer, dom.brickWallLayer, dom.fakeEscapeLayer].forEach((el) => {
      if (el) el.addEventListener('click', () => clearAllReactions());
    });

    if (dom.btnDiaryClose) {
      dom.btnDiaryClose.addEventListener('click', () => {
        playSound('tap');
        closeDiaryReaderModal();
      });
    }

    if (dom.btnPlayAgain) {
      dom.btnPlayAgain.addEventListener('click', () => {
        if (isTransitioning) return;
        trackAnalytics('replay_clicked', {
          room_number: getRoomNumber(engine.state.currentRoomId),
          source: 'finale'
        });
        if (window.analyticsManager && typeof window.analyticsManager.resetRunEvents === 'function') {
          window.analyticsManager.resetRunEvents();
        }
        playSound('page');
        if (dom.finaleModal) dom.finaleModal.classList.add('hidden');
        engine.restartGame();
        bootIntoRoom(false);
      });
    }

    if (dom.btnShareResult) {
      dom.btnShareResult.addEventListener('click', async () => {
        playSound('tap');
        const stats = engine.getTotalStats();
        const gameUrl = 'https://escape-the-website.onrender.com/';
        const text = `I escaped ESCAPE THE WEBSITE!\nStars: ${stats.totalStars}/${stats.maxStars}\nTime: ${stats.formattedTime}\n${gameUrl}`;
        trackAnalytics('share_clicked', {
          room_number: getRoomNumber(engine.state.currentRoomId),
          total_stars: stats.totalStars
        });
        try {
          if (navigator.share) {
            await navigator.share({ title: 'Escape the Website', text, url: gameUrl });
            trackAnalytics('share_completed', { share_method: 'native' });
          } else if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            trackAnalytics('share_completed', { share_method: 'clipboard' });
          }
          if (dom.shareFeedback) {
            dom.shareFeedback.textContent = 'Copied result to share!';
            dom.shareFeedback.classList.remove('hidden');
          }
        } catch (err) { }
      });
    }

    if (dom.sceneFrame) {
      dom.sceneFrame.addEventListener('pointerdown', updateBeamFromPointer);
      dom.sceneFrame.addEventListener('pointermove', updateBeamFromPointer);
    }

    if (dom.codelockGrid) {
      dom.codelockGrid.querySelectorAll('.codelock-key').forEach((btn) => {
        btn.addEventListener('click', () => handleCodeKey(btn.dataset.digit));
      });
    }

    if (dom.btnCodelockCancel) {
      dom.btnCodelockCancel.addEventListener('click', () => {
        playSound('tap');
        closeCodeLockModal();
      });
    }

    if (dom.clothesReactionLayer) {
      dom.clothesReactionLayer.addEventListener('pointerdown', (e) => {
        clothesSwipeStart = { x: e.clientX, y: e.clientY };
      });
      dom.clothesReactionLayer.addEventListener('pointermove', (e) => {
        if (!clothesSwipeStart) return;
        if (Math.hypot(e.clientX - clothesSwipeStart.x, e.clientY - clothesSwipeStart.y) > 24) {
          playSound('cloth');
          clearAllReactions();
          setCaption('You brush the clothes aside.', 'normal');
        }
      });
      dom.clothesReactionLayer.addEventListener('click', () => {
        playSound('cloth');
        clearAllReactions();
        setCaption('You brush the clothes aside.', 'normal');
      });
    }

    if (dom.btnPause) {
      dom.btnPause.addEventListener('click', () => {
        if (isTransitioning) return;
        playSound('tap');
        if (dom.pauseModal) dom.pauseModal.classList.remove('hidden');
      });
    }

    if (dom.btnResume) {
      dom.btnResume.addEventListener('click', () => {
        playSound('tap');
        if (dom.pauseModal) dom.pauseModal.classList.add('hidden');
      });
    }

    if (dom.btnRestartRoom) {
      dom.btnRestartRoom.addEventListener('click', () => {
        if (isTransitioning) return;
        playSound('tap');
        if (dom.pauseModal) dom.pauseModal.classList.add('hidden');
        if (dom.winModal) dom.winModal.classList.add('hidden');
        engine.restartRoom();
        bootIntoRoom(false);
      });
    }

    if (dom.btnRestartAll) {
      dom.btnRestartAll.addEventListener('click', () => {
        if (isTransitioning) return;
        trackAnalytics('replay_clicked', {
          room_number: getRoomNumber(engine.state.currentRoomId),
          source: 'pause'
        });
        if (window.analyticsManager && typeof window.analyticsManager.resetRunEvents === 'function') {
          window.analyticsManager.resetRunEvents();
        }
        playSound('page');
        if (dom.pauseModal) dom.pauseModal.classList.add('hidden');
        if (dom.winModal) dom.winModal.classList.add('hidden');
        engine.restartGame();
        bootIntoRoom(false);
      });
    }

    if (dom.btnNextRoom) {
      dom.btnNextRoom.addEventListener('click', () => {
        if (isTransitioning) return;
        const curRoom = engine.getCurrentRoom();
        const nextId = curRoom && curRoom.winSequence ? curRoom.winSequence.nextRoomId : null;
        if (dom.winModal) dom.winModal.classList.add('hidden');
        if (nextId) {
          runPageTurnTransition(nextId, () => {
            engine.goToNextRoom();
            bootIntoRoom(false);
          });
        } else {
          engine.restartRoom();
          bootIntoRoom(false);
        }
      });
    }

    // Keyboard support: Escape dismisses reactions/modals, digits work in codelock
    window.addEventListener('keydown', (e) => {
      if (dom.codelockModal && !dom.codelockModal.classList.contains('hidden')) {
        if (/^[0-9]$/.test(e.key)) {
          handleCodeKey(e.key);
          return;
        }
        if (e.key === 'Backspace') {
          codeEntry = codeEntry.slice(0, -1);
          updateCodeLockDisplay();
          return;
        }
        if (e.key === 'Enter') {
          handleCodeKey('OK');
          return;
        }
        if (e.key === 'Escape') {
          closeCodeLockModal();
          return;
        }
      }
      if (e.key === 'Escape') {
        if (isReactionActive) {
          clearAllReactions();
          return;
        }
        if (dom.diaryModal && !dom.diaryModal.classList.contains('hidden')) {
          closeDiaryReaderModal();
          return;
        }
        if (dom.pauseModal && !dom.pauseModal.classList.contains('hidden')) {
          dom.pauseModal.classList.add('hidden');
        }
      }
    });

    // Show closed storybook Cover; preload ONLY the room the player will enter next
    syncMuteUi();
    const initialTargetId = hasSavedProgress() ? engine.state.currentRoomId : 'room1';
    if (dom.btnCoverStart) {
      dom.btnCoverStart.textContent = hasSavedProgress() ? 'Continue' : 'Start';
      dom.btnCoverStart.addEventListener('click', openBookFromCover);
    }
    if (dom.btnAboutStart) {
      dom.btnAboutStart.textContent = hasSavedProgress() ? 'Continue Game' : 'Start Game';
      dom.btnAboutStart.addEventListener('click', openBookFromCover);
    }
    if (window.matchMedia && window.EscapeV4Desktop) {
      const desktopMql = window.matchMedia(window.EscapeV4Desktop.DESKTOP_MQL);
      if (typeof desktopMql.addEventListener === 'function') {
        desktopMql.addEventListener('change', syncDesktopWings);
      } else if (typeof desktopMql.addListener === 'function') {
        desktopMql.addListener(syncDesktopWings);
      }
    }
    window.addEventListener('resize', syncDesktopWings);
    preloadRoomAssets(initialTargetId);
  });
})();
