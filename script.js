document.addEventListener('DOMContentLoaded', () => {
  // Seleksi elemen DOM
  const els = {
    health: document.getElementById('health-bar'),
    fuel: document.getElementById('fuel-bar'),
    healthPct: document.getElementById('health-percent'),
    fuelPct: document.getElementById('fuel-percent'),
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
    // Seleksi elemen audio
    audio: {
      tick: document.getElementById('audio-tick'),
      alarm: document.getElementById('audio-alarm')
    }
  };

  // Buat 10 kotak RPM
  for (let i = 0; i < 10; i++) {
    const box = document.createElement('div');
    box.className = 'rpm-box';
    els.rpm.appendChild(box);
  }
  const rpmBoxes = Array.from(els.rpm.children);

  // Fungsi untuk mengatur kecepatan (m/s -> mph)
  window.setSpeed = (speed) => {
    const val = Math.round(Math.max(0, speed * 2.23694)); 
    els.speed.textContent = val;
  };

  // Fungsi untuk mengatur RPM
  window.setRPM = (rpm) => {
    const active = Math.round(Math.max(0, Math.min(1, rpm)) * 10);
    rpmBoxes.forEach((box, i) => box.classList.toggle('on', i < active));
  };

  // Fungsi untuk mengatur level bahan bakar
  window.setFuel = (val) => {
    const p = Math.max(0, Math.min(1, val));
    els.fuel.style.transform = `translateY(${100 - p * 100}%)`;
    els.fuelPct.textContent = `${Math.round(p * 100)}%`;
  };

  // Fungsi untuk mengatur level kesehatan
  window.setHealth = (val) => {
    const p = Math.max(0, Math.min(1, val));
    els.health.style.transform = `translateY(${100 - p * 100}%)`;
    els.healthPct.textContent = `${Math.round(p * 100)}%`;
  };

  // Fungsi untuk mengatur status ikon
  const toggleIcon = (id, state) => {
    els.icons[id].classList.toggle('active', !!state);
  };
  
  // Fungsi untuk memutar atau menghentikan audio
  const handleAudio = (audioEl, play) => {
      if (play) {
        // Cek jika audio belum diputar
        if (audioEl.paused) {
            audioEl.play().catch(e => console.error("Audio failed to play:", e));
        }
      } else {
        audioEl.pause();
        audioEl.currentTime = 0; // Reset waktu audio
      }
  };


  window.setEngine = (on) => toggleIcon('engine', on);
  window.setHeadlights = (on) => toggleIcon('lights', on > 0);
  
  window.setLeftIndicator = (on) => {
      toggleIcon('left', on);
      // Jika sein kanan aktif, matikan suaranya
      if(els.icons.right.classList.contains('active')) return;
      handleAudio(els.audio.tick, on);
  };
  
  window.setRightIndicator = (on) => {
      toggleIcon('right', on);
      // Jika sein kiri aktif, matikan suaranya
      if(els.icons.left.classList.contains('active')) return;
      handleAudio(els.audio.tick, on);
  };

  window.setSeatbelts = (on) => {
      // Ikon aktif jika sabuk pengaman TIDAK terpasang
      toggleIcon('seatbelt', !on); 
      // Mainkan alarm jika sabuk pengaman TIDAK terpasang
      handleAudio(els.audio.alarm, !on); 
  };
});
