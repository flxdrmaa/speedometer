document.addEventListener('DOMContentLoaded', () => {
  const els = {
    health: document.getElementById('health-bar'),
    fuel: document.getElementById('fuel-bar'),
    healthPercent: document.getElementById('health-percent'),
    fuelPercent: document.getElementById('fuel-percent'),
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
    engineOn: false,
    hasMoved: false
  };

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
      window.setRPM = () => {};
  }

  window.setSpeed = (speed) => {
    if (!els.speed) return;
    const val = Math.round(Math.max(0, speed * 2.23694)); 
    els.speed.textContent = val;

    if (val > 0) {
        vehicleState.hasMoved = true;
    }
  };

  window.setGear = (gear) => {
    if (!els.gear) return;

    let gearText;
    if (!vehicleState.engineOn) {
        gearText = 'N';
    } else {
        if (gear > 0) {
            gearText = gear;
        } else if (gear === 0 && vehicleState.hasMoved) {
            gearText = 'R';
        } else {
            gearText = 'N';
        }
    }

    const upperGear = String(gearText).toUpperCase();
    els.gear.textContent = upperGear;
    
    els.gear.classList.toggle('gear-reverse', upperGear === 'R');
  };

  window.setFuel = (val) => {
    if (!els.fuel) return;
    const p = Math.max(0, Math.min(1, val));
    // Memperbaiki sintaks template literal
    els.fuel.style.transform = `translateY(${100 - p * 100}%)`;
    if (els.fuelPercent) {
      els.fuelPercent.textContent = Math.round(p * 100) + '%';
    }
  };

  window.setHealth = (val) => {
    if (!els.health) return;
    const p = Math.max(0, Math.min(1, val));
    // Memperbaiki sintaks template literal
    els.health.style.transform = `translateY(${100 - p * 100}%)`;
    if (els.healthPercent) {
      els.healthPercent.textContent = Math.round(p * 100) + '%';
    }
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
  
  window.setSeatbelts = (isNotBuckled) => {
    // Logika diubah: true berarti peringatan (tidak terpasang)
    toggleIcon('seatbelt', !!isNotBuckled);
    const shouldPlayAlarm = !!isNotBuckled && vehicleState.engineOn;
    manageLoopingAudio(els.audio.alarm, shouldPlayAlarm);
  };
  
  // Hanya ada satu fungsi setEngine, yang ini sudah mencakup logika alarm
  window.setEngine = (on) => {
    const newState = !!on;
    if (vehicleState.engineOn === newState) return;
    
    vehicleState.engineOn = newState;
    toggleIcon('engine', vehicleState.engineOn);
    
    if (!newState) {
        vehicleState.hasMoved = false;
        window.setGear('N');
        manageLoopingAudio(els.audio.alarm, false);
    } else {
        window.setGear(0);
        // Periksa apakah seatbelt tidak terpasang untuk menyalakan alarm
        const isSeatbeltWarningOn = els.icons.seatbelt && els.icons.seatbelt.classList.contains('active');
        if (isSeatbeltWarningOn) {
            manageLoopingAudio(els.audio.alarm, true);
        }
    }
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
  
  // --- FUNGSI BARU UNTUK MENGONTROL LOGIKA SEIN ---
  const updateIndicators = () => {
    if (!els.icons.left || !els.icons.right) return;
    
    const leftActive = els.icons.left.classList.contains('active');
    const rightActive = els.icons.right.classList.contains('active');
    
    // 1. Selalu hapus kelas animasi di awal
    els.icons.left.classList.remove('is-blinking');
    els.icons.right.classList.remove('is-blinking');

    // 2. Terapkan logika baru
    if (leftActive && rightActive) {
      // Mode Hazard: Keduanya aktif, tambahkan kelas animasi ke keduanya
      els.icons.left.classList.add('is-blinking');
      els.icons.right.classList.add('is-blinking');
    } else if (leftActive) {
      // Hanya kiri yang aktif
      els.icons.left.classList.add('is-blinking');
    } else if (rightActive) {
      // Hanya kanan yang aktif
      els.icons.right.classList.add('is-blinking');
    }

    // 3. Putar suara jika salah satu atau keduanya aktif
    manageLoopingAudio(els.audio.tick, leftActive || rightActive);
  };

  // --- MODIFIKASI FUNGSI SEIN ---
  window.setLeftIndicator = (on) => {
    toggleIcon('left', on);
    updateIndicators(); // Panggil fungsi logika yang baru
  };
  
  window.setRightIndicator = (on) => {
    toggleIcon('right', on);
    updateIndicators(); // Panggil fungsi logika yang baru
  };
});
