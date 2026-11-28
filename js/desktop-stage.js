/**
 * Escape the Website v4 — Desktop Wide (16:10) Seamless Room Wings
 * Only renders continuous left/right room extensions on large landscape
 * mouse/trackpad screens matching the strict desktop media query.
 */
(function (root) {
  'use strict';

  const DESKTOP_MQL = '(min-width: 1024px) and (min-height: 600px) and (orientation: landscape) and (hover: hover) and (pointer: fine)';

  function buildRoom1Svg() {
    return [
      '<img class="wing-room1-bg" src="assets/images/room1/bedroom-bg-wide.webp" alt="" draggable="false">',
      '<svg class="wing-full-svg" viewBox="-280 0 1280 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">',
      '  <!-- Subtle Non-Clickable Side Decor Resting Over Continuous Painting -->',
      '  <g opacity="0.86">',
      '    <ellipse cx="-148" cy="606" rx="74" ry="12" fill="#180f09" opacity="0.45"/>',
      '    <rect x="-184" y="176" width="96" height="118" rx="6" fill="#5e3e29" stroke="#1f140d" stroke-width="3"/>',
      '    <rect x="-170" y="190" width="68" height="90" rx="3" fill="#cdb996" stroke="#1f140d" stroke-width="2"/>',
      '    <path d="M-170 256 Q-148 232 -128 248 T-102 246 L-102 280 L-170 280 Z" fill="#8b6f54" opacity="0.65"/>',
      '    <circle cx="-122" cy="214" r="9" fill="#9c7f5f" opacity="0.6"/>',
      '    <rect x="-210" y="498" width="124" height="16" rx="4" fill="#634029" stroke="#1f140d" stroke-width="3"/>',
      '    <rect x="-194" y="514" width="14" height="92" fill="#462c1c" stroke="#1f140d" stroke-width="3"/>',
      '    <rect x="-118" y="514" width="14" height="92" fill="#462c1c" stroke="#1f140d" stroke-width="3"/>',
      '    <rect x="-156" y="464" width="16" height="34" rx="3" fill="#e6d7ba" stroke="#1f140d" stroke-width="2.2"/>',
      '  </g>',
      '  <g opacity="0.88">',
      '    <ellipse cx="852" cy="598" rx="42" ry="9" fill="#180f09" opacity="0.42"/>',
      '    <path d="M846 476 C836 444 812 430 806 444 C814 456 832 464 846 476 Z" fill="#4a6e51" stroke="#1f140d" stroke-width="2.2"/>',
      '    <path d="M852 474 C854 434 868 414 876 424 C878 442 864 458 852 474 Z" fill="#5b8462" stroke="#1f140d" stroke-width="2.2"/>',
      '    <path d="M858 478 C876 446 902 444 902 458 C890 468 872 474 858 478 Z" fill="#4a6e51" stroke="#1f140d" stroke-width="2.2"/>',
      '    <path d="M828 478 H876 L868 596 H836 Z" fill="#825132" stroke="#1f140d" stroke-width="3"/>',
      '    <rect x="822" y="470" width="60" height="14" rx="4" fill="#9a643f" stroke="#1f140d" stroke-width="3"/>',
      '  </g>',
      '</svg>'
    ].join('\n');
  }

  function buildRoom2Svg() {
    return [
      '<svg class="wing-full-svg" viewBox="-280 0 1280 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">',
      '  <defs>',
      '    <linearGradient id="r2wWall" x1="0" y1="0" x2="0" y2="1">',
      '      <stop offset="0%" stop-color="#3b2b23"/>',
      '      <stop offset="65%" stop-color="#523f35"/>',
      '      <stop offset="100%" stop-color="#443229"/>',
      '    </linearGradient>',
      '    <linearGradient id="r2wFloor" x1="0" y1="0" x2="0" y2="1">',
      '      <stop offset="0%" stop-color="#8b5a36"/>',
      '      <stop offset="100%" stop-color="#a5744e"/>',
      '    </linearGradient>',
      '    <radialGradient id="r2wSconce" cx="0.67" cy="0.24" r="0.34">',
      '      <stop offset="0%" stop-color="#f4b942" stop-opacity="0.42"/>',
      '      <stop offset="55%" stop-color="#f4b942" stop-opacity="0.1"/>',
      '      <stop offset="100%" stop-color="#f4b942" stop-opacity="0"/>',
      '    </radialGradient>',
      '  </defs>',
      '  <rect x="-280" y="0" width="1280" height="585" fill="url(#r2wWall)"/>',
      '  <rect x="-280" y="0" width="1280" height="585" fill="url(#r2wSconce)"/>',
      '  <!-- Continuous Ceiling Crown Molding -->',
      '  <rect x="-280" y="0" width="1280" height="32" fill="#3b2b23" stroke="#2a1e17" stroke-width="4"/>',
      '  <line x1="-280" y1="24" x2="1000" y2="24" stroke="#7a5239" stroke-width="3"/>',
      '  <!-- Outer Side Wall Corners -->',
      '  <polygon points="-280,0 -240,32 -240,500 -280,585" fill="#2e211a" stroke="#2a1e17" stroke-width="3"/>',
      '  <polygon points="1000,0 960,32 960,500 1000,585" fill="#2e211a" stroke="#2a1e17" stroke-width="3"/>',
      '  <!-- Continuous Wainscoting -->',
      '  <rect x="-240" y="458" width="1200" height="127" fill="#463329" stroke="#2a1e17" stroke-width="4"/>',
      '  <rect x="-240" y="454" width="1200" height="12" fill="#7a5239" stroke="#2a1e17" stroke-width="3"/>',
      '  <rect x="64" y="482" width="110" height="84" rx="4" fill="#3b2b23" stroke="#2a1e17" stroke-width="2.5"/>',
      '  <rect x="546" y="482" width="110" height="84" rx="4" fill="#3b2b23" stroke="#2a1e17" stroke-width="2.5"/>',
      '  <rect x="-188" y="482" width="110" height="84" rx="4" fill="#3b2b23" stroke="#2a1e17" stroke-width="2.5"/>',
      '  <rect x="780" y="482" width="110" height="84" rx="4" fill="#3b2b23" stroke="#2a1e17" stroke-width="2.5"/>',
      '  <!-- Brass Wall Sconce (preserved at x=588) -->',
      '  <rect x="576" y="180" width="24" height="44" rx="8" fill="#7a5239" stroke="#2a1e17" stroke-width="3"/>',
      '  <path d="M588 182 V160" stroke="#d99b32" stroke-width="5" stroke-linecap="round"/>',
      '  <circle cx="588" cy="144" r="24" fill="#f4b942" fill-opacity="0.28"/>',
      '  <path d="M588 122 C598 134 600 146 593 154 H583 C576 146 578 134 588 122 Z" fill="#f4b942" stroke="#2a1e17" stroke-width="2.5"/>',
      '  <path d="M588 132 C592 138 593 145 590 150 H586 C583 145 584 138 588 132 Z" fill="#fff5d1"/>',
      '  <!-- Non-clickable Library Side Decor (tall quiet reading shelf & cozy floor globe) -->',
      '  <g opacity="0.88">',
      '    <rect x="-210" y="130" width="144" height="328" rx="6" fill="#463126" stroke="#2a1e17" stroke-width="3.5"/>',
      '    <rect x="-196" y="150" width="116" height="86" fill="#2e211a" stroke="#2a1e17" stroke-width="2.5"/>',
      '    <rect x="-196" y="252" width="116" height="86" fill="#2e211a" stroke="#2a1e17" stroke-width="2.5"/>',
      '    <rect x="-196" y="354" width="116" height="86" fill="#2e211a" stroke="#2a1e17" stroke-width="2.5"/>',
      '    <rect x="-184" y="176" width="18" height="58" rx="2" fill="#824d40" stroke="#2a1e17" stroke-width="2"/>',
      '    <rect x="-162" y="182" width="16" height="52" rx="2" fill="#5e7f63" stroke="#2a1e17" stroke-width="2"/>',
      '    <rect x="-142" y="170" width="20" height="64" rx="2" fill="#8c6343" stroke="#2a1e17" stroke-width="2"/>',
      '    <rect x="-180" y="280" width="22" height="56" rx="2" fill="#6f8799" stroke="#2a1e17" stroke-width="2"/>',
      '    <rect x="-154" y="274" width="18" height="62" rx="2" fill="#9a6b48" stroke="#2a1e17" stroke-width="2"/>',
      '    <rect x="772" y="206" width="136" height="106" rx="8" fill="#523b2e" stroke="#2a1e17" stroke-width="3.5"/>',
      '    <rect x="786" y="220" width="108" height="78" rx="4" fill="#3a2a21" stroke="#2a1e17" stroke-width="2.5"/>',
      '    <circle cx="840" cy="258" r="22" fill="#684a36" opacity="0.6"/>',
      '  </g>',
      '  <!-- Continuous Honey-Oak Floorboards -->',
      '  <rect x="-280" y="585" width="1280" height="215" fill="url(#r2wFloor)" stroke="#2a1e17" stroke-width="4"/>',
      '  <g stroke="#2a1e17" stroke-width="2.8" opacity="0.62">',
      '    <line x1="-110" y1="585" x2="-240" y2="800"/>',
      '    <line x1="-10" y1="585" x2="-110" y2="800"/>',
      '    <line x1="88" y1="585" x2="20" y2="800"/>',
      '    <line x1="184" y1="585" x2="145" y2="800"/>',
      '    <line x1="274" y1="585" x2="262" y2="800"/>',
      '    <line x1="360" y1="585" x2="360" y2="800"/>',
      '    <line x1="446" y1="585" x2="458" y2="800"/>',
      '    <line x1="536" y1="585" x2="575" y2="800"/>',
      '    <line x1="632" y1="585" x2="700" y2="800"/>',
      '    <line x1="730" y1="585" x2="830" y2="800"/>',
      '    <line x1="830" y1="585" x2="960" y2="800"/>',
      '    <line x1="-280" y1="650" x2="1000" y2="650"/>',
      '    <line x1="-280" y1="726" x2="1000" y2="726"/>',
      '  </g>',
      '</svg>'
    ].join('\n');
  }

  function buildRoom3Svg() {
    return [
      '<svg class="wing-full-svg" viewBox="-280 0 1280 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">',
      '  <defs>',
      '    <linearGradient id="r3wWall" x1="0" y1="0" x2="0" y2="1">',
      '      <stop offset="0%" stop-color="#2e2420"/>',
      '      <stop offset="100%" stop-color="#483830"/>',
      '    </linearGradient>',
      '    <linearGradient id="r3wFloor" x1="0" y1="0" x2="0" y2="1">',
      '      <stop offset="0%" stop-color="#6e4b32"/>',
      '      <stop offset="100%" stop-color="#8c5f3f"/>',
      '    </linearGradient>',
      '  </defs>',
      '  <rect x="-280" y="0" width="1280" height="585" fill="url(#r3wWall)"/>',
      '  <rect x="-240" y="460" width="1200" height="125" fill="#3b2b23" stroke="#2a1e17" stroke-width="4"/>',
      '  <rect x="-240" y="454" width="1200" height="12" fill="#68442f" stroke="#2a1e17" stroke-width="3"/>',
      '  <polygon points="-280,0 -240,32 -240,500 -280,585" fill="#231914" stroke="#2a1e17" stroke-width="3"/>',
      '  <polygon points="1000,0 960,32 960,500 1000,585" fill="#231914" stroke="#2a1e17" stroke-width="3"/>',
      '  <!-- Subtle Non-Clickable Attic Side Clutter -->',
      '  <rect x="-188" y="484" width="96" height="101" rx="4" fill="#4f3729" stroke="#231914" stroke-width="3"/>',
      '  <rect x="784" y="476" width="112" height="109" rx="4" fill="#4f3729" stroke="#231914" stroke-width="3"/>',
      '  <rect x="802" y="398" width="76" height="78" rx="4" fill="#5e4131" stroke="#231914" stroke-width="3"/>',
      '  <!-- Corridor Doorway Arch (preserved center-right) -->',
      '  <path d="M442 585 V256 C442 192 490 156 544 156 C598 156 646 192 646 256 V585 Z" fill="#231914" stroke="#2a1e17" stroke-width="5"/>',
      '  <path d="M456 585 V262 C456 208 496 174 544 174 C592 174 632 208 632 262 V585 Z" fill="#5e3f2b" stroke="#2a1e17" stroke-width="4"/>',
      '  <rect x="456" y="310" width="176" height="14" fill="#3b2b23" stroke="#2a1e17" stroke-width="3"/>',
      '  <rect x="456" y="450" width="176" height="14" fill="#3b2b23" stroke="#2a1e17" stroke-width="3"/>',
      '  <!-- Floorboards -->',
      '  <rect x="-280" y="585" width="1280" height="215" fill="url(#r3wFloor)" stroke="#2a1e17" stroke-width="4"/>',
      '  <g stroke="#2a1e17" stroke-width="2.6" opacity="0.6">',
      '    <line x1="-110" y1="585" x2="-240" y2="800"/>',
      '    <line x1="-10" y1="585" x2="-110" y2="800"/>',
      '    <line x1="90" y1="585" x2="22" y2="800"/>',
      '    <line x1="190" y1="585" x2="150" y2="800"/>',
      '    <line x1="360" y1="585" x2="360" y2="800"/>',
      '    <line x1="530" y1="585" x2="570" y2="800"/>',
      '    <line x1="630" y1="585" x2="698" y2="800"/>',
      '    <line x1="730" y1="585" x2="830" y2="800"/>',
      '    <line x1="830" y1="585" x2="960" y2="800"/>',
      '    <line x1="-280" y1="660" x2="1000" y2="660"/>',
      '    <line x1="-280" y1="734" x2="1000" y2="734"/>',
      '  </g>',
      '</svg>'
    ].join('\n');
  }

  function buildRoom4Svg() {
    return [
      '<svg class="wing-full-svg" viewBox="-280 0 1280 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">',
      '  <defs>',
      '    <linearGradient id="r4wWall" x1="0" y1="0" x2="0" y2="1">',
      '      <stop offset="0%" stop-color="#3b2b23"/>',
      '      <stop offset="100%" stop-color="#523f35"/>',
      '    </linearGradient>',
      '    <linearGradient id="r4wFloor" x1="0" y1="0" x2="0" y2="1">',
      '      <stop offset="0%" stop-color="#7a5239"/>',
      '      <stop offset="100%" stop-color="#a5744e"/>',
      '    </linearGradient>',
      '    <radialGradient id="r4wLamp" cx="0.5" cy="0.14" r="0.38">',
      '      <stop offset="0%" stop-color="#f4b942" stop-opacity="0.34"/>',
      '      <stop offset="100%" stop-color="#f4b942" stop-opacity="0"/>',
      '    </radialGradient>',
      '  </defs>',
      '  <rect x="-280" y="0" width="1280" height="585" fill="url(#r4wWall)"/>',
      '  <rect x="-280" y="0" width="1280" height="585" fill="url(#r4wLamp)"/>',
      '  <polygon points="-280,0 -240,32 -240,500 -280,585" fill="#2e211a" stroke="#2a1e17" stroke-width="3"/>',
      '  <polygon points="1000,0 960,32 960,500 1000,585" fill="#2e211a" stroke="#2a1e17" stroke-width="3"/>',
      '  <!-- Hanging workshop lamp (preserved center x=360) -->',
      '  <line x1="360" y1="0" x2="360" y2="66" stroke="#2a1e17" stroke-width="5"/>',
      '  <path d="M318 96 L340 66 H380 L402 96 Z" fill="#7a5239" stroke="#2a1e17" stroke-width="4" stroke-linejoin="round"/>',
      '  <ellipse cx="360" cy="98" rx="18" ry="8" fill="#fff3c4"/>',
      '  <!-- Interactive Shelf, Pegboard & Workbench (preserved positions) -->',
      '  <rect x="64" y="218" width="244" height="16" rx="5" fill="#7a5239" stroke="#2a1e17" stroke-width="4"/>',
      '  <rect x="92" y="234" width="14" height="28" rx="3" fill="#5e3f2b" stroke="#2a1e17" stroke-width="3"/>',
      '  <rect x="264" y="234" width="14" height="28" rx="3" fill="#5e3f2b" stroke="#2a1e17" stroke-width="3"/>',
      '  <rect x="424" y="136" width="224" height="154" rx="10" fill="#68442f" stroke="#2a1e17" stroke-width="4.5"/>',
      '  <rect x="438" y="150" width="196" height="126" rx="6" fill="#493429" stroke="#2a1e17" stroke-width="2.5"/>',
      '  <rect x="52" y="426" width="330" height="24" rx="6" fill="#9a6b48" stroke="#2a1e17" stroke-width="4"/>',
      '  <rect x="74" y="450" width="22" height="135" fill="#68442f" stroke="#2a1e17" stroke-width="4"/>',
      '  <rect x="338" y="450" width="22" height="135" fill="#68442f" stroke="#2a1e17" stroke-width="4"/>',
      '  <rect x="96" y="514" width="242" height="16" fill="#5e3f2b" stroke="#2a1e17" stroke-width="3"/>',
      '  <!-- Non-clickable Workshop Side Decor: Barrel left, Storage Crate right -->',
      '  <g opacity="0.9">',
      '    <rect x="-184" y="458" width="102" height="127" rx="14" fill="#68442f" stroke="#2a1e17" stroke-width="3.5"/>',
      '    <rect x="-184" y="486" width="102" height="10" fill="#3b2b23" stroke="#2a1e17" stroke-width="2.5"/>',
      '    <rect x="-184" y="544" width="102" height="10" fill="#3b2b23" stroke="#2a1e17" stroke-width="2.5"/>',
      '    <rect x="772" y="438" width="132" height="147" rx="8" fill="#523f35" stroke="#2a1e17" stroke-width="3.5"/>',
      '    <rect x="788" y="458" width="100" height="44" rx="4" fill="#68442f" stroke="#2a1e17" stroke-width="2.5"/>',
      '    <rect x="788" y="514" width="100" height="44" rx="4" fill="#68442f" stroke="#2a1e17" stroke-width="2.5"/>',
      '    <line x1="828" y1="480" x2="848" y2="480" stroke="#f4b942" stroke-width="4" stroke-linecap="round"/>',
      '    <line x1="828" y1="536" x2="848" y2="536" stroke="#f4b942" stroke-width="4" stroke-linecap="round"/>',
      '  </g>',
      '  <!-- Extended Floorboards -->',
      '  <rect x="-280" y="585" width="1280" height="215" fill="url(#r4wFloor)" stroke="#2a1e17" stroke-width="4"/>',
      '  <g stroke="#2a1e17" stroke-width="2.6" opacity="0.6">',
      '    <line x1="-110" y1="585" x2="-240" y2="800"/>',
      '    <line x1="-10" y1="585" x2="-110" y2="800"/>',
      '    <line x1="90" y1="585" x2="22" y2="800"/>',
      '    <line x1="210" y1="585" x2="175" y2="800"/>',
      '    <line x1="360" y1="585" x2="360" y2="800"/>',
      '    <line x1="510" y1="585" x2="545" y2="800"/>',
      '    <line x1="630" y1="585" x2="698" y2="800"/>',
      '    <line x1="730" y1="585" x2="830" y2="800"/>',
      '    <line x1="830" y1="585" x2="960" y2="800"/>',
      '    <line x1="-280" y1="665" x2="1000" y2="665"/>',
      '    <line x1="-280" y1="738" x2="1000" y2="738"/>',
      '  </g>',
      '</svg>'
    ].join('\n');
  }

  function buildRoom5Html(escaped) {
    const sky = [
      '<svg class="wing-full-svg wing-daylight-bg" viewBox="-280 0 1280 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">',
      '  <defs>',
      '    <linearGradient id="skyDayW" x1="0" y1="0" x2="0" y2="1">',
      '      <stop offset="0%" stop-color="#9bbbd0"/>',
      '      <stop offset="65%" stop-color="#f5ebd6"/>',
      '      <stop offset="100%" stop-color="#f4b942"/>',
      '    </linearGradient>',
      '  </defs>',
      '  <rect x="-280" y="0" width="1280" height="800" fill="url(#skyDayW)"/>',
      '  <circle cx="520" cy="210" r="76" fill="#fff5d1" stroke="#f4b942" stroke-width="8"/>',
      '  <path d="M-280 560 Q-40 480 180 555 Q380 485 590 565 Q790 615 1000 520 V800 H-280 Z" fill="#6f9e78" stroke="#2a1e17" stroke-width="4"/>',
      '  <path d="M-280 645 Q40 565 360 640 Q680 700 1000 615 V800 H-280 Z" fill="#5b8764" stroke="#2a1e17" stroke-width="4"/>',
      '</svg>'
    ].join('\n');

    const walls = [
      `<div class="wing-room5-walls ${escaped ? 'is-peeled' : ''}">`,
      '  <svg class="wing-full-svg" viewBox="-280 0 1280 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">',
      '    <defs>',
      '      <linearGradient id="r5wWall" x1="0" y1="0" x2="0" y2="1">',
      '        <stop offset="0%" stop-color="#3b2b23"/>',
      '        <stop offset="100%" stop-color="#523f35"/>',
      '      </linearGradient>',
      '      <linearGradient id="r5wFloor" x1="0" y1="0" x2="0" y2="1">',
      '        <stop offset="0%" stop-color="#7a5239"/>',
      '        <stop offset="100%" stop-color="#a5744e"/>',
      '      </linearGradient>',
      '      <radialGradient id="r5wGlow" cx="0.5" cy="0.38" r="0.38">',
      '        <stop offset="0%" stop-color="#f4b942" stop-opacity="0.28"/>',
      '        <stop offset="100%" stop-color="#f4b942" stop-opacity="0"/>',
      '      </radialGradient>',
      '    </defs>',
      '    <rect x="-280" y="0" width="1280" height="585" fill="url(#r5wWall)"/>',
      '    <rect x="-280" y="0" width="1280" height="585" fill="url(#r5wGlow)"/>',
      '    <rect x="-240" y="458" width="1200" height="127" fill="#463329" stroke="#2a1e17" stroke-width="4"/>',
      '    <rect x="-240" y="454" width="1200" height="12" fill="#7a5239" stroke="#2a1e17" stroke-width="3"/>',
      '    <polygon points="-280,0 -240,32 -240,500 -280,585" fill="#2e211a" stroke="#2a1e17" stroke-width="3"/>',
      '    <polygon points="1000,0 960,32 960,500 1000,585" fill="#2e211a" stroke="#2a1e17" stroke-width="3"/>',
      '    <!-- Preserved Diary Pedestal -->',
      '    <rect x="74" y="492" width="112" height="16" rx="5" fill="#9a6b48" stroke="#2a1e17" stroke-width="3.5"/>',
      '    <rect x="114" y="508" width="32" height="82" fill="#68442f" stroke="#2a1e17" stroke-width="3.5"/>',
      '    <rect x="92" y="582" width="76" height="14" rx="5" fill="#7a5239" stroke="#2a1e17" stroke-width="3.5"/>',
      '    <!-- Subtle Non-Clickable Hall Bench & Frame on Sides -->',
      '    <rect x="-188" y="210" width="110" height="140" rx="8" fill="#523b2e" stroke="#2a1e17" stroke-width="3.5"/>',
      '    <rect x="-174" y="224" width="82" height="112" rx="4" fill="#3a2a21" stroke="#2a1e17" stroke-width="2.5"/>',
      '    <rect x="780" y="502" width="124" height="18" rx="5" fill="#7a5239" stroke="#2a1e17" stroke-width="3.5"/>',
      '    <rect x="794" y="520" width="16" height="65" fill="#523b2e" stroke="#2a1e17" stroke-width="3"/>',
      '    <rect x="874" y="520" width="16" height="65" fill="#523b2e" stroke="#2a1e17" stroke-width="3"/>',
      '    <!-- Extended Floorboards -->',
      '    <rect x="-280" y="585" width="1280" height="215" fill="url(#r5wFloor)" stroke="#2a1e17" stroke-width="4"/>',
      '    <g stroke="#2a1e17" stroke-width="2.6" opacity="0.6">',
      '      <line x1="-110" y1="585" x2="-240" y2="800"/>',
      '      <line x1="-10" y1="585" x2="-110" y2="800"/>',
      '      <line x1="90" y1="585" x2="22" y2="800"/>',
      '      <line x1="210" y1="585" x2="175" y2="800"/>',
      '      <line x1="360" y1="585" x2="360" y2="800"/>',
      '      <line x1="510" y1="585" x2="545" y2="800"/>',
      '      <line x1="630" y1="585" x2="698" y2="800"/>',
      '      <line x1="730" y1="585" x2="830" y2="800"/>',
      '      <line x1="830" y1="585" x2="960" y2="800"/>',
      '      <line x1="-280" y1="665" x2="1000" y2="665"/>',
      '      <line x1="-280" y1="738" x2="1000" y2="738"/>',
      '    </g>',
      '  </svg>',
      '</div>'
    ].join('\n');

    return sky + '\n' + walls;
  }

  root.EscapeV4Desktop = {
    isWideDesktop() {
      return typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia(DESKTOP_MQL).matches;
    },
    getDesktopQuery() {
      return DESKTOP_MQL;
    },
    renderWings(roomId, roomState) {
      if (roomId === 'room1') return buildRoom1Svg();
      if (roomId === 'room2') return buildRoom2Svg();
      if (roomId === 'room3') return buildRoom3Svg();
      if (roomId === 'room4') return buildRoom4Svg();
      if (roomId === 'room5') return buildRoom5Html(Boolean(roomState && roomState.completed));
      return '';
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
