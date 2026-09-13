(function () {
  'use strict';

  if (document.getElementById('musicPlayer')) return;

  var KEY_TRACK = 'music_track';
  var KEY_ENABLED = 'music_enabled';
  var KEY_VOLUME = 'music_volume';

  var TRACKS = [
    { label: 'Lagu 1', url: 'assets/audio/lagu1.mp3' },
    { label: 'Lagu 2', url: 'assets/audio/lagu2.mp3' },
    { label: 'Lagu 3', url: 'assets/audio/lagu3.mp3' }
  ];

  var trackIdx = parseInt(localStorage.getItem(KEY_TRACK) || '0', 10);
  if (isNaN(trackIdx) || trackIdx < 0 || trackIdx >= TRACKS.length) trackIdx = 0;

  var savedVol = parseFloat(localStorage.getItem(KEY_VOLUME) || '0.5');
  if (isNaN(savedVol) || savedVol < 0 || savedVol > 1) savedVol = 0.5;

  var wasEnabled = localStorage.getItem(KEY_ENABLED) === '1';

  var audio = new Audio();
  audio.loop = true;
  audio.volume = savedVol;
  audio.preload = 'auto';
  audio.src = TRACKS[trackIdx].url;

  var wrap = document.createElement('div');
  wrap.id = 'musicPlayer';
  wrap.className = 'music-bar';
  wrap.innerHTML = [
    '<button id="musicOn" class="music-btn" title="Play" aria-label="Play">',
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    '</button>',
    '<button id="musicOff" class="music-btn" title="Pause" aria-label="Pause">',
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    '</button>',
    '<span class="music-divider"></span>',
    '<button id="musicPrev" class="music-btn" title="Previous" aria-label="Previous">',
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zM20 6l-8.5 6L20 18V6z"/></svg>',
    '</button>',
    '<button id="musicNext" class="music-btn" title="Next" aria-label="Next">',
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',
    '</button>',
    '<span class="music-divider"></span>',
    '<input id="musicVol" class="music-vol" type="range" min="0" max="1" step="0.01" aria-label="Volume" />',
    '<span id="musicLabel" class="music-label"></span>'
  ].join('');
  document.body.appendChild(wrap);

  var btnOn = document.getElementById('musicOn');
  var btnOff = document.getElementById('musicOff');
  var btnPrev = document.getElementById('musicPrev');
  var btnNext = document.getElementById('musicNext');
  var volSlider = document.getElementById('musicVol');
  var labelEl = document.getElementById('musicLabel');

  var playing = false;

  volSlider.value = String(audio.volume);

  function sync() {
    wrap.classList.toggle('is-playing', playing);
    labelEl.textContent = TRACKS[trackIdx].label;
  }

  function loadTrack(idx, autoplay) {
    trackIdx = ((idx % TRACKS.length) + TRACKS.length) % TRACKS.length;
    audio.src = TRACKS[trackIdx].url;
    audio.load();
    localStorage.setItem(KEY_TRACK, String(trackIdx));
    sync();
    if (autoplay) {
      audio.play().then(function () {
        playing = true;
        sync();
      }).catch(function (err) {
        console.warn('Autoplay track failed:', err);
        playing = false;
        sync();
      });
    }
  }

  function play() {
    audio.play().then(function () {
      playing = true;
      localStorage.setItem(KEY_ENABLED, '1');
      sync();
    }).catch(function (err) {
      console.warn('Play error:', err);
      playing = false;
      sync();
    });
  }

  function pause() {
    audio.pause();
    playing = false;
    localStorage.setItem(KEY_ENABLED, '0');
    sync();
  }

  btnOn.addEventListener('click', play);
  btnOff.addEventListener('click', pause);
  btnPrev.addEventListener('click', function () { loadTrack(trackIdx - 1, playing); });
  btnNext.addEventListener('click', function () { loadTrack(trackIdx + 1, playing); });

  volSlider.addEventListener('input', function () {
    audio.volume = parseFloat(volSlider.value);
    localStorage.setItem(KEY_VOLUME, volSlider.value);
  });

  audio.addEventListener('error', function () {
    console.warn('Gagal load audio:', audio.src);
    playing = false;
    sync();
  });

  audio.addEventListener('play', function () { playing = true; sync(); });
  audio.addEventListener('pause', function () { playing = false; sync(); });

  sync();
  console.log('[Music] Player siap. Track aktif:', TRACKS[trackIdx].label, '—', TRACKS[trackIdx].url);

  if (wasEnabled) {
    var arm = function () {
      if (!playing) play();
      window.removeEventListener('click', arm);
      window.removeEventListener('keydown', arm);
      window.removeEventListener('touchstart', arm);
    };
    window.addEventListener('click', arm, { once: true });
    window.addEventListener('keydown', arm, { once: true });
    window.addEventListener('touchstart', arm, { once: true });
  }
})();