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
    }
  };

  // Buat 10 kotak RPM
  for (let i = 0; i < 10; i++) {
    const box = document.createElement('div');
    box.className = 'rpm-box';
    els.rpm.appendChild(box);
  }
  const rpmBoxes = Array.from(els.rpm.children);

  // Fungsi untuk mengatur kecepatan (m/s -> km/h, tanpa nol di depan)
  window.setSpeed = (speed) => {
    const val = Math.round(Math.max(0, speed * 3.6)); // Konversi ke km/h, minimal 0
    els.speed.textContent = val; // Tanpa padStart untuk menghapus nol di depan
  };

  // Fungsi untuk mengatur RPM
  window.setRPM = (rpm) => {
    const active = Math.round(Math.max(0, Math.min(1, rpm)) * 10); // Normalisasi 0-1 ke 0-10
    rpmBoxes.forEach((box, i) => box.classList.toggle('on', i < active));
  };

  // Fungsi untuk mengatur level bahan bakar
  window.setFuel = (val) => {
    const p = Math.max(0, Math.min(1, val)); // Normalisasi 0-1
    els.fuel.style.transform = `translateY(${100 - p * 100}%)`;
    els.fuelPct.textContent = `${Math.round(p * 100)}%`;
  };

  // Fungsi untuk mengatur level kesehatan
  window.setHealth = (val) => {
    const p = Math.max(0, Math.min(1, val)); // Normalisasi 0-1
    els.health.style.transform = `translateY(${100 - p * 100}%)`;
    els.healthPct.textContent = `${Math.round(p * 100)}%`;
  };

  // Fungsi untuk mengatur status ikon
  const toggleIcon = (id, state) => {
    els.icons[id].classList.toggle('active', !!state);
  };

  window.setEngine = (on) => toggleIcon('engine', on);
  window.setHeadlights = (on) => toggleIcon('lights', on > 0);
  window.setLeftIndicator = (on) => toggleIcon('left', on);
  window.setRightIndicator = (on) => toggleIcon('right', on);
  window.setSeatbelts = (on) => toggleIcon('seatbelt', on);
});
