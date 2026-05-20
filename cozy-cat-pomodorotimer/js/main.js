import { Timer }       from './timer.js';
import { BlobCat }     from './cat.js';
import { MouseTracker } from './mouse.js';
import { UI }          from './ui.js';
import { BREAK_DATA, DONE_TEXT, CAT_CLICK_LINES, MID_BREAK_LINES } from './config.js';

// ── Canvas setup ────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const dpr    = window.devicePixelRatio || 1;

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = `${w}px`;
  canvas.style.height = `${h}px`;
  // Reset transform each resize to avoid stacking scales
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cat.cx     = w / 2;
  cat.cy     = h * 0.57;
  cat.homeCY = cat.cy;
}

// ── Core objects ─────────────────────────────────────────────────────────────
const timer  = new Timer();
const cat    = new BlobCat(window.innerWidth / 2, window.innerHeight * 0.57);
const mouse  = new MouseTracker();
const ui     = new UI();

// ── Event wiring ─────────────────────────────────────────────────────────────
ui.focusBtn.addEventListener('click', () => {
  if (timer.phase !== 'focus' && timer.phase !== 'idle') return;
  timer.isRunning ? timer.pause() : timer.start();
});

ui.breakBtn.addEventListener('click', () => {
  if (timer.phase === 'focus') {
    timer.forceBreak();
    const data = BREAK_DATA[timer.pomodoroCount - 1];
    cat.setAction(data?.action ?? 'idle');
    setTimeout(() => {
      ui.showBubble(data?.text ?? '', cat.cx, cat.cy, cat.baseRadius, 4500);
    }, 600);
    _startMidBreakInterval();
  } else if (timer.phase === 'break') {
    timer.isRunning ? timer.pause() : timer.start();
  }
});

ui.resetBtn.addEventListener('click', () => {
  clearInterval(_midBreakInterval);
  _midBreakInterval = null;
  timer.hardReset();
  cat.setAction('idle');
  cat.ampScale = 1.0;
  ui.hideBubble();
  ui.update(timer);
});

window.addEventListener('resize', resize);

document.addEventListener('click', (e) => {
  if (e.target.closest('button')) return;
  if (cat.isMouseOver(e.clientX, e.clientY)) {
    const line = CAT_CLICK_LINES[Math.floor(Math.random() * CAT_CLICK_LINES.length)];
    ui.showBubble(line, cat.cx, cat.cy, cat.baseRadius, 2200);
    cat.triggerPetting();
  }
});

// ── Mid-break random speech ──────────────────────────────────────────────────
let _midBreakTimer = null;

function _startMidBreakInterval() {
  clearTimeout(_midBreakTimer);
  function _schedule() {
    const delay = 3000 + Math.random() * 5000;
    _midBreakTimer = setTimeout(() => {
      if (timer.phase !== 'break') return;
      const mid = MID_BREAK_LINES[Math.floor(Math.random() * MID_BREAK_LINES.length)];
      ui.showBubble(mid, cat.cx, cat.cy, cat.baseRadius, 4000);
      _schedule();
    }, delay);
  }
  _schedule();
}

// ── Main loop ────────────────────────────────────────────────────────────────
let tSec    = 0;
let lastTs  = null;

function loop(timestamp) {
  if (lastTs === null) lastTs = timestamp;
  const dt = Math.min((timestamp - lastTs) / 1000, 0.1); // cap at 100ms
  lastTs = timestamp;
  tSec += dt;

  // Clear (DPR-scaled ctx already set up)
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // ── Timer tick & events ─────────────────────────────────────────────────
  const event = timer.tick();

  if (event === 'focus_end') {
    const data = BREAK_DATA[timer.pomodoroCount - 1];
    cat.setAction(data?.action ?? 'idle');
    setTimeout(() => {
      ui.showBubble(data?.text ?? '', cat.cx, cat.cy, cat.baseRadius, 4500);
    }, 1000);
    _startMidBreakInterval();
  }

  if (event === 'break_end') {
    clearTimeout(_midBreakTimer);
    _midBreakTimer = null;
    cat.setAction('idle');
    if (timer.phase === 'done') {
      setTimeout(() => {
        ui.showBubble(DONE_TEXT, cat.cx, cat.cy, cat.baseRadius, 6000);
      }, 400);
    }
  }

  // ── Mouse & cat update ──────────────────────────────────────────────────
  mouse.checkPetting(cat);
  cat.update(tSec, mouse);
  cat.draw(ctx, tSec);

  // ── DOM update ──────────────────────────────────────────────────────────
  ui.update(timer);

  requestAnimationFrame(loop);
}

// ── Init ─────────────────────────────────────────────────────────────────────
resize();
requestAnimationFrame(loop);
