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
  gradient.addColorStop(0.55, '#071426');
  gradient.addColorStop(1, '#02050a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(242,199,109,.65)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, w - 36, h - 36);
  ctx.strokeStyle = 'rgba(126,231,255,.22)';
  ctx.strokeRect(30, 30, w - 60, h - 60);

  for (let x = 470; x < w - 40; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 42 + Math.sin(x) * 6);
    ctx.lineTo(x + 10, h - 42 + Math.cos(x) * 6);
    ctx.stroke();
  }

  const email = contact?.email || 'cmajeff@gmail.com';
  const phone = contact?.phone || 'available on request';
  const linkedin = contact?.linkedin || 'LinkedIn profile available from Jeff Barnes';

  ctx.font = '700 18px ui-sans-serif, system-ui, Segoe UI, sans-serif';
  ctx.fillStyle = '#f2c76d';
  ctx.fillText('CONTACT UNLOCKED', 52, 62);

  ctx.font = '800 34px Georgia, serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Jeff Barnes', 52, 108);

  ctx.font = '700 18px ui-sans-serif, system-ui, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(234,252,255,.72)';
  ctx.fillText('Business Intelligence • Data Engineering • AI • Healthcare Analytics', 52, 139);

  drawContactRow(ctx, 'EMAIL', email, 52, 184, '#eafcff');
  drawContactRow(ctx, 'PHONE', phone, 52, 221, '#9fefff');

  ctx.font = '600 12px ui-monospace, SFMono-Regular, Consolas, monospace';
  ctx.fillStyle = 'rgba(234,252,255,.46)';
  ctx.fillText(`trust token: ${token || 'local-seal'}`, 52, 246);

  ctx.font = '600 12px ui-sans-serif, system-ui, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(242,199,109,.72)';
  ctx.fillText(linkedin, 430, 246);
}

function drawContactRow(ctx, label, value, x, y, color) {
  ctx.font = '700 12px ui-sans-serif, system-ui, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(242,199,109,.84)';
  ctx.fillText(label, x, y - 21);
  ctx.font = '800 26px ui-sans-serif, system-ui, Segoe UI, sans-serif';
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}
