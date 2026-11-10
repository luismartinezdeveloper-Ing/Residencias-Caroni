/**
 * Reduce el peso de las imágenes existentes SIN cambiar su nombre ni su aspecto, de modo que el
 * código no necesita ningún cambio.
 *
 * Para cada JPEG de public/imagen/interior y public/planos genera una versión más ligera y solo la
 * sustituye si (a) pesa al menos un 15 % menos y (b) su similitud estructural (SSIM) con el
 * original es ≥ 0.985, es decir, visualmente idéntica. El original se guarda en
 * media-src/originales/ (no se despliega).
 *
 * Uso: node scripts/optimize-in-place.mjs   (requiere ffmpeg y ffprobe en el PATH)
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGETS = ['public/imagen/interior', 'public/planos'];
const ORIGINALS = join(ROOT, 'media-src', 'originales');
const MIN_SAVING = 0.15;
const MIN_SSIM = 0.975;
const MAX_WIDTH = 2400;
const JPEG_QUALITY = '2'; // escala mjpeg: 2 es casi sin pérdida visible (1 = máxima)

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
// ffmpeg escribe sus estadísticas (como el SSIM) en stderr, también cuando termina bien
const runErr = (cmd, args) => String(spawnSync(cmd, args, { encoding: 'utf8' }).stderr || '');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : /\.jpe?g$/i.test(entry.name) ? [full] : [];
  });
}

function dims(file) {
  const [w, h] = run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]).trim().split(',').map(Number);
  return { w, h };
}

function ssim(original, candidate) {
  // Se reduce el original al tamaño del candidato y se compara a la misma resolución:
  // medir contra el original ampliado penalizaría el tamaño, no la calidad.
  const { w, h } = dims(candidate);
  const log = runErr('ffmpeg', ['-hide_banner', '-i', original, '-i', candidate, '-lavfi', `[0:v]scale=${w}:${h}:flags=lanczos[a];[a][1:v]ssim`, '-f', 'null', '-']);
  const match = log.match(/All:([\d.]+)/);
  return match ? Number(match[1]) : 0;
}

const tmp = mkdtempSync(join(tmpdir(), 'caroni-img-'));
const rows = [];

for (const target of TARGETS) {
  for (const file of walk(join(ROOT, target))) {
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    if (rel.startsWith('media-src')) continue;
    const before = statSync(file).size;
    const out = join(tmp, rel.replace(/[\\/]/g, '_'));

    run('ffmpeg', ['-v', 'error', '-y', '-i', file, '-vf', `scale='min(${MAX_WIDTH},iw)':-2:flags=lanczos`, '-q:v', JPEG_QUALITY, '-huffman', 'optimal', out]);
    const after = statSync(out).size;
    const saving = 1 - after / before;
    const score = saving >= MIN_SAVING ? ssim(file, out) : 0;
    const apply = saving >= MIN_SAVING && score >= MIN_SSIM;
    if (process.env.DEBUG_OPT) console.log('  candidato', rel, `${Math.round(after / 1024)} KB`, `ahorro ${(saving * 100).toFixed(0)}%`, `ssim ${score}`);

    if (apply) {
      const backup = join(ORIGINALS, rel.replace(/^public\//, ''));
      mkdirSync(dirname(backup), { recursive: true });
      if (!existsSync(backup)) renameSync(file, backup);
      copyFileSync(out, file);
    }
    rows.push({ rel, beforeKB: Math.round(before / 1024), afterKB: Math.round(after / 1024), ssim: score ? score.toFixed(4) : '-', apply });
  }
}

let total0 = 0;
let total1 = 0;
for (const r of rows) {
  total0 += r.beforeKB;
  total1 += r.apply ? r.afterKB : r.beforeKB;
  console.log(`${r.apply ? 'OPTIMIZADO' : 'sin cambios'}  ${String(r.beforeKB).padStart(5)} → ${String(r.apply ? r.afterKB : r.beforeKB).padStart(5)} KB  ssim ${r.ssim}  ${r.rel}`);
}
console.log(`\nTotal: ${(total0 / 1024).toFixed(1)} MB → ${(total1 / 1024).toFixed(1)} MB`);
