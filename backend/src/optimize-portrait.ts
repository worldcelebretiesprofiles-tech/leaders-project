import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

async function run() {
  const sourcePath = path.join(__dirname, "../../src/assets/leader-portrait.jpg");
  const destDir = path.join(__dirname, "../../frontend/public/assets");
  const destPath = path.join(destDir, "leader-portrait.webp");

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  console.log(`Optimizing image from ${sourcePath} to ${destPath}`);

  try {
    if (!fs.existsSync(sourcePath)) {
      console.error(`Error: Source file does not exist at ${sourcePath}`);
      return;
    }

    await sharp(sourcePath)
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(destPath);

    const stats = fs.statSync(destPath);
    console.log(`Success! Optimized file size: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (err) {
    console.error("Failed to optimize portrait:", err);
  }
}

run();
