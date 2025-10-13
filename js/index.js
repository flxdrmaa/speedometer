let elements = {};
let speedMode = 1;
let indicators = 0;

const onOrOff = (state) => (state ? "On" : "Off");

/**
 * Updates the display of the engine state.
 *
 * @param {boolean} state If true, the engine is on; otherwise, it is off.
 * @description Sets the engine state display based on the provided boolean state.
 */
function setEngine(state) {
  elements.engine.innerText = onOrOff(state);
}

function updateSpeedMeter(speed, maxSpeed = 300) {
  const path = document.querySelector('.speed path[style*="stroke-dasharray"]');
  if (!path) return;
  const style = path.getAttribute("style") || "";
  const m = style.match(/stroke-dasharray:\s*([\d.]+)/);
  const total = m ? parseFloat(m[1]) : 838;
  const clamped = Math.max(0, Math.min(speed, maxSpeed));
  const offset = total - total * (clamped / maxSpeed);
  path.style.strokeDashoffset = offset;
}

function updateFuelMeter(level, maxLevel = 100) {
  const path = document.querySelector('.fuel path[style*="stroke-dasharray"]');
  if (!path) return;

  const style = path.getAttribute("style") || "";
  const m = style.match(/stroke-dasharray:\s*([\d.]+)/);
  const total = m ? parseFloat(m[1]) : 340; // fallback ke 340

  const clamped = Math.max(0, Math.min(Number(level) || 0, maxLevel));
  const offset = total - total * (clamped / maxLevel);

  path.style.strokeDashoffset = offset;

  // contoh: ubah warna saat bahan bakar rendah (opsional)
  if (clamped <= maxLevel * 0.15) {
    path.setAttribute("stroke", "#FFCC00"); // kuning/oranye untuk peringatan
  } else {
    path.setAttribute("stroke", "#F43E5F"); // warna default
  }
}

/** Animasi halus ke nilai target */
function animateFuelTo(targetLevel, duration = 300, maxLevel = 100) {
  const startLevel = 0; // tidak ada teks fuel di HTML, mulai dari 0 atau simpan state jika ada
  const change = targetLevel - startLevel;
  const startTime = performance.now();

  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const current = startLevel + change * t;
    updateFuelMeter(current, maxLevel);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/**
 * Updates the speed display based on the current speed mode.
 * @param {number} speed - The speed value in meters per second (m/s).
 * @description Converts the speed value to the current speed mode and updates the display.
 */
function setSpeed(speed) {
  switch (speedMode) {
    case 1:
      updateSpeedMeter(speed, 300);
      speed = elements.speed.innerText = `${Math.round(speed * 2.236936)} MPH`;
      break;
    case 2:
      updateSpeedMeter(speed, 300);
      speed = elements.speed.innerText = `${Math.round(
        speed * 1.943844
      )} Knots`;
      break; // Knots
    default:
      updateSpeedMeter(speed, 300);
      speed = elements.speed.innerText = `${Math.round(speed * 3.6)} KMH`; // KMH
  }
}
function updateEngineMeter(level, maxLevel = 100) {
  const path = document.querySelector(
    '.engine path[style*="stroke-dasharray"]'
  );
  if (!path) return;

  const style = path.getAttribute("style") || "";
  const m = style.match(/stroke-dasharray:\s*([\d.]+)/);
  const total = m ? parseFloat(m[1]) : 345; // fallback sesuai SVG
  const clamped = Math.max(0, Math.min(Number(level) || 0, maxLevel));
  const offset = total - total * (clamped / maxLevel);

  path.style.strokeDashoffset = offset;

  // optional: change color when low health
  if (clamped <= maxLevel * 0.15) {
    path.setAttribute("stroke", "#FF002E");
  } else {
    path.setAttribute("stroke", "white");
  }
}

/** Animasi halus ke nilai engine/health target */
function animateEngineTo(targetLevel, duration = 300, maxLevel = 100) {
  // derive current level from strokeDashoffset if possible
  const path = document.querySelector(
    '.engine path[style*="stroke-dasharray"]'
  );
  const style = path?.getAttribute("style") || "";
  const m = style.match(/stroke-dasharray:\s*([\d.]+)/);
  const total = m ? parseFloat(m[1]) : 345;
  const currentOffset = parseFloat(
    getComputedStyle(path).strokeDashoffset || 0
  );
  const currentLevel = ((total - currentOffset) / total) * maxLevel || 0;

  const start = currentLevel;
  const change = targetLevel - start;
  const startTime = performance.now();

  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const value = start + change * t;
    updateEngineMeter(value, maxLevel);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/**
 * Updates the RPM (Revolutions Per Minute) display.
 * @param {number} rpm - The RPM value to display. (0 to 1).
 */
function setRPM(rpm) {}

/**
 * Updates the fuel level display as a percentage.
 * @param {number} fuel - The fuel level (0 to 1).
 */
function setFuel(fuel) {
  animateFuelTo(fuel * 100, 300, 100);
}

/**
 * Updates the vehicle health display as a percentage.
 * @param {number} health - The vehicle health level (0 to 1).
 */
function setHealth(health) {
  const pct = Math.max(0, Math.min(1, Number(health) || 0)) * 100;
  animateEngineTo(pct, 300, 100);
}

/**
 * Updates the current gear display.
 * @param {number} gear - The current gear to display. 0 represents neutral/reverse.
 */
function setGear(gear) {
  elements.gear.innerText = String(gear);
}

/**
 * Updates the headlights status display.
 * @param {number} state - The headlight state (0: Off, 1: On, 2: High Beam).
 */
function setHeadlights(state) {
  switch (state) {
    case 1:
      elements.headlights.innerText = "On";
      elements.headlights.classList.add("active");
      elements.headlights.classList.remove("highBeam");
      break;
    case 2:
      elements.headlights.innerText = "High Beam";
      elements.headlights.classList.add("highBeam");
      break;
    default:
      elements.headlights.innerText = "Off";
      elements.headlights.classList.remove("active");
  }
}

/**
 * Sets the state of the left turn indicator and updates the display.
 * @param {boolean} state - If true, turns the left indicator on; otherwise, turns it off.
 */
function setLeftIndicator(state) {
  indicators = (indicators & 0b10) | (state ? 0b01 : 0b00);
  elements.indicators.innerText = `${indicators & 0b01 ? "On" : "Off"} / ${
    indicators & 0b10 ? "On" : "Off"
  }`;
}

/**
 * Sets the state of the right turn indicator and updates the display.
 * @param {boolean} state - If true, turns the right indicator on; otherwise, turns it off.
 */
function setRightIndicator(state) {
  indicators = (indicators & 0b01) | (state ? 0b10 : 0b00);
  elements.indicators.innerText = `${indicators & 0b01 ? "On" : "Off"} / ${
    indicators & 0b10 ? "On" : "Off"
  }`;
}

/**
 * Updates the seatbelt status display.
 * @param {boolean} state - If true, indicates seatbelts are fastened; otherwise, indicates they are not.
 */
function setSeatbelts(state) {
  elements.seatbelts.innerText = onOrOff(state);
  if (state) {
    elements.seatbelts.classList.add("active");
  } else {
    elements.seatbelts.classList.remove("active");
  }
}

/**
 * Sets the speed display mode and updates the speed unit display.
 * @param {number} mode - The speed mode to set (0: KMH, 1: MPH, 2: Knots).
 */
function setSpeedMode(mode) {
  speedMode = mode;
  switch (mode) {
    case 1:
      elements.speedMode.innerText = "MPH";
      break;
    case 2:
      elements.speedMode.innerText = "Knots";
      break;
    default:
      elements.speedMode.innerText = "KMH";
  }
}

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  elements = {
    engine: document.getElementById("engine"),
    speed: document.getElementById("speed"),
    rpm: document.getElementById("rpm"),
    fuel: document.getElementById("fuel"),
    health: document.getElementById("health"),
    gear: document.getElementById("gear"),
    headlights: document.getElementById("headlights"),
    indicators: document.getElementById("indicators"),
    seatbelts: document.getElementById("seatbelts"),
    speedMode: document.getElementById("speed-mode"),
  };
});
