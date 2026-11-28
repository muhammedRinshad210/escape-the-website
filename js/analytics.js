/**
 * Escape The Website - Google Analytics 4 & Clarity Event Dispatcher
 * Provides failure-proof tracking for game lifecycle, room progression,
 * mistakes, hints, shares, and replays with zero personal data.
 */

(function () {
  'use strict';

  // Internal deduplication registry to guarantee single-fire events per run
  const firedEvents = new Set();

  /**
   * Safe GA4 + Microsoft Clarity Event Dispatcher
   * @param {string} eventName - Analytics event name (e.g. 'game_start', 'room_complete')
   * @param {Object} [params={}] - Optional non-personal parameters (room_number, hint_level, etc.)
   */
  function trackEvent(eventName, params) {
    if (!eventName || typeof eventName !== 'string') return;

    // Safe parameter sanitization (allow numbers, strings, booleans only)
    const sanitizedParams = {};
    try {
      if (params && typeof params === 'object') {
        for (const [key, value] of Object.entries(params)) {
          if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
            sanitizedParams[key] = value;
          }
        }
      }
    } catch (err) {
      // Ignore sanitization failure
    }

    // Send to GA4 safely
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, sanitizedParams);
      }
    } catch (err) {
      // Analytics failures must never propagate or break game execution
    }

    // Send custom event to Microsoft Clarity only if window.clarity exists
    try {
      if (typeof window.clarity === 'function') {
        window.clarity('event', eventName);
      }
    } catch (err) {
      // Clarity failures must never propagate or break game execution
    }
  }

  /**
   * Track one-time unique events per game run
   * @param {string} eventKey - Unique deduplication key
   * @param {string} eventName - Event name
   * @param {Object} [params={}] - Event parameters
   */
  function trackUniqueEvent(eventKey, eventName, params) {
    try {
      if (firedEvents.has(eventKey)) return;
      firedEvents.add(eventKey);
      trackEvent(eventName, params);
    } catch (err) {
      // Never propagate analytics errors
    }
  }

  /**
   * Reset run-specific deduplication flags (e.g. on replay / new game)
   */
  function resetRunEvents() {
    try {
      firedEvents.clear();
    } catch (err) {
      // Never propagate analytics errors
    }
  }

  // Expose global safe analytics interface
  window.analyticsManager = {
    trackEvent,
    trackUniqueEvent,
    resetRunEvents
  };

  // Global shorthand helper
  window.trackEvent = trackEvent;
})();
