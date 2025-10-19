document.addEventListener('DOMContentLoaded', () => {
  const els = {
    health: document.getElementById('health-bar'),
    fuel: document.getElementById('fuel-bar'),
    speed: document.getElementById('speed-display'),
    gear: document.getElementById('gear-display'),
    unit: document.getElementById('speed-unit'),
    rpm: document.getElementById('rpm-boxes'),
    icons: {
      engine: document.getElementById('icon-engine'),
      lights: document.getElementById('icon-lights'),
      left: document.getElementById('icon-left'),
      right: document.getElementById('icon-right'),
      seatbelt: document.getElementById('icon-seatbelt')
    },
    audio: {
      tick: document.getElementById('audio-tick'),
      alarm: document.getElementById('audio-alarm')
    }
  };
  
  const vehicleState = {
    engineOn: false
    // Status seatbelt tidak perlu dilacak di sini lagi
  };

  // --- PERBAIKAN UNTUK RPM ---
  // Pastikan elemen RPM ada
  if (els.rpm) {
    // 1. Buat kotak-kotak RPM terlebih dahulu
    for (let i = 0; i < 10; i++) {
      const box = document.createElement('div');
      box.className = 'rpm-box';
      els.rpm.appendChild(box);
    }
    
    // 2. Setelah dibuat, baru pilih kotak-kotak tersebut
    const rpmBoxes = Array.from(els.rpm.children);

    // 3. Sekarang definisikan fungsi setRPM dengan referensi yang benar
    window.setRPM = (rpm) => {
        const active = Math.round(Math.max(0, Math.min(1, rpm)) * 10);
        rpmBoxes.forEach((box, i) => box.classList.toggle('on', i < active));
    };
  } else {
      window.setRPM = () => {}; // Buat fungsi kosong jika elemen RPM tidak ada
  }

  window.setSpeed = (speed) => {
    if (!els.speed) return;
    const val = Math.round(Math.max(0, speed * 2.23694)); 
    els.speed.textContent = val;
  };

  /**
   * Mengatur teks gear yang ditampilkan.
   * CONTOH PANGGILAN: setGear('R') akan menampilkan R, setGear('N') akan menampilkan N.
   * Jika Anda memanggil setGear('N') saat mobil mundur, maka itu yang akan tampil.
   * Pastikan Anda mengirimkan data yang benar dari game Anda.
   */
  window.setGear = (gear) => {
    if (!els.gear) return;
    const upperGear = String(gear).toUpperCase(); // Selalu ubah ke huruf besar
    els.gear.textContent = upperGear;
    
    if (upperGear === 'R') {
      els.gear.classList.add('gear-reverse');
    } else {
      els.gear.classList.remove('gear-reverse');
    }
  };

  window.setFuel = (val) => {
    if (!els.fuel) return;
    const p = Math.max(0, Math.min(1, val));
    els.fuel.style.transform = `translateY(${100 - p * 100}%)`;
  };

  window.setHealth = (val) => {
    if (!els.health) return;
    const p = Math.max(0, Math.min(1, val));
    els.health.style.transform = `translateY(${100 - p * 100}%)`;
  };

  const toggleIcon = (id, state) => {
    if (els.icons[id]) {
      els.icons[id].classList.toggle('active', !!state);
    }
  };

  const manageLoopingAudio = (audioEl, shouldPlay) => {
    if (!audioEl) return;
    if (shouldPlay && audioEl.paused) {
      audioEl.play().catch(e => {});
    } 
    else if (!shouldPlay && !audioEl.paused) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
  };
  
  window.setEngine = (on) => {
    const newState = !!on;
    if (vehicleState.engineOn === newState) return;
    vehicleState.engineOn = newState;
    toggleIcon('engine', vehicleState.engineOn);
  };

  // --- PERBAIKAN UNTUK LOGIKA SEATBELT ---
  /**
   * Mengatur status ikon sabuk pengaman (lampu status).
   * @param {boolean} isBuckled - true jika sabuk TERPASANG (ikon akan MENYALA).
   *                              false jika sabuk DILEPAS (ikon akan MATI).
   */
  window.setSeatbelts = (isBuckled) => {
    const isNowOn = !!isBuckled;
    toggleIcon('seatbelt', isNowOn);
    // Karena ini bukan lagi peringatan, suara alarm tidak diperlukan.
    // manageLoopingAudio(els.audio.alarm, false); 
  };
  
  window.setHeadlights = (level) => {
    const lights = els.icons.lights;
    if (!lights) return;
    lights.classList.remove('low-beam', 'high-beam');
    if (level === 1) {
      lights.classList.add('low-beam');
    } else if (level === 2) {
      lights.classList.add('high-beam');
    }
  };
  
  const updateIndicatorSound = () => {
    if (!els.icons.left || !els.icons.right) return;
    const leftOn = els.icons.left.classList.contains('active');
    const rightOn = els.icons.right.classList.contains('active');
    manageLoopingAudio(els.audio.tick, leftOn || rightOn);
  };

  window.setLeftIndicator = (on) => {
    toggleIcon('left', on);
    updateIndicatorSound();
  };
  
  window.setRightIndicator = (on) => {
    toggleIcon('right', on);
    updateIndicatorSound();
  };
});
