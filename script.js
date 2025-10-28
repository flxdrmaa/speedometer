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

// Menambahkan state hasMoved untuk melacak pergerakan
const vehicleState = {
engineOn: false,
hasMoved: false // Awalnya false
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

// Modifikasi: setSpeed sekarang juga akan mengubah state hasMoved
window.setSpeed = (speed) => {
if (!els.speed) return;
const val = Math.round(Math.max(0, speed * 2.23694));
els.speed.textContent = val;

code
Code
download
content_copy
expand_less
// Jika kecepatan di atas 0, tandai bahwa mobil sudah bergerak
if (val > 0) {
    vehicleState.hasMoved = true;
}

};

// Modifikasi: Logika penentuan gear yang baru
window.setGear = (gear) => {
if (!els.gear) return;

code
Code
download
content_copy
expand_less
let gearText;

if (!vehicleState.engineOn) {
    gearText = 'N'; // Jika mesin mati, selalu 'N'
} else {
    // Logika baru saat mesin hidup
    if (gear > 0) {
        gearText = gear; // Gear maju (1, 2, 3...)
    } else if (gear === 0 && vehicleState.hasMoved) {
        // Gear 0 dan mobil sudah pernah bergerak = Mundur ('R')
        gearText = 'R';
    } else {
        // Semua kondisi lain (termasuk gear 0 saat mobil belum bergerak) = Netral ('N')
        gearText = 'N';
    }
}

const upperGear = String(gearText).toUpperCase();
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
els.fuel.style.transform = translateY(${100 - p * 100}%);
if (els.fuelPercent) {
els.fuelPercent.textContent = Math.round(p * 100) + '%';
}
};

window.setHealth = (val) => {
if (!els.health) return;
const p = Math.max(0, Math.min(1, val));
els.health.style.transform = translateY(${100 - p * 100}%);
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

// Modifikasi: setEngine akan me-reset status hasMoved
window.setEngine = (on) => {
const newState = !!on;
if (vehicleState.engineOn === newState) return;

code
Code
download
content_copy
expand_less
vehicleState.engineOn = newState;
toggleIcon('engine', vehicleState.engineOn);

// Jika mesin dimatikan, reset status `hasMoved` dan tampilkan 'N'
if (!newState) {
    vehicleState.hasMoved = false;
    window.setGear('N'); // Paksa tampilkan 'N'
} else {
    // Jika mesin baru dinyalakan, panggil `setGear` dengan gear saat ini (kemungkinan 0)
    // Logika baru di `setGear` akan menampilkannya sebagai 'N' karena `hasMoved` masih false
    window.setGear(0);
}

};

window.setSeatbelts = (isBuckled) => {
toggleIcon('seatbelt', !!isBuckled);

code
Code
download
content_copy
expand_less
// Tambahkan logika untuk alarm:
// Alarm hanya berbunyi jika sabuk pengaman tidak terpasang DAN mesin menyala.
const shouldPlayAlarm = !isBuckled && vehicleState.engineOn;
manageLoopingAudio(els.audio.alarm, shouldPlayAlarm);

};

// ... (kode Anda yang lain antara setSeatbelts dan setEngine)

// Modifikasi: setEngine akan me-reset status hasMoved dan mengelola alarm
window.setEngine = (on) => {
const newState = !!on;
if (vehicleState.engineOn === newState) return;

code
Code
download
content_copy
expand_less
vehicleState.engineOn = newState;
toggleIcon('engine', vehicleState.engineOn);

// Jika mesin dimatikan, reset status `hasMoved`, tampilkan 'N', dan matikan alarm
if (!newState) {
    vehicleState.hasMoved = false;
    window.setGear('N'); // Paksa tampilkan 'N'
    manageLoopingAudio(els.audio.alarm, false); // Hentikan alarm saat mesin mati
} else {
    // Jika mesin baru dinyalakan, panggil `setGear` dengan gear saat ini
    window.setGear(0);
    // Periksa status sabuk pengaman saat ini untuk menentukan apakah alarm harus diputar
    const isSeatbeltBuckled = els.icons.seatbelt && els.icons.seatbelt.classList.contains('active');
    if (!isSeatbeltBuckled) {
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

ketika sein kanan kiri aktif maka kedip kedipnta di buat bareng
