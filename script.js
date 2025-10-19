document.addEventListener('DOMContentLoaded', () => {
  // --- 1. SELEKSI ELEMEN & VALIDASI YANG LEBIH TOLERAN ---
  const els = {
    health: document.getElementById('health-bar'),
    fuel: document.getElementById('fuel-bar'),
    speed: document.getElementById('speed-display'),
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

  // Validasi baru: Hanya menampilkan peringatan (warning) dan tidak menghentikan skrip.
  // Ini memastikan fungsi-fungsi utama (seperti setSpeed) akan selalu dibuat.
  function validateElements(elements) {
    for (const key in elements) {
      const element = elements[key];
      if (element === null) {
        // Tampilkan peringatan, bukan error yang menghentikan skrip
        console.warn(`[Speedometer] Peringatan: Elemen dengan ID '${key}' tidak ditemukan. Fitur terkait mungkin tidak akan berfungsi.`);
      } else if (typeof element === 'object' && !element.tagName) { // Cek objek bersarang seperti 'icons'
        validateElements(element);
      }
    }
  }
  validateElements(els);


  // --- 2. STATE MANAGEMENT ---
  const vehicleState = {
    engineOn: false,
    seatbeltOn: true 
  };

  // --- 3. FUNGSI-FUNGSI UTAMA ---
  // Pastikan RPM container ada sebelum membuat kotaknya
  if (els.rpm) {
    for (let i = 0; i < 10; i++) {
      const box = document.createElement('div');
      box.className = 'rpm-box';
      els.rpm.appendChild(box);
    }
    const rpmBoxes = Array.from(els.rpm.children);
    
    window.setRPM = (rpm) => {
        const active = Math.round(Math.max(0, Math.min(1, rpm)) * 10);
        rpmBoxes.forEach((box, i) => box.classList.toggle('on', i < active));
    };
  } else {
      window.setRPM = () => {}; // Buat fungsi kosong jika elemen tidak ada
  }

  window.setSpeed = (speed) => {
    if (!els.speed) return;
    const val = Math.round(Math.max(0, speed * 2.23694)); 
    els.speed.textContent = val;
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

  // --- 4. FUNGSI AUDIO YANG AMAN ---
  const manageLoopingAudio = (audioEl, shouldPlay) => {
    if (!audioEl) return; // Jangan lakukan apa-apa jika elemen audio tidak ada

    if (shouldPlay && audioEl.paused) {
      audioEl.play().catch(e => {}); // Tangani error autoplay tanpa spam console
    } 
    else if (!shouldPlay && !audioEl.paused) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
  };

  // --- 5. LOGIKA APLIKASI ---
  const updateSeatbeltWarning = () => {
    const isWarningActive = vehicleState.engineOn && !vehicleState.seatbeltOn;
    toggleIcon('seatbelt', isWarningActive);
    manageLoopingAudio(els.audio.alarm, isWarningActive);
  };
  
  window.setEngine = (on) => {
    const newState = !!on;
    if (vehicleState.engineOn === newState) return;
    vehicleState.engineOn = newState;
    toggleIcon('engine', vehicleState.engineOn);
    updateSeatbeltWarning();
  };

  window.setSeatbelts = (on) => {
    const newState = !!on;
    if (vehicleState.seatbeltOn === newState) return;
    vehicleState.seatbeltOn = newState;
    updateSeatbeltWarning();
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

  updateSeatbeltWarning(); 
});
