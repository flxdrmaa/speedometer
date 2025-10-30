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
    hasMoved: false,
    isMotorcycle: false // Defaultnya adalah mobil
  };

  /**
   * Mengatur jenis kendaraan. 'motorcycle' akan menonaktifkan fitur sabuk pengaman.
   * Jenis lainnya akan dianggap sebagai mobil.
   */
  window.setVehicleType = (type) => {
    vehicleState.isMotorcycle = type === 'motorcycle';

    if (els.icons.seatbelt) {
      if (vehicleState.isMotorcycle) {
        // Jika motor, sembunyikan ikon dan matikan alarm
        els.icons.seatbelt.style.display = 'none';
        manageLoopingAudio(els.audio.alarm, false); 
      } else {
        // Jika mobil, tampilkan kembali ikonnya
        els.icons.seatbelt.style.display = ''; // Menghapus style 'display' agar kembali ke default CSS
      }
    }
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
  
  window.setSeatbelts = (isBuckled) => {
    // Jika kendaraan adalah motor, abaikan semua fungsi sabuk pengaman
    if (vehicleState.isMotorcycle) {
      return;
    }
    
    const isWearingBelt = !!isBuckled;
    toggleIcon('seatbelt', !isWearingBelt); // Ikon aktif jika TIDAK dipakai
    
    // Alarm hanya berbunyi jika mesin menyala DAN sabuk tidak terpasang
    const shouldPlayAlarm = !isWearingBelt && vehicleState.engineOn;
    manageLoopingAudio(els.audio.alarm, shouldPlayAlarm);
  };
  
  window.setEngine = (on) => {
    const newState = !!on;
    if (vehicleState.engineOn === newState) return;
    
    vehicleState.engineOn = newState;
    toggleIcon('engine', vehicleState.engineOn);
    
    if (!newState) {
        // Jika mesin mati
        vehicleState.hasMoved = false;
        window.setGear('N');
        manageLoopingAudio(els.audio.alarm, false); // Selalu matikan alarm saat mesin mati
    } else {
        // Jika mesin baru menyala
        window.setGear(0);

        // Untuk mobil, periksa status sabuk pengaman saat mesin menyala
        if (!vehicleState.isMotorcycle) {
            const isSeatbeltIconActive = els.icons.seatbelt && els.icons.seatbelt.classList.contains('active');
            if (isSeatbeltIconActive) { // Jika ikon aktif (artinya belt belum terpasang)
                manageLoopingAudio(els.audio.alarm, true);
            }
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
  
  const updateIndicators = () => {
    if (!els.icons.left || !els.icons.right) return;
    
    const leftActive = els.icons.left.classList.contains('active');
    const rightActive = els.icons.right.classList.contains('active');
    
    els.icons.left.classList.remove('is-blinking');
    els.icons.right.classList.remove('is-blinking');

    if (leftActive && rightActive) {
      els.icons.left.classList.add('is-blinking');
      els.icons.right.classList.add('is-blinking');
    } else if (leftActive) {
      els.icons.left.classList.add('is-blinking');
    } else if (rightActive) {
      els.icons.right.classList.add('is-blinking');
    }

    manageLoopingAudio(els.audio.tick, leftActive || rightActive);
  };

  window.setLeftIndicator = (on) => {
    toggleIcon('left', on);
    updateIndicators();
  };
  
  window.setRightIndicator = (on) => {
    toggleIcon('right', on);
    updateIndicators();
  };
});
