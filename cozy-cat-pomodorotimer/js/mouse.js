export class MouseTracker {
  constructor() {
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;
    this._prevX = this.x;
    this._prevY = this.y;
    this.speed = 0;

    // Listen on window so pointer-events:none on canvas doesn't block tracking
    window.addEventListener('mousemove', (e) => {
      this._prevX = this.x;
      this._prevY = this.y;
      this.x = e.clientX;
      this.y = e.clientY;
      const dx = this.x - this._prevX;
      const dy = this.y - this._prevY;
      this.speed = Math.sqrt(dx * dx + dy * dy);
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      this._prevX = this.x;
      this._prevY = this.y;
      this.x = t.clientX;
      this.y = t.clientY;
      const dx = this.x - this._prevX;
      const dy = this.y - this._prevY;
      this.speed = Math.sqrt(dx * dx + dy * dy);
    }, { passive: true });
  }

  // Call each frame. Triggers petting on cat if conditions met.
  checkPetting(cat) {
    if (this.speed > 4 && cat.isMouseOver(this.x, this.y)) {
      cat.triggerPetting();
    }
    // Decay speed so it doesn't stay "fast" forever
    this.speed *= 0.85;
  }
}
