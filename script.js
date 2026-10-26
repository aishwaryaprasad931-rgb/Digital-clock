javascript
// ---------------- LIVE DIGITAL CLOCK ----------------

let is24Hour = false;

function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const period = hours >= 12 ? "PM" : "AM";

    document.getElementById("period").textContent =
        is24Hour ? "24-hour format" : period;

    if (!is24Hour) {
        hours = hours % 12 || 12;
    }

    const displayHours = String(hours).padStart(2, "0");

    document.getElementById("time").textContent =
        `${displayHours}:${minutes}:${seconds}`;

    document.getElementById("day").textContent =
        now.toLocaleDateString("en-IN", { weekday: "long" });

    document.getElementById("date").textContent =
        now.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    checkAlarm(now);
}

document.getElementById("formatBtn").addEventListener("click", () => {
    is24Hour = !is24Hour;

    document.getElementById("formatBtn").textContent =
        is24Hour ? "Switch to 12-hour" : "Switch to 24-hour";

    updateClock();
});

setInterval(updateClock, 1000);
updateClock();


// ---------------- DARK / LIGHT MODE ----------------

document.getElementById("themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark");

    document.getElementById("themeBtn").textContent =
        document.body.classList.contains("dark")
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";
});


// ---------------- STOPWATCH ----------------

let elapsed = 0;
let startedAt = 0;
let watchInterval = null;

function renderStopwatch() {
    let total = elapsed;

    if (watchInterval !== null) {
        total += performance.now() - startedAt;
    }

    const centiseconds = Math.floor(total / 10) % 100;
    const totalSeconds = Math.floor(total / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    document.getElementById("stopwatch").textContent =
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}.` +
        `${String(centiseconds).padStart(2, "0")}`;
}

document.getElementById("startWatch").addEventListener("click", () => {
    if (watchInterval !== null) return;

    startedAt = performance.now();

    watchInterval = setInterval(renderStopwatch, 30);
    renderStopwatch();
});

document.getElementById("pauseWatch").addEventListener("click", () => {
    if (watchInterval === null) return;

    elapsed += performance.now() - startedAt;

    clearInterval(watchInterval);
    watchInterval = null;

    renderStopwatch();
});

document.getElementById("resetWatch").addEventListener("click", () => {
    clearInterval(watchInterval);
    watchInterval = null;
    elapsed = 0;
    startedAt = 0;

    renderStopwatch();
});


// ---------------- ALARM ----------------

let alarmTimestamp = null;
let alarmTriggered = false;
let audioContext = null;

const alarmInput = document.getElementById("alarmTime");
const alarmStatus = document.getElementById("alarmStatus");

document.getElementById("setAlarm").addEventListener("click", () => {
    if (!alarmInput.value) {
        alarmStatus.textContent = "Please select an alarm time.";
        return;
    }

    const [hours, minutes] = alarmInput.value.split(":").map(Number);
    const now = new Date();
    const target = new Date(now);

    target.setHours(hours, minutes, 0, 0);

    // If the selected time has already passed, set the alarm for tomorrow.
    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }

    alarmTimestamp = target.getTime();
    alarmTriggered = false;

    alarmStatus.textContent =
        "Alarm set for " + target.toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        }) + (target.getDate() !== now.getDate() ? " tomorrow." : ".");
});

document.getElementById("cancelAlarm").addEventListener("click", () => {
    alarmTimestamp = null;
    alarmTriggered = false;
    alarmStatus.textContent = "Alarm cancelled.";
});

function checkAlarm(now) {
    if (
        alarmTimestamp !== null &&
        !alarmTriggered &&
        now.getTime() >= alarmTimestamp
    ) {
        alarmTriggered = true;
        alarmTimestamp = null;

        alarmStatus.textContent = "⏰ ALARM! Time to wake up!";

        playAlarmSound();
        alert("⏰ Your alarm is ringing!");
    }
}

function playAlarmSound() {
    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        if (!audioContext) {
            audioContext = new AudioContextClass();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        gain.gain.value = 0.2;

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();

        setTimeout(() => {
            oscillator.stop();
            oscillator.disconnect();
            gain.disconnect();
        }, 1500);
    } catch (error) {
        console.error("Could not play alarm sound:", error);
    }
}

