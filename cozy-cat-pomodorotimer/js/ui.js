import { MAX_POMODOROS } from './config.js';

export class UI {
  constructor() {
    this.timeEl        = document.getElementById('time');
    this.labelEl       = document.getElementById('phase-label');
    this.dotsEl        = document.getElementById('pomodoro-dots');
    this.breakEl       = document.getElementById('break-overlay');
    this.bubbleEl      = document.getElementById('speech-bubble');
    this.focusBtn      = document.getElementById('btn-focus');
    this.resetBtn      = document.getElementById('btn-reset');
    this.breakBtn      = document.getElementById('btn-break');

    this._bubbleTimer  = null;
    this._buildDots();
  }

  _buildDots() {
    this.dotsEl.innerHTML = '';
    for (let i = 0; i < MAX_POMODOROS; i++) {
      const d = document.createElement('div');
      d.className = 'dot';
      this.dotsEl.appendChild(d);
    }
  }

  // ── Called every frame ──────────────────────────────────────────────────

  update(timer) {
    // Timer digits
    if (timer.phase === 'idle') {
      this.timeEl.textContent = '25:00';
    } else if (timer.phase === 'done') {
      this.timeEl.textContent = '完了';
    } else {
      this.timeEl.textContent = timer.formatTime();
    }

    // Phase label
    if (timer.phase === 'break') {
      this.labelEl.innerHTML = '<strong>脳のリラックスタイム</strong><br><span class="break-big">5分休憩中</span>';
    } else {
      const labels = { idle: 'STANDBY', focus: '集中', done: '完了' };
      this.labelEl.textContent = labels[timer.phase] ?? '';
    }

    // Pomodoro dots
    const dots = this.dotsEl.querySelectorAll('.dot');
    dots.forEach((d, i) => {
      d.classList.toggle('done', i < timer.pomodoroCount);
    });

    // 集中ボタン
    const inFocus = timer.phase === 'focus';
    const inIdle  = timer.phase === 'idle' || timer.phase === 'done';
    this.focusBtn.textContent = (inFocus && timer.isRunning) ? '集中ストップ' : '集中スタート';
    this.focusBtn.disabled = !(inFocus || inIdle);

    // 休憩ボタン（focus中も手動切り替え可能）
    const inBreak = timer.phase === 'break';
    this.breakBtn.textContent = (inBreak && timer.isRunning) ? '休憩ストップ' : '休憩スタート';
    this.breakBtn.disabled = !(inBreak || inFocus);

    // やり直しボタン
    this.resetBtn.textContent = 'やり直し';
  }

  // ── Speech bubble ───────────────────────────────────────────────────────

  // catX, catY: canvas-space center of cat (CSS pixels)
  showBubble(text, catX, catY, radius, ms = 3200) {
    clearTimeout(this._bubbleTimer);
    this.bubbleEl.textContent = text;
    this.bubbleEl.style.left = `${catX}px`;
    this.bubbleEl.style.top  = `${catY - radius - 10}px`;
    this.bubbleEl.classList.add('visible');
    this._bubbleTimer = setTimeout(() => this.bubbleEl.classList.remove('visible'), ms);
  }

  hideBubble() {
    clearTimeout(this._bubbleTimer);
    this.bubbleEl.classList.remove('visible');
  }
}
