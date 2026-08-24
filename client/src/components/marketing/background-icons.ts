// Line-art icon library for BackgroundCanvas. Each function draws one
// automotive symbol, stroke-only, centered on (0,0) inside a roughly
// -10..10 unit box, using plain canvas primitives (no external icon set —
// lucide's icon set doesn't cover piston/tire-tread/shock-absorber/hex-bolt,
// and these are decorative at ~0.03-0.07 opacity, so hand-built geometry is
// both sufficient and dependency-free).

export type IconDrawFn = (ctx: CanvasRenderingContext2D) => void;

function wrench(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-6, 5);
  ctx.lineTo(4.5, -5.5);
  ctx.moveTo(-9, 8);
  ctx.arc(-7.5, 6.5, 2.1, Math.PI * 0.65, Math.PI * 1.65);
  ctx.moveTo(7, -8);
  ctx.arc(5.5, -6.5, 2.1, Math.PI * -0.35, Math.PI * 0.65);
  ctx.stroke();
}

function piston(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-4, -9);
  ctx.lineTo(4, -9);
  ctx.lineTo(4, -1);
  ctx.lineTo(2, 1);
  ctx.lineTo(2, 9);
  ctx.lineTo(-2, 9);
  ctx.lineTo(-2, 1);
  ctx.lineTo(-4, -1);
  ctx.closePath();
  ctx.moveTo(-4, -5.5);
  ctx.lineTo(4, -5.5);
  ctx.moveTo(-4, -2.5);
  ctx.lineTo(4, -2.5);
  ctx.stroke();
}

function brakeDisc(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.moveTo(3, 0);
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const x = Math.cos(a) * 6;
    const y = Math.sin(a) * 6;
    ctx.moveTo(x + 0.9, y);
    ctx.arc(x, y, 0.9, 0, Math.PI * 2);
  }
  ctx.stroke();
}

function tireTread(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  const r = 3;
  ctx.moveTo(-7, -9);
  ctx.lineTo(7, -9);
  ctx.arcTo(9, -9, 9, -7, r);
  ctx.lineTo(9, 7);
  ctx.arcTo(9, 9, 7, 9, r);
  ctx.lineTo(-7, 9);
  ctx.arcTo(-9, 9, -9, 7, r);
  ctx.lineTo(-9, -7);
  ctx.arcTo(-9, -9, -7, -9, r);
  ctx.closePath();
  for (let i = -6; i <= 6; i += 4) {
    ctx.moveTo(i - 1.5, -9);
    ctx.lineTo(i + 1.5, -5.5);
    ctx.moveTo(i - 1.5, 9);
    ctx.lineTo(i + 1.5, 5.5);
  }
  ctx.stroke();
}

function gear(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
  ctx.moveTo(2, 0);
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  const teeth = 8;
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const innerR = 5.5;
    const outerR = 8.2;
    const halfWidth = 0.55;
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    const ax = Math.cos(a) * innerR + nx * halfWidth;
    const ay = Math.sin(a) * innerR + ny * halfWidth;
    const bx = Math.cos(a) * outerR + nx * halfWidth;
    const by = Math.sin(a) * outerR + ny * halfWidth;
    const cx = Math.cos(a) * outerR - nx * halfWidth;
    const cy = Math.sin(a) * outerR - ny * halfWidth;
    const dx = Math.cos(a) * innerR - nx * halfWidth;
    const dy = Math.sin(a) * innerR - ny * halfWidth;
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.lineTo(dx, dy);
  }
  ctx.stroke();
}

function oilDrop(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.bezierCurveTo(5, -1, 6, 2.5, 6, 4);
  ctx.bezierCurveTo(6, 7.5, 3.3, 9.5, 0, 9.5);
  ctx.bezierCurveTo(-3.3, 9.5, -6, 7.5, -6, 4);
  ctx.bezierCurveTo(-6, 2.5, -5, -1, 0, -9);
  ctx.closePath();
  ctx.stroke();
}

function shockAbsorber(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(-2, -9);
  ctx.lineTo(2, -9);
  ctx.lineTo(2, -1);
  ctx.moveTo(-2, -9);
  ctx.lineTo(-2, -1);
  ctx.moveTo(-4, -1);
  ctx.lineTo(4, -1);
  ctx.lineTo(4, 9);
  ctx.lineTo(-4, 9);
  ctx.lineTo(-4, -1);
  for (let y = -7; y <= -2; y += 2.5) {
    ctx.moveTo(-5.5, y);
    ctx.lineTo(5.5, y);
  }
  ctx.stroke();
}

function battery(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.rect(-8, -5, 16, 10);
  ctx.moveTo(-3, -7.5);
  ctx.lineTo(-3, -5);
  ctx.moveTo(3, -7.5);
  ctx.lineTo(3, -5);
  ctx.rect(-4, -7.5, 2, 2.5);
  ctx.rect(2, -7.5, 2, 2.5);
  ctx.moveTo(-5.5, 0);
  ctx.lineTo(-2.5, 0);
  ctx.moveTo(-4, -1.5);
  ctx.lineTo(-4, 1.5);
  ctx.moveTo(3, 0);
  ctx.lineTo(6, 0);
  ctx.stroke();
}

function hexBolt(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * 8;
    const y = Math.sin(a) * 8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.moveTo(3, 0);
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.stroke();
}

function gauge(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.arc(0, 0, 8.5, Math.PI * 0.75, Math.PI * 0.25, false);
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI * 0.75 + (i / 6) * Math.PI * 1.5;
    const inner = 6.8;
    const outer = 8.5;
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
  }
  const needle = Math.PI * 1.15;
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(needle) * 6, Math.sin(needle) * 6);
  ctx.moveTo(1.3, 0);
  ctx.arc(0, 0, 1.3, 0, Math.PI * 2);
  ctx.stroke();
}

export const BACKGROUND_ICONS: IconDrawFn[] = [
  wrench,
  piston,
  brakeDisc,
  tireTread,
  gear,
  oilDrop,
  shockAbsorber,
  battery,
  hexBolt,
  gauge,
];
