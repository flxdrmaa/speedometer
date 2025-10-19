document.addEventListener('DOMContentLoaded', () => {
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

  // Variabel untuk melacak status kendaraan
  const vehicleState = {
    engineOn: false,
    seatbeltOn: true // Asumsikan sabuk pengaman terpasang saat mulai
  };

  for (let i = 0; i < 10; i++) {
    const box = document.createElement('div');
    box.className = 'rpm-box';
    els.rpm.appendChild(box);
  }
  const rpmBoxes = Array.from(els.rpm.children);

  window.setSpeed = (speed) => {
    const val = Math.round(Math.max(0, speed * 2.23694)); 
    els.speed.textContent = val;
  };

  window.setRPM = (rpm) => {
    const active = Math.round(Math.max(0, Math.min(1, rpm)) * 10);
    rpmBoxes.forEach((box, i) => box.classList.toggle('on', i < active));
  };

  window.setFuel = (val) => {
    const p = Math.max(0, Math.min(1, val));
    els.fuel.style.transform = `translateY(${100 - p * 100}%)`;
  };

  window.setHealth = (val) => {
    const p = Math.max(0, Math.min(1, val));
    els.health.style.transform = `translateY(${100 - p * 100}%)`;
  };

  const toggleIcon = (id, state) => {
    els.icons[id].classList.toggle('active', !!state);
  };
  
  const handleAudio = (audioEl, play) => {
      if (play && audioEl.paused) {
        audioEl.play().catch(e => console.error("Audio failed to play:", e));
      } else if (!play) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
  };

  // --- LOGIKA BARU ---

  // Fungsi untuk mengupdate status peringatan sabuk pengaman
  const updateSeatbeltWarning = () => {
    const isWarningActive = vehicleState.engineOn && !vehicleState.seatbeltOn;
    toggleIcon('seatbelt', isWarningActive);
    handleAudio(els.audio.alarm, isWarningActive);
  };

  window.setEngine = (on) => {
    vehicleState.engineOn = !!on;
    toggleIcon('engine', on);
    updateSeatbeltWarning(); // Cek status sabuk pengaman setiap mesin nyala/mati
  };

  // Fungsi setSeatbelts sekarang hanya mengubah status
  window.setSeatbelts = (on) => {
    vehicleState.seatbeltOn = !!on;
    updateSeatbeltWarning(); // Cek kembali status peringatan
  };
  
  // Fungsi setHeadlights diperbarui
  // level: 0 = mati, 1 = lampu dekat, 2 = lampu jauh
  window.setHeadlights = (level) => {
    const lights = els.icons.lights;
    lights.classList.remove('low-beam', 'high-beam');
    if (level === 1) {
      lights.classList.add('low-beam');
    } else if (level === 2) {
      lights.classList.add('high-beam');
    }
  };
  
  window.setLeftIndicator = (on) => {
      toggleIcon('left', on);
      if(els.icons.right.classList.contains('active')) return;
      handleAudio(els.audio.tick, on);
  };
  
  window.setRightIndicator = (on) => {
      toggleIcon('right', on);
      if(els.icons.left.classList.contains('active')) return;
      handleAudio(els.audio.tick, on);
  };

  // Inisialisasi status awal
  updateSeatbeltWarning(); 
});
