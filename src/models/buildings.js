// Procedural buildings per district. Local frame: the facade is at x = 0 facing +x,
// the body extends toward -x, and the building is centred on z (width along z).
// Returns { group, w } — w is the frontage width along the road.
import { Builder, pick, rand, randi } from '../render/kit.js';
import { signUV, neonUV, SHOPS, NEON } from '../render/textures.js';
import { posters } from './posters.js';
import { portBlock, parkSegment } from './landmarks.js';

const FACE = Math.PI / 2; // rotate a +z plane to face +x

function shopFront(b, w, d, district) {
  const shutterCol = pick([0x8a8f96, 0x6b7078, 0x9aa0a8]);
  const n = Math.max(1, Math.floor(w / 3.6));
  const sw = w / n;
  for (let i = 0; i < n; i++) {
    const z = -w / 2 + sw * (i + 0.5);
    const open = Math.random() < 0.7;
    if (open) {
      b.box(0.1, 2.4, sw - 0.5, 0x2a2018, 0.02, 1.3, z);                     // dark interior
      b.box(0.5, 0.8, sw - 0.8, pick([0xd9a52a, 0xc23b22, 0x3f8f2f, 0xe8e2d0]), 0.25, 0.4, z); // goods
      b.box(0.08, 0.12, sw - 0.6, 0xfff0c8, 0.05, 2.45, z, { kind: 'glow' });  // tube light
    } else {
      for (let k = 0; k < 8; k++) b.box(0.06, 0.28, sw - 0.5, shutterCol, 0.04, 0.3 + k * 0.3, z, { kind: 'shiny' });
    }
    // striped awning
    const ac = pick(district.wood);
    for (let k = 0; k < 4; k++) b.box(0.32, 0.05, sw - 0.2, k % 2 ? ac : 0xf5f0e6, 0.25 + k * 0.3, 2.95 - k * 0.07, z);
    // shop sign
    b.plane(sw - 0.4, 0.62, 'sign', 0xffffff, [0.07, 3.45, z], [0, FACE, 0], { uv: signUV(randi(0, SHOPS.length - 1)) });
  }
}

function oldCity(district) {
  const b = new Builder();
  const w = rand(7, 12), floors = randi(2, 4), fh = 3.2, d = rand(7, 10);
  const h = 3.8 + floors * fh;
  const wall = pick(district.walls);
  b.box(d, 3.8, w, wall, -d / 2, 1.9, 0);
  b.box(d, floors * fh, w, wall, -d / 2, 3.8 + (floors * fh) / 2, 0, { kind: 'facade' });
  shopFront(b, w, d, district);
  if (Math.random() < 0.7) posters(b, w, 4.6);
  // paan ki peek in the corners — every Karachi wall has it
  for (let i = 0, n = randi(1, 3); i < n; i++) { const z = Math.random() < 0.5 ? -w / 2 + 0.4 : w / 2 - 0.4; b.plane(rand(0.6, 1.1), rand(0.6, 1.1), 'stain', 0xffffff, [0.09 + i * 0.002, rand(0.3, 0.9), z + rand(-0.2, 0.2)], [0, FACE, rand(0, 6)]); }
  b.box(0.3, 0.2, w + 0.1, 0xf5f0e6, 0.1, 3.8, 0);
  // jharokas (wooden balconies)
  const wood = pick(district.wood);
  const nb = Math.max(1, Math.floor(w / 4.5));
  for (let f = 0; f < floors; f++) {
    if (Math.random() < 0.35) continue;
    for (let i = 0; i < nb; i++) {
      const z = -w / 2 + (w / nb) * (i + 0.5);
      const y = 3.8 + f * fh + 1.2;
      b.box(0.9, 0.15, 2.0, wood, 0.45, y - 0.9, z);
      b.box(0.85, 1.4, 1.9, wood, 0.42, y, z);
      b.box(0.05, 0.9, 1.4, 0x26323e, 0.86, y + 0.1, z, { kind: 'glass' });
      b.box(1.1, 0.12, 2.3, wood, 0.48, y + 0.82, z, { r: [0, 0, -0.25] });
      for (let k = 0; k < 4; k++) b.box(0.06, 0.06, 0.06, 0xffd60a, 0.9, y - 0.75, z - 0.75 + k * 0.5, { kind: 'shiny' });
    }
  }
  // parapet + roof clutter
  b.box(d, 0.6, w, wall, -d / 2, h + 0.3, 0);
  b.box(0.3, 0.12, w + 0.2, 0xf5f0e6, 0.05, h + 0.62, 0);
  if (Math.random() < 0.6) b.cyl(0.6, 0.6, 1.1, pick([0x111111, 0x1565c0, 0xf2f2f2]), -d * 0.6, h + 1.15, rand(-w / 3, w / 3), { seg: 10 });
  if (Math.random() < 0.35) {
    // small chhatri (domed kiosk)
    const z = rand(-w / 4, w / 4);
    for (const dx of [-0.8, 0.8]) for (const dz of [-0.8, 0.8]) b.box(0.15, 1.4, 0.15, 0xf5f0e6, -2 + dx, h + 1.3, z + dz);
    b.box(2, 0.2, 2, 0xf5f0e6, -2, h + 2.05, z);
    b.sphere(1.0, 0xf5f0e6, -2, h + 2.1, z, { seg: 10, half: true });
    b.cone(0.1, 0.5, 0xffc93c, -2, h + 3.3, z, { kind: 'shiny' });
  }
  if (Math.random() < 0.5) b.box(0.05, 0.05, rand(1, 2), 0x777777, -d * 0.3, h + 1.8, 0, { r: [0.4, 0, 0] }); // antenna
  // laundry line across the front
  if (Math.random() < 0.4) {
    const y = 3.8 + randi(0, floors - 1) * fh + 2.6;
    b.box(0.02, 0.02, w * 0.8, 0x333333, 0.6, y, 0);
    for (let i = 0; i < 6; i++) b.box(0.04, rand(0.4, 0.7), rand(0.3, 0.6), pick([0xe84a8a, 0x1fa2d6, 0xffd60a, 0xffffff, 0x2e9e5a]), 0.6, y - 0.35, -w * 0.35 + i * w * 0.14);
  }
  return { group: b.build(), w };
}

/** Pastel sea-facing apartment blocks with balconies and a cafe at street level. */
function seaFront(district) {
  const b = new Builder();
  const w = rand(10, 15), d = rand(9, 12);
  const floors = randi(3, 6), fh = 3.1, h = 3.6 + floors * fh;
  const wall = pick(district.walls);
  const accent = pick(district.wood);
  b.box(d, 3.6, w, 0xf5f5f0, -d / 2, 1.8, 0);
  b.box(0.08, 2.6, w - 1.2, 0x9fd8ff, 0.03, 1.5, 0, { kind: 'glass' });
  for (let k = 0; k < 5; k++) b.box(0.3, 0.05, w - 0.4, k % 2 ? accent : 0xffffff, 0.2 + k * 0.28, 3.3 - k * 0.07, 0);
  b.plane(Math.min(w - 2, 6), 0.6, 'sign', 0xffffff, [0.06, 3.85, 0], [0, FACE, 0], { uv: signUV(randi(0, SHOPS.length - 1)) });
  b.box(d, floors * fh, w, wall, -d / 2, 3.6 + (floors * fh) / 2, 0, { kind: 'facade' });
  for (let f = 0; f < floors; f++) {
    const y = 3.6 + f * fh + 0.2;
    b.box(1.1, 0.14, w - 1.2, 0xf0f0f0, 0.55, y, 0);
    b.box(0.05, 0.85, w - 1.2, accent, 1.08, y + 0.45, 0);
    if (Math.random() < 0.35) b.box(0.05, 0.6, rand(0.6, 1.2), pick([0xe84a8a, 0x1fa2d6, 0xffd60a, 0xffffff]), 1.0, y + 0.55, rand(-w / 3, w / 3));
  }
  b.box(d + 0.3, 0.4, w + 0.3, 0xf5f5f5, -d / 2, h + 0.2, 0);
  b.cyl(0.6, 0.6, 1.1, 0x1565c0, -d * 0.6, h + 0.95, rand(-w / 4, w / 4), { seg: 10 });
  if (Math.random() < 0.5) b.box(0.15, 0.15, 2.2, 0x777777, -d * 0.3, h + 1.3, 0, { r: [0.5, 0, 0] });
  return { group: b.build(), w };
}

function neonTower(district) {
  const b = new Builder();
  const w = rand(10, 16), d = rand(10, 16);
  const h = rand(14, 42);
  const wall = pick(district.walls);
  const glassy = Math.random() < 0.6;
  // podium with shop windows
  b.box(d, 4.5, w, 0x2a2e36, -d / 2, 2.25, 0);
  b.box(0.08, 3, w - 1, 0x9fd8ff, 0.02, 2, 0, { kind: 'glass' });
  const col = pick(district.neon);
  b.box(0.1, 0.12, w, col, 0.08, 4.4, 0, { kind: 'glow' });
  if (Math.random() < 0.5) posters(b, w, 1.4, 2);
  b.plane(Math.min(w - 2, 7), 1.4, 'neon', col, [0.12, 5.4, 0], [0, FACE, 0], { uv: neonUV(randi(0, NEON.length - 1)) });
  // tower
  const tw = w - rand(0, 3), td = d - rand(0, 3);
  b.box(td, h, tw, glassy ? 0x6f8fb0 : wall, -td / 2 - 0.5, 4.5 + h / 2, 0, { kind: 'facade' });
  // vertical neon strips on corners
  const strip = pick(district.neon);
  for (const s of [-1, 1]) b.box(0.12, h, 0.12, strip, -0.45, 4.5 + h / 2, s * (tw / 2 + 0.02), { kind: 'glow' });
  b.box(td + 0.4, 0.4, tw + 0.4, 0x2a2e36, -td / 2 - 0.5, 4.5 + h + 0.2, 0);
  b.box(0.1, 0.12, tw + 0.4, strip, -0.25, 4.5 + h + 0.2, 0, { kind: 'glow' });
  if (Math.random() < 0.6) {
    b.box(0.2, 5, 0.2, 0x888888, -td / 2, 4.5 + h + 2.5, 0);
    b.sphere(0.2, 0xff2020, -td / 2, 4.5 + h + 5.1, 0, { kind: 'glow', seg: 6 });
  }
  return { group: b.build(), w };
}

/** Saddar colonial: sandstone block with a shaded arcade over the shops, cornices and a little turret. */
function colonial(district) {
  const b = new Builder();
  const n = randi(3, 4), bay = rand(3.2, 3.8), w = n * bay, d = rand(8, 11);
  const floors = randi(1, 3), fh = 3.6, g = 4.6, h = g + floors * fh;
  const wall = pick(district.walls), trim = 0xf3e6c8, wood = pick(district.wood);
  const R = 1.6; // arcade depth: shops sit this far back from the pillars
  b.box(d - R, g, w, wall, -(d + R) / 2, g / 2, 0);
  for (let i = 0; i < n; i++) {
    const z = -w / 2 + bay * (i + 0.5);
    b.box(0.1, 2.6, bay - 0.6, 0x2a2018, -R + 0.02, 1.4, z);                                  // shop interior
    b.box(0.5, 0.8, bay - 0.9, pick([0xd9a52a, 0xc23b22, 0x3f8f2f, 0xe8e2d0, 0x8e244d]), -R + 0.3, 0.4, z);
    b.box(0.08, 0.1, bay - 0.8, 0xfff0c8, -R + 0.08, 2.85, z, { kind: 'glow' });
    b.plane(bay - 0.5, 0.6, 'sign', 0xffffff, [-R + 0.07, 3.35, z], [0, FACE, 0], { uv: signUV(randi(0, SHOPS.length - 1)) });
    b.torus(bay / 2 - 0.3, 0.16, trim, 0.05, g - 1.0 - (bay / 2 - 0.3), z, { r: [0, Math.PI / 2, 0], arc: Math.PI }); // arch
  }
  for (let i = 0; i <= n; i++) b.box(0.55, g, 0.55, trim, -0.25, g / 2, -w / 2 + i * bay);        // pillars
  b.box(R + 0.2, 0.25, w, 0xb8a27e, -R / 2, g - 0.05, 0);                                       // arcade ceiling
  b.box(0.5, 1.0, w + 0.2, wall, -0.2, g - 0.5, 0);
  b.box(d, floors * fh, w, wall, -d / 2, g + (floors * fh) / 2, 0, { kind: 'facade' });
  for (let f = 0; f <= floors; f++) b.box(0.35, 0.25, w + 0.15, trim, 0.1, g + f * fh, 0);      // cornice bands
  for (let f = 0; f < floors; f++) for (let i = 0; i < n; i++) {
    const z = -w / 2 + bay * (i + 0.5), y = g + f * fh + 1.6;
    b.box(0.1, 1.9, 1.0, wood, 0.05, y, z);                                                     // louvred shutters
    b.box(0.3, 0.18, 1.4, trim, 0.15, y + 1.1, z);                                              // window hood
    if (Math.random() < 0.3) b.box(0.6, 0.1, 1.5, trim, 0.3, y - 1.0, z);                       // small balcony
  }
  b.box(d, 0.5, w, wall, -d / 2, h + 0.25, 0);
  for (let z = -w / 2 + 0.4; z < w / 2; z += 0.7) b.box(0.15, 0.6, 0.15, trim, 0.05, h + 0.8, z); // balustrade
  b.box(0.3, 0.15, w + 0.1, trim, 0.05, h + 1.15, 0);
  if (Math.random() < 0.4) {
    const z = Math.random() < 0.5 ? -w / 2 + 1.2 : w / 2 - 1.2;
    b.cyl(1.0, 1.0, 2.2, wall, -1.2, h + 1.6, z, { seg: 8 });
    b.cone(1.25, 2.0, 0x8a5a3a, -1.2, h + 3.7, z, { seg: 8 });
  }
  return { group: b.build(), w };
}

/** Tariq Road shopping plaza: glass shopfronts, stacked hoardings and lights down the facade. */
function plaza(district) {
  const b = new Builder();
  const w = rand(12, 18), d = rand(12, 16), floors = randi(3, 5), fh = 3.4, g = 4.2;
  const h = g + floors * fh;
  const wall = pick(district.walls);
  b.box(d, g, w, 0x2a2420, -d / 2, g / 2, 0);
  const n = Math.max(2, Math.floor(w / 4)), sw = w / n;
  for (let i = 0; i < n; i++) {
    const z = -w / 2 + sw * (i + 0.5);
    b.box(0.08, 3, sw - 0.4, 0xbfe6ff, 0.03, 1.6, z, { kind: 'glass' });
    for (let k = 0; k < 3; k++) b.box(0.3, rand(1.2, 1.7), 0.5, pick(district.wood), -0.4, 0.9, z - sw / 3 + k * sw / 3); // clothes on display
    b.box(0.08, 0.1, sw - 0.5, 0xfff8e8, 0.06, 3.15, z, { kind: 'glow' });
    b.plane(sw - 0.4, 0.62, 'sign', 0xffffff, [0.07, 3.75, z], [0, FACE, 0], { uv: signUV(randi(0, SHOPS.length - 1)) });
  }
  b.box(d, floors * fh, w, wall, -d / 2, g + (floors * fh) / 2, 0, { kind: 'facade' });
  // big hoardings bolted over the windows: the Tariq Road look
  for (let i = 0, hn = randi(1, 3); i < hn; i++) {
    const y = g + 1.6 + i * fh * 1.15, hw = w * rand(0.6, 0.9), col = pick(district.wood), lit = pick(district.neon);
    if (y + 1.2 > h) break;
    const z = rand(-(w - hw) / 2, (w - hw) / 2);
    b.box(0.25, 2.3, hw, col, 0.2, y, z);
    b.plane(hw - 0.6, 1.3, 'sign', 0xffffff, [0.34, y, z], [0, FACE, 0], { uv: signUV(randi(0, SHOPS.length - 1)) });
    b.box(0.08, 0.1, hw, lit, 0.36, y + 1.15, z, { kind: 'glow' });
    b.box(0.08, 0.1, hw, lit, 0.36, y - 1.15, z, { kind: 'glow' });
  }
  // shaadi-style fairy-light cascades
  if (Math.random() < 0.5) for (let k = 0; k < 6; k++) {
    const z = -w / 2 + 0.8 + k * (w - 1.6) / 5, col = pick([0xffd60a, 0xfff3c4, 0xff2e88]);
    for (let y = g + 0.6; y < h - 0.3; y += 0.7) b.sphere(0.07, col, 0.12, y, z, { kind: 'glow', seg: 4 });
  }
  b.box(d + 0.3, 0.4, w + 0.3, 0x3a3a40, -d / 2, h + 0.2, 0);
  if (Math.random() < 0.55) {
    // rooftop billboard frame
    const bw = Math.min(w - 1, 9);
    for (const z of [-bw / 3, bw / 3]) b.box(0.2, 3, 0.2, 0x555555, -d / 2, h + 1.6, z);
    b.box(0.3, 2.6, bw, 0x15171c, -d / 2 + 0.2, h + 3.8, 0);
    b.plane(bw - 0.4, 1.6, 'neon', pick(district.neon), [-d / 2 + 0.37, h + 3.8, 0], [0, FACE, 0], { uv: neonUV(randi(0, NEON.length - 1)) });
  } else b.cyl(0.6, 0.6, 1.1, 0x1565c0, -d * 0.6, h + 0.95, rand(-w / 4, w / 4), { seg: 10 });
  return { group: b.build(), w };
}

/** Hawke's Bay beach hut: raised plinth, shaded veranda with a charpai, painted trim. */
function beachHut(district) {
  const b = new Builder();
  const w = rand(8, 11), d = rand(6, 8);
  const wall = pick(district.walls), accent = pick(district.wood), slab = 0xf2efe6;
  b.box(d + 1.6, 1.0, w, 0xcdbb94, -d / 2 + 0.8, 0.5, 0);                         // plinth
  b.box(0.7, 0.5, 1.8, 0xcdbb94, 1.95, 0.25, 0);                                  // step
  b.box(d - 0.8, 3.0, w - 1, wall, -d / 2 - 0.4, 2.5, 0);
  b.box(0.06, 0.4, w - 1, accent, -0.78, 3.6, 0);                                 // painted band
  b.box(0.08, 2.0, 1.1, accent, -0.78, 2.0, 0);                                   // door
  for (const z of [-w / 3, w / 3]) {
    b.box(0.08, 1.0, 1.2, 0x26323e, -0.78, 2.4, z, { kind: 'glass' });
    b.box(0.1, 1.2, 0.1, accent, -0.74, 2.4, z - 0.65); b.box(0.1, 1.2, 0.1, accent, -0.74, 2.4, z + 0.65);
  }
  b.box(d + 2.2, 0.25, w + 0.4, slab, -d / 2 + 1.1, 4.1, 0);                      // veranda roof slab
  for (const z of [-w / 2 + 0.4, 0, w / 2 - 0.4]) b.box(0.25, 3.0, 0.25, slab, 1.25, 2.5, z);
  b.box(0.06, 0.06, w, 0x222222, 1.35, 3.85, 0);
  for (let i = 0; i < 10; i++) b.sphere(0.07, pick([0xffd60a, 0xff2e88, 0x2bff88, 0xffffff]), 1.38, 3.75, -w / 2 + 0.5 + i * (w - 1) / 9, { kind: 'glow', seg: 4 });
  // charpai on the veranda
  const cz = rand(-w / 4, w / 4);
  b.box(0.9, 0.1, 1.9, 0x7a5230, 0.3, 1.45, cz);
  b.box(0.8, 0.03, 1.8, 0xe8d6a8, 0.3, 1.51, cz);
  for (const dx of [-0.38, 0.38]) for (const dz of [-0.85, 0.85]) b.box(0.08, 0.45, 0.08, 0x7a5230, 0.3 + dx, 1.2, cz + dz);
  b.cyl(0.6, 0.6, 1.1, 0x1565c0, -d * 0.6, 4.75, rand(-w / 4, w / 4), { seg: 10 });   // water tank
  if (Math.random() < 0.5) { b.cyl(0.04, 0.04, 3, 0xdddddd, -d + 0.8, 5.7, w / 2 - 0.8, { seg: 4 }); b.box(0.04, 0.7, 1.1, pick([0x0b6e3a, accent]), -d + 0.8, 6.8, w / 2 - 0.25); }
  b.plane(d + 4, w + 2, 'shadow', 0xffffff, [-d / 2 + 1, 0.03, 0], [-Math.PI / 2, 0, 0]);
  return { group: b.build(), w };
}

/** Clifton: mix of pastel sea-facing flats and the odd glass tower. */
function clifton(district) {
  return Math.random() < 0.6 ? seaFront(district) : neonTower(district);
}

export function createBuilding(district) {
  if (district.id === 'port') return portBlock(district);
  if (district.id === 'mazar') return parkSegment(district);
  if (district.id === 'old') return oldCity(district);
  if (district.id === 'sea') return seaFront(district);
  if (district.id === 'saddar') return colonial(district);
  if (district.id === 'tariq') return plaza(district);
  if (district.id === 'hawks') return beachHut(district);
  if (district.id === 'clifton') return clifton(district);
  return neonTower(district);
}
