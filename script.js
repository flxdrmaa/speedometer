document.addEventListener('DOMContentLoaded', () => {
  // --- 1. SELEKSI ELEMEN & VALIDASI ---
  // Memastikan semua elemen ada sebelum skrip berjalan lebih jauh.
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

  // Validasi: Hentikan eksekusi jika ada elemen penting yang tidak ditemukan
  for (const key in els) {
    if (els[key] === null) {
      console.error(`[Speedometer] Elemen kritis tidak ditemukan: '${key}'. Skrip dihentikan.`);
      return; // Menghentikan skrip agar tidak crash
    }
    if (typeof els[key] === 'object') {
        for (const subKey in els[key]) {
            if (els[key][subKey] === null) {
                console.error(`[Speedometer] Elemen kritis tidak ditemukan: '${key}.${subKey}'. Skrip dihentikan.`);
                return;
            }
        }
    }
  }

  // --- 2. STATE MANAGEMENT ---
  // Variabel untuk melacak status kendaraan.
  const vehicleState = {
    engineOn: false,
    seatbeltOn: true // Asumsikan sabuk pengaman terpasang saat mulai
  };

  // --- 3. FUNGSI-FUNGSI UTAMA (TIDAK BERUBAH) ---
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

  // --- 4. FUNGSI AUDIO YANG LEBIH AMAN DAN EFISIEN ---
  // Fungsi ini hanya akan memutar atau menghentikan audio JIKA DIPERLUKAN,
  // mencegah panggilan berulang yang tidak perlu.
  const manageLoopingAudio = (audioEl, shouldPlay) => {
    // Jika audio harus diputar DAN saat ini sedang dijeda
    if (shouldPlay && audioEl.paused) {
      // play() mengembalikan Promise, tangani potensi error (misalnya autoplay diblokir)
      audioEl.play().catch(e => console.warn("Pemutaran audio diblokir oleh browser. Diperlukan interaksi pengguna."));
    } 
    // Jika audio TIDAK boleh diputar DAN saat ini TIDAK sedang dijeda
    else if (!shouldPlay && !audioEl.paused) {
      audioEl.pause();
      audioEl.currentTime = 0; // Reset ke awal
    }
  };

  // --- 5. LOGIKA APLIKASI YANG DIPERBARUI ---

  // Fungsi untuk mengupdate status peringatan sabuk pengaman
  const updateSeatbeltWarning = () => {
    const isWarningActive = vehicleState.engineOn && !vehicleState.seatbeltOn;
    toggleIcon('seatbelt', isWarningActive);
    manageLoopingAudio(els.audio.alarm, isWarningActive);
  };
  
  window.setEngine = (on) => {
    const newState = !!on;
    if (vehicleState.engineOn === newState) return; // Tidak ada perubahan, jangan lakukan apa-apa
    vehicleState.engineOn = newState;
    toggleIcon('engine', vehicleState.engineOn);
    updateSeatbeltWarning();
  };

  window.setSeatbelts = (on) => {
    const newState = !!on;
    if (vehicleState.seatbeltOn === newState) return; // Tidak ada perubahan
    vehicleState.seatbeltOn = newState;
    updateSeatbeltWarning();
  };
  
  // level: 0 = mati, 1 = lampu dekat, 2 = lampu jauh
  window.setHeadlights = (level) => {
    const lights = els.icons.lights;
    lights.classList.remove('low-beam', 'high-beam'); // Reset status
    if (level === 1) {
      lights.classList.add('low-beam');
    } else if (level === 2) {
      lights.classList.add('high-beam');
    }
  };
  
  const updateIndicatorSound = () => {
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

  // Inisialisasi status awal saat skrip dimuat
  updateSeatbeltWarning(); 
});
