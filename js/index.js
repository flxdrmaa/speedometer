let elements = {};
let speedMode = 0; // 0: KMH, 1: MPH, 2: Knots
let indicators = 0;
let currentFuel = 0;
let currentEngine = 0;

const onOrOff = (state) => (state ? "On" : "Off");

/* ----------------------------- SPEEDOMETER ----------------------------- */
function updateSpeedMeter(speed, maxSpeed = 300) {
  const path = document.querySelector('.speed path') || null;
  if (!path) return;

  const total = path.getTotalLength() || 838;
  const clamped = Math.max(0, Math.min(speed, maxSpeed));
  const offset = total - (total * clamped) / maxSpeed;

  path.style.strokeDashoffset = offset;
}

/**
 * Sets the current speed
 * RAGE MP gives speed in m/s → convert to KMH/MPH/Knots
 */
function setSpeed(speed) {
  if (!elements.speed) return;
  let displaySpeed;

  switch (speedMode) {
    case 1: // MPH
      displaySpeed = speed * 2.236936;
      elements.speed.innerText = `${Math.round(displaySpeed)} MPH`;
      break;
    case 2: // Knots
      displaySpeed = speed * 1.943844;
      elements.speed.innerText = `${Math.round(displaySpeed)} Knots`;
      break;
    default: // KMH
      displaySpeed = speed * 3.6;
      elements.speed.innerText = `${Math.round(displaySpeed)} KMH`;
      break;
  }

  updateSpeedMeter(displaySpeed, 300);
}

/* ----------------------------- FUEL ----------------------------- */
function updateFuelMeter(level, maxLevel = 100) {
  const path = document.querySelector('.fuel path');
  if (!path) return;

  const total = path.getTotalLength() || 340;
  const clamped = Math.max(0, Math.min(level, maxLevel));
  const offset = total - (total * clamped) / maxLevel;

  path.style.strokeDashoffset = offset;

  // ubah warna jika fuel rendah
  path.setAttribute("stroke", clamped <= 15 ? "#FFCC00" : "#F43E5F");
}

let currentFuel = 0;
function animateFuelTo(targetLevel, duration = 300, maxLevel = 100) {
  const startLevel = currentFuel;
  const change = targetLevel - startLevel;
  currentFuel = targetLevel;
  const startTime = performance.now();

  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const current = startLevel + change * t;
    updateFuelMeter(current, maxLevel);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function setFuel(fuel) {
  // support input 0–1 atau 0–100
  const value = fuel <= 1 ? fuel * 100 : fuel;
  animateFuelTo(value, 400, 100);
}


/* ----------------------------- ENGINE HEALTH ----------------------------- */
function updateEngineMeter(level, maxLevel = 100) {
  const path = document.querySelector('.engine path') || null;
  if (!path) return;

  const total = path.getTotalLength() || 345;
  const clamped = Math.max(0, Math.min(level, maxLevel));
  const offset = total - (total * clamped) / maxLevel;
  path.style.strokeDashoffset = offset;

  if (clamped <= maxLevel * 0.15) {
    path.setAttribute("stroke", "#FF002E");
  } else {
    path.setAttribute("stroke", "white");
  }
}

function animateEngineTo(targetLevel, duration = 300, maxLevel = 100) {
  const startLevel = currentEngine;
  const change = targetLevel - startLevel;
  currentEngine = targetLevel;
  const startTime = performance.now();

  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const value = startLevel + change * t;
    updateEngineMeter(value, maxLevel);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function setHealth(health) {
  const pct = Math.max(0, Math.min(1, Number(health) || 0)) * 100;
  animateEngineTo(pct, 400, 100);
}

/* ----------------------------- RPM ----------------------------- */
function setRPM(rpm) {
  const rpmPercent = Math.min(Math.max(rpm, 0), 1) * 100;
  const path = document.querySelector('.engine path');
  if (path) path.style.strokeDashoffset = 345 - 345 * (rpmPercent / 100);
  if (elements.rpm) elements.rpm.innerText = `${Math.round(rpmPercent)}%`;
}

/* ----------------------------- GEARS, LIGHTS, SEATBELT ----------------------------- */
function setGear(gear) {
  if (elements.gear) elements.gear.innerText = String(gear);
}

function setHeadlights(state) {
  if (!elements.headlights) return;
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
      elements.headlights.classList.remove("active", "highBeam");
  }
}

function setSeatbelts(state) {
  if (!elements.seatbelts) return;
  elements.seatbelts.innerText = onOrOff(state);
  elements.seatbelts.classList.toggle("active", state);
}

function setLeftIndicator(state) {
  indicators = (indicators & 0b10) | (state ? 0b01 : 0b00);
  if (elements.indicators)
    elements.indicators.innerText = `${indicators & 0b01 ? "On" : "Off"} / ${
      indicators & 0b10 ? "On" : "Off"
    }`;
}

function setRightIndicator(state) {
  indicators = (indicators & 0b01) | (state ? 0b10 : 0b00);
  if (elements.indicators)
    elements.indicators.innerText = `${indicators & 0b01 ? "On" : "Off"} / ${
      indicators & 0b10 ? "On" : "Off"
    }`;
}

function setEngine(state) {
  if (elements.engine) elements.engine.innerText = onOrOff(state);
}

function setSpeedMode(mode) {
  speedMode = mode;
  if (!elements.speedMode) return;
  elements.speedMode.innerText =
    mode === 1 ? "MPH" : mode === 2 ? "Knots" : "KMH";
}

/* ----------------------------- INIT ----------------------------- */
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

  // Optional: default mode
  setSpeedMode(0);
});

/* ----------------------------- RAGE MP HOOKS ----------------------------- */
if (typeof mp !== "undefined") {
  mp.events.add("updateSpeed", setSpeed);
  mp.events.add("updateFuel", setFuel);
  mp.events.add("updateHealth", setHealth);
  mp.events.add("updateRPM", setRPM);
  mp.events.add("updateGear", setGear);
  mp.events.add("updateHeadlights", setHeadlights);
  mp.events.add("updateSeatbelt", setSeatbelts);
  mp.events.add("updateLeftIndicator", setLeftIndicator);
  mp.events.add("updateRightIndicator", setRightIndicator);
  mp.events.add("updateEngine", setEngine);
  mp.events.add("setSpeedMode", setSpeedMode);
}
