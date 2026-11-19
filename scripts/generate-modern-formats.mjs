import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const TARGET_DIRS = ['public/imagen', 'public/planos'];
const CONCURRENCY = 4;
const FORCE = process.argv.includes('--force');

async function collectJpegs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJpegs(fullPath)));
    } else if (entry.isFile() && /\.(jpe?g|png)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function needsUpdate(srcPath, destPath) {
  if (FORCE) return true;
  try {
    const [srcStat, destStat] = await Promise.all([fs.stat(srcPath), fs.stat(destPath)]);
    return destStat.size === 0 || srcStat.mtimeMs > destStat.mtimeMs;
  } catch {
    return true;
  }
}

async function convertImage(srcPath) {
  const base = srcPath.replace(/\.(jpe?g|png)$/i, '');
  const webpPath = `${base}.webp`;
  const avifPath = `${base}.avif`;

  let generatedWebp = false;
  let generatedAvif = false;

  if (await needsUpdate(srcPath, webpPath)) {
    await execFileAsync('convert', [
      srcPath,
      '-strip',
      '-quality',
      '82',
      '-define',
      'webp:method=4',
      webpPath,
    ]);
    generatedWebp = true;
  }

  if (await needsUpdate(srcPath, avifPath)) {
    await execFileAsync('convert', [
      srcPath,
      '-strip',
      '-quality',
      '65',
      '-define',
      'heic:speed=8',
      avifPath,
    ]);
    generatedAvif = true;
  }

  return { srcPath, webpPath, avifPath, generatedWebp, generatedAvif };
}

async function main() {
  const allFiles = [];
  for (const dir of TARGET_DIRS) {
    try {
      allFiles.push(...(await collectJpegs(path.resolve(process.cwd(), dir))));
    } catch {
      // Directory may not exist
    }
  }

  console.log(`[modern-formats] Processing ${allFiles.length} source images (WebP + AVIF)...`);
  let index = 0;
  let webpCount = 0;
  let avifCount = 0;

  async function worker() {
    while (index < allFiles.length) {
      const current = allFiles[index++];
      const res = await convertImage(current);
      if (res.generatedWebp) webpCount++;
      if (res.generatedAvif) avifCount++;
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log(
    `[modern-formats] Done. Generated ${webpCount} WebP and ${avifCount} AVIF assets across ${allFiles.length} images.`
  );
}

main().catch((err) => {
  console.error('[modern-formats] Failed:', err);
  process.exit(1);
});
