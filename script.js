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
  
  // Menyimpan state kendaraan dan gear terakhir
  const vehicleState = {
    engineOn: false,
    lastGear: 1 // Asumsi gear awal adalah 1 atau netral
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
  };

  window.setGear = (gear) => {
    if (!els.gear) return;

    // Simpan gear terakhir yang valid (bukan N)
    if (typeof gear === 'number') {
      vehicleState.lastGear = gear;
    }

    let gearText;

    // Logika baru untuk menentukan teks gear
    if (!vehicleState.engineOn) {
      gearText = 'N'; // Jika mesin mati, tampilkan 'N'
    } else if (gear === 0) {
      gearText = 'R'; // Jika gear 0 (mundur), tampilkan 'R'
    } else {
      gearText = gear; // Tampilkan gear seperti biasa
    }

    const upperGear = String(gearText).toUpperCase();
    els.gear.textContent = upperGear;
    
    // Atur style untuk gear mundur
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
    if (els.fuelPercent) {
      els.fuelPercent.textContent = Math.round(p * 100) + '%';
    }
  };

  window.setHealth = (val) => {
    if (!els.health) return;
    const p = Math.max(0, Math.min(1, val));
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
  
  window.setEngine = (on) => {
    const newState = !!on;
    if (vehicleState.engineOn === newState) return;
    
    vehicleState.engineOn = newState;
    toggleIcon('engine', vehicleState.engineOn);
    
    // Panggil setGear lagi untuk update tampilan (menjadi 'N' atau kembali ke gear terakhir)
    window.setGear(vehicleState.lastGear);
  };

  window.setSeatbelts = (isBuckled) => {
    toggleIcon('seatbelt', !!isBuckled);
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
