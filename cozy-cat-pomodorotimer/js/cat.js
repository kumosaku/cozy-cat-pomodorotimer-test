// ── Blob Cat ──────────────────────────────────────────────────────────────
// 14 control points in polar coords, connected with Catmull-Rom spline.
// Ears at indices 9 & 12 (upper-left / upper-right in canvas space).
// Three stacked sine waves per point give organic, non-repeating motion.

export class BlobCat {
  constructor(cx, cy) {
    this.cx = cx;
    this.cy = cy;
    this.homeCY = cy;

    this.vx = 0;
    this.vy = 0;

    this.baseRadius = 100;
    this.ampScale = 1.0;      // multiplied onto wave amplitudes
    this._targetAmpScale = 1.0;
    this._pettingAt = 0;      // timestamp of last petting trigger

    this.action = 'idle';     // idle|stretch|flat|expand|small|bounce|spin|glow
    this._actionGlow = 0;     // extra glow for 'glow' action
    this._spinAngle = 0;

    this._initPoints();
  }

  // ── Setup ──────────────────────────────────────────────────────────────

  _initPoints() {
    const N = 14;
    // In canvas coords: 270° (= -π/2) is "up".
    // step = 2π/14. Ear positions:
    //   index 9  → 9 * (2π/14) ≈ 231°  (upper-left)
    //   index 12 → 12 * (2π/14) ≈ 309° (upper-right)
    const EAR = new Set([9, 12]);
    const CROWN = new Set([10, 11]);
    const CHEEK = new Set([8, 13]);
    const CHIN = new Set([4, 5, 6]);

    this.pts = [];
    for (let i = 0; i < N; i++) {
      const angle = (i / N) * Math.PI * 2;
      const isEar = EAR.has(i);

      let baseR = this.baseRadius;
      if (EAR.has(i))   baseR *= 1.42;
      else if (CROWN.has(i)) baseR *= 1.07;
      else if (CHEEK.has(i)) baseR *= 1.13;
      else if (CHIN.has(i))  baseR *= 0.91;

      this.pts.push({
        angle,
        baseR,
        // wave 1 – slow large swell
        a1: isEar ? 3  : 9  + Math.random() * 7,
        f1: 0.22 + Math.random() * 0.28,
        p1: Math.random() * Math.PI * 2,
        // wave 2 – medium ripple
        a2: isEar ? 2  : 5  + Math.random() * 4,
        f2: 0.55 + Math.random() * 0.38,
        p2: Math.random() * Math.PI * 2,
        // wave 3 – fast shimmer
        a3: isEar ? 1  : 2.5 + Math.random() * 2.5,
        f3: 1.0  + Math.random() * 0.6,
        p3: Math.random() * Math.PI * 2,
      });
    }
  }

  // ── Public API ──────────────────────────────────────────────────────────

  isMouseOver(mx, my) {
    const dx = mx - this.cx;
    const dy = my - this.cy;
    return (dx * dx + dy * dy) < (this.baseRadius * 1.4) ** 2;
  }

  triggerPetting() {
    this._pettingAt = Date.now();
  }

  setAction(action) {
    this.action = action;
    this._spinAngle = 0;
    if (action !== 'idle') this._targetAmpScale = 1.35;
  }

  // ── Per-frame update ────────────────────────────────────────────────────

  update(t, mouse) {
    const prevCX = this.cx;
    const prevCY = this.cy;

    // Mouse follow (only during non-bounce actions)
    const dx = mouse.x - this.cx;
    const dy = mouse.y - this.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (this.action === 'bounce') {
      // Override: cat bounces in place
      this.cy = this.homeCY + Math.sin(t * 4.5) * 48;
    } else if (dist > 18 && dist < 520) {
      const speed = 0.016;
      this.cx += dx * speed;
      this.cy += dy * speed;
    }

    // Clamp cat above the separator/button area
    const floorY = window.innerHeight - 136 - this.baseRadius - 30;
    this.cy = Math.min(this.cy, floorY);
    this.homeCY = Math.min(this.homeCY, floorY);

    // Spin accumulation
    if (this.action === 'spin') {
      this._spinAngle += 0.012;
    }

    // Velocity (for squash & stretch)
    this.vx = this.cx - prevCX;
    this.vy = this.cy - prevCY;

    // Amplitude scale – petting
    const msSincePet = Date.now() - this._pettingAt;
    this._targetAmpScale = msSincePet < 900 ? 2.8 : 1.0;
    this.ampScale += (this._targetAmpScale - this.ampScale) * 0.09;

    // Glow scale for 'glow' action
    if (this.action === 'glow') {
      this._actionGlow = 20 + Math.sin(t * 2) * 10;
    } else {
      this._actionGlow = 0;
    }
  }

  // ── Drawing ─────────────────────────────────────────────────────────────

  draw(ctx, t) {
    ctx.save();

    // Spin: rotate canvas around cat center
    if (this.action === 'spin' && this._spinAngle > 0) {
      ctx.translate(this.cx, this.cy);
      ctx.rotate(this._spinAngle);
      ctx.translate(-this.cx, -this.cy);
    }

    // Blob outline
    const pts = this._computePoints(t);
    const glowIntensity = 13 + this._actionGlow + (this.ampScale > 1.5 ? 8 : 0);

    ctx.shadowBlur = glowIntensity;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.55)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    _drawCatmullRomClosed(ctx, pts);
    ctx.stroke();

    ctx.restore();

    // Eyes & whiskers (outside spin transform for stability)
    this._drawEyes(ctx);
    this._drawWhiskers(ctx);
  }

  // ── Internals ───────────────────────────────────────────────────────────

  _computePoints(t) {
    const velocity = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const moveAngle = Math.atan2(this.vy, this.vx);

    return this.pts.map((p) => {
      // Sum of three sine waves
      let r = p.baseR
        + p.a1 * Math.sin(p.f1 * t + p.p1) * this.ampScale
        + p.a2 * Math.sin(p.f2 * t + p.p2) * this.ampScale
        + p.a3 * Math.sin(p.f3 * t + p.p3) * this.ampScale;

      // Action modifiers
      r += this._actionRadius(p.angle, t);

      // Squash & stretch from movement velocity
      if (velocity > 0.3) {
        const align = Math.cos(p.angle - moveAngle);
        r += align * Math.min(velocity * 14, 32);
      }

      return {
        x: this.cx + r * Math.cos(p.angle),
        y: this.cy + r * Math.sin(p.angle),
      };
    });
  }

  _actionRadius(angle, t) {
    switch (this.action) {
      case 'stretch':
        return Math.sin(angle) * -60;
      case 'flat':
        return Math.cos(angle) * 70;
      case 'expand':
        return 50;
      case 'small':
        return -45;
      case 'glow':
        return 10;
      case 'bounce':
        return Math.abs(Math.sin(t * 4.5)) * -20;
      default:
        return 0;
    }
  }

  _drawEyes(ctx) {
    ctx.save();
    const ex = 21;
    const ey = this.cy - 20;   // above cat center
    const petting = this.ampScale > 2;

    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(255,255,255,0.5)';

    if (petting) {
      // Happy squint: small upward arc
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      [this.cx - ex, this.cx + ex].forEach((x) => {
        ctx.beginPath();
        ctx.arc(x, ey, 5, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      });
    } else {
      // Open eyes: small filled dots
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      [this.cx - ex, this.cx + ex].forEach((x) => {
        ctx.beginPath();
        ctx.arc(x, ey, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();
  }

  _drawWhiskers(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 3;
    ctx.shadowColor = 'rgba(255,255,255,0.25)';

    const ox = this.cx;
    const oy = this.cy - 8;
    const whiskers = [
      // left side
      [ox - 16, oy - 4,  ox - 64, oy - 10],
      [ox - 16, oy,      ox - 66, oy],
      [ox - 16, oy + 6,  ox - 62, oy + 13],
      // right side
      [ox + 16, oy - 4,  ox + 64, oy - 10],
      [ox + 16, oy,      ox + 66, oy],
      [ox + 16, oy + 6,  ox + 62, oy + 13],
    ];
    whiskers.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
    ctx.restore();
  }
}

// ── Catmull-Rom closed spline → Canvas bezierCurveTo ──────────────────────
function _drawCatmullRomClosed(ctx, pts) {
  const n = pts.length;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    // Uniform Catmull-Rom → Bezier (tension = 0.5 → divide by 6)
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    if (i === 0) ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  ctx.closePath();
}
