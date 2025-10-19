document.addEventListener('DOMContentLoaded', () => {
  const els = {
    health: document.getElementById('health-bar'),
    fuel: document.getElementById('fuel-bar'),
    speed: document.getElementById('speed-display'),
    gear: document.getElementById('gear-display'), // Elemen gear ditambahkan
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
  
  // (Kode validasi dan fungsi lainnya tetap sama seperti versi toleran sebelumnya)
  // ...

  const vehicleState = {
    engineOn: false,
    seatbeltOn: true // Asumsikan sabuk terpasang di awal
  };

  if (els.rpm) {
    const rpmBoxes = Array.from(els.rpm.children);
    window.setRPM = (rpm) => {
        if (!rpmBoxes) return;
        const active = Math.round(Math.max(0, Math.min(1, rpm)) * 10);
        rpmBoxes.forEach((box, i) => box.classList.toggle('on', i < active));
    };
    for (let i = 0; i < 10; i++) {
      const box = document.createElement('div');
      box.className = 'rpm-box';
      els.rpm.appendChild(box);
    }
  } else {
    window.setRPM = ()=>{};
  }

  window.setSpeed = (speed) => {
    if (!els.speed) return;
    const val = Math.round(Math.max(0, speed * 2.23694)); 
    els.speed.textContent = val;
  };

  // --- FUNGSI BARU UNTUK GEAR ---
  window.setGear = (gear) => {
    if (!els.gear) return;
    els.gear.textContent = gear;
    // Tambahkan kelas 'gear-reverse' jika gear adalah 'R', hapus jika bukan
    if (gear === 'R' || gear === 'r') {
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

  /**
   * Mengatur status sabuk pengaman.
   * @param {boolean} isBuckled - true jika sabuk terpasang, false jika tidak terpasang.
   */
  window.setSeatbelts = (isBuckled) => {
    const newState = !!isBuckled;
    if (vehicleState.seatbeltOn === newState) return; // Tidak ada perubahan
    vehicleState.seatbeltOn = newState;
    // Cek kembali apakah peringatan perlu dinyalakan atau dimatikan.
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
