export function extractSkinPixels(canvas, ctx, img) {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  const sx = Math.floor(canvas.width * 0.3), ex = Math.floor(canvas.width * 0.7);
  const sy = Math.floor(canvas.height * 0.2), ey = Math.floor(canvas.height * 0.8);
  for (let y = sy; y < ey; y += 3)
    for (let x = sx; x < ex; x += 3) {
      const i = (y * canvas.width + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (r > 60 && g > 40 && b > 20 && r > g && r > b && (r - Math.min(g, b)) > 10) {
        rSum += r; gSum += g; bSum += b; count++;
      }
    }
  if (count < 10) {
    count = 0;
    for (let y = sy; y < ey; y += 5)
      for (let x = sx; x < ex; x += 5) {
        const i = (y * canvas.width + x) * 4;
        rSum += d[i]; gSum += d[i + 1]; bSum += d[i + 2]; count++;
      }
  }
  return { r: Math.round(rSum / count), g: Math.round(gSum / count), b: Math.round(bSum / count) };
}
