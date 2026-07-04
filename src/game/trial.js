import { createTrustToken } from './token.js';

const MOVES = {
  speed: {
    label: 'Speed',
    insight: 3,
    stability: -1,
    pressure: 2,
    log: 'You accelerate delivery. The council cheers until the system starts to flex.'
  },
  reliability: {
    label: 'Reliability',
    insight: 1,
    stability: 3,
    pressure: -2,
    log: 'You reinforce the platform. The visible progress slows, but the foundation stops shaking.'
  },
  innovation: {
    label: 'Innovation',
    insight: 4,
    stability: -2,
    pressure: 3,
    log: 'You awaken a new capability. It glows beautifully and immediately demands governance.'
  },
  governance: {
    label: 'Governance',
    insight: 2,
    stability: 2,
    pressure: -1,
    log: 'You force the decision through a clear operating model. The room gets quieter. Good.'
  }
};

export class ArchitectsTrial {
  constructor({ onUpdate, onReveal }) {
    this.onUpdate = onUpdate;
    this.onReveal = onReveal;
    this.reset();
  }

  reset() {
    this.turn = 0;
    this.insight = 0;
    this.stability = 9;
    this.pressure = 0;
    this.complete = false;
    this.failed = false;
    this.token = null;
    this.log = 'The vault waits. Balance speed, reliability, innovation, and governance.';
    this.onUpdate?.(this.snapshot());
  }

  async choose(moveId) {
    if (this.complete || this.failed) return;
    const move = MOVES[moveId];
    if (!move) return;
    this.turn += 1;
    this.insight += move.insight;
    this.stability += move.stability;
    this.pressure += move.pressure;

    if (this.turn % 3 === 0) {
      this.pressure += 1;
      this.log = `${move.log} A stakeholder escalation adds pressure.`;
    } else {
      this.log = move.log;
    }

    if (this.pressure >= 11 || this.stability <= 0) {
      this.failed = true;
      this.log = 'The system buckles. The vault does not punish ambition; it punishes imbalance. Reset and try again.';
    }

    if (this.insight >= 16 && this.stability > 0 && this.pressure < 11) {
      this.complete = true;
      const token = await createTrustToken({ score: this.insight + this.stability - this.pressure, turns: this.turn, insight: this.insight, stability: this.stability, pressure: this.pressure });
      this.token = token.token;
      this.log = 'The vault opens. Access was earned through balance, not luck.';
      this.onReveal?.(this.snapshot());
    }

    this.onUpdate?.(this.snapshot());
  }

  snapshot() {
    return {
      turn: this.turn,
      insight: this.insight,
      stability: this.stability,
      pressure: this.pressure,
      complete: this.complete,
      failed: this.failed,
      token: this.token,
      log: this.log,
      moves: MOVES
    };
  }
}

export function renderContactGlyphs(canvas, token = '', contact = null) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#09111f');
  gradient.addColorStop(1, '#02050a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(242,199,109,.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, w - 36, h - 36);
  ctx.strokeStyle = 'rgba(126,231,255,.22)';
  for (let x = 42; x < w - 42; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 30 + Math.sin(x) * 6);
    ctx.lineTo(x + 12, h - 30 + Math.cos(x) * 6);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(0, Math.sin(Date.now() / 400) * 2);
  ctx.font = '700 24px Georgia';
  ctx.fillStyle = '#f2c76d';
  ctx.fillText('CONTACT SEAL UNLOCKED', 52, 72);

  // Canvas drawn contact values. Replace these in deployment if desired.
  const email = contact?.email || 'cmajeff@gmail.com';
  const phone = contact?.phone || 'available on request';
  drawDistorted(ctx, email, 54, 132, 34, '#eafcff');
  drawDistorted(ctx, phone, 54, 186, 24, '#9fefff');
  ctx.font = '12px ui-monospace, monospace';
  ctx.fillStyle = 'rgba(234,252,255,.44)';
  ctx.fillText(`trust token: ${token || 'local-seal'}`, 54, 226);
  ctx.restore();
}

function drawDistorted(ctx, text, x, y, size, color) {
  ctx.font = `800 ${size}px Georgia`;
  ctx.fillStyle = color;
  [...text].forEach((ch, i) => {
    const dx = x + i * size * 0.55;
    const dy = y + Math.sin(i * 1.7) * 2;
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(Math.sin(i) * 0.015);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
}
