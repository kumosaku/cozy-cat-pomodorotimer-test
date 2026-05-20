import { FOCUS_DURATION, BREAK_DURATION, MAX_POMODOROS } from './config.js';

export class Timer {
  constructor() {
    this._reset();
  }

  _reset() {
    this.phase = 'idle';      // idle | focus | break | done
    this.pomodoroCount = 0;   // increments at each focus→break transition (1〜7)
    this.elapsed = 0;         // seconds accumulated before last pause
    this.startTime = null;    // Date.now() when last started
    this.isRunning = false;
  }

  get phaseDuration() {
    return this.phase === 'break' ? BREAK_DURATION : FOCUS_DURATION;
  }

  get remaining() {
    if (this.phase === 'idle' || this.phase === 'done') return 0;
    const total = this.elapsed + (this.isRunning ? (Date.now() - this.startTime) / 1000 : 0);
    return Math.max(0, this.phaseDuration - total);
  }

  formatTime() {
    const r = this.remaining;
    const m = Math.floor(r / 60);
    const s = Math.floor(r % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  start() {
    if (this.phase === 'idle') this.phase = 'focus';
    if (!this.isRunning && this.phase !== 'done') {
      this.startTime = Date.now();
      this.isRunning = true;
    }
  }

  pause() {
    if (this.isRunning) {
      this.elapsed += (Date.now() - this.startTime) / 1000;
      this.isRunning = false;
    }
  }

  hardReset() {
    this._reset();
  }

  // Manually jump from focus → break (counts current focus as completed)
  forceBreak() {
    if (this.phase !== 'focus') return;
    this.pomodoroCount++;
    this.phase = 'break';
    this.elapsed = 0;
    this.startTime = Date.now();
    this.isRunning = true;
  }

  // Call every frame. Returns 'focus_end' | 'break_end' | null
  tick() {
    if (!this.isRunning || this.phase === 'idle' || this.phase === 'done') return null;
    if (this.remaining <= 0) {
      const event = this.phase === 'focus' ? 'focus_end' : 'break_end';
      this._advance();
      return event;
    }
    return null;
  }

  _advance() {
    this.elapsed = 0;
    this.startTime = Date.now();

    if (this.phase === 'focus') {
      this.pomodoroCount++;          // 1〜7
      this.phase = 'break';
    } else {
      // break → next focus or done
      if (this.pomodoroCount >= MAX_POMODOROS) {
        this.phase = 'done';
        this.isRunning = false;
      } else {
        this.phase = 'focus';
      }
    }
  }
}
